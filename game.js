/**
 * Luna Invaders — free-movement Space Invaders-style arcade game.
 */

const SAVE_KEY = "lunaInvadersProgress";
const MAX_LIVES = 3;
const MAX_SHIP_HP = 100;
const HIT_DAMAGE_BULLET = 18;
const HIT_DAMAGE_COLLISION = 32;
/** Base move speed is multiplied by this much per level (level 1 = no bonus). */
const SHIP_SPEED_PER_LEVEL = 0.14;
const SHIP_SPEED_MAX_MULT = 2.75;
const OVER_SHIELD_UNLOCK_LEVEL = 7;
const BOSS_LEVEL = 10;

const ABILITIES = {
  rapidFire: {
    id: "rapidFire",
    name: "Rapid Fire",
    desc: "Shoot 40% faster",
    maxStacks: 5,
    role: "offense",
    apply(stats) {
      stats.fireCooldown *= 0.6;
    },
  },
  multiShot: {
    id: "multiShot",
    name: "Spread Shot",
    desc: "Fire 3 bullets in a spread",
    maxStacks: 1,
    role: "offense",
    apply(stats) {
      stats.spread = 3;
    },
  },
  piercing: {
    id: "piercing",
    name: "Piercing Rounds",
    desc: "Bullets pass through one enemy",
    maxStacks: 1,
    role: "offense",
    apply(stats) {
      stats.piercing = true;
    },
  },
  turbo: {
    id: "turbo",
    name: "Turbo Thrusters",
    desc: "Move 25% faster",
    maxStacks: 4,
    role: "utility",
    apply(stats) {
      stats.speed *= 1.25;
    },
  },
  shield: {
    id: "shield",
    name: "Energy Shield",
    desc: "Absorb one hit without losing a life",
    maxStacks: 3,
    role: "defense",
    apply() {},
  },
  powerShot: {
    id: "powerShot",
    name: "Power Core",
    desc: "Bullets deal double damage",
    maxStacks: 3,
    role: "offense",
    apply(stats) {
      stats.bulletDamage *= 2;
    },
  },
  magnet: {
    id: "magnet",
    name: "XP Magnet",
    desc: "Gain 50% more XP from kills",
    maxStacks: 2,
    role: "utility",
    apply(stats) {
      stats.xpMultiplier *= 1.5;
    },
  },
  regen: {
    id: "regen",
    name: "Nano Repair",
    desc: "Recover 1 life every 3 waves",
    maxStacks: 1,
    role: "defense",
    apply(stats) {
      stats.regenWaves = 3;
    },
  },
  sideGuns: {
    id: "sideGuns",
    name: "Orbital Turrets",
    desc: "Side guns auto-fire beside your ship",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.sideGuns += 1;
    },
  },
  pulseLaser: {
    id: "pulseLaser",
    name: "Pulse Laser",
    desc: "Piercing laser bolt toward nearest enemy",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.laserLevel += 1;
    },
  },
  seekerMissiles: {
    id: "seekerMissiles",
    name: "Seeker Missiles",
    desc: "Homing missiles track invaders",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.missiles += 1;
    },
  },
  plasmaNova: {
    id: "plasmaNova",
    name: "Plasma Nova",
    desc: "Expanding shockwave damages nearby foes",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.plasma += 1;
    },
  },
  tailCannon: {
    id: "tailCannon",
    name: "Rear Cannon",
    desc: "Rear gun fires behind your ship",
    maxStacks: 2,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.tailGun += 1;
    },
  },
  chainLightning: {
    id: "chainLightning",
    name: "Chain Lightning",
    desc: "Lightning arcs between nearby enemies",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.lightning += 1;
    },
  },
  overShield: {
    id: "overShield",
    name: "Aegis Overshield",
    desc: "Strong shield with HP + timed duration (Lv7+)",
    maxStacks: 3,
    role: "defense",
    minLevel: 7,
    apply() {},
  },
  droneSwarm: {
    id: "droneSwarm",
    name: "Attack Drones",
    desc: "Orbiting drones fire at enemies",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.drones += 1;
    },
  },
  photonTorpedo: {
    id: "photonTorpedo",
    name: "Photon Torpedo",
    desc: "Heavy bolts toward the nearest foe",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.photon += 1;
    },
  },
  arcCannon: {
    id: "arcCannon",
    name: "Arc Cannon",
    desc: "Rapid energy arcs in a wide cone",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.arcCannon += 1;
    },
  },
  scatterBurst: {
    id: "scatterBurst",
    name: "Scatter Burst",
    desc: "Burst of bullets in all directions",
    maxStacks: 3,
    weapon: true,
    role: "offense",
    apply(stats) {
      stats.scatterBurst += 1;
    },
  },
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  score: document.getElementById("score"),
  wave: document.getElementById("wave"),
  level: document.getElementById("level"),
  xp: document.getElementById("xp"),
  xpMax: document.getElementById("xp-max"),
  highScore: document.getElementById("high-score"),
  lifeHearts: document.getElementById("life-hearts"),
  hpFill: document.getElementById("hp-fill"),
  hpText: document.getElementById("hp-text"),
  activeAbilities: document.getElementById("active-abilities"),
  overlayStart: document.getElementById("overlay-start"),
  overlayPause: document.getElementById("overlay-pause"),
  overlayGameover: document.getElementById("overlay-gameover"),
  finalScore: document.getElementById("final-score"),
  finalWave: document.getElementById("final-wave"),
  btnStart: document.getElementById("btn-start"),
  btnContinue: document.getElementById("btn-continue"),
  btnRestart: document.getElementById("btn-restart"),
};

let progress = loadProgress();
let gameState = "menu";
let keys = {};
let lastTime = 0;

const game = {
  score: 0,
  wave: 1,
  level: 1,
  xp: 0,
  xpToLevel: 100,
  lives: 3,
  player: null,
  bullets: [],
  enemyBullets: [],
  enemies: [],
  particles: [],
  effects: [],
  weaponTimers: {},
  ownedAbilities: {},
  stats: null,
  fireTimer: 0,
  enemyShootTimer: 0,
  pendingSpawns: [],
  pendingNextWave: false,
  waveAdvanceTimer: null,
  invulnerable: 0,
  waveCleared: false,
  regenCounter: 0,
  shieldCharges: 0,
  overshield: null,
  bossActive: false,
  bossDefeated: false,
  droneAngle: 0,
  lastDifficultyLevel: 1,
  levelUpToast: null,
};

function defaultStats() {
  return {
    speed: 280,
    fireCooldown: 0.28,
    spread: 1,
    piercing: false,
    bulletDamage: 1,
    xpMultiplier: 1,
    regenWaves: 0,
    sideGuns: 0,
    laserLevel: 0,
    missiles: 0,
    plasma: 0,
    tailGun: 0,
    lightning: 0,
    drones: 0,
    photon: 0,
    arcCannon: 0,
    scatterBurst: 0,
  };
}

function initWeaponTimers() {
  game.weaponTimers = {
    sideGuns: 0,
    laser: 0,
    missiles: 0,
    plasma: 0,
    tail: 0,
    lightning: 0,
    drones: 0,
    photon: 0,
    arc: 0,
    scatter: 0,
  };
  game.effects = [];
  game.droneAngle = 0;
}

function playerAimAngle() {
  return game.player.angle - Math.PI / 2;
}

function spawnBullet(x, y, angle, speed, damage, type, extra = {}) {
  game.bullets.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    w: extra.w ?? 6,
    h: extra.h ?? 6,
    damage,
    type,
    color: extra.color ?? "#00f5d4",
    piercing: !!extra.piercing,
    pierced: 0,
    maxPierce: extra.maxPierce ?? (extra.piercing ? 12 : 1),
    homing: !!extra.homing,
    homingTurn: extra.homingTurn ?? 4.5,
  });
}

function damageEnemy(index, damage, hitX, hitY) {
  const e = game.enemies[index];
  e.hp -= damage;
  if (e.hp <= 0) {
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const wasBoss = e.isBoss;
    spawnParticles(cx, cy, wasBoss ? "#ffd60a" : e.tier === 0 ? "#ffd60a" : "#00f5d4", wasBoss ? 40 : 10);
    SoundFX.explosion();
    game.enemies.splice(index, 1);
    if (wasBoss) {
      game.bossActive = false;
      game.bossDefeated = true;
      game.score += 500;
      addXP(200);
      SoundFX.bossDefeated();
      AmbientMusic.setBossIntensity(false);
      game.levelUpToast = {
        name: "Boss Defeated!",
        desc: "The Dreadnought is destroyed — press on!",
        life: 3.5,
        weapon: true,
      };
    } else {
      game.score += 10 * game.wave + (e.maxHp > 1 ? 15 : 0);
      progress.totalKills = (progress.totalKills || 0) + 1;
      addXP(12 + game.wave * 2);
    }
    SoundFX.enemyHit();
    return true;
  }
  SoundFX.enemyHit();
  spawnParticles(hitX, hitY, "#ff006e", 4);
  return false;
}

function processBulletHit(b, enemyIndex) {
  const e = game.enemies[enemyIndex];
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const killed = damageEnemy(enemyIndex, b.damage, b.x, b.y);
  if (b.piercing && b.pierced < b.maxPierce - 1) {
    b.pierced++;
  } else {
    b.dead = true;
  }
  return killed;
}

function getNearestEnemyTo(x, y) {
  let nearest = null;
  let best = Infinity;
  for (const e of game.enemies) {
    const dx = e.x + e.w / 2 - x;
    const dy = e.y + e.h / 2 - y;
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      nearest = e;
    }
  }
  return nearest;
}

function fireSideGuns() {
  const s = game.stats;
  const p = game.player;
  const aim = playerAimAngle();
  const dmg = s.bulletDamage * 0.75;
  const offsets = [
    [Math.PI / 2, -Math.PI / 2],
    [Math.PI / 2.6, -Math.PI / 2.6],
    [Math.PI / 1.7, -Math.PI / 1.7],
  ];
  for (let i = 0; i < s.sideGuns && i < offsets.length; i++) {
    for (const off of offsets[i]) {
      const a = aim + off;
      const dist = 22;
      spawnBullet(p.x + Math.cos(a) * dist, p.y + Math.sin(a) * dist, a, 420, dmg, "side", {
        color: "#ffd60a",
        w: 5,
        h: 5,
      });
    }
  }
  SoundFX.sideGun();
}

function firePulseLaser() {
  const s = game.stats;
  const p = game.player;
  const aim = playerAimAngle();
  const nearest = getNearestEnemy();
  const angle = nearest
    ? Math.atan2(nearest.y + nearest.h / 2 - p.y, nearest.x + nearest.w / 2 - p.x)
    : aim;
  spawnBullet(p.x, p.y, angle, 720, s.bulletDamage * (1.2 + s.laserLevel * 0.35), "laser", {
    color: "#ff4d6d",
    piercing: true,
    maxPierce: 4 + s.laserLevel * 2,
    w: 4,
    h: 16,
  });
  SoundFX.laser();
}

function fireSeekerMissiles() {
  const s = game.stats;
  const p = game.player;
  const aim = playerAimAngle();
  for (let i = 0; i < s.missiles; i++) {
    const spread = (i - (s.missiles - 1) / 2) * 0.25;
    spawnBullet(p.x, p.y, aim + spread, 280, s.bulletDamage * 1.1, "missile", {
      color: "#ff9f1c",
      homing: true,
      homingTurn: 5 + s.missiles,
      w: 8,
      h: 8,
    });
  }
  SoundFX.missile();
}

function firePlasmaNova() {
  const s = game.stats;
  const p = game.player;
  game.effects.push({
    type: "plasma",
    x: p.x,
    y: p.y,
    radius: 8,
    maxRadius: 55 + s.plasma * 28,
    life: 0.4,
    maxLife: 0.4,
    damage: s.bulletDamage * (1 + s.plasma * 0.45),
    hit: new Set(),
  });
  SoundFX.plasma();
}

function fireTailCannon() {
  const s = game.stats;
  const p = game.player;
  const rear = playerAimAngle() + Math.PI;
  const dmg = s.bulletDamage * 0.85;
  for (let i = 0; i < s.tailGun; i++) {
    const spread = (i - (s.tailGun - 1) / 2) * 0.12;
    spawnBullet(
      p.x + Math.cos(rear) * 14,
      p.y + Math.sin(rear) * 14,
      rear + spread,
      460,
      dmg,
      "tail",
      { color: "#90e0ef", w: 5, h: 5 }
    );
  }
  SoundFX.sideGun();
}

function fireChainLightning() {
  const s = game.stats;
  const p = game.player;
  if (game.enemies.length === 0) return;

  const chains = 2 + s.lightning;
  const hit = new Set();
  const targets = [];
  let current = getNearestEnemyTo(p.x, p.y);

  for (let c = 0; c < chains && current; c++) {
    if (hit.has(current)) break;
    hit.add(current);
    targets.push(current);
    const cx = current.x + current.w / 2;
    const cy = current.y + current.h / 2;
    let next = null;
    let best = 140 * 140;
    for (const e of game.enemies) {
      if (hit.has(e)) continue;
      const dx = e.x + e.w / 2 - cx;
      const dy = e.y + e.h / 2 - cy;
      const d = dx * dx + dy * dy;
      if (d < best) {
        best = d;
        next = e;
      }
    }
    current = next;
  }

  const arcs = [];
  let fromX = p.x;
  let fromY = p.y;
  for (const e of targets) {
    const tx = e.x + e.w / 2;
    const ty = e.y + e.h / 2;
    arcs.push({ x1: fromX, y1: fromY, x2: tx, y2: ty });
    fromX = tx;
    fromY = ty;
  }

  const dmg = s.bulletDamage * (1.3 + s.lightning * 0.25);
  for (let i = targets.length - 1; i >= 0; i--) {
    const e = targets[i];
    const idx = game.enemies.indexOf(e);
    if (idx !== -1) {
      damageEnemy(idx, dmg, e.x + e.w / 2, e.y + e.h / 2);
    }
  }

  if (arcs.length) {
    game.effects.push({ type: "lightning", arcs, life: 0.22, maxLife: 0.22 });
  }
  SoundFX.lightning();
}

function updateWeapons(dt) {
  if (!game.stats || gameState !== "playing") return;
  const s = game.stats;
  const t = game.weaponTimers;

  if (s.sideGuns > 0) {
    t.sideGuns -= dt;
    if (t.sideGuns <= 0) {
      t.sideGuns = Math.max(0.22, 0.5 - s.sideGuns * 0.08);
      fireSideGuns();
    }
  }

  if (s.laserLevel > 0) {
    t.laser -= dt;
    if (t.laser <= 0) {
      t.laser = Math.max(0.45, 1.35 - s.laserLevel * 0.22);
      firePulseLaser();
    }
  }

  if (s.missiles > 0) {
    t.missiles -= dt;
    if (t.missiles <= 0) {
      t.missiles = Math.max(0.5, 1.1 - s.missiles * 0.12);
      fireSeekerMissiles();
    }
  }

  if (s.plasma > 0) {
    t.plasma -= dt;
    if (t.plasma <= 0) {
      t.plasma = Math.max(1.2, 2.8 - s.plasma * 0.4);
      firePlasmaNova();
    }
  }

  if (s.tailGun > 0) {
    t.tail -= dt;
    if (t.tail <= 0) {
      t.tail = Math.max(0.3, 0.65 - s.tailGun * 0.1);
      fireTailCannon();
    }
  }

  if (s.lightning > 0) {
    t.lightning -= dt;
    if (t.lightning <= 0) {
      t.lightning = Math.max(0.7, 1.6 - s.lightning * 0.2);
      fireChainLightning();
    }
  }

  if (s.drones > 0) {
    t.drones -= dt;
    game.droneAngle += dt * (2.2 + s.drones * 0.4);
    if (t.drones <= 0) {
      t.drones = Math.max(0.25, 0.55 - s.drones * 0.08);
      fireDroneSwarm();
    }
  }

  if (s.photon > 0) {
    t.photon -= dt;
    if (t.photon <= 0) {
      t.photon = Math.max(0.6, 1.4 - s.photon * 0.15);
      firePhotonTorpedo();
    }
  }

  if (s.arcCannon > 0) {
    t.arc -= dt;
    if (t.arc <= 0) {
      t.arc = Math.max(0.18, 0.42 - s.arcCannon * 0.06);
      fireArcCannon();
    }
  }

  if (s.scatterBurst > 0) {
    t.scatter -= dt;
    if (t.scatter <= 0) {
      t.scatter = Math.max(0.5, 1.2 - s.scatterBurst * 0.12);
      fireScatterBurst();
    }
  }
}

function fireDroneSwarm() {
  const s = game.stats;
  const p = game.player;
  const dmg = s.bulletDamage * 0.65;
  const count = 2 + s.drones;
  for (let i = 0; i < count; i++) {
    const a = game.droneAngle + (i / count) * Math.PI * 2;
    const dist = 36 + i * 4;
    const ox = p.x + Math.cos(a) * dist;
    const oy = p.y + Math.sin(a) * dist;
    const target = getNearestEnemyTo(ox, oy);
    const shootA = target
      ? Math.atan2(target.y + target.h / 2 - oy, target.x + target.w / 2 - ox)
      : playerAimAngle();
    spawnBullet(ox, oy, shootA, 380, dmg, "drone", { color: "#b8f2e6", w: 4, h: 4 });
  }
  SoundFX.sideGun();
}

function firePhotonTorpedo() {
  const s = game.stats;
  const p = game.player;
  const nearest = getNearestEnemy();
  const angle = nearest
    ? Math.atan2(nearest.y + nearest.h / 2 - p.y, nearest.x + nearest.w / 2 - p.x)
    : playerAimAngle();
  for (let i = 0; i < s.photon; i++) {
    const spread = (i - (s.photon - 1) / 2) * 0.08;
    spawnBullet(p.x, p.y, angle + spread, 340, s.bulletDamage * 2.2, "photon", {
      color: "#e0aaff",
      w: 10,
      h: 10,
      piercing: true,
      maxPierce: 2,
    });
  }
  SoundFX.missile();
}

function fireArcCannon() {
  const s = game.stats;
  const p = game.player;
  const base = playerAimAngle();
  const count = 3 + s.arcCannon;
  for (let i = 0; i < count; i++) {
    const spread = ((i / (count - 1 || 1)) - 0.5) * 0.9;
    spawnBullet(p.x, p.y, base + spread, 500, s.bulletDamage * 0.55, "arc", {
      color: "#48cae4",
      w: 5,
      h: 5,
    });
  }
}

function fireScatterBurst() {
  const s = game.stats;
  const p = game.player;
  const bolts = 6 + s.scatterBurst * 2;
  for (let i = 0; i < bolts; i++) {
    const a = (i / bolts) * Math.PI * 2;
    spawnBullet(p.x, p.y, a, 400, s.bulletDamage * 0.5, "scatter", {
      color: "#ff85a1",
      w: 4,
      h: 4,
    });
  }
  SoundFX.sideGun();
}

function updateEffects(dt) {
  for (let i = game.effects.length - 1; i >= 0; i--) {
    const fx = game.effects[i];
    fx.life -= dt;

    if (fx.type === "plasma") {
      fx.radius += (fx.maxRadius - 8) * (dt / fx.maxLife) * 1.2;
      for (let ei = game.enemies.length - 1; ei >= 0; ei--) {
        const e = game.enemies[ei];
        if (fx.hit.has(e)) continue;
        const ex = e.x + e.w / 2;
        const ey = e.y + e.h / 2;
        const dist = Math.hypot(ex - fx.x, ey - fx.y);
        if (dist < fx.radius + e.w / 2) {
          fx.hit.add(e);
          damageEnemy(ei, fx.damage, ex, ey);
        }
      }
    }

    if (fx.life <= 0) game.effects.splice(i, 1);
  }
}

function updateHomingBullets(dt) {
  for (const b of game.bullets) {
    if (!b.homing) continue;
    const target = getNearestEnemyTo(b.x, b.y);
    if (!target) continue;
    const tx = target.x + target.w / 2;
    const ty = target.y + target.h / 2;
    const desired = Math.atan2(ty - b.y, tx - b.x);
    const current = Math.atan2(b.vy, b.vx);
    let diff = desired - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    const turn = b.homingTurn * dt;
    const angle = current + Math.max(-turn, Math.min(turn, diff));
    const speed = Math.hypot(b.vx, b.vy);
    b.vx = Math.cos(angle) * speed;
    b.vy = Math.sin(angle) * speed;
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    highScore: 0,
    totalKills: 0,
    highestWave: 1,
    highestLevel: 1,
    lifetimeAbilities: {},
    lastSession: null,
  };
}

function saveProgress() {
  progress.highScore = Math.max(progress.highScore, game.score);
  progress.highestWave = Math.max(progress.highestWave, game.wave);
  progress.highestLevel = Math.max(progress.highestLevel, game.level);
  progress.lastSession = {
    score: game.score,
    wave: game.wave,
    level: game.level,
    xp: game.xp,
    xpToLevel: game.xpToLevel,
    lives: game.lives,
    ownedAbilities: { ...game.ownedAbilities },
    shieldCharges: game.shieldCharges,
    shipHp: game.player?.hp ?? MAX_SHIP_HP,
    bossDefeated: game.bossDefeated,
    savedAt: Date.now(),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function getLevelSpeedMultiplier() {
  const mult = 1 + (game.level - 1) * SHIP_SPEED_PER_LEVEL;
  return Math.min(mult, SHIP_SPEED_MAX_MULT);
}

function rebuildStats() {
  const stats = defaultStats();
  for (const [id, count] of Object.entries(game.ownedAbilities)) {
    const ability = ABILITIES[id];
    if (!ability) continue;
    for (let i = 0; i < count; i++) {
      ability.apply(stats);
    }
  }
  stats.speed *= getLevelSpeedMultiplier();
  game.stats = stats;
}

function syncShieldCharges() {
  const max = countShieldStacks();
  game.shieldCharges = Math.min(game.shieldCharges, max);
}

function countShieldStacks() {
  return game.ownedAbilities.shield || 0;
}

function countOverShieldStacks() {
  return game.ownedAbilities.overShield || 0;
}

function refreshOvershield() {
  if (game.level < OVER_SHIELD_UNLOCK_LEVEL) return;
  const stacks = Math.max(1, countOverShieldStacks());
  const levelBonus = Math.max(0, game.level - OVER_SHIELD_UNLOCK_LEVEL) * 20;
  const maxHp = 140 + stacks * 55 + levelBonus;
  const maxTime = 9 + stacks * 2.5;
  game.overshield = {
    hp: maxHp,
    maxHp,
    timeLeft: maxTime,
    maxTime,
  };
}

function updateOvershield(dt) {
  if (!game.overshield) return;
  game.overshield.timeLeft -= dt;
  if (game.overshield.timeLeft <= 0 || game.overshield.hp <= 0) {
    game.overshield = null;
  }
}

function checkLevelMilestones() {
  if (game.level === OVER_SHIELD_UNLOCK_LEVEL) {
    refreshOvershield();
    if (game.levelUpToast) {
      game.levelUpToast.desc = `${game.levelUpToast.desc} · Aegis Overshield online!`;
    }
  }
  if (game.level >= BOSS_LEVEL && !game.bossDefeated && !game.bossActive) {
    startBossFight();
  }
}

function startBossFight() {
  game.enemies = [];
  game.pendingSpawns = [];
  game.pendingNextWave = false;
  game.waveCleared = false;
  clearWaveAdvanceTimer();
  game.bossActive = true;

  const hp = 520 + game.wave * 40 + (game.level - BOSS_LEVEL) * 60;
  game.enemies.push({
    isBoss: true,
    x: canvas.width / 2 - 95,
    y: 55,
    w: 190,
    h: 115,
    hp,
    maxHp: hp,
    tier: 0,
    anim: 0,
    moveMult: 0.4,
    moveDir: 1,
    shootTimer: 0,
    spawnEdge: 0,
  });

  game.levelUpToast = {
    name: "BOSS: Lunar Dreadnought",
    desc: "Destroy the boss to continue!",
    life: 4,
    weapon: true,
  };
  SoundFX.bossAppear();
  AmbientMusic.setBossIntensity(true);
}

function bossShoot(boss) {
  const px = game.player.x;
  const py = game.player.y;
  const ex = boss.x + boss.w / 2;
  const ey = boss.y + boss.h / 2;
  const diff = getEnemyDifficulty();
  const speed = 200 + diff.bulletSpeedBonus;

  for (let i = -2; i <= 2; i++) {
    const angle = Math.atan2(py - ey, px - ex) + i * 0.18;
    game.enemyBullets.push({
      x: ex - 4,
      y: ey,
      w: 10,
      h: 10,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    });
  }
  SoundFX.enemyShoot();
}

function initPlayer(hp = MAX_SHIP_HP) {
  game.player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    w: 36,
    h: 28,
    angle: 0,
    targetAngle: 0,
    hp: Math.min(hp, MAX_SHIP_HP),
    maxHp: MAX_SHIP_HP,
  };
}

function refillShipHull() {
  if (game.player) game.player.hp = game.player.maxHp;
}

function lerpAngle(current, target, t) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * Math.min(1, t);
}

function playerHitbox() {
  const p = game.player;
  const pad = 4;
  return {
    x: p.x - p.w / 2 + pad,
    y: p.y - p.h / 2 + pad,
    w: p.w - pad * 2,
    h: p.h - pad * 2,
  };
}

function getNearestEnemy() {
  const p = game.player;
  let nearest = null;
  let best = Infinity;
  for (const e of game.enemies) {
    const dx = e.x + e.w / 2 - p.x;
    const dy = e.y + e.h / 2 - p.y;
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      nearest = e;
    }
  }
  return nearest;
}

function updatePlayerFacing(dt) {
  const p = game.player;
  const nearest = getNearestEnemy();
  if (nearest) {
    const dx = nearest.x + nearest.w / 2 - p.x;
    const dy = nearest.y + nearest.h / 2 - p.y;
    p.targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
  }
  p.angle = lerpAngle(p.angle, p.targetAngle, dt * 10);
}

function createEnemyFromEdge(diff, tier) {
  const enemyW = 34;
  const enemyH = 26;
  const margin = 50;
  const edge = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (edge === 0) {
    x = margin + Math.random() * (canvas.width - margin * 2 - enemyW);
    y = -enemyH - 20 - Math.random() * 60;
  } else if (edge === 1) {
    x = margin + Math.random() * (canvas.width - margin * 2 - enemyW);
    y = canvas.height + 20 + Math.random() * 60;
  } else if (edge === 2) {
    x = -enemyW - 20 - Math.random() * 60;
    y = margin + Math.random() * (canvas.height - margin * 2 - enemyH);
  } else {
    x = canvas.width + 20 + Math.random() * 60;
    y = margin + Math.random() * (canvas.height - margin * 2 - enemyH);
  }

  const hp = 1 + diff.hpBonus + (tier === 0 ? 1 : 0);
  return {
    x,
    y,
    w: enemyW,
    h: enemyH,
    hp,
    maxHp: hp,
    tier,
    anim: Math.random() * Math.PI * 2,
    moveMult: diff.moveSpeedMult,
    spawnEdge: edge,
  };
}

/** Enemy toughness scales with player level (each level-up makes the invasion harder). */
function getEnemyDifficulty() {
  const lvl = game.level;
  return {
    hpBonus: Math.floor((lvl - 1) * 0.6) + Math.floor(game.wave / 6),
    extraEnemies: Math.min(Math.floor((lvl - 1) / 2) + Math.floor(game.wave / 3), 14),
    moveSpeedMult: 1 + (lvl - 1) * 0.07,
    shootRateMult: 1 + (lvl - 1) * 0.09,
    bulletSpeedBonus: (lvl - 1) * 14 + game.wave * 5,
    approachSpeed: 48 + game.wave * 7 + (lvl - 1) * 5,
    shootChanceBonus: (lvl - 1) * 0.035,
  };
}

function toughenActiveEnemies() {
  const diff = getEnemyDifficulty();
  const hpGain = 1 + Math.floor(game.level / 5);
  for (const e of game.enemies) {
    e.maxHp += hpGain;
    e.hp += hpGain;
    e.moveMult = (e.moveMult || 1) * (1 + 0.04);
  }
  game.enemyShootTimer = Math.max(0, game.enemyShootTimer - 0.15 * diff.shootRateMult);
}

function spawnWave() {
  if (game.level >= BOSS_LEVEL && !game.bossDefeated) {
    startBossFight();
    return;
  }

  game.enemies = [];
  game.pendingSpawns = [];
  game.bossActive = false;
  const diff = getEnemyDifficulty();
  const count = 6 + game.wave * 2 + diff.extraEnemies;

  for (let i = 0; i < count; i++) {
    game.pendingSpawns.push({
      diff,
      tier: i % 4,
      delay: i * 0.28,
    });
  }

  game.enemyShootTimer = 0;
  game.waveCleared = false;
}

function processPendingSpawns(dt) {
  for (let i = game.pendingSpawns.length - 1; i >= 0; i--) {
    const spawn = game.pendingSpawns[i];
    spawn.delay -= dt;
    if (spawn.delay <= 0) {
      game.enemies.push(createEnemyFromEdge(spawn.diff, spawn.tier));
      game.pendingSpawns.splice(i, 1);
    }
  }
}

function startGame(continueSession = false) {
  SoundFX.init();
  AmbientMusic.init();
  AmbientMusic.start();
  game.score = 0;
  game.wave = 1;
  game.level = 1;
  game.xp = 0;
  game.xpToLevel = 100;
  game.lives = MAX_LIVES;
  game.lastDifficultyLevel = 1;
  game.bullets = [];
  game.enemyBullets = [];
  game.particles = [];
  initWeaponTimers();
  game.ownedAbilities = {};
  game.regenCounter = 0;
  game.fireTimer = 0;
  game.invulnerable = 0;
  game.shieldCharges = 0;
  game.overshield = null;
  game.bossActive = false;
  game.bossDefeated = false;
  game.pendingNextWave = false;
  game.waveCleared = false;
  game.levelUpToast = null;
  clearWaveAdvanceTimer();

  if (continueSession && progress.lastSession) {
    const s = progress.lastSession;
    game.score = s.score || 0;
    game.wave = s.wave || 1;
    game.level = s.level || 1;
    game.xp = s.xp ?? 0;
    game.xpToLevel = s.xpToLevel ?? 100;
    game.lives = Math.min(Math.max(s.lives ?? MAX_LIVES, 1), MAX_LIVES);
    game.lastDifficultyLevel = game.level;
    game.ownedAbilities = { ...(s.ownedAbilities || {}) };
    game.shieldCharges = s.shieldCharges ?? 0;
    game.bossDefeated = s.bossDefeated ?? false;
    initPlayer(s.shipHp ?? MAX_SHIP_HP);
    if (game.level >= OVER_SHIELD_UNLOCK_LEVEL) refreshOvershield();
  } else {
    initPlayer();
  }

  rebuildStats();
  syncShieldCharges();
  spawnWave();
  gameState = "playing";
  hideOverlay(ui.overlayStart);
  hideOverlay(ui.overlayGameover);
  updateHUD();
  renderAbilityPanel();
}

function resetRun() {
  progress.lastSession = null;
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
  startGame(false);
}

function hideOverlay(el) {
  el.classList.remove("visible");
}

function showOverlay(el) {
  el.classList.add("visible");
}

function updateHUD() {
  ui.score.textContent = game.score;
  ui.wave.textContent = game.wave;
  ui.level.textContent = game.level;
  ui.xp.textContent = game.xp;
  ui.xpMax.textContent = game.xpToLevel;
  ui.highScore.textContent = progress.highScore;
  if (ui.lifeHearts) {
    ui.lifeHearts.innerHTML = "";
    for (let i = 0; i < MAX_LIVES; i++) {
      const heart = document.createElement("span");
      heart.className = i < game.lives ? "heart-full" : "heart-empty";
      heart.textContent = "♥";
      heart.title = i < game.lives ? "Life remaining" : "Life lost";
      ui.lifeHearts.appendChild(heart);
    }
    if (game.shieldCharges > 0) {
      const shield = document.createElement("span");
      shield.className = "shield-badge";
      shield.textContent = `+${game.shieldCharges} shield`;
      ui.lifeHearts.appendChild(shield);
    }
  }

  const hp = game.player?.hp ?? MAX_SHIP_HP;
  const maxHp = game.player?.maxHp ?? MAX_SHIP_HP;
  const pct = Math.max(0, hp / maxHp);
  if (ui.hpFill) {
    ui.hpFill.style.width = `${pct * 100}%`;
    ui.hpFill.style.background =
      pct > 0.5
        ? "linear-gradient(90deg, #00f5d4, #00a896)"
        : pct > 0.25
          ? "linear-gradient(90deg, #ffd60a, #ff9f1c)"
          : "linear-gradient(90deg, #ff006e, #c9184a)";
  }
  if (ui.hpText) ui.hpText.textContent = `${Math.ceil(hp)} / ${maxHp}`;

  const os = game.overshield;
  if (ui.hpFill && os) {
    const osPct = os.hp / os.maxHp;
    const osBar = document.getElementById("overshield-bar");
    if (osBar) {
      osBar.style.display = "inline-flex";
      const fill = document.getElementById("overshield-fill");
      const txt = document.getElementById("overshield-text");
      if (fill) fill.style.width = `${osPct * 100}%`;
      if (txt) txt.textContent = `${Math.ceil(os.hp)} · ${os.timeLeft.toFixed(1)}s`;
    }
  } else {
    const osBar = document.getElementById("overshield-bar");
    if (osBar) osBar.style.display = "none";
  }
}

function renderAbilityPanel() {
  ui.activeAbilities.innerHTML = "";
  const entries = Object.entries(game.ownedAbilities);
  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "None yet — level up!";
    ui.activeAbilities.appendChild(li);
    return;
  }
  for (const [id, count] of entries) {
    const ability = ABILITIES[id];
    if (!ability) continue;
    const li = document.createElement("li");
    const tag = ability.weapon ? "⚔ " : "";
    li.textContent =
      count > 1 ? `${tag}${ability.name} x${count}` : `${tag}${ability.name}`;
    ui.activeAbilities.appendChild(li);
  }
}

function getAvailableAbilities() {
  const pool = [];
  for (const ability of Object.values(ABILITIES)) {
    if (ability.minLevel && game.level < ability.minLevel) continue;
    const owned = game.ownedAbilities[ability.id] || 0;
    if (owned < ability.maxStacks) pool.push(ability);
  }
  return pool;
}

/** Early game favors damage; defense weight rises as level/wave increase. */
function getAbilityPickWeight(ability) {
  const role = ability.role || "offense";
  const earlyLevel = Math.max(0, 8 - game.level) / 8;
  const earlyWave = Math.max(0, 5 - game.wave) / 5;
  const earlyBias = Math.max(earlyLevel, earlyWave);

  if (role === "offense") return 1 + earlyBias * 3.5;
  if (role === "utility") return 1 + earlyBias * 1.2;
  if (role === "defense") return Math.max(0.15, 1 - earlyBias * 0.85);
  return 1;
}

function pickWeighted(pool, weightFn) {
  let total = 0;
  const weights = pool.map((item) => {
    const w = weightFn(item);
    total += w;
    return w;
  });
  let roll = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function pickRandomAbility() {
  const pool = getAvailableAbilities();
  if (pool.length === 0) return null;
  return pickWeighted(pool, getAbilityPickWeight);
}

function applyAbility(id) {
  game.ownedAbilities[id] = (game.ownedAbilities[id] || 0) + 1;
  rebuildStats();
  if (id === "shield") {
    game.shieldCharges = Math.min(game.shieldCharges + 1, countShieldStacks());
  }
  if (id === "overShield") refreshOvershield();
  progress.lifetimeAbilities[id] = (progress.lifetimeAbilities[id] || 0) + 1;
  SoundFX.buffPick();
  advanceWaveIfReady();
  if (game.level > game.lastDifficultyLevel) {
    game.lastDifficultyLevel = game.level;
    toughenActiveEnemies();
  }
  renderAbilityPanel();
  saveProgress();
  updateHUD();
}

function applyLevelUpRegen() {
  refillShipHull();
  if (game.level >= OVER_SHIELD_UNLOCK_LEVEL) refreshOvershield();
}

function grantLevelUpAbility() {
  SoundFX.levelUp();
  applyLevelUpRegen();
  const regenNote =
    game.level >= OVER_SHIELD_UNLOCK_LEVEL
      ? " · Hull & overshield restored"
      : " · Hull restored";

  const ability = pickRandomAbility();
  if (!ability) {
    game.levelUpToast = { name: "Level Up!", desc: `All abilities maxed${regenNote}`, life: 2 };
    checkLevelMilestones();
    return;
  }
  applyAbility(ability.id);
  const stacks = game.ownedAbilities[ability.id];
  const stackText =
    stacks > 1 ? ` (x${stacks}/${ability.maxStacks})` : ability.maxStacks > 1 ? " (x1)" : "";
  game.levelUpToast = {
    name: ability.name + stackText,
    desc: ability.desc + regenNote,
    life: 2.5,
    weapon: ability.weapon,
  };
  checkLevelMilestones();
}

function addXP(amount) {
  const gained = Math.floor(amount * game.stats.xpMultiplier);
  game.xp += gained;
  while (game.xp >= game.xpToLevel) {
    game.xp -= game.xpToLevel;
    game.level++;
    game.xpToLevel = Math.floor(game.xpToLevel * 1.35);
    grantLevelUpAbility();
  }
  updateHUD();
}

function shoot() {
  if (game.fireTimer > 0 || gameState !== "playing") return;
  game.fireTimer = game.stats.fireCooldown;
  SoundFX.shoot();

  const p = game.player;
  const spread = game.stats.spread;
  const offsets = spread === 1 ? [0] : [-0.15, 0, 0.15];
  const baseAngle = p.angle - Math.PI / 2;
  const speed = 520;

  for (const offset of offsets) {
    const a = baseAngle + offset;
    spawnBullet(p.x + Math.cos(a) * 18, p.y + Math.sin(a) * 18, a, speed, game.stats.bulletDamage, "main", {
      piercing: game.stats.piercing,
      maxPierce: game.stats.piercing ? 2 : 1,
    });
  }
}

function enemyShoot(enemy) {
  const px = game.player.x;
  const py = game.player.y;
  const ex = enemy.x + enemy.w / 2;
  const ey = enemy.y + enemy.h / 2;
  const dx = px - ex;
  const dy = py - ey;
  const len = Math.hypot(dx, dy) || 1;
  const diff = getEnemyDifficulty();
  const speed = 180 + diff.bulletSpeedBonus;
  game.enemyBullets.push({
    x: ex - 4,
    y: ey,
    w: 8,
    h: 8,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
  });
  SoundFX.enemyShoot();
}

function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.3 + Math.random() * 0.4,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function loseLife() {
  game.lives--;
  refillShipHull();
  game.invulnerable = 1.5;
  SoundFX.playerHit();
  spawnParticles(game.player.x, game.player.y, "#ff006e", 20);
  updateHUD();
  if (game.lives <= 0) endGame();
}

function damagePlayer(amount = HIT_DAMAGE_BULLET) {
  if (game.invulnerable > 0 || gameState !== "playing" || !game.player) return;

  if (game.overshield && game.overshield.hp > 0) {
    game.overshield.hp = Math.max(0, game.overshield.hp - amount);
    game.invulnerable = 0.25;
    SoundFX.playerHit();
    spawnParticles(game.player.x, game.player.y, "#8338ec", 10);
    if (game.overshield.hp <= 0) game.overshield = null;
    updateHUD();
    return;
  }

  if (game.shieldCharges > 0) {
    game.shieldCharges--;
    game.invulnerable = 1.2;
    SoundFX.playerHit();
    spawnParticles(game.player.x, game.player.y, "#00f5d4", 12);
    updateHUD();
    return;
  }

  game.player.hp = Math.max(0, game.player.hp - amount);
  game.invulnerable = 0.35;
  SoundFX.playerHit();
  spawnParticles(game.player.x, game.player.y, "#ff006e", 8);
  updateHUD();

  if (game.player.hp <= 0) loseLife();
}

function endGame() {
  gameState = "gameover";
  AmbientMusic.stop();
  SoundFX.gameOver();
  saveProgress();
  ui.finalScore.textContent = game.score;
  ui.finalWave.textContent = game.wave;
  showOverlay(ui.overlayGameover);
}

function clearWaveAdvanceTimer() {
  if (game.waveAdvanceTimer) {
    clearTimeout(game.waveAdvanceTimer);
    game.waveAdvanceTimer = null;
  }
}

/** Start next wave once combat is idle and the game is not paused/on level-up overlay. */
function advanceWaveIfReady() {
  if (!game.pendingNextWave || gameState !== "playing") return;
  game.pendingNextWave = false;
  game.waveCleared = false;
  nextWave();
}

function scheduleWaveAdvance() {
  game.waveCleared = true;
  game.pendingNextWave = true;
  clearWaveAdvanceTimer();
  game.waveAdvanceTimer = setTimeout(() => advanceWaveIfReady(), 800);
}

function nextWave() {
  game.wave++;
  if (game.stats.regenWaves > 0) {
    game.regenCounter++;
    if (game.regenCounter >= game.stats.regenWaves) {
      game.lives = Math.min(game.lives + 1, MAX_LIVES);
      refillShipHull();
      game.regenCounter = 0;
    }
  }
  spawnWave();
  SoundFX.waveClear();
  saveProgress();
  updateHUD();
}

function update(dt) {
  if (gameState === "menu" || gameState === "gameover") return;

  if (game.levelUpToast) {
    game.levelUpToast.life -= dt;
    if (game.levelUpToast.life <= 0) game.levelUpToast = null;
  }

  if (gameState === "pause") return;

  if (game.fireTimer > 0) game.fireTimer -= dt;
  if (game.invulnerable > 0) game.invulnerable -= dt;
  updateOvershield(dt);

  const p = game.player;
  const s = game.stats;
  let dx = 0;
  let dy = 0;
  if (keys.ArrowLeft || keys.a) dx -= 1;
  if (keys.ArrowRight || keys.d) dx += 1;
  if (keys.ArrowUp || keys.w) dy -= 1;
  if (keys.ArrowDown || keys.s) dy += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy) || 1;
    p.x += (dx / len) * s.speed * dt;
    p.y += (dy / len) * s.speed * dt;
  }

  p.x = Math.max(p.w / 2, Math.min(canvas.width - p.w / 2, p.x));
  p.y = Math.max(p.h / 2, Math.min(canvas.height - p.h / 2, p.y));

  updatePlayerFacing(dt);

  if (keys[" "]) shoot();

  updateWeapons(dt);

  for (const b of game.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  updateHomingBullets(dt);
  game.bullets = game.bullets.filter(
    (b) =>
      !b.dead &&
      b.x > -30 &&
      b.x < canvas.width + 30 &&
      b.y > -30 &&
      b.y < canvas.height + 30
  );

  updateEffects(dt);

  for (const b of game.enemyBullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  game.enemyBullets = game.enemyBullets.filter(
    (b) => b.x > -30 && b.x < canvas.width + 30 && b.y > -30 && b.y < canvas.height + 30
  );

  processPendingSpawns(dt);

  const diff = getEnemyDifficulty();
  const approachSpeed = diff.approachSpeed;

  for (const e of game.enemies) {
    if (e.isBoss) {
      e.anim += dt * 2;
      e.shootTimer = (e.shootTimer || 0) + dt;
      e.moveDir = e.moveDir || 1;
      e.x += e.moveDir * 75 * dt;
      if (e.x <= 20 || e.x + e.w >= canvas.width - 20) e.moveDir *= -1;
      e.y = 45 + Math.sin(e.anim) * 28;
      const towardX = (p.x - (e.x + e.w / 2)) * 0.15 * dt;
      e.x += towardX;
      if (e.shootTimer >= 0.55) {
        bossShoot(e);
        e.shootTimer = 0;
      }
      continue;
    }

    const ex = e.x + e.w / 2;
    const ey = e.y + e.h / 2;
    const edx = p.x - ex;
    const edy = p.y - ey;
    const len = Math.hypot(edx, edy) || 1;
    const mult = (e.moveMult || 1) * diff.moveSpeedMult;
    const spd = approachSpeed * mult * dt;

    e.x += (edx / len) * spd + Math.sin(e.anim * 2.2) * 22 * dt;
    e.y += (edy / len) * spd + Math.cos(e.anim * 1.8) * 18 * dt;
    e.anim += dt * 4;
  }

  game.enemyShootTimer += dt;
  const shootInterval = Math.max(0.55, 2.2 - game.wave * 0.1) / diff.shootRateMult;
  const regularEnemies = game.enemies.filter((e) => !e.isBoss);
  if (game.enemyShootTimer >= shootInterval && regularEnemies.length > 0) {
    game.enemyShootTimer = 0;
    const shootChance = 0.35 + game.wave * 0.02 + diff.shootChanceBonus;
    const shooters = regularEnemies.filter(() => Math.random() < shootChance);
    const pick = shooters.length ? shooters : regularEnemies;
    const enemy = pick[Math.floor(Math.random() * pick.length)];
    if (enemy) enemyShoot(enemy);
  }

  const ph = playerHitbox();

  for (const b of game.bullets) {
    if (b.dead) continue;
    for (let i = game.enemies.length - 1; i >= 0; i--) {
      const e = game.enemies[i];
      if (!rectsOverlap(b, e)) continue;
      processBulletHit(b, i);
      if (b.dead) break;
    }
  }
  game.bullets = game.bullets.filter((b) => !b.dead);

  for (const b of game.enemyBullets) {
    if (rectsOverlap(b, ph)) {
      b.y = 9999;
      damagePlayer(HIT_DAMAGE_BULLET);
    }
  }

  for (const e of game.enemies) {
    if (rectsOverlap(e, ph)) damagePlayer(HIT_DAMAGE_COLLISION);
  }

  for (const part of game.particles) {
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.life -= dt;
  }
  game.particles = game.particles.filter((part) => part.life > 0);

  if (
    game.enemies.length === 0 &&
    game.pendingSpawns.length === 0 &&
    !game.waveCleared &&
    !game.pendingNextWave
  ) {
    scheduleWaveAdvance();
  }

  updateHUD();
}

function drawWeaponMounts(cx, cy, angle, stats) {
  if (!stats || !game.player) return;
  const w = game.player.w;
  const h = game.player.h;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  if (stats.sideGuns > 0) {
    ctx.fillStyle = "#ffd60a";
    for (let i = 0; i < Math.min(stats.sideGuns, 3); i++) {
      const yOff = (i - 1) * 8;
      ctx.fillRect(-w / 2 - 6, yOff - 2, 6, 4);
      ctx.fillRect(w / 2, yOff - 2, 6, 4);
    }
  }
  if (stats.laserLevel > 0) {
    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(-2, -h / 2 - 6, 4, 6);
  }
  if (stats.missiles > 0) {
    ctx.fillStyle = "#ff9f1c";
    ctx.fillRect(-10, h * 0.15, 5, 8);
    ctx.fillRect(5, h * 0.15, 5, 8);
  }
  if (stats.tailGun > 0) {
    ctx.fillStyle = "#90e0ef";
    ctx.fillRect(-4, h / 2 - 2, 8, 5);
  }
  if (stats.plasma > 0) {
    ctx.strokeStyle = "rgba(131, 56, 236, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14 + stats.plasma * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (stats.lightning > 0) {
    ctx.fillStyle = "#caf0f8";
    ctx.fillRect(-6, -4, 12, 3);
  }
  if (stats.drones > 0) {
    ctx.fillStyle = "#b8f2e6";
    ctx.beginPath();
    ctx.arc(0, -w / 2 - 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  if (stats.photon > 0) {
    ctx.fillStyle = "#e0aaff";
    ctx.fillRect(-6, 0, 12, 6);
  }
  if (stats.arcCannon > 0) {
    ctx.fillStyle = "#48cae4";
    ctx.fillRect(-w / 2 + 4, -4, 6, 4);
  }
  if (stats.scatterBurst > 0) {
    ctx.fillStyle = "#ff85a1";
    for (let i = 0; i < Math.min(stats.scatterBurst, 3); i++) {
      ctx.fillRect(-8 + i * 8, h / 2 - 8, 4, 4);
    }
  }
  ctx.restore();
}

function drawShip(cx, cy, w, h, angle, color, glow) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.shadowColor = glow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(0, h * 0.2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.fillRect(-2, -h * 0.15, 4, 6);
  ctx.restore();
}

function drawOvershield() {
  const os = game.overshield;
  const p = game.player;
  if (!os || !p || os.hp <= 0) return;

  const pct = os.hp / os.maxHp;
  const r = p.w * 1.1 + 12;
  ctx.save();
  ctx.globalAlpha = 0.35 + pct * 0.35;
  ctx.strokeStyle = `rgba(131, 56, 236, ${0.5 + pct * 0.5})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(131, 56, 236, ${0.08 + pct * 0.12})`;
  ctx.fill();
  ctx.restore();
}

function drawBoss(e) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const pulse = Math.sin(e.anim * 3) * 0.1 + 0.9;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = pulse;
  ctx.shadowColor = "#ff006e";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#8338ec";
  ctx.beginPath();
  ctx.moveTo(0, -e.h / 2);
  ctx.lineTo(e.w / 2, -e.h * 0.1);
  ctx.lineTo(e.w / 2, e.h / 2);
  ctx.lineTo(0, e.h * 0.35);
  ctx.lineTo(-e.w / 2, e.h / 2);
  ctx.lineTo(-e.w / 2, -e.h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ff006e";
  ctx.fillRect(-e.w / 4, -e.h * 0.2, e.w / 2, e.h * 0.35);
  ctx.shadowBlur = 0;
  ctx.restore();

  const pct = e.hp / e.maxHp;
  const barW = e.w + 20;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(e.x - 10, e.y - 18, barW, 8);
  ctx.fillStyle = "#ff006e";
  ctx.fillRect(e.x - 10, e.y - 18, barW * pct, 8);
  ctx.fillStyle = "#ffd60a";
  ctx.font = "bold 12px Segoe UI, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LUNAR DREADNOUGHT", cx, e.y - 22);
}

function drawEnemy(e) {
  if (e.isBoss) {
    drawBoss(e);
    return;
  }

  const pulse = Math.sin(e.anim) * 0.15 + 0.85;
  const colors = ["#ff006e", "#8338ec", "#3a86ff", "#ffd60a"];
  const color = colors[(e.tier || 0) % colors.length];
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  let faceAngle = 0;
  if (game.player) {
    faceAngle = Math.atan2(game.player.y - cy, game.player.x - cx) + Math.PI / 2;
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(faceAngle);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
  ctx.fillStyle = "#000";
  ctx.fillRect(-e.w / 2 + 8, -e.h / 2 + 8, 8, 6);
  ctx.fillRect(e.w / 2 - 16, -e.h / 2 + 8, 8, 6);
  ctx.restore();

  if (e.maxHp > 1) {
    const pct = e.hp / e.maxHp;
    ctx.fillStyle = "#333";
    ctx.fillRect(e.x, e.y - 8, e.w, 4);
    ctx.fillStyle = "#ffd60a";
    ctx.fillRect(e.x, e.y - 8, e.w * pct, 4);
  }
}

function drawLevelUpToast() {
  const toast = game.levelUpToast;
  if (!toast) return;

  const alpha = Math.min(1, toast.life);
  const y = canvas.height / 2 - 40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(5, 5, 12, 0.85)";
  ctx.strokeStyle = toast.weapon ? "#ffd60a" : "#00f5d4";
  ctx.lineWidth = 2;
  const w = 340;
  const h = 72;
  const x = canvas.width / 2 - w / 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#00f5d4";
  ctx.font = "bold 18px Segoe UI, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("LEVEL UP!", canvas.width / 2, y + 26);

  ctx.fillStyle = toast.weapon ? "#ffd60a" : "#e8e8f0";
  ctx.font = "14px Segoe UI, system-ui, sans-serif";
  ctx.fillText(`+ ${toast.name}`, canvas.width / 2, y + 48);

  ctx.fillStyle = "#6b6b8a";
  ctx.font = "12px Segoe UI, system-ui, sans-serif";
  ctx.fillText(toast.desc, canvas.width / 2, y + 64);
  ctx.restore();
}

function drawShipHealthBar() {
  const p = game.player;
  if (!p) return;

  const barW = 44;
  const barH = 5;
  const x = p.x - barW / 2;
  const y = p.y - p.h / 2 - 14;
  const pct = Math.max(0, p.hp / p.maxHp);

  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x, y, barW, barH);

  const hue = pct > 0.5 ? 160 : pct > 0.25 ? 45 : 0;
  ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
  ctx.fillRect(x, y, barW * pct, barH);

  ctx.strokeStyle = "rgba(0, 245, 212, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barW, barH);
}

function drawLifeIcons() {
  const size = 14;
  const gap = 18;
  const startX = 12;
  const startY = 12;
  for (let i = 0; i < MAX_LIVES; i++) {
    const filled = i < game.lives;
    ctx.fillStyle = filled ? "#ff006e" : "#2a2a40";
    ctx.beginPath();
    ctx.arc(startX + i * gap + size / 2, startY + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    if (filled) {
      ctx.shadowColor = "#ff006e";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 70; i++) {
    const x = (i * 137) % canvas.width;
    const y = ((i * 97 + performance.now() * 0.02) % canvas.height);
    ctx.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.05})`;
    ctx.fillRect(x, y, 1, 1);
  }

  if (gameState === "menu") return;

  drawLifeIcons();
  drawLevelUpToast();

  for (const fx of game.effects) {
    if (fx.type === "plasma") {
      const alpha = fx.life / fx.maxLife;
      ctx.strokeStyle = `rgba(131, 56, 236, ${alpha * 0.85})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = `rgba(255, 0, 110, ${alpha * 0.15})`;
      ctx.fill();
    }
    if (fx.type === "lightning") {
      const alpha = fx.life / fx.maxLife;
      ctx.strokeStyle = `rgba(202, 240, 248, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = "#caf0f8";
      ctx.shadowBlur = 10;
      for (const arc of fx.arcs) {
        ctx.beginPath();
        ctx.moveTo(arc.x1, arc.y1);
        ctx.lineTo(arc.x2, arc.y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }
  }

  for (const e of game.enemies) drawEnemy(e);

  for (const b of game.bullets) {
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 6;
    if (b.type === "laser") {
      const len = 14;
      const a = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(a);
      ctx.fillRect(-2, -len / 2, 4, len);
      ctx.restore();
    } else if (b.type === "missile") {
      ctx.beginPath();
      ctx.moveTo(b.x + 4, b.y);
      ctx.lineTo(b.x - 3, b.y - 4);
      ctx.lineTo(b.x - 3, b.y + 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.type === "side" ? 3 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#ff006e";
  for (const b of game.enemyBullets) {
    ctx.beginPath();
    ctx.arc(b.x + 4, b.y + 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  for (const part of game.particles) {
    ctx.globalAlpha = part.life;
    ctx.fillStyle = part.color;
    ctx.fillRect(part.x, part.y, part.size, part.size);
  }
  ctx.globalAlpha = 1;

  if (game.player) {
    drawOvershield();
    drawShipHealthBar();
    const blink = game.invulnerable > 0 && Math.floor(performance.now() / 80) % 2 === 0;
    const hullDanger = game.player.hp / game.player.maxHp < 0.35;
    if (!blink || hullDanger) {
      if (game.stats) {
        drawWeaponMounts(
          game.player.x,
          game.player.y,
          game.player.angle,
          game.stats
        );
      }
      drawShip(
        game.player.x,
        game.player.y,
        game.player.w,
        game.player.h,
        game.player.angle,
        "#00f5d4",
        "#00f5d4"
      );
    }
    if (game.shieldCharges > 0) {
      ctx.strokeStyle = "rgba(0, 245, 212, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(game.player.x, game.player.y, game.player.w * 0.8, game.player.h * 0.9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (game.bossActive && game.enemies.some((e) => e.isBoss)) {
    ctx.fillStyle = "rgba(255, 0, 110, 0.85)";
    ctx.font = "bold 14px Segoe UI, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚠ BOSS FIGHT", canvas.width / 2, 36);
  }
}

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " " || e.key.startsWith("Arrow")) e.preventDefault();

  if (e.key === "p" || e.key === "P") {
    if (gameState === "playing") {
      gameState = "pause";
      AmbientMusic.pause();
      showOverlay(ui.overlayPause);
      saveProgress();
    } else if (gameState === "pause") {
      gameState = "playing";
      AmbientMusic.resume();
      hideOverlay(ui.overlayPause);
      advanceWaveIfReady();
    }
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

ui.btnStart.addEventListener("click", () => startGame(false));
ui.btnContinue.addEventListener("click", () => startGame(true));
ui.btnRestart.addEventListener("click", () => resetRun());

if (progress.lastSession) {
  ui.btnContinue.classList.remove("hidden");
}

ui.highScore.textContent = progress.highScore;
game.lives = MAX_LIVES;
updateHUD();
requestAnimationFrame(loop);

// Auto-save every 5 seconds during play
setInterval(() => {
  if (gameState === "playing" || gameState === "pause") saveProgress();
}, 5000);
