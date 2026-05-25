/**
 * Procedural ambient space music (Web Audio, no files).
 */
const AmbientMusic = (() => {
  let ctx = null;
  let master = null;
  let filter = null;
  let playing = false;
  let paused = false;
  let arpTimer = null;
  let arpStep = 0;
  const activeNodes = [];

  const CHORDS = [
    [55, 65.41, 82.41, 98], // Am
    [43.65, 55, 65.41, 82.41], // F
    [65.41, 82.41, 98, 130.81], // C
    [49, 61.74, 73.42, 98], // G
  ];

  const ARP_NOTES = [0, 2, 3, 2, 0, -1, 0, 2];

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.09;
      filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      filter.Q.value = 0.6;
      filter.connect(master);
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function track(node) {
    activeNodes.push(node);
    return node;
  }

  function startDrone(freq, type, gain, detune = 0) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    track({ stop: () => { try { osc.stop(); } catch (_) {} } });
  }

  function startNoiseBed() {
    const ac = getCtx();
    const len = ac.sampleRate * 4;
    const buffer = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.98 + white * 0.02;
        data[i] = last * 0.4;
      }
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const g = ac.createGain();
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    g.gain.value = 0.035;
    src.connect(lp);
    lp.connect(g);
    g.connect(filter);
    src.start();
    track({ stop: () => { try { src.stop(); } catch (_) {} } });
  }

  function playArpNote() {
    if (!playing || paused) return;
    const ac = getCtx();
    const chord = CHORDS[Math.floor(arpStep / ARP_NOTES.length) % CHORDS.length];
    const idx = arpStep % ARP_NOTES.length;
    const degree = ARP_NOTES[idx];
    const base = chord[1] || chord[0];
    const freq = base * Math.pow(2, degree / 12) * 2;

    const osc = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime;
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    osc.connect(g);
    g.connect(filter);
    osc.start(t);
    osc.stop(t + 0.95);
    arpStep++;
  }

  function scheduleArp() {
    clearInterval(arpTimer);
    arpTimer = setInterval(playArpNote, 520);
  }

  function setBossIntensity(on) {
    if (!filter) return;
    filter.frequency.linearRampToValueAtTime(on ? 2200 : 1400, getCtx().currentTime + 1.5);
    if (master) master.gain.linearRampToValueAtTime(on ? 0.11 : 0.09, getCtx().currentTime + 1);
  }

  return {
    init() {
      getCtx();
    },

    start() {
      if (playing) {
        this.resume();
        return;
      }
      const ac = getCtx();
      playing = true;
      paused = false;
      arpStep = 0;

      startDrone(55, "sine", 0.028);
      startDrone(82.41, "sine", 0.018, 4);
      startDrone(110, "triangle", 0.012, -3);
      startNoiseBed();
      scheduleArp();
    },

    stop() {
      playing = false;
      paused = false;
      clearInterval(arpTimer);
      arpTimer = null;
      for (const n of activeNodes) {
        try {
          n.stop();
        } catch (_) {}
      }
      activeNodes.length = 0;
    },

    pause() {
      if (!playing) return;
      paused = true;
      if (master) master.gain.setValueAtTime(0, getCtx().currentTime);
    },

    resume() {
      if (!playing) return;
      paused = false;
      if (master) master.gain.setValueAtTime(0.09, getCtx().currentTime);
    },

    setBossIntensity,
  };
})();
