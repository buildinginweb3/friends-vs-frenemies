# FRIENDS vs FRENEMIES game component

SDK version **v0.1.2**. Survivor + idle RPG on canonical Rare Friends islands:
MANUAL positioning (WASD/arrows/tap) with mouse aim on desktop, optional
AUTO-pilot, 15 Shadow archetypes with telegraphs, 6 phased bosses, Rare Trader
every 5 waves, new map every 5 waves, 11 weapon families, 6 abilities.

This component has no wallet code, no Friend selector and no ownership gate —
the SDK runtime supplies those. It only calls `client.read()` on session start
(required to finish runtime loading) and otherwise runs a custom in-memory game
built on SDK world/movement/navigation modules.

## Controls

- **Home plot:** the Friend wanders on its own. Tap it (or Enter) to poke it.
  **DEFEND** starts a run; **UP** opens upgrades, **KIT** gear, **MUTE** sound.
- **MANUAL (default):** WASD/arrows/tap move; desktop mouse aims the primary
  weapon (facing follows with hysteresis); mobile keeps auto-aim.
- **AUTO:** toggle chip; AI moves, aims, kites, dodges telegraphs, collects.
- **Level up:** combat freezes, pick 1 of 3 (keys 1/2/3; abilities appear too).
- **BLAST:** Space. **Second ability:** E or dock button. **+HP:** banked RF.
- **H:** collision + performance debug overlay (development).
- **Trader (every 5 waves):** 4-item stock with CURRENT-vs-NEW compare,
  escalating rerolls, consumables, CONTINUE. Combat waits.

## Rules

- World space (576x384 plane per map): manual controller (iso keymap,
  tap-to-move via unproject) or `createWorldMovement` auto-pilot; enemies via
  navigator routes + steering + spatial-hash separation; body colliders
  (smaller than sprites); swept projectile collision; x+y depth sorting.
- Spawn pipeline: validated gates (walkable, clear, routable to home),
  per-spawn validation with retries, stuck watchdog with relocation. Zero
  permanently stuck enemies is the target.
- Budget wave director (standard/swarm/heavy/ranged/rush/elite/surge/boss),
  formations per wave type, progressive unlocks, elites with modifiers,
  6 phased bosses, Trader after every boss, map transition every 5 waves
  (6 islands, vents/mud/pressure per map).
- XP auto-collects; 24 stacking run upgrades in 6 build families with 8
  evolutions/synergies; wave-clear stipends; pickups (RF/heart/haste/power/
  ward) with magnet; stray-hunt cleanup.
- Kills/bosses/waves/elites pay simulated RF into the run bank (tracked
  earned/spent); death banks net once into the permanent profile with stats.
- Bosses drop gear (35%+); Trader sells gear + consumables for banked RF with
  atomic transactions, escalating rerolls, 40% salvage. Duplicates → +25 RF.
- Permanent upgrades: Friend stats, 4 plot structures (physical props),
  economy tracks. Gear (weapon/armor/trinket, 5 rarities, tradeoffs) changes
  shots, auras, charms and the held blaster — never the canonical sprite.

## Exact economy (all simulated)

- `game.json` is the SDK-required reference definition only (1 RF Shadow
  Bounty, 60%/30%/10% outcomes, expected 0.9 RF). It is NOT a mechanic and its
  actions are never called.
- SimRF is custom in-memory currency, labeled simulated everywhere, 1 SimRF
  presented as 1 RF for a future live integration (see project README). Kill
  payouts: shadow/swift 1, tank/ranged 2, elites ×3, bosses 25+2/wave, wave
  stipends, structure/economy multipliers. Upgrade costs are shown in-game.

## Checks and known issues

- `npm run typecheck`, `npm run logic:test` (33 tests incl. scripted 25-wave,
  developed late-game runs, economy, diversity, spawn sweeps, swept collision,
  aim/hysteresis/pointer mapping, enemy behaviors, abilities, passives,
  evolutions, mud/ward, trader atomicity, save migration, per-map perf),
  `npx friendsdk check`, `scripts/interaction-test.mjs` (WASD/tap/AUTO/trader/
  build/debug, desktop + 360px), `scripts/visual-qa.mjs`,
  `scripts/map2-qa.mjs`, `scripts/telegraph-qa.mjs`, `scripts/boss-qa.mjs`,
  `scripts/perf-qa.mjs` (all with inspected screenshots in `artifacts/`).
- Real-wallet playtest still required (ownership gate, live sprite reads).
- No localStorage/IndexedDB in the SDK sandbox: saves are versioned and
  session-local in previews (stated on the home plot).
- No per-NFT activated-world API in SDK v0.1.2: canonical preset islands
  rotate by wave block (garden → court → mesa → tides → terrace → hex);
  per-NFT selection is architected for later.
- Friend artwork loads all 64 canonical on-chain frames (idle + walk, 4
  facings) with a procedural fallback; Shadows reuse the same artwork as dark
  counterparts with ember eyes (allowed: no pixel-preservation requirement,
  NOTICE.md permits custom representations).
