# Luna Starship (Luna Invaders)

A free-movement Space Invaders-style arcade game built with HTML5 Canvas. Move anywhere on screen, level up for passive abilities, and your progress is saved automatically.

Repository: [christossolonos-bit/Luna-Starship](https://github.com/christossolonos-bit/Luna-Starship)

## How to play

1. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
2. Click **Start Game** or **Continue** if you have a saved session.
3. Controls:
   - **Arrow keys** — move in any direction
   - **Space** — shoot
   - **P** — pause (progress saves while paused)

## Features

- **Large arena** — 1200×900 play area with more room to dodge and fight
- **Free movement** — fly anywhere on the screen; your ship rotates to face the nearest enemy
- **Early level-ups** — random abilities favor damage and weapons early; defense becomes more common later
- **Edge spawns** — invaders enter from all four sides and close in on you
- **3 lives** — shown as hearts in the HUD; game over when all are lost
- **Waves of invaders** — classic formation that shifts and shoots back; **enemy difficulty rises with your level**
- **XP & leveling** — earn XP from kills; each level automatically grants a random ability (no pause menu)
- **Persistent progress** — high score, stats, and last run saved in `localStorage`
- **Retro sound effects** — synthesized via Web Audio (no downloads required)

## Passive abilities

| Ability | Effect |
|---------|--------|
| Rapid Fire | Shoot faster (stackable) |
| Spread Shot | 3-way bullet spread |
| Piercing Rounds | Bullets pass through one enemy |
| Turbo Thrusters | Move faster |
| Energy Shield | Block one hit per stack |
| Power Core | Double bullet damage |
| XP Magnet | 50% more XP |
| Nano Repair | Regain a life every 3 waves |

### Weapon buffs (auto-fire)

| Weapon | Effect |
|--------|--------|
| Orbital Turrets | Side guns fire beside your ship (up to 3 pairs) |
| Pulse Laser | Piercing laser toward nearest enemy |
| Seeker Missiles | Homing missiles (stacks = more missiles) |
| Plasma Nova | Expanding shockwave around your ship |
| Rear Cannon | Shots fired behind you |
| Chain Lightning | Arcs damage between nearby enemies |

## Files

- `index.html` — page structure and UI overlays
- `style.css` — neon arcade styling
- `game.js` — gameplay, leveling, save system
- `sounds.js` — Web Audio sound effects
- `music.js` — procedural ambient music

## License

Apache-2.0 — see [LICENSE](LICENSE).
