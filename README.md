# FRIENDS vs FRENEMIES

**Your Friend. Your home. Defend it together.**

A base-building + idle + tower-defense game starring your Rare Friend for the
**Rare Friends Vibeathon** (Sept 20–30, 2026). Your actual Rare Friend lives on
its own plot — wandering, inspecting structures, napping by its house — while
you build turrets, collectors and walls, gather idle production (even AFK),
then actively help your defenses repel lane-based Frenemy invasions through
gates and paths. Action combat serves the base, not the other way around.

## Concept

`CONNECT → SELECT FRIEND → HOME PLOT → IDLE / PRODUCE → BUILD → UPGRADE →
PREPARE → INVASION (lanes) → ACTIVELY HELP DEFEND → EARN → REPAIR / EXPAND →
HARDER INVASION → REPEAT`

Long-term: `OWN → BUILD → GROW → DEFEND → EARN → EXPAND`.

The Rare Friend is the game: its verified on-chain sprite lives in a house
(Home Core) on a plot seeded by its token ID, attacks with its own Friend
powers (never a held gun), and Shadow Friends are corrupted counterparts of
that same artwork. Every permanent upgrade is visible on the plot or in combat.

## Home Plot

After wallet connect + Friend selection (both owned by the SDK runtime), you
arrive at your Friend's home — not a menu. The Friend wanders, pauses,
inspects its structures and drifts home; tap the ground to stroll there, tap
the Friend and it hops. Empty build slots show as wooden foundations with
flags. The plot shows your Home Core house, turret seed-launcher, barricade
posts, healing spring and RF collector as physical props the day you buy them.

**Peaceful mode:** with no invasion running, structures idle visibly (collector
fills, workshop sparks, healer pulses) and production accrues into a capped
bank — collect it from BASE. **AFK mode** (AFK button): turrets swat minor
shadows on their own for trickle RF; major invasions still need you — press
**DEFEND** when ready. If the Home Core falls the invasion is lost (reduced
rewards, base itself is never destroyed).

## Run cadence

Maps rotate every 5 waves: your base plot choice sets the FIRST map, then
each boss → Rare Trader → next map (Sun Garden → Copper Court → Ember Mesa →
Reed Tides → Sky Terrace → Star Hex → back around), with Base-Level-gated
travel bonuses. Build, equipment, bank and rewards all carry across the
transition (only the scene swaps; the next map prebuilds off the critical
path). Invasions run in waves with preparation briefings (scouted kinds,
threatened lanes, repair, launch when ready).
Enemies invade through validated gates as coherent lanes — NORTH GATE, EAST
PATH, … — with live lane warnings (HUD chips + in-world markers), not random
surrounds. Raiders (saboteurs, thieves, artillery, siege) force different
interceptions; the Siegebreaker boss marches on structures including the Home
Core. Boss slams landing on the house chip it.
Waves alternate types: patrol, assault, siege, ambush, commander push, burrow,
elite hunt, sniper pressure, swarm, resource raid, breach, holdout, boss.
Elites spike excitement with bonus XP/RF. Stragglers get hunted, never waited on.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Move in MANUAL mode (default; normalized diagonals) |
| Mouse | Aim Friend powers in MANUAL desktop (facing follows with hysteresis) |
| Tap / click | Tap-to-move in MANUAL and at HOME; poke your Friend at home |
| AUTO / MAN chip | Toggle auto-pilot anytime (persisted preference) |
| AFK button (home) | Toggle AFK: idle production + turret auto-defense trickle |
| Space | Ability slot 1: Friend Blast — damage + knock back (cooldown reduced by gear/upgrades) |
| Q / E | Ability slots 2–3: unlocked powers (Blast + up to 2; R mirrors slot 3) |
| Z / X / C / V | Item belt: use the first four owned consumables in fixed order |
| 1 / 2 / 3 | Pick a level-up upgrade (abilities appear as choices too) |
| H | Collision + performance debug overlay (development) |
| M | Mute toggle |

MANUAL desktop = WASD positioning + mouse aiming (Friend powers fire
automatically along the cursor; mobile MANUAL keeps auto-aim). MANUAL =
positioning/aiming skill (dodge telegraphs, kite bosses, choose lanes, grab
pickups). AUTO = competent idle pilot (kites, dodges telegraphs, prioritizes
supporters, collects pickups).

## Run progression (temporary)

- **15 Shadow archetypes,** each with a distinct Friend-derived silhouette
  (slim swifts, bulky tanks, visored ranged/snipers, crossed supports…):
  Shadow + Swift (w1) → Swarm (w2) → Ranged (w3) → Tank + Charger (w4) →
  Splitter/Support (map 2) → Bomber/Sniper (map 3–4) → Orbiter/Blinker/Leaper
  (map 4–5) → Summoner/Shield. Elites (frenzied/armored/giant) spike rewards.
- **7 bosses** with 60%/30% phase escalations:
  Brute (slam), Hunter (charges), Swarmkeeper (summons), Artillerist
  (spreads), Warden (ward windows), Blink King (teleports), Siegebreaker
  (marches structures incl. the Home Core) — plus controlled adds and
  chapter-end cleanup (RF shower + pickups).
- XP auto-collects; each level offers **3 of 24 stackable upgrades** in 6
  build families (projectile/burn/tank/companion/crit/utility) plus unlockable
  **abilities** (dash/nova/barrier/strike/overdrive; blast + 1 equipped).
  Evolutions: FRIEND BARRAGE, INFERNO, OVERCLOCKED, FRIEND ARMY, PINBALL,
  THUNDERHEAD, VOID LANCE, INFERNO SCATTER.
- **11 Friend attack styles** (bolt/twin-spark/rapid/heavy-pulse/lance/arc +
  star-burst/orbiting-charms/seeking-sparks/beam), each with distinct shots,
  charm arrangements and impacts. The Friend itself emits every attack via an
  orbiting charm + aim-side energy glow — no held weapons, ever.
- Run RF bank pays for mid-run **Heal**, **Reroll**, and **consumables**.

## Enemies, bosses, gear, Trader

- **Formations:** pincer, ring, escort, hunting party, firing line, swarm
  burst — gates assigned per wave type so packs arrive with intent.
- **Map pressure:** garden (swift/swarm), court (tank/ranged/charger),
  mesa (bombers/leapers + ember vents), tides (orbiters/support + mud),
  terrace (snipers/shields), hex (everything + elites).
- **Permanent tracks:** Friend stats, plot structures (turret, frost spire,
  barricade, healer, collector, workshop, altar, vault… — all physical props),
  Home Core house tiers, economy (RF gain, loot luck), Base Level + settlement
  tiers (Campsite → Sanctuary) gating expeditions.
- **Gear:** attack style/armor/trinket across 5 rarities with real tradeoffs
  (heavy pulse = slow + knockback, scout = speed + dodge − HP…), 4-item Trader
  stocks with rarity odds that improve per block, escalating rerolls,
  CURRENT-vs-NEW compare, instant equip, 40% salvage, run consumables
  (heal/ward/tonic/token). Equipment changes charms, auras and attack style —
  never the canonical sprite, never a held weapon.
- **RF sinks:** Trader gear, rerolls, permanent upgrades, base structures and
  Plot Expansion, in-run heal, consumables. Results show earned/spent/net +
  lifetime totals. RF-only economy (no secondary currency).
- **Pickups:** RF caches, hearts, haste, power — movement decisions for
  manual, magnet collection for all.
- **Idle:** collector/workshop production accrues in-session at HOME into a
  vault-capped bank; offline progress accrues capped at 8h with a welcome-back
  summary; AFK turret trickle handles minor shadows. Active defense stays the
  fastest progression.
- **Saves:** versioned schema v4 (migrates earlier), persisted RF/gear/upgrades/
  records/mode preference; session-local in the SDK sandbox (stated in-game).

## Simulated $RAREFRIENDS disclosure

**All currency, purchases, drops and rewards are simulated and clearly labeled
"simulated" in-game. Nothing has real token value; no contracts are deployed,
no funds move.** SimRF is a custom in-memory currency (1 SimRF presented as
1 RF) so a future approved live integration can map it to real RF. `game.json`
is the SDK-required reference definition only and its actions are never used.

## FriendSDK integration (v0.1.2)

- Runtime supplies wallet, owned-Friend discovery/selection and the hardwired
  (gen ≥ 1, Robinhood 4663) eligibility gate. No custom wallet/NFT code.
- `client.read()` on session start; `client.mode` drives the RF label.
- World: canonical `01-garden-oval-complete` preset (color palette) via
  `getWorldPreset`/`validateWorld`/`loadWorldAssets`; locomotion via
  `createWorldMovement`; enemy pathing via `createWorldNavigator`
  (`route`/`segmentClear`); rendering via SDK `project`/`unproject` with x+y
  depth sorting; **follow camera** (`updateCamera`) scrolling the 960×640 view
  window across the 1600×1200 native canvas (SDK scrolling-world pattern —
  no invented APIs). Per-NFT world selection is architected for later
  (world-scene module). The 576×384 SDK plane is fixed by the preset format,
  so map growth went into usable walkable area + connectivity + camera rather
  than raw dimensions (see `scripts/map-audit.mjs`).
- Friend art: all 64 canonical on-chain frames (idle + walk × 4 facings) read
  over plain JSON-RPC with procedural fallback — never blank-screens. Shadows
  reuse the same artwork as dark counterparts with ember eyes (allowed: no
  pixel-preservation rule).
- Sound via the SDK sound kit (+ mute). Reduced motion, keyboard + touch,
  loading/error states, `paused` respected.
- No localStorage/IndexedDB in the sandbox → saves are versioned, validated,
  and **session-local** (the game says so on the home plot).

## Setup

Requirements: Node.js 22+, npm, Git. A browser wallet with a hardwired
Rare Friends Generations NFT (gen ≥ 1) on Robinhood mainnet to play
(real-wallet playtest still required — the mock harness can't verify ownership).

```sh
npm install
```

The SDK is vendored (`vendor/rarefriends-friendsdk-0.1.2.tgz`, from the
[v0.1.2 release](https://github.com/spokesz/friendsdk/releases/tag/v0.1.2)),
so install works offline after cloning.

> **WSL/Windows note:** run everything from an **Ubuntu/WSL terminal, not
> PowerShell** — `node_modules` contains the Linux toolchain (esbuild), so the
> commands cannot work on Windows directly. A stray Yarn PnP manifest at the
> Windows home folder breaks the SDK's esbuild bundling, so `dev`/`build`/`test`
> run through `scripts/pnp-safe.mjs`, which briefly moves unrelated manifests
> aside and always restores them (including on Ctrl+C; `npm run pnp:restore`
> recovers manually if the wrapper is ever hard-killed). Long-term, a
> Linux-home checkout avoids this.

`npm run` scripts: `dev`, `dev:lan`, `build`, `check`, `test`, `test:mobile`,
`typecheck`, `logic:test`.

## Development

```sh
npm run dev
# open the printed URL (normally http://localhost:4173)
```

Phone testing on the same Wi-Fi:

```sh
npm run dev:lan
# open http://YOUR_COMPUTER_LAN_IP:4173 on your phone
```

## Production build & deployment

```sh
npm run build   # → games/friends-vs-frenemies/.friendsdk/
```

The `.friendsdk/` folder is a static site (keep relative paths + CSP). For the
Vibeathon preview: copy its **contents** into a `gh-pages` branch with an empty
`.nojekyll`, enable Pages (Deploy from branch → `gh-pages` → `/(root)`), and
use that URL in the submission. **Do not publish until the owner approves.**
No contracts, funds, or submission PR without explicit approval.

## Verification (all actually run)

- `npm run logic:test` — 56 engine/world/balance/save/sim tests: scripted
  25-wave developed-base playtest (robust across seeds), economy calibration
  (wave-5 banks ≈100–130), build-diversity check, spawn-validation sweeps,
  swept-collision, aim sectors/hysteresis/direction, pointer mapping, enemy
  behaviors incl. Home Core loss → gameover, lane warnings, attack-style
  naming, abilities, passives/evolutions, mud/ward, trader atomicity,
  save migration, per-map perf regression.
- `node scripts/map-audit.mjs` — walkable fraction, gate counts, dash/tap
  corridors, Home Core reachability on all 6 maps × bare/developed builds.
  PASS.
- `node scripts/render-smoke.mjs` — headless mock-context execution of every
  draw path (home empty/developed, 5 attack styles, boss waves, slam splash,
  debug overlay). PASS.
- `npm run typecheck` — clean.
- `npm run check` — `friendsdk check` valid.
- `npm run build` — production bundle built.
- `scripts/interaction-test.mjs` — 16 checks PASS in harness (home, intro,
  plot choice, sheets, combat start, prep launch, WASD, tap-to-move,
  AUTO switching, kills, level-up, blast, build inspector, debug).
- `scripts/visual-overhaul-qa.mjs` — 10 staged screenshots (home, prep,
  combat, level-up, boss, trader, buy, reroll, rotated map, later map).
- `scripts/visual-base-qa.mjs` — results, base sheet, developed-home shots.
- `scripts/map2-qa.mjs`, `telegraph-qa.mjs`, `boss-qa.mjs`, `perf-qa.mjs` —
  re-verified post-overhaul (map transition, roster/telegraphs, boss
  patterns, flat step/render across 5 maps, single loop).
- Dev-only hooks (`?fvfWave|fvfMap|fvfBuild|fvfRf|fvfShop`) work on localhost
  dev servers only — never on public previews.

Browser tests need Chromium system libs; without sudo, extract them with
plain `apt-get download` + `dpkg-deb -x` into a user dir, e.g.
`LD_LIBRARY_PATH=/tmp/syslibs/usr/lib/x86_64-linux-gnu` (no root needed).

Art direction: pixel 2.5D toy-diorama bible in `lib/render-iso.ts` (ART BIBLE
header). Ground dressing derives only from real SDK world data (path
polylines, patch rects, polygon rims, prop footprints) + seeded scatter.
Map rotation every 5 waves; base plot choice sets the first map only.

## Known limitations

- Session-local saves in previews (SDK sandbox has no storage); reload restarts.
- No real activated-plot rendering API in SDK v0.1.2 → seeded fallback plot.
- Map size is bounded by the SDK 576×384 preset plane (fixed format): growth
  went into walkable use, connectivity, camera and lanes instead.
- Wall-clock perf tests (furball, five-map ratio) are marginal on slow/shared
  hardware; they pass in isolation (furball ≈7–9.5ms of 10ms budget) and flake
  only under full-suite load on this laptop.
- Browser interaction/visual QA scripts need Chromium system libs; see above
  for the no-sudo extraction flow.
- Emoji/symbols show as boxes on font-poor headless test browsers only.
- The SDK mock harness only serves recorded artwork for Friend #7730: the
  game's public generator-art reads for Frenemy bodies trip the mock's strict
  assertions (`fixture.errors`), so `testGame`-based scripts report failure at
  the final assert even when every in-game check passes and all screenshots
  are captured. In-game behavior is correct (graceful procedural fallback);
  relaxing the mock for generator reads is SDK-side future work.
- Real-wallet playtest (ownership gate, RPC sprite reads) still required.
- Deferred by design (see IMPLEMENTATION_PROGRESS.md): building
  specializations, auto-collect automation, purified-Frenemy defenders,
  expedition expansion, day/activity variants, secondary crafting material.
- Cut for scope: random events, PvP/trading, on-chain play.

## Vibeathon alignment

- **Character Spotlight:** the Generations NFT *is* the main character, rendered
  from live on-chain art on its own seeded land.
- **Token Activity / Economy Potential:** a complete simulated RF loop
  (fight → earn → build → stronger) designed to map 1:1 onto real RF later.
- Submission (when approved): PR adding `submissions/friends-vs-frenemies/README.md`
  with name, contact, category, one-liner, source, preview URL, controls/rules,
  economy terms, checks and known issues — per the fishing PR #1 format.
