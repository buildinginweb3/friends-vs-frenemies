# IMPLEMENTATION_PROGRESS — Rare Friends base-building / idle / defense overhaul

Living tracker for the FRIENDS vs FRENEMIES game-direction overhaul.
Status: COMPLETE · PARTIAL · MISSING · BLOCKED · DEFERRED (scope-controlled).

## Identity / core loop

- COMPLETE — HOME persistent: invasions run on the plot; boss Trader offers
  hold-HOME (default) or explicit expedition travel. Auto 5-wave teleport
  removed in the shell (engine `closeTrader` contract kept for tests).
- COMPLETE — Combat in service of the base: structures fight (turret,
  frost, healer, collector production), raiders target structures, Home Core
  loss ends the invasion with reduced rewards and no permanent destruction.
- COMPLETE — Roguelite repositioned: run upgrades solve the current invasion;
  base development solves future ones; expeditions preserve old combat maps.

## Player fantasy (no gun)

- COMPLETE — Visible gun removed: `drawBlaster` replaced by `drawFriendFocus`
  (orbiting attack charm + aim-side energy glow + expanding-ring fire flash).
  Projectiles originate at the Friend's center. Canonical sprite untouched.
- COMPLETE — Weapons reinterpreted as attack styles (ids stable, display
  renamed): Friend Bolt, Twin Spark, Rapid Sparks, Heavy Pulse, Shadow Lance,
  Friend Arc, Star Burst, Seeking Sparks, Orbiting Charms, Friend Beam,
  Shadowbane Lance, Glass Lance, Echo Duet, Prism Charm, Ricochet Charm,
  Volatile Pulse. `ATTACK_STYLE_NAMES` per family; UI labels updated.
- COMPLETE — Turret restyled: gun barrel → timber seed-launcher cup + power
  seed + leaf pennant; dome recolored from gunmetal to timber.

## Art direction (2.5D pixel toy-diorama)

Internal spec (see `lib/render-iso.ts` ART BIBLE header, authoritative):
- Characters: canonical 16×16 one-bit frames at 5× (80px), feet-anchored,
  white 1px halo + INK outline; 8-frame walk rhythm (0.11s).
- Light: flat ground ellipses (alpha 0.22) at anchors; height via `lift` only;
  no gradients, no blur.
- Depth: SDK shallow projection; upright bodies sort by x+y; feet planted.
- Outlines: INK 1.5–2px on structures/props; bodies via halo pass.
- Palette: PAPER UI, garden greens, signal accents; ember red = hostile;
  gold = rare/legendary.
- Density: `imageSmoothingEnabled=false`, rounded placement, chunky shapes.
- Enemies: official (family,seed) bodies + corruption + ember eyes + class
  props; role never tint-alone. Structures: timber/crystal/woven-paper toys.
- COMPLETE — Spec written + applied to player focus, turret, Home Core house
  (4 visual tiers), build-slot signs, lane markers, trader stall.
- PARTIAL — Older neglect: enemy ranged/sniper shadow bodies still carry
  nub/tube geometry (creature parts, not player firearms). Full prop-by-prop
  restyle pass remains future work.

## Home / idle

- COMPLETE — Peaceful mode: wander/inspect/drift-home, poke hop, chimney
  smoke, pulses, pollen, production animations, house tiers.
- COMPLETE — In-session idle production at HOME (capped, vault-scaled,
  paused/hidden-safe) + offline progression (8h cap, welcome-back toast).
- COMPLETE — AFK mode: toggle, indicator chip, turret minor-shadow trickle
  (75s, capped); major invasions still require DEFEND.
- COMPLETE — Tap-to-stroll at HOME (tap friend = poke, tap ground = amble).
- PARTIAL — Collect is via BASE panel (Collect button), not per-structure tap.
- DEFERRED — Storage auto-collect automation (vault raises cap today).

## Base building

- COMPLETE — 14-building roster (8–12 required): turret, frost, wall,
  collector, workshop, healer, altar, training, beacon, vault, archive,
  kennel, shrine, medbay; tiers with pips + visual growth; build slots
  (6 + 2×Plot Expansion); Base Level + settlement tiers gating expeditions.
- COMPLETE — Home Core: always-present house, pass-1-anchored, region-locked
  to the combat island, scaled HP, repair UI, loss = invasion lost.
- COMPLETE — Build-slot signs in-world (DEF/AID/RF/CHILL foundations+flags).
- DEFERRED — Branching specializations (Multi/Heavy etc.).
- PARTIAL — Base expansion = Plot Expansion slots + tiers (same-map visual
  growth via house/structures/pips; no new territory maps).

## Defense combat

- COMPLETE — Structure targeting: saboteur/thief/artillery/siege/bosses;
  Siegebreaker marches incl. Home Core; boss-slam splash chips the house.
- COMPLETE — Lanes: validated gates, compass labels, prep-briefing watch
  list + advice, live HUD chips, in-world pulsing gate markers.
- COMPLETE — 13 encounter types with ceilings; honest composition labels.
- COMPLETE — Prep phase (brief, repair, launch, auto-countdown).
- PARTIAL — Barracks defenders: companions + wisps via kennel (no separate
  barracks building).
- DEFERRED — Purified-Frenemy defenders (architected via official art
  identities; not implemented).

## Maps / camera

- COMPLETE — Follow camera (`updateCamera`, SDK scrolling-world pattern).
- COMPLETE — `scripts/map-audit.mjs`: all 6 maps × bare/developed PASS
  (walkable %, gates ≥ validated, corridors, house reachable ≤170).
  Continents 60–72% walkable; islands 19–24% by preset nature (documented).
- PARTIAL — Raw dimensions fixed by SDK 576×384 preset format (platform
  bound, not a bug). Growth delivered as usable area + connectivity + camera.
- COMPLETE — Island connectivity: gates route-validated; house region-locked
  to the combat island; home anchor stabilized across builds.

## Economy / Trader / progression

- COMPLETE — RF-only economy; Trader Beacon rarity/reroll/stock scaling;
  Trader opens post-boss with next-map rotation preview + travel bonus.
- COMPLETE — Milestones, quests, codex, settlement tiers, expedition bonuses.
- COMPLETE — Friend/base/idle/defense progression layers in UI tabs.

## Performance / mobile / tests

- COMPLETE — typecheck clean; `friendsdk check` valid; production build OK.
- COMPLETE — 56 logic tests (2 new blocks: Home Core; lanes/styles).
- COMPLETE — render-smoke (13 draws, no throws) committed.
- COMPLETE — No hot-path regression: per-step delta is one hash lookup;
  furball ≈7–9.5ms isolated (10ms budget).
- PARTIAL — Wall-clock perf tests flake under full-suite load on slow
  hardware; green in isolation. Browser QA runs with user-dir-extracted
  Chromium libs (`LD_LIBRARY_PATH=/tmp/syslibs/...`, no sudo needed).
- BLOCKED — Real-wallet playtest (needs owner session).

## Visual / art-direction overhaul (this pass)

- COMPLETE — Map rotation every 5 waves reinstated: boss Trader always
  advances to the next map (build/equipment/bank/rewards persist; scene
  prebuilds off-path). Base plot choice sets the FIRST map only
  (`plotStartMap`: plot preset → MAPS index). Trader shows next-map preview
  with travel bonus instead of the expedition picker.
- COMPLETE — Ground dressing from real SDK world data only (path polylines →
  edge stones; patch rects → water foam/glints + reed hugging; polygon rims →
  cliff grass lip; prop footprints → grounded shadows) + scene-seeded
  walkable-checked scatter (tufts/flowers/pebbles) + 6 per-map biome palettes.
  WeakMap-cached per scene; bounded per-frame ops; motion-gated animation.
- COMPLETE — Home rug, gate slabs + pennants, lit torches on inbound lanes,
  4 handcrafted pixel props near home (signpost, lantern, toadstools, bush).
- COMPLETE — Structures 2.5D: packed-dirt footings, platforms, right-side
  shade, eave lines, foundation rows, back shards/crystals, deck + canopy
  thickness on the trader stall, dirt + base stones on walls/signs.
- COMPLETE — Enemy variety: role eye colors (support gold, sniper cyan,
  necro/mage/summoner violet, commander amber, drainer/cryo blue), role
  ground rings, boss rotating rune ticks, pixel hit stars, pickup glints,
  victory sparkles.
- COMPLETE — UI pixel reskin: stepped-corner double-border plates (canvas +
  CSS), checker header inlays, rarity bars + icon tiles in shop, offer icon
  tiles, pulsing Collect button, Friend portrait cameos (canvas nameplate +
  PixelPortrait in trader/level-up/base/results/intro).
- COMPLETE — Fixed hook-order crash (portrait memos after loading return →
  React #310) found via harness stack + SDK source correlation.
- COMPLETE — Hardened rAF dt floor (SDK movement guard threw once on a
  headless timestamp glitch).
- COMPLETE — QA scripts updated for plot-gate + prep-launch flows;
  interaction-test 16/16 in-check PASS; 10+3+mobile staged screenshots
  captured and reviewed; map2/roster/boss/perf suites re-verified.
- PARTIAL — `testGame` final assert trips on the SDK mock's 7730-only
  artwork rule (public generator reads for Frenemy bodies record
  fixture.errors); game degrades correctly, screenshots/checks all pass.
  Needs SDK-side mock relaxation for generator reads.
- DEFERRED — Full prop-by-prop restyle (SDK-baked halftone paths/canopy),
  emoji-free upgrade icons, day/activity variants.

## Deferred (scope-controlled, per brief §79)

Offline-true-persistence beyond session sandbox (in-session + 8h offline calc
done — true persistence is a platform bound); purified Frenemies; expedition
expansion; day/activity variants; cosmetic-life bulk; specializations;
secondary material.
