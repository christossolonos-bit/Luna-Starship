/**
 * Retro arcade sounds via Web Audio API (no external files).
 */
const SoundFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  }

  function tone(freq, duration, type = "square", volume = 0.12, slide = 0) {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide !== 0) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, freq + slide),
        ac.currentTime + duration
      );
    }
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  }

  function noise(duration, volume = 0.08) {
    const ac = getCtx();
    const bufferSize = ac.sampleRate * duration;
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ac.createBufferSource();
    src.buffer = buffer;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  }

  return {
    init() {
      getCtx();
    },

    shoot() {
      tone(880, 0.06, "square", 0.06, -400);
    },

    enemyHit() {
      tone(220, 0.08, "sawtooth", 0.1, -80);
      noise(0.05, 0.04);
    },

    enemyShoot() {
      tone(140, 0.1, "triangle", 0.07, -30);
    },

    playerHit() {
      tone(80, 0.25, "sawtooth", 0.15, -50);
      noise(0.15, 0.1);
    },

    explosion() {
      noise(0.2, 0.12);
      tone(60, 0.3, "sawtooth", 0.1, -40);
    },

    levelUp() {
      [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => tone(f, 0.12, "square", 0.1), i * 80);
      });
    },

    buffPick() {
      tone(440, 0.08, "sine", 0.1);
      setTimeout(() => tone(660, 0.1, "sine", 0.1), 60);
    },

    waveClear() {
      [392, 494, 587].forEach((f, i) => {
        setTimeout(() => tone(f, 0.15, "square", 0.08), i * 100);
      });
    },

    gameOver() {
      [392, 349, 330, 262].forEach((f, i) => {
        setTimeout(() => tone(f, 0.2, "triangle", 0.1, -20), i * 150);
      });
    },

    laser() {
      tone(1200, 0.05, "sawtooth", 0.05, -600);
    },

    missile() {
      tone(320, 0.07, "square", 0.05, 80);
    },

    plasma() {
      tone(180, 0.15, "sine", 0.08, -60);
      noise(0.08, 0.05);
    },

    lightning() {
      noise(0.06, 0.07);
      tone(900, 0.04, "square", 0.06, -200);
    },

    sideGun() {
      tone(520, 0.04, "square", 0.04, -100);
    },

    bossAppear() {
      [110, 82, 55].forEach((f, i) => {
        setTimeout(() => tone(f, 0.25, "sawtooth", 0.1), i * 120);
      });
    },

    bossDefeated() {
      [262, 330, 392, 523].forEach((f, i) => {
        setTimeout(() => tone(f, 0.2, "square", 0.1), i * 90);
      });
    },
  };
})();
