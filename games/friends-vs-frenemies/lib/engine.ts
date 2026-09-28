/**
 * FRIENDS vs FRENEMIES — combat simulation in Rare Friends WORLD SPACE.
 * Survivor + idle RPG: MANUAL positioning (WASD/arrows/tap) with auto-attacks,
 * optional AUTO-pilot, validated spawn pipeline, body colliders, swept
 * projectiles, 10 enemy archetypes, budget wave director, elites, 3 boss
 * patterns, trader shops, multi-map runs, pickups, RF accounting.
 * Framework-free fixed-timestep engine: pure data in, events out.
 */
import { createWorldMovement } from "@rarefriends/friendsdk/movement";
import {
  ENEMIES, NEW_ENEMIES, BODY_R, FRIEND_BODY,
  waveHpMult, waveDmgMult, waveSpeedMult, bossSpec, eliteChance,
  xpForLevel, UPGRADES, UPGRADE_IDS, bossDropPool, bossDropChance,
  BLAST_COOLDOWN, BLAST_DMG_MULT, BLAST_RADIUS, HEAL_AMOUNT, healCost, REROLL_COST,
  planWave, unlockedKinds, BUDGET_COST, bossPatternFor, MAPS, mapForWave,
  traderStock, rerollCost, PICKUP_W, ABILITIES, MAX_ACTIVE_ABILITIES, ABILITY_MAX_RANK, abilitiesForAltar,
  TEMPLATE_KINDS, TEMPLATE_MIN_SHARE, EARLY_WAVES, RELICS, ENEMY_OBJECTIVE,
  planEncounter, ENCOUNTERS, collectorRate, structureById, eliteModFor,
  HOME_CORE, structLabel, homeCoreHp,
  type UpgradeId, type AbilityId, type DerivedStats, type EnemyArchetype, type WaveType,
  type BossPattern, type EliteMod, type StockItem, type PickupKind, type ConsumableDef,
  type EncounterId, type EnemyObjective, type TraderMods,
} from "./balance";
import {
  WORLD_W, WORLD_H, randomWalkable, isValidSpawn, isWorldWalkable, regionAt,
  type Scene, type WorldPoint,
} from "./world-scene";
import type { SpriteFacing } from "./sprites";

/** World-space tuning (plane is 576x384; projection magnifies ~1.3-1.5x). */
export const FRIEND_SPEED = 148;
export const FRIEND_RANGE = 178;
const ENEMY_SPEED: Record<string, number> = {
  shadow: 38, swift: 68, tank: 24, ranged: 33, swarm: 56, boss: 27,
  charger: 44, split: 46, shield: 32, support: 38, summoner: 30, splitling: 70,
  bomber: 62, sniper: 36, orbiter: 70, blinker: 48, leaper: 46,
  mage: 34, burrower: 42, commander: 32, drainer: 40,
  saboteur: 54, thief: 74, artillery: 26, necromancer: 28, traplayer: 44, siege: 20,
  cryo: 38, corrupter: 46, elitehunter: 72, minibrute: 30, minimage: 30, minisiege: 24,
};
const BLAST_RADIUS_W = 132;
const BARRICADE_RADIUS = 92;
const MAX_ENEMIES = 90;

export interface Enemy {
  id: number; kind: EnemyArchetype;
  x: number; y: number;
  hp: number; maxHp: number; dmg: number; speed: number;
  xp: number; rf: number; radius: number; body: number; stopDist: number;
  slowT: number; slowF: number;
  burnT: number; burnDps: number;
  shieldHp: number; shieldMax: number;
  elite: boolean; eliteMod: EliteMod | null; mods: string[];
  pattern: BossPattern | null; bossName: string; phase: number;
  wardT: number; wardDown: number; blinkT: number; addT: number;
  atkCd: number; shootCd: number; burstT: number; summonT: number;
  slamT: number; slamX: number; slamY: number; slamCd: number;
  chargeState: "roam" | "tele" | "dash" | "vuln";
  chargeT: number; chargeDx: number; chargeDy: number; chargeCd: number;
  fuseT: number; aimT: number; aimDx: number; aimDy: number;
  orbitDir: number; orbitT: number;
  skipT: number; skipPhase: number;
  leapState: "roam" | "tele" | "air"; leapT: number; leapX: number; leapY: number;
  burrowState: "roam" | "down" | "up"; burrowT: number; burrowX: number; burrowY: number;
  mageCd: number; drainT: number;
  /** Base-raid behavior: what this foe wants to break. */
  objective: EnemyObjective;
  structCd: number; stolen: number; mineT: number; reviveT: number; bombardT: number;
  fleeing: boolean;
  flash: number; walkPhase: number; lungeT: number; spawnT: number;
  facing: SpriteFacing;
  px?: number; py?: number;
  waypoints: WorldPoint[]; repathT: number;
  stuckT: number; lastX: number; lastY: number; stuckFails: number;
  goalX: number; goalY: number;
}

export interface Projectile {
  x: number; y: number; px: number; py: number; vx: number; vy: number;
  dmg: number; pierce: number; bounce: number;
  explosive: number; explosiveR: number;
  burnDps: number; burnDur: number;
  slowF: number; slowDur: number; freeze: boolean;
  crit: boolean; life: number; color: string; size: number;
  hitIds: number[];
  homing?: number;
}

export interface Bolt { x: number; y: number; px: number; py: number; vx: number; vy: number; dmg: number; life: number; chill?: boolean }
export interface Companion { angle: number; cd: number; power: number; x: number; y: number }
export interface Floater { x: number; y: number; text: string; color: string; ttl: number; big: boolean }
export interface Orb { x: number; y: number; vx: number; vy: number; ttl: number }
export interface Particle { x: number; y: number; vx: number; vy: number; ttl: number; color: string; size: number }
export interface Announce { text: string; sub: string; ttl: number; max: number }
export interface Pickup { kind: PickupKind; x: number; y: number; vx: number; vy: number; ttl: number }
export interface Corpse { x: number; y: number; kind: EnemyArchetype; ttl: number; scale: number }
export interface VentState { x: number; y: number; phase: "idle" | "tele" | "burst"; t: number }
/** Ground danger/utility zones (mage fire, freeze fields, gravity wells). */
export interface Zone { kind: "mage" | "freeze" | "gravity"; x: number; y: number; r: number; ttl: number; max: number; dps: number; slowF: number }

export interface Offer {
  id: UpgradeId | "snack" | AbilityId;
  name: string; desc: string; icon: string;
  evolved: boolean; stacks: number; maxStacks: number;
}

export type RunEvent =
  | { t: "levelup" }
  | { t: "wave"; wave: number }
  | { t: "bosswarn"; wave: number; pattern: BossPattern; name: string }
  | { t: "bossdown"; wave: number }
  | { t: "gameover"; summary: RunSummary }
  | { t: "hurt" }
  | { t: "eshot" }
  | { t: "blast" }
  | { t: "heal" }
  | { t: "evolved"; name: string }
  | { t: "geardrop"; gearId: string }
  | { t: "elite" }
  | { t: "trader"; block: number }
  | { t: "mapswap"; mapIdx: number }
  | { t: "pickup"; kind: PickupKind }
  | { t: "codex"; id: string; kind: string }
  | { t: "quest"; id: string }
  | { t: "structdown"; id: string }
  | { t: "structhurt"; id: string }
  | { t: "stolen"; amount: number }
  | { t: "recovered"; amount: number }
  | { t: "prepdone"; wave: number };

export interface RunSummary {
  timeSurvived: number; wave: number; mapIdx: number; kills: number; bosses: number;
  rfEarned: number; rfSpent: number; gearDrops: string[];
}

export type FriendMood = "idle" | "seek" | "fight" | "kite" | "retreat" | "home";
export type RunPhase = "combat" | "shop" | "prep";
/** Placed trap (friendly) or mine (hostile). */
export interface Trap { x: number; y: number; r: number; ttl: number; dmg: number; foe: boolean; slowF: number }
/** Temporary summon (wisp): fights, then fades. */
export interface TempFriend { x: number; y: number; cd: number; ttl: number; power: number; angle: number }

export interface ShopState {
  block: number;
  stock: StockItem[];
  rerolls: number;
  wave: number;
}

export interface RunState {
  seed: number;
  rng: () => number;
  time: number;
  scene: Scene;
  mapIdx: number;
  home: WorldPoint;
  mover: ReturnType<typeof createWorldMovement>;
  mood: FriendMood;
  aiT: number; strafeT: number; strafeDir: number; stuckT: number; lastPos: WorldPoint;
  manual: boolean;
  mpos: WorldPoint; mfacing: SpriteFacing; mwalking: boolean;
  keys: Set<string>;
  tapDest: WorldPoint | null;
  /** Manual-desktop aiming: mouse world point; mobile/AUTO use target aim. */
  aimMode: "mouse" | "auto";
  aimWorld: WorldPoint;
  aimSet: boolean;
  aimFace: SpriteFacing;
  phase: RunPhase;
  shop: ShopState | null;
  shopOpen: boolean;
  derived: DerivedStats;
  turretLvl: number; wallLvl: number; healerLvl: number; collectorLvl: number; lootLuck: number;
  frostLvl: number; medbayLvl: number;
  /** Structure HP in combat by anchor id; disabled timers; overcharge timer. */
  structHp: Record<string, number>; structMax: Record<string, number>; structOff: Record<string, number>;
  overchargeT: number; bulwarkT: number; bulwarkArmor: number; reflectT: number; domeT: number;
  /** Ability ranks this run (re-pick ranks up, max ABILITY_MAX_RANK). */
  abilityRank: Record<string, number>;
  unlocks: { bulwark: number; traps: number; overcharge: number; kennel: number; workshop: number };
  training: number;
  traps: Trap[]; wisps: TempFriend[];
  encounter: EncounterId; prepT: number; expRf: number; expLoot: number;
  plotHpBonus: number; plotRegen: number; plotPickup: number; plotRf: number; plotXp: number;
  prodTick: number;
  seenKinds: string[]; structDamageTaken: number; stolenLost: number; stolenBack: number;
  flawlessWaves: number; waveStructHit: boolean;
  weaponTint: string;
  reducedMotion: boolean;
  hp: number; maxHp: number;
  armor: number;
  wave: number; intermission: number;
  waveType: WaveType;
  surgeMult: number;
  queue: { kind: EnemyArchetype; delay: number; gate?: number; forceElite?: boolean }[];
  spawnT: number;
  lastKillT: number; strayHunt: boolean;
  enemies: Enemy[];
  shots: Projectile[];
  bolts: Bolt[];
  companions: Companion[];
  floaters: Floater[];
  orbs: Orb[];
  particles: Particle[];
  pickups: Pickup[];
  corpses: Corpse[];
  vents: VentState[];
  announce: Announce[];
  xp: number; level: number; xpNext: number;
  stacks: Record<UpgradeId, number>;
  abilities: AbilityId[];
  abilityCd: Record<string, number>;
  altarLevel: number;
  relics: string[];
  relicEchoN: number;
  relicMirrorN: number;
  momentum: number;
  hitstop: number;
  timeCoreT: number;
  furyT: number;
  zones: Zone[];
  shopPre: StockItem[] | null;
  shopPreBlock: number;
  overT: number; shieldT: number; iframes: number; slowMe: number;
  strikes: { x: number; y: number; t: number }[];
  orbTick: number;
  beamT: number; beamAng: number;
  evos: string[];
  offers: Offer[];
  rerollsUsed: number;
  frozen: boolean;
  over: boolean;
  committed: boolean;
  kills: number; bosses: number; elitesSlain: number;
  bankRf: number;
  earned: number; spent: number;
  cons: Record<string, number>;
  shieldHp: number; tonicT: number; powerT: number; hasteT: number; luckyWave: number;
  gearDrops: string[];
  fireCd: number; turretCd: number; turretAngle: number; healerT: number;
  blastCd: number; healUses: number;
  celebrateT: number;
  shake: number;
  nextId: number;
  events: RunEvent[];
  bossId: number | null;
  debug: boolean;
  stuckFixes: number; spawnRejects: number;
  stuckRoute: number; stuckWatch: number;
  stepMs: number;
  pathReqs: number;
  /** Cached defense lanes: gate-cluster -> goal-cluster routes, rebuilt per
   * wave. Followers copy lane waypoints instead of running A* (§87). */
  routeCache: Map<string, WorldPoint[]>;
  aimAngle: number; muzzleT: number;
  tapMark: { x: number; y: number; ttl: number } | null;
}

export interface RunConfig {
  seed: number;
  scene: Scene;
  mapIdx: number;
  derived: DerivedStats;
  turretLvl: number; wallLvl: number; healerLvl: number; collectorLvl: number; lootLuck: number;
  weaponTint: string;
  reducedMotion: boolean;
  manual: boolean;
  altarLevel?: number;
  frostLvl?: number; medbayLvl?: number;
  unlocks?: { bulwark: number; traps: number; overcharge: number; kennel: number; workshop?: number };
  training?: number;
  expRf?: number; expLoot?: number;
  plot?: { hp: number; regen: number; pickup: number; rf: number; xp: number };
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function friendPos(run: RunState): WorldPoint {
  if (run.manual) return [run.mpos[0], run.mpos[1]];
  const p = run.mover.state.position;
  return [p[0], p[1]];
}

export function friendFacing(run: RunState): SpriteFacing {
  if (run.manual) return run.aimMode === "mouse" && run.aimSet ? run.aimFace : run.mfacing;
  return run.mover.state.facing;
}

/**
 * Continuous 360° mouse aim in world space.
 *
 * The AIM VECTOR (cursorWorld - playerWorld, normalized) is stored losslessly
 * in `run.aimWorld` and used directly for every projectile via
 * `continuousAimAngle`/`aimVector` — never quantized, never snapped to sprite
 * facings. Sprite facing (`run.aimFace`) is a SEPARATE 4-way display value with
 * hysteresis so canonical Friend frames stay stable near sector boundaries.
 */
export function setAim(run: RunState, wx: number, wy: number): void {
  const [fx, fy] = friendPos(run);
  run.aimWorld = [wx, wy];
  run.aimSet = true;
  // Screen-projected sectors: right/left split on (dx-dy), down/up on (dx+dy).
  const dx = wx - fx, dy = wy - fy;
  const sx = dx - dy, sy = (dx + dy) * 0.5;
  const mag = Math.hypot(sx, sy);
  if (mag < 4) return; // dead zone: cursor on the Friend keeps current facing
  let want: SpriteFacing;
  if (Math.abs(sx) > Math.abs(sy)) want = sx > 0 ? "right" : "left";
  else want = sy > 0 ? "down" : "up";
  if (want === run.aimFace) return;
  // Hysteresis: require the aim to be firmly inside the new sector.
  const along = want === "right" ? sx : want === "left" ? -sx : want === "down" ? sy : -sy;
  const across = want === "right" || want === "left" ? Math.abs(sy) : Math.abs(sx);
  if (along > across * 1.35) run.aimFace = want;
}

/** True continuous aim angle in world space (radians, never quantized). */
export function continuousAimAngle(fx: number, fy: number, wx: number, wy: number): number {
  return Math.atan2(wy - fy, wx - fx);
}

/** Normalized continuous aim vector from player to cursor in world space. */
export function aimVector(run: RunState): { x: number; y: number; angle: number; dist: number } {
  const [fx, fy] = friendPos(run);
  const dx = run.aimWorld[0] - fx, dy = run.aimWorld[1] - fy;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return { x: 1, y: 0, angle: 0, dist: 0 };
  return { x: dx / dist, y: dy / dist, angle: Math.atan2(dy, dx), dist };
}

/** Debug snapshot proving sprite facing never leaks into projectile aim. */
export function aimDebug(run: RunState): {
  player: WorldPoint; cursor: WorldPoint;
  aimVec: { x: number; y: number }; aimAngle: number;
  projAngle: number; facing: SpriteFacing;
} {
  const [fx, fy] = friendPos(run);
  const v = aimVector(run);
  return {
    player: [fx, fy], cursor: [...run.aimWorld],
    aimVec: { x: v.x, y: v.y }, aimAngle: v.angle,
    projAngle: run.aimAngle, facing: run.aimFace,
  };
}

export function friendWalking(run: RunState): boolean {
  return run.manual ? run.mwalking : run.mover.state.walking;
}

export function moveSpeedOf(run: RunState): number {
  let m = 1 + run.derived.moveSpeed + 0.08 * run.stacks.boots;
  if (run.hasteT > 0) m *= 1.25;
  m *= 1 + Math.min(0.06, run.momentum * 0.006);
  return Math.max(0.7, m);
}

/** Auto-pilot routing with bounded worst case (mirrors requestRoute). */
function pilotTo(run: RunState, dest: WorldPoint): boolean {
  const [fx, fy] = friendPos(run);
  const dx = dest[0] - fx, dy = dest[1] - fy;
  const d = Math.hypot(dx, dy);
  run.pathReqs++;
  if (d > 230) {
    const mid: WorldPoint = [fx + (dx / d) * 200, fy + (dy / d) * 200];
    if (isWorldWalkable(run.scene.world, mid, 7)) return run.mover.moveTo(mid);
    return run.mover.moveTo(dest);
  }
  return run.mover.moveTo(dest);
}

/** Screen-space dominant axis from a world velocity (matches projection). */
export function facingOf(vx: number, vy: number, fallback: SpriteFacing = "down"): SpriteFacing {
  const sx = vx - vy;
  const sy = (vx + vy) * 0.5;
  if (Math.abs(sx) < 0.01 && Math.abs(sy) < 0.01) return fallback;
  if (Math.abs(sx) > Math.abs(sy)) return sx > 0 ? "right" : "left";
  return sy > 0 ? "down" : "up";
}

export function createRun(cfg: RunConfig): RunState {
  const run: RunState = {
    seed: cfg.seed, rng: mulberry(cfg.seed), time: 0,
    scene: cfg.scene, mapIdx: cfg.mapIdx,
    mover: createWorldMovement(cfg.scene.world, cfg.scene.home, { speed: FRIEND_SPEED, radius: 9 }),
    home: [...cfg.scene.home],
    mood: "idle", aiT: 0, strafeT: 2, strafeDir: 1, stuckT: 0, lastPos: [...cfg.scene.home],
    manual: cfg.manual,
    mpos: [...cfg.scene.home], mfacing: "down", mwalking: false,
    keys: new Set(), tapDest: null,
    aimMode: "auto", aimWorld: [...cfg.scene.home], aimSet: false, aimFace: "down",
    phase: "combat", shop: null, shopOpen: false,
    derived: cfg.derived,
    turretLvl: cfg.turretLvl, wallLvl: cfg.wallLvl, healerLvl: cfg.healerLvl,
    collectorLvl: cfg.collectorLvl, lootLuck: cfg.lootLuck,
    weaponTint: cfg.weaponTint, reducedMotion: cfg.reducedMotion,
    hp: cfg.derived.maxHp, maxHp: cfg.derived.maxHp,
    armor: cfg.derived.armor,
    wave: 0, intermission: 0, waveType: "standard", surgeMult: 1,
    queue: [], spawnT: 0, lastKillT: 0, strayHunt: false,
    enemies: [], shots: [], bolts: [], companions: [], floaters: [], orbs: [],
    particles: [], pickups: [], corpses: [],
    vents: cfg.scene.vents.map(v => ({ x: v[0], y: v[1], phase: "idle" as const, t: 4 + mulberry(cfg.seed + 0x9e37)() * 4 })),
    announce: [],
    xp: 0, level: 1, xpNext: xpForLevel(1),
    stacks: {
      power: 0, rapid: 0, multishot: 0, pierce: 0, ricochet: 0, explosive: 0,
      burn: 0, freeze: 0, crit: 0, vitality: 0, regen: 0, minifriend: 0,
      ironskin: 0, buddy: 0, deadeye: 0, keen: 0, quick: 0, boots: 0,
      heavy: 0, seeker: 0, storm: 0, sidestep: 0, adrenaline: 0, fortune: 0,
    },
    abilities: ["ab-blast"], abilityCd: {},
    altarLevel: cfg.altarLevel ?? 4,
    abilityRank: {},
    unlocks: { bulwark: 0, traps: 0, overcharge: 0, kennel: 0, workshop: 0, ...cfg.unlocks },
    training: cfg.training ?? 0,
    frostLvl: cfg.frostLvl ?? 0, medbayLvl: cfg.medbayLvl ?? 0,
    structHp: {}, structMax: {}, structOff: {},
    overchargeT: 0, bulwarkT: 0, bulwarkArmor: 0, reflectT: 0, domeT: 0,
    traps: [], wisps: [],
    encounter: "patrol", prepT: 0, expRf: cfg.expRf ?? 0, expLoot: cfg.expLoot ?? 0,
    plotHpBonus: cfg.plot?.hp ?? 0, plotRegen: cfg.plot?.regen ?? 0,
    plotPickup: cfg.plot?.pickup ?? 0, plotRf: cfg.plot?.rf ?? 0, plotXp: cfg.plot?.xp ?? 0,
    prodTick: 0,
    seenKinds: [], structDamageTaken: 0, stolenLost: 0, stolenBack: 0,
    flawlessWaves: 0, waveStructHit: false,
    relics: [], relicEchoN: 0, relicMirrorN: 0,
    momentum: 0, hitstop: 0, timeCoreT: 0, furyT: 0,
    zones: [], shopPre: null, shopPreBlock: -1,
    overT: 0, shieldT: 0, iframes: 0, slowMe: 0, strikes: [], orbTick: 0,
    beamT: 0, beamAng: 0, evos: [],
    offers: [], rerollsUsed: 0,
    frozen: false, over: false, committed: false,
    kills: 0, bosses: 0, elitesSlain: 0, bankRf: 0, earned: 0, spent: 0,
    cons: { heal: 0, ward: 0, tonic: 0, token: 0 },
    shieldHp: 0, tonicT: 0, powerT: 0, hasteT: 0, luckyWave: -1,
    gearDrops: [],
    fireCd: 0.5, turretCd: 1, turretAngle: 0, healerT: 0,
    blastCd: 0, healUses: 0, celebrateT: 0, shake: 0, nextId: 1, events: [], bossId: null,
    debug: false, stuckFixes: 0, spawnRejects: 0, stepMs: 0, pathReqs: 0, routeCache: new Map(),
    stuckRoute: 0, stuckWatch: 0,
    aimAngle: 0, muzzleT: 0, tapMark: null,
  };
  resetStructHp(run);
  startWave(run, 1);
  return run;
}

/** (Re)build structure HP from tiers. Called on run start + map swap. */
export function resetStructHp(run: RunState): void {
  const tiers: Record<string, number> = {
    turret: run.turretLvl, wall: run.wallLvl, healer: run.healerLvl,
    collector: run.collectorLvl, frost: run.frostLvl,
  };
  run.structHp = {}; run.structMax = {};
  for (const [id, tier] of Object.entries(tiers)) {
    if (tier <= 0) continue;
    try {
      const def = structureById(id);
      const hp = def.hp[Math.min(def.maxTier, tier) - 1] ?? 100;
      if (hp > 0) { run.structHp[id] = hp; run.structMax[id] = hp; }
    } catch { /* unknown structure: skip */ }
  }
  // The Home Core is always present: lose it and the invasion is lost.
  const coreHp = homeCoreHp(run.maxHp);
  run.structHp[HOME_CORE.id] = coreHp;
  run.structMax[HOME_CORE.id] = coreHp;
  run.structOff = {};
}

/** Damage a structure; returns true if it went down. Repair via repairStructure. */
export function damageStructure(run: RunState, id: string, dmg: number): boolean {
  if (!(run.structHp[id] > 0)) return false;
  run.structHp[id] = Math.max(0, run.structHp[id] - Math.max(1, Math.round(dmg)));
  run.structDamageTaken += dmg;
  run.waveStructHit = true;
  if (run.structHp[id] <= 0) {
    run.events.push({ t: "structdown", id });
    announce(run, `${structLabel(id).toUpperCase()} DOWN!`, id === HOME_CORE.id ? "The heart of your home has fallen!" : "Repair it after the wave.");
    return true;
  }
  return false;
}

/** Boss-slam splash against the Home Core: a slam landing on the house
 * chips it. Position-based and incidental — no AI changes, but parking a
 * boss on your doorstep is punished and the heart is never trivially safe. */
export function slamHitsCore(run: RunState, x: number, y: number, r: number, dmg: number): void {
  if (!(run.structHp[HOME_CORE.id] > 0)) return;
  const a = run.scene.anchors[HOME_CORE.id];
  if (!a) return;
  if (Math.hypot(a[0] - x, a[1] - y) < r + 20) {
    damageStructure(run, HOME_CORE.id, dmg);
    burst(run, a[0], a[1], "#d95f4b", 8);
    floater(run, a[0], a[1] - 30, "HOME HIT!", "#d93a3a", true);
  }
}
/** Repair cost scales with missing HP. Returns false if unaffordable/destroyed? */export function repairCost(run: RunState, id: string): number {
  const max = run.structMax[id] ?? 0;
  const cur = run.structHp[id] ?? 0;
  if (max <= 0 || cur >= max) return 0;
  return Math.ceil(4 + ((max - cur) / max) * 22);
}

export function repairStructure(run: RunState, id: string): boolean {
  const cost = repairCost(run, id);
  if (cost <= 0 || run.bankRf < cost) return false;
  run.bankRf -= cost; run.spent += cost;
  run.structHp[id] = run.structMax[id];
  return true;
}

/** Compass label for an invasion gate relative to the plot heart. */
export function gateLabel(home: WorldPoint, gate: WorldPoint): string {
  const dx = gate[0] - home[0], dy = gate[1] - home[1];
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI; // world plane, +y = south
  if (deg >= -112.5 && deg < -67.5) return "NORTH GATE";
  if (deg >= -67.5 && deg < -22.5) return "NE TRAIL";
  if (deg >= -22.5 && deg < 22.5) return "EAST PATH";
  if (deg >= 22.5 && deg < 67.5) return "SE TRAIL";
  if (deg >= 67.5 && deg < 112.5) return "SOUTH GATE";
  if (deg >= 112.5 && deg < 157.5) return "SW TRAIL";
  if (deg >= -157.5 && deg < -112.5) return "NW TRAIL";
  return "WEST PATH";
}

/** Gates with enemies still inbound (pending spawn queue). Lane warnings. */
export function pendingGates(run: RunState): { gate: number; label: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const q of run.queue) {
    if (q.gate === undefined) continue;
    counts.set(q.gate, (counts.get(q.gate) ?? 0) + 1);
  }
  const out: { gate: number; label: string; count: number }[] = [];
  for (const [gate, count] of counts) {
    const g = run.scene.gates[gate % Math.max(1, run.scene.gates.length)];
    if (!g) continue;
    out.push({ gate, label: gateLabel(run.home, g), count });
  }
  out.sort((a, b) => b.count - a.count);
  return out.slice(0, 4);
}

/** Nearest live structure anchor for raiders. Null when the base is bare/broken.
 * The Home Core is deliberately NOT in the raider list: outer defenses draw
 * raiders first (tower-defense layering). Only the Siegebreaker boss marches
 * on the heart itself (includeCore), plus incidental boss-slam splash. */
export function structureTarget(run: RunState, objective: EnemyObjective, includeCore = false): { id: string; x: number; y: number } | null {
  const want = objective === "production"
    ? ["collector"]
    : includeCore
      ? ["turret", "frost", "healer", "collector", "wall", HOME_CORE.id]
      : ["turret", "frost", "healer", "collector", "wall"];
  let best: { id: string; x: number; y: number } | null = null;
  let bestD = Infinity;
  const [fx, fy] = friendPos(run);
  for (const id of want) {
    if (!(run.structHp[id] > 0)) continue;
    const a = run.scene.anchors[id as keyof typeof run.scene.anchors];
    if (!a) continue;
    const d = Math.hypot(a[0] - fx, a[1] - fy);
    if (d < bestD) { bestD = d; best = { id, x: a[0], y: a[1] }; }
  }
  return best;
}

/** Swap the run onto a new map mid-run (structures rebuilt by the shell). */
export function enterMap(run: RunState, scene: Scene, mapIdx: number): void {
  run.scene = scene;
  run.mapIdx = mapIdx;
  run.routeCache.clear();
  run.mover = createWorldMovement(scene.world, scene.home, { speed: FRIEND_SPEED, radius: 9 });
  run.home = [...scene.home];
  run.mpos = [...scene.home];
  run.mfacing = "down";
  run.mwalking = false;
  run.tapDest = null;
  run.enemies = [];
  run.shots = [];
  run.bolts = [];
  run.pickups = [];
  run.corpses = [];
  run.zones = [];
  run.strikes = [];
  run.traps = [];
  run.queue = [];
  run.bossId = null;
  run.momentum = 0;
  run.hitstop = 0;
  run.overchargeT = 0;
  run.encounter = "patrol";
  resetStructHp(run);
  run.vents = scene.vents.map(v => ({ x: v[0], y: v[1], phase: "idle" as const, t: 5 }));
  run.hp = Math.min(run.maxHp, run.hp + run.maxHp * (0.3 + run.medbayLvl * 0.15));
  syncCompanions(run);
}

/* ---------------- waves: budget director ---------------- */

/**
 * Spawn validation pipeline (Phase 6): jitter around a pre-validated gate,
 * cheap geometric checks only — NO path queries (gates already proved
 * connectivity at map build). Falls back to the gate itself.
 */
export function validatedSpawn(run: RunState, gateIdx?: number): WorldPoint {
  const world = run.scene.world;
  const gates = run.scene.gates.length > 0 ? run.scene.gates : run.scene.entrances;
  const gi = gateIdx !== undefined ? gateIdx % gates.length : Math.floor(run.rng() * gates.length);
  const [gx, gy] = gates[gi] ?? run.home;
  const homeId = run.scene.regions.homeId;
  for (let i = 0; i < 6; i++) {
    const x = Math.min(WORLD_W - 16, Math.max(16, gx + (run.rng() - 0.5) * 44));
    const y = Math.min(WORLD_H - 16, Math.max(16, gy + (run.rng() - 0.5) * 36));
    if (!isWorldWalkable(world, [x, y], 12)) { run.spawnRejects++; continue; }
    let blocked = false;
    for (const b of world.collision?.blocked ?? []) {
      if (x > b.x - 14 && x < b.x + b.w + 14 && y > b.y - 14 && y < b.y + b.h + 14) { blocked = true; break; }
    }
    if (blocked) { run.spawnRejects++; continue; }
    // O(1) connectivity: same walkable region as the combat area.
    if (regionAt(run.scene.regions, x, y) !== homeId) { run.spawnRejects++; continue; }
    return [x, y];
  }
  return [gx, gy];
}

function pickKind(run: RunState, allowed: EnemyArchetype[], type: WaveType, mapIdx: number): EnemyArchetype {
  // Mini-bosses never spawn from budget rolls (dedicated invasion logic only).
  const noMinis = { minibrute: 0, minimage: 0, minisiege: 0 } as const;
  const weights: Partial<Record<EnemyArchetype, number>> =
    type === "swarm" ? { swarm: 5, splitling: 2, shadow: 2, swift: 1, ...noMinis } :
    type === "heavy" ? { tank: 4, shield: 3, commander: 2, shadow: 2, charger: 1, ...noMinis } :
    type === "ranged" ? { ranged: 4, sniper: 2, mage: 2, cryo: 2, support: 2, shadow: 1.2, swift: 0.8, ...noMinis } :
    type === "rush" ? { swift: 4, charger: 3, leaper: 2, orbiter: 1.5, swarm: 1, ...noMinis } :
    type === "elite" ? { shadow: 3, tank: 2, swift: 2, ranged: 1, commander: 1, elitehunter: 1.5, ...noMinis } :
    { shadow: 4, swift: 2, swarm: 2, tank: 1, ranged: 1, charger: 1, split: 1, shield: 1, support: 0.7, summoner: 0.6, mage: 0.5, burrower: 0.5, drainer: 0.5, commander: 0.4, saboteur: 0.5, thief: 0.4, traplayer: 0.4, artillery: 0.35, necromancer: 0.3, siege: 0.3, cryo: 0.5, corrupter: 0.4, elitehunter: 0.4, ...noMinis };
  // Map pressure: each island favors different threats.
  const pressure: Partial<Record<EnemyArchetype, number>> =
    mapIdx === 0 ? { swift: 1.5, swarm: 1.5 } :
    mapIdx === 1 ? { tank: 1.6, ranged: 1.6, charger: 1.5 } :
    mapIdx === 2 ? { bomber: 2, leaper: 2, charger: 1.3 } :
    mapIdx === 3 ? { orbiter: 2, support: 1.8, swarm: 1.4 } :
    mapIdx === 4 ? { sniper: 2, shield: 1.8, ranged: 1.5 } :
    { summoner: 1.6, blinker: 1.8, swift: 1.3 };
  let total = 0;
  for (const k of allowed) total += (weights[k] ?? 0.5) * (pressure[k] ?? 1);
  let r = run.rng() * total;
  for (const k of allowed) {
    r -= (weights[k] ?? 0.5) * (pressure[k] ?? 1);
    if (r <= 0) return k;
  }
  return allowed[0] ?? "shadow";
}

function startWave(run: RunState, wave: number): void {
  run.wave = wave;
  run.queue = [];
  run.surgeMult = 1;
  run.waveStructHit = false;
  const plan = planWave(wave, run.mapIdx);
  run.waveType = plan.type;
  // Encounter Director: authored template over the budget composition.
  const encId = planEncounter(wave, run.mapIdx, plan.type);
  run.encounter = encId;
  const enc = ENCOUNTERS[encId];
  let t = wave <= 2 ? 1.4 : 0.6;
  if (plan.type === "boss") {
    const pattern = bossPatternFor(wave);
    const spec = bossSpec(wave);
    run.events.push({ t: "bosswarn", wave, pattern, name: spec.name });
    announce(run, `${spec.name} APPROACHES`, pattern === "siegebreaker" ? "It marches on your structures. Repair and kite!" : `Wave ${wave} — hold the plot!`);
    t = Math.max(2.2, enc.calmBefore);
    run.queue.push({ kind: "boss", delay: t });
    t += 1.2;
    const adds = 2 + Math.floor(wave / 10);
    for (let i = 0; i < adds; i++) {
      run.queue.push({ kind: i % 2 ? "swift" : "shadow", delay: t });
      t += 1.4;
    }
    if (pattern === "siegebreaker") {
      // Siege escorts pry the walls open for the boss.
      const allowed = unlockedKinds(wave, run.mapIdx);
      const escort: EnemyArchetype[] = ["siege", "saboteur", "shield"];
      for (let i = 0; i < 3; i++) {
        const k = escort[i];
        if (allowed.includes(k)) run.queue.push({ kind: k, delay: t + i * 1.2 });
      }
    }
  } else {
    // Curated early encounters: tactical mixes with their own honest labels
    // (never a random template name over a hand-built composition).
    const early = EARLY_WAVES[wave];
    if (early && run.mapIdx === 0) {
      run.waveType = "standard";
      const names: Record<number, [string, string]> = {
        1: ["WAVE 1", "Movement lesson: Basics + Swifts."],
        2: ["SWARM + SWIFT", "Spacing lesson: hold the line."],
        3: ["RANGED PAIR", "Positioning lesson: two shooters."],
        4: ["SHIELD + CHARGERS", "Priority lesson: crack the guard."],
      };
      const [label, sub] = names[wave] ?? [`WAVE ${wave}`, "Shadows are entering the plot!"];
      announce(run, label, wave === 1 ? "Shadows are entering the plot!" : sub);
      const gates = run.scene.gates;
      const gcount = Math.max(1, gates.length);
      let cursor = Math.floor(run.rng() * gcount);
      let t2 = wave <= 2 ? 1.1 : 0.5;
      for (const [kind, count] of early) {
        for (let i = 0; i < count; i++) {
          cursor = (cursor + 1) % gcount;
          run.queue.push({ kind, delay: Math.round(t2 / 0.8) * 0.8, gate: cursor });
          t2 += kind === "swarm" ? 0.35 : 0.75;
        }
        t2 += 0.4;
      }
      run.spawnT = 0;
      run.events.push({ t: "wave", wave });
      return;
    }
    // Encounter name carries intent; the wave-type label stays for honesty.
    const encName = enc.id === "assault" && plan.label ? plan.label : enc.name.toUpperCase();
    announce(run, encName, `${enc.desc}${plan.label && enc.id === "assault" ? "" : ` · Wave ${wave}`}`);
    if (plan.surge) run.surgeMult = 1.3;
    const allowed = unlockedKinds(wave, run.mapIdx);
    let budget = plan.budget;
    t = Math.max(t, enc.calmBefore * 0.6);
    // Early-game spam cut: waves 1-10 spend less raw budget, more meaning.
    if (wave <= 10) budget = Math.round(budget * (wave <= 4 ? 0.75 : 0.88));
    const interval = Math.max(0.3, 0.95 - wave * 0.03) + (wave <= 2 ? 0.25 : 0);
    // Formation gates: spread by angle so packs arrive from chosen sides.
    const gates = run.scene.gates;
    const gcount = Math.max(1, gates.length);
    const farGate = (() => {
      let bi = 0, bd = -1;
      gates.forEach((g, i) => {
        const d = Math.hypot(g[0] - run.home[0], g[1] - run.home[1]);
        if (d > bd) { bd = d; bi = i; }
      });
      return bi;
    })();
    let cursor = Math.floor(run.rng() * gcount);
    const nextGate = () => (cursor = (cursor + 1) % gcount);
    const oppositeGate = () => (cursor + Math.floor(gcount / 2)) % gcount;
    let guard = 400;
    let elitesForced = plan.type === "elite" ? 2 + Math.floor(run.rng() * 2) : 0;
    while (budget > 0 && guard-- > 0) {
      const kind = pickKind(run, allowed, plan.type, run.mapIdx);
      const cost = BUDGET_COST[kind] ?? 1;
      if (cost > budget && kind !== "shadow" && kind !== "swarm") {
        budget -= 1;
        run.queue.push({ kind: plan.type === "swarm" ? "swarm" : "shadow", delay: t, gate: nextGate() });
        t += interval * 0.7;
        continue;
      }
      budget -= Math.min(budget, cost);
      const forceElite = elitesForced > 0 && kind !== "swarm";
      if (forceElite) elitesForced--;
      if (kind === "swarm") {
        const clump = 3 + Math.floor(run.rng() * 3);
        const g = plan.type === "swarm" ? farGate : nextGate();
        for (let i = 0; i < clump; i++) run.queue.push({ kind: "swarm", delay: t + i * 0.12, gate: g });
        t += interval * 1.4;
      } else {
        let g = nextGate();
        if (plan.type === "heavy") g = oppositeGate();
        else if (plan.type === "ranged" && (kind === "ranged" || kind === "support" || kind === "summoner")) g = farGate;
        else if (plan.type === "rush" && (kind === "swift" || kind === "charger")) { /* hunting party: same gate */ }
        else if (plan.type === "surge" || plan.type === "elite") g = nextGate();
        run.queue.push({ kind, delay: t, gate: g, forceElite: forceElite || undefined });
        // Escort: valuable backline gets a bodyguard at the same gate.
        if ((kind === "support" || kind === "summoner") && run.rng() < 0.4 && budget >= 3) {
          budget -= 3;
          const guardKind = run.rng() < 0.5 ? "tank" : "shield";
          if (allowed.includes(guardKind)) run.queue.push({ kind: guardKind, delay: t + 0.4, gate: g });
        }
        t += interval * (0.7 + run.rng() * 0.6);
      }
    }
    // Burst pacing: quantize arrivals into mini-pushes instead of a drip.
    for (const q of run.queue) {
      if (q.kind === "boss") continue;
      q.delay = Math.round(q.delay / 0.8) * 0.8;
    }
    // Raid/siege encounters: guarantee the raiders actually show up.
    if (enc.structureRaid) {
      const raiders: EnemyArchetype[] = enc.id === "raid" ? ["thief", "saboteur"] : ["saboteur", "siege", "artillery"];
      for (const k of raiders) {
        if (allowed.includes(k) && !run.queue.some(q => q.kind === k)) {
          run.queue.push({ kind: k, delay: Math.max(...run.queue.map(q => q.delay), 1) + 0.8 });
        }
      }
    }
    // Commander push: guarantee the commander.
    if (enc.id === "commander" && allowed.includes("commander") && !run.queue.some(q => q.kind === "commander")) {
      run.queue.push({ kind: "commander", delay: Math.max(...run.queue.map(q => q.delay), 1) + 1.2, forceElite: true });
    }
    // Burrow attack: guarantee diggers.
    if (enc.id === "burrow" && allowed.includes("burrower") && !run.queue.some(q => q.kind === "burrower")) {
      for (let i = 0; i < 2; i++) run.queue.push({ kind: "burrower", delay: 1 + i * 1.4 });
    }
    // Occasional mini-boss pack before major bosses (waves 3/4, 8/9 ...).
    if ((wave % 5 === 3 || wave % 5 === 4) && wave > 4 && run.rng() < 0.35) {
      const elites = run.queue.filter(q => q.forceElite).length;
      if (elites === 0 && allowed.length > 0) {
        const at = Math.max(...run.queue.map(q => q.delay), 1) + 0.8;
        const pick = allowed.includes("tank") ? "tank" : allowed[0];
        run.queue.push({ kind: pick ?? "shadow", delay: at, gate: 0, forceElite: true });
        announce(run, "ELITE INVASION", "A named Shadow leads the pack!");
      }
    }
    // Mini-boss invasions: named milestone foes with an escort, never spam.
    if (wave % 5 !== 0) {
      const minis: { kind: EnemyArchetype; wave: number; name: string; odds: number }[] = [
        { kind: "minibrute", wave: 7, name: "GRISTLE, MAW OF THE HORDE", odds: 0.3 },
        { kind: "minimage", wave: 12, name: "VESPER, THE PALE CHOIR", odds: 0.25 },
        { kind: "minisiege", wave: 17, name: "RAMPART, THE WALL-EATER", odds: 0.25 },
      ];
      for (const m of minis) {
        if (wave >= m.wave && allowed.includes(m.kind)
          && !run.queue.some(q => q.kind === m.kind || q.kind === "boss")
          && run.rng() < m.odds) {
          run.queue.push({ kind: m.kind, delay: Math.max(...run.queue.map(q => q.delay), 1) + 1.6, forceElite: true });
          const esc: EnemyArchetype[] = m.kind === "minimage" ? ["swarm", "swarm"] : m.kind === "minisiege" ? ["shield", "saboteur"] : ["swift", "swift"];
          for (const k of esc) {
            if (allowed.includes(k)) run.queue.push({ kind: k, delay: Math.max(...run.queue.map(q => q.delay), 1) + 0.6 });
          }
          announce(run, `MINI-BOSS: ${m.name}`, "Bring it down for a bonus cache!");
          break;
        }
      }
    }
    // Breach/ambush: everything through one gate so positioning matters.
    if (enc.gateFocus && run.scene.gates.length > 0) {
      const focus = Math.floor(run.rng() * run.scene.gates.length);
      for (const q of run.queue) q.gate = focus;
    }
    // Enemy ceiling: encounters stay readable, never a flood. Trim cheapest
    // filler first (boss + forced elites protected), then re-assert honesty
    // so trimming can never eat the advertised composition.
    if (run.queue.length > enc.ceiling) {
      const scored = run.queue.map((q, i) => ({
        q, i,
        keep: q.kind === "boss" || q.forceElite === true ? 1 : 0,
        c: BUDGET_COST[q.kind] ?? 1,
      }));
      scored.sort((a, b) => (a.keep - b.keep) || (a.c - b.c));
      const over = run.queue.length - enc.ceiling;
      const drop = new Set(scored.filter(s => s.keep === 0).slice(0, over).map(s => s.i));
      if (drop.size > 0) run.queue = run.queue.filter((_, i) => !drop.has(i));
    }
    // Honest labels: guarantee the advertised family actually shows up.
    ensureTemplateHonesty(run, plan.type, allowed);
  }
  run.spawnT = 0;
  run.events.push({ t: "wave", wave });
}

/** Enforce TEMPLATE_MIN_SHARE so labels describe real compositions. */
export function ensureTemplateHonesty(
  run: RunState, type: WaveType, allowed: EnemyArchetype[],
): void {
  if (type !== "ranged" && type !== "heavy" && type !== "swarm" && type !== "rush") return;
  const fam = type as "ranged" | "heavy" | "swarm" | "rush";
  const kinds = TEMPLATE_KINDS[fam];
  const need = TEMPLATE_MIN_SHARE[fam];
  let total = 0, part = 0;
  for (const q of run.queue) {
    if (q.kind === "boss") continue;
    const c = BUDGET_COST[q.kind] ?? 1;
    total += c;
    if (kinds.includes(q.kind)) part += c;
  }
  if (total <= 0) return;
  let guard = 12;
  while (part / total < need && guard-- > 0) {
    const cand = kinds.find(k => allowed.includes(k));
    if (!cand) break;
    // Convert a non-family queued enemy into the advertised family.
    const idx = run.queue.findIndex(q => q.kind !== "boss" && !kinds.includes(q.kind));
    if (idx < 0) break;
    const old = run.queue[idx].kind;
    run.queue[idx].kind = cand;
    total += (BUDGET_COST[cand] ?? 1) - (BUDGET_COST[old] ?? 1);
    part += BUDGET_COST[cand] ?? 1;
  }
}

export function announce(run: RunState, text: string, sub = ""): void {
  run.announce.push({ text, sub, ttl: 2.8, max: 2.8 });
  if (run.announce.length > 3) run.announce.shift();
}

export function nextWave(run: RunState): void {
  if (run.intermission > 0 && !run.over) run.intermission = 0.01;
}

function baseSpec(kind: EnemyArchetype): { hp: number; dmg: number; xp: number; rf: number; radius: number; range: number } {
  if (kind in NEW_ENEMIES) {
    const s = NEW_ENEMIES[kind as keyof typeof NEW_ENEMIES];
    return { hp: s.hp, dmg: s.dmg, xp: s.xp, rf: s.rf, radius: s.radius, range: s.range };
  }
  const s = ENEMIES[kind as keyof typeof ENEMIES];
  return { hp: s.hp, dmg: s.dmg, xp: s.xp, rf: s.rf, radius: s.radius, range: s.range };
}

function spawnEnemy(run: RunState, kind: EnemyArchetype, gate?: number, forceElite?: boolean): void {
  const [x, y] = validatedSpawn(run, gate);
  const id = run.nextId++;
  const map = MAPS[run.mapIdx] ?? MAPS[0];
  const eliteRoll = forceElite === true || run.rng() < eliteChance(run.wave) + map.eliteBonus + (run.waveType === "elite" ? 0.12 : 0);
  // Onboarding grace: waves 1-2 hit softer while players learn to move.
  const grace = run.wave <= 2 ? 0.7 : 1;
  const mk = (hp: number, dmg: number, xp: number, rf: number, radius: number, range: number, elite: boolean, eliteMod: EliteMod | null) => {
    let speed = (ENEMY_SPEED[kind] ?? 36) * waveSpeedMult(run.wave) * (0.9 + run.rng() * 0.2);
    let body = BODY_R[kind] ?? 8;
    let ehp = hp, edmg = dmg, exml = 1;
    if (elite && eliteMod === "frenzied") { speed *= 1.3; exml = 1; }
    if (elite && eliteMod === "armored") { ehp = Math.round(hp * 1.6); }
    if (elite && eliteMod === "giant") { ehp = hp * 2; edmg = Math.round(dmg * 1.4); body *= 1.3; }
    return {
      id, kind, x, y,
      hp: Math.round(ehp * waveHpMult(run.wave) * (elite && !eliteMod ? 2.5 : 1)),
      maxHp: Math.round(ehp * waveHpMult(run.wave) * (elite && !eliteMod ? 2.5 : 1)),
      dmg: Math.max(1, Math.round(edmg * waveDmgMult(run.wave) * (elite ? 1.5 : 1) * grace)),
      speed, xp: elite ? xp * 3 : xp, rf: elite ? rf * (eliteMod === "frenzied" ? 3 : 4) : rf,
      radius, body, stopDist: range > 0 ? range : 0,
      slowT: 0, slowF: 1, burnT: 0, burnDps: 0,
      shieldHp: 0, shieldMax: 0,
      elite, eliteMod, mods: [] as string[],
      pattern: null as BossPattern | null, bossName: "", phase: 0,
      wardT: 0, wardDown: 0, blinkT: 0, addT: 0,
      atkCd: 0.5 + run.rng() * 0.5, shootCd: 1 + run.rng(), burstT: 4, summonT: 9,
      slamT: 0, slamX: 0, slamY: 0, slamCd: 5,
      chargeState: "roam" as const, chargeT: 0, chargeDx: 0, chargeDy: 0, chargeCd: 2 + run.rng() * 2,
      fuseT: 0, aimT: 0, aimDx: 0, aimDy: 0,
      orbitDir: run.rng() < 0.5 ? -1 : 1, orbitT: 0,
      skipT: 3 + run.rng() * 3, skipPhase: 0,
      leapState: "roam" as const, leapT: 0, leapX: 0, leapY: 0,
      burrowState: "roam" as const, burrowT: 2 + run.rng() * 2, burrowX: 0, burrowY: 0,
      mageCd: 2 + run.rng() * 2, drainT: 0,
      objective: ENEMY_OBJECTIVE[kind] ?? "friend",
      structCd: 1 + run.rng(), stolen: 0, mineT: 3, reviveT: 6, bombardT: 2, fleeing: false,
      flash: 0, walkPhase: run.rng() * 6, lungeT: 0, spawnT: 0.8,
      facing: "down" as SpriteFacing,
      px: x, py: y,
      waypoints: [] as WorldPoint[], repathT: run.rng() * 0.8,
      goalX: x, goalY: y,
      stuckT: 0, lastX: x, lastY: y, stuckFails: 0,
    };
  };
  if (kind === "boss") {
    const spec = bossSpec(run.wave);
    const pattern = bossPatternFor(run.wave);
    const e = mk(spec.hp, spec.dmg, spec.xp, spec.rf, 26, 0, false, null);
    e.hp = spec.hp; e.maxHp = spec.hp; e.speed = spec.speed;
    e.mods = spec.modifiers; e.pattern = pattern; e.bossName = spec.name;
    e.body = BODY_R.boss;
    if (pattern === "warden") e.wardT = 8;
    if (pattern === "blink") e.blinkT = 3;
    run.enemies.push(e);
    run.bossId = id;
    return;
  }
  const base = baseSpec(kind);
  // Legacy elite flag (pre-modifier saves/tests) maps to armored.
  const elite = eliteRoll;
  const eliteMod = elite ? eliteModFor(run.rng) : null;
  const e = mk(base.hp, base.dmg, base.xp, base.rf, base.radius, base.range, elite, eliteMod);
  if (kind === "shield") {
    e.shieldHp = Math.round(e.maxHp * 0.45);
    e.shieldMax = e.shieldHp;
  }
  if (elite) run.events.push({ t: "elite" });
  run.enemies.push(e);
}

/* ---------------- run-mod helpers ---------------- */

function dmgMult(run: RunState): number {
  let m = (1 + 0.25 * run.stacks.power) * (1 + 0.3 * (run.tonicT > 0 ? 1 : 0)) * (1 + 0.3 * (run.powerT > 0 ? 1 : 0));
  m *= 1 + 0.2 * run.stacks.heavy;
  if (run.stacks.multishot >= 3) m *= 1.2;
  if (run.stacks.pierce >= 2) m *= 1.15;
  if (isPinball(run)) m *= 1.2;
  if (isLance(run)) m *= 1.3;
  if (run.furyT > 0) m *= 1.4;
  if (run.relics.includes("re-glass")) m *= 1.4;
  if (run.relics.includes("re-berserk")) {
    const missing = 1 - run.hp / Math.max(1, run.maxHp);
    m *= 1 + Math.min(0.3, missing * 0.5);
  }
  m *= 1 + Math.min(0.08, run.momentum * 0.01);
  return m;
}
function interval(run: RunState): number {
  let iv = run.derived.interval * Math.pow(0.83, run.stacks.rapid);
  if (run.stacks.rapid >= 3) iv *= 0.75;
  iv *= 1 + 0.1 * run.stacks.heavy;
  if (run.overT > 0) iv *= 0.65;
  if (run.furyT > 0) iv *= 0.8;
  iv *= 1 - Math.min(0.08, run.momentum * 0.008);
  return Math.max(0.12, iv);
}
export function projectileCount(run: RunState): number {
  const fam = run.derived.family === "twin" ? 1 : 0;
  return run.derived.projectiles + run.stacks.multishot + (run.stacks.multishot >= 3 ? 1 : 0) + fam + (isBarrage(run) ? 1 : 0);
}
function pierceCount(run: RunState): number {
  if (run.stacks.pierce >= 2) return 99;
  const prism = run.relics.includes("re-prism") ? 1 : 0;
  return run.derived.pierce + run.stacks.pierce + prism + (run.derived.family === "needle" ? 1 : 0);
}
function bounceCount(run: RunState): number {
  const prism = run.relics.includes("re-prism") ? 1 : 0;
  return run.derived.bounce + run.stacks.ricochet + prism
    + (run.derived.family === "spark" ? 2 : 0) + (isPinball(run) ? 2 : 0);
}
function volatileChance(run: RunState): number {
  return Math.min(0.5, run.derived.volatile + (run.relics.includes("re-vol") ? 0.15 : 0));
}
function abilityCdScale(run: RunState): number {
  return 1 - Math.min(0.4, run.derived.abilityCdr + (run.timeCoreT > 0 ? 0.35 : 0));
}
function dashCooldown(run: RunState): number {
  return 6 * (1 - 0.2 * run.stacks.adrenaline);
}
function luckBonus(run: RunState): number {
  return run.lootLuck + 0.5 * run.stacks.fortune;
}
function critChance(run: RunState): number {
  return Math.min(0.85, run.derived.critC + 0.12 * run.stacks.crit + (run.stacks.power >= 3 ? 0.1 : 0));
}
function critMult(run: RunState): number {
  return run.derived.critM + 0.5 * run.stacks.deadeye + (run.stacks.crit >= 2 ? 1 : 0);
}
function regenRate(run: RunState): number {
  return run.derived.regen + 1.2 * run.stacks.regen + run.plotRegen;
}
function rfGainMult(run: RunState): number {
  const map = MAPS[run.mapIdx] ?? MAPS[0];
  return run.derived.rfMult * map.rfMult * (1 + 0.05 * run.stacks.keen) * (1 + run.plotRf + run.expRf) * run.surgeMult;
}
function bankAdd(run: RunState, amount: number): void {
  const v = Math.max(0, Math.round(amount));
  run.bankRf += v;
  run.earned += v;
}
function bankSpend(run: RunState, amount: number): boolean {
  const v = Math.max(0, Math.round(amount));
  if (run.bankRf < v) return false;
  run.bankRf -= v;
  run.spent += v;
  return true;
}

/** Damage to the Friend through armor/dodge/shield. Returns actual HP lost. */
export function hurtFriend(run: RunState, raw: number): number {
  if (run.over) return 0;
  if (run.iframes > 0) return 0;
  if (run.rng() < Math.min(0.5, run.derived.dodge + 0.08 * run.stacks.sidestep)) {
    const [dx, dy] = friendPos(run);
    floater(run, dx, dy - 26, "MISS", "#6b6558");
    return 0;
  }
  let dmg = Math.max(1, Math.round(raw - run.armor));
  if (run.shieldHp > 0) {
    const absorbed = Math.min(run.shieldHp, dmg);
    run.shieldHp -= absorbed;
    dmg -= absorbed;
    if (dmg <= 0) {
      const [sx, sy] = friendPos(run);
      floater(run, sx, sy - 26, "WARD", "#3f7fbf");
      run.events.push({ t: "hurt" });
      return 0;
    }
  }
  run.hp -= dmg;
  run.events.push({ t: "hurt" });
  return dmg;
}

/* ---------------- combat ---------------- */

function nearestEnemy(run: RunState, x: number, y: number, range: number, priority = false): Enemy | null {
  let best: Enemy | null = null;
  let bestD = range * range;
  let bestPri = false;
  for (const e of run.enemies) {
    if (e.spawnT > 0.4) continue;
    const dx = e.x - x, dy = e.y - y;
    const d = dx * dx + dy * dy;
    // High-value targets first: buffers, raiders and backline win fights.
    const pri = priority && (e.kind === "support" || e.kind === "summoner" || e.kind === "commander"
      || e.kind === "saboteur" || e.kind === "drainer" || e.kind === "necromancer"
      || e.kind === "artillery" || e.kind === "thief");
    if (pri && !bestPri) {
      if (d < (range * 1.35) * (range * 1.35)) { best = e; bestD = d; bestPri = true; }
      continue;
    }
    if (bestPri && !pri) continue;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function heavyFamily(run: RunState): boolean {
  return run.derived.family === "heavy" || run.derived.family === "buster";
}

function fireVolley(run: RunState, fromX: number, fromY: number, target: Enemy, dmgScale: number, color: string, size: number): void {
  const baseAng = Math.atan2(target.y - fromY, target.x - fromX);
  fireVolleyAng(run, fromX, fromY, baseAng, target, dmgScale, color, size);
}

/** Manual-desktop fire with per-family behavior (scatter/orbital/homing/beam). */
function fireMouse(run: RunState, fx: number, fy: number, ang: number): void {
  const fam = run.derived.family;
  const tint = run.weaponTint;
  if (fam === "beam") {
    // Pulsed hitscan along the aim: damage everything in a clean lane.
    const len = 200, w = 12;
    const ex = fx + Math.cos(ang) * len, ey = fy + Math.sin(ang) * len;
    const dmg = run.derived.dmg * dmgMult(run) * 2.5;
    for (const e of run.enemies) {
      if (e.spawnT > 0.4) continue;
      if (segDist(e.x, e.y, fx, fy, ex, ey) < e.body + w) {
        damageEnemy(run, e, dmg * (e.kind === "boss" ? 1 + run.derived.bossDmg : 1), false);
        burst(run, e.x, e.y, tint, 3);
      }
    }
    run.beamT = 0.12;
    run.beamAng = ang;
    burst(run, fx + Math.cos(ang) * 20, fy + Math.sin(ang) * 20, "#ffffff", 6);
    run.fireCd = interval(run) * 2;
    return;
  }
  if (fam === "orbital") {
    // Orbitals damage on contact ticks; the trigger also spits a weak shot.
    fireVolleyAng(run, fx, fy, ang, null, 0.4, tint, 4);
    run.fireCd = interval(run) * 1.1;
    return;
  }
  if (fam === "scatter") {
    const pellets = 5;
    const sox = fx + Math.cos(ang) * 14, soy = fy + Math.sin(ang) * 14;
    for (let i = 0; i < pellets; i++) {
      const a = ang + (i - (pellets - 1) / 2) * 0.15;
      const speed = 420;
      const crit = run.rng() < critChance(run);
      run.shots.push({
        x: sox, y: soy, px: sox, py: soy,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
        dmg: Math.round(run.derived.dmg * dmgMult(run) * 0.55 * (crit ? critMult(run) : 1) * 10) / 10,
        pierce: 0, bounce: 0, explosive: 0, explosiveR: 0,
        burnDps: run.stacks.burn > 0 ? run.derived.dmg * 0.4 : 0, burnDur: 2,
        slowF: 1, slowDur: 0, freeze: false, crit,
        life: 0.55, color: tint, size: 4, hitIds: [], homing: 0,
      });
    }
    run.aimAngle = ang;
    run.muzzleT = 0.09;
    burst(run, sox, soy, tint, 5);
    run.fireCd = interval(run);
    return;
  }
  const target = nearestEnemy(run, fx + Math.cos(ang) * 60, fy + Math.sin(ang) * 60, 240, false);
  fireVolleyAng(run, fx, fy, ang, target, 1, tint, fam === "heavy" ? 6 : 5);
  if (fam === "homing") {
    for (let i = run.shots.length - 1; i >= 0; i--) {
      const s = run.shots[i];
      if (s.life > 1.3) s.homing = 3;
    }
  }
  run.fireCd = interval(run) * (fam === "heavy" ? 1.25 : 1);
}

function fireVolleyAng(run: RunState, fromX: number, fromY: number, baseAng: number, target: Enemy | null, dmgScale: number, color: string, size: number): void {
  run.aimAngle = baseAng;
  run.muzzleT = 0.09;
  // Friend-originated: projectiles appear immediately adjacent to the Friend
  // on the attack-facing edge (never from a detached orb or gun).
  const ox = fromX + Math.cos(baseAng) * 14, oy = fromY + Math.sin(baseAng) * 14;
  const n = projectileCount(run);
  const doubleShot = run.stacks.rapid >= 3 && run.rng() < 0.15;
  const volleys = doubleShot ? 2 : 1;
  const heavy = heavyFamily(run);
  const bossBonus = target && target.kind === "boss" ? 1 + run.derived.bossDmg : 1;
  for (let v = 0; v < volleys; v++) {
    for (let i = 0; i < n; i++) {
      const spread = n === 1 ? 0 : (i - (n - 1) / 2) * 0.16;
      const ang = baseAng + spread + (v > 0 ? 0.05 : 0);
      const speed = run.derived.family === "rapid" ? 440 : heavy ? 330 : 390;
      const crit = run.rng() < critChance(run);
      let dmg = run.derived.dmg * dmgMult(run) * dmgScale * bossBonus * (crit ? critMult(run) : 1);
      dmg = Math.round(dmg * 10) / 10;
      const burnStacks = run.stacks.burn;
      const freezeStacks = run.stacks.freeze;
      const expStacks = run.stacks.explosive;
      // Twin Spark: two offset projectiles around the Friend edge.
      const twinOff = run.derived.family === "twin" ? (i % 2 === 0 ? 6 : -6) : 0;
      const px0 = ox + Math.cos(baseAng + Math.PI / 2) * twinOff;
      const py0 = oy + Math.sin(baseAng + Math.PI / 2) * twinOff;
      run.shots.push({
        x: px0, y: py0, px: px0, py: py0,
        vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed,
        dmg, pierce: pierceCount(run), bounce: bounceCount(run),
        explosive: expStacks === 0 ? 0 : expStacks === 1 ? 0.5 : 0.8,
        explosiveR: expStacks === 0 ? 0 : expStacks === 1 ? 46 : 60,
        burnDps: burnStacks === 0 ? 0 : dmg * (0.4 + 0.3 * burnStacks),
        burnDur: burnStacks === 0 ? 0 : 3,
        slowF: freezeStacks === 0 ? 1 : 0.6,
        slowDur: freezeStacks === 0 ? 0 : 1.5,
        freeze: freezeStacks >= 2,
        crit, life: 1.4, color, size: crit ? size + 1 : size, hitIds: [],
      });
    }
  }
  burst(run, ox, oy, color, heavy ? 6 : 3);
  // Echo Core relic / Echo Duet: every 5th volley repeats instantly.
  if (run.derived.echo || run.relics.includes("re-echo")) {
    run.relicEchoN++;
    if (run.relicEchoN % 5 === 0) {
      for (let i = 0; i < Math.min(n, 3); i++) {
        const ang = baseAng + (i - Math.min(n, 3) / 2) * 0.12;
        run.shots.push({
          x: ox, y: oy, px: ox, py: oy,
          vx: Math.cos(ang) * 390, vy: Math.sin(ang) * 390,
          dmg: Math.round(run.derived.dmg * dmgMult(run) * dmgScale * 10) / 10,
          pierce: pierceCount(run), bounce: bounceCount(run),
          explosive: 0, explosiveR: 0, burnDps: 0, burnDur: 0,
          slowF: 1, slowDur: 0, freeze: false, crit: false,
          life: 1.1, color: "#c9a8ff", size, hitIds: [],
        });
      }
    }
  }
  // Shadow Mirror relic: every 8th volley duplicates as a ghost shot.
  if (run.relics.includes("re-mirror")) {
    run.relicMirrorN++;
    if (run.relicMirrorN % 8 === 0) {
      run.shots.push({
        x: ox, y: oy, px: ox, py: oy,
        vx: Math.cos(baseAng + 0.2) * 390, vy: Math.sin(baseAng + 0.2) * 390,
        dmg: Math.round(run.derived.dmg * dmgMult(run) * dmgScale * 10) / 10,
        pierce: pierceCount(run), bounce: bounceCount(run),
        explosive: 0, explosiveR: 0, burnDps: 0, burnDur: 0,
        slowF: 1, slowDur: 0, freeze: false, crit: false,
        life: 1.1, color: "#7a5fc0", size, hitIds: [],
      });
    }
  }
}

function burst(run: RunState, x: number, y: number, color: string, count: number): void {
  if (run.reducedMotion || run.particles.length > 220) return;
  for (let i = 0; i < count; i++) {
    const a = run.rng() * Math.PI * 2;
    const s = 25 + run.rng() * 70;
    run.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ttl: 0.35 + run.rng() * 0.2, color, size: 2 + run.rng() * 2 });
  }
}

function floater(run: RunState, x: number, y: number, text: string, color: string, big = false): void {
  if (run.floaters.length > 18) run.floaters.shift();
  run.floaters.push({ x, y, text, color, ttl: big ? 1.1 : 0.7, big });
}

export function damageEnemy(run: RunState, e: Enemy, dmg: number, crit: boolean): void {
  const vuln = e.chargeState === "vuln" ? 1.5 : 1;
  let remaining = dmg * vuln;
  // The Warden resists everything while warded (vulnerability windows matter).
  if (e.kind === "boss" && e.pattern === "warden" && e.wardDown <= 0) {
    remaining *= 0.4;
  }
  if (e.shieldHp > 0) {
    const absorbed = Math.min(e.shieldHp, remaining);
    e.shieldHp -= absorbed;
    remaining -= absorbed;
    if (e.shieldHp <= 0) floater(run, e.x, e.y - 24, "SHIELD DOWN", "#6b6558", true);
    else if (remaining <= 0) {
      e.flash = 0.12;
      return;
    }
  }
  e.hp -= remaining;
  e.flash = 0.12;
  if (!run.reducedMotion) floater(run, e.x, e.y - 14, String(Math.round(remaining)), crit ? "#8a5a00" : "#ffffff", crit);
}

function dropPickup(run: RunState, x: number, y: number, elite: boolean, boss: boolean): void {
  const r = run.rng();
  const chance = boss ? 1 : elite ? 0.18 : 0.06;
  if (r > chance) return;
  let kind: PickupKind = "rf";
  const w = run.rng();
  let acc = 0;
  for (const k of Object.keys(PICKUP_W) as PickupKind[]) {
    acc += PICKUP_W[k];
    if (w <= acc) { kind = k; break; }
  }
  if (boss) kind = run.rng() < 0.5 ? "heart" : "rf";
  if (run.pickups.length > 24) run.pickups.shift();
  run.pickups.push({ kind, x, y, vx: (run.rng() - 0.5) * 40, vy: -30, ttl: 25 });
}

function killEnemy(run: RunState, e: Enemy): void {
  run.kills++;
  if (e.elite) run.elitesSlain++;
  run.lastKillT = run.time;
  run.xp += Math.round(e.xp * (1 + run.plotXp) * run.surgeMult);
  // Codex tracking: first-seen kinds this run surface as discovery events.
  const seenId = e.kind === "boss" ? `boss:${e.pattern ?? "brute"}` : e.kind;
  if (!run.seenKinds.includes(seenId)) {
    run.seenKinds.push(seenId);
    run.events.push({ t: "codex", id: e.kind === "boss" ? (e.pattern ?? "brute") : e.kind, kind: e.kind === "boss" ? "boss" : "enemy" });
  }
  // Mini-bosses drop a bonus cache (moment + loot, never just HP).
  if (e.kind === "minibrute" || e.kind === "minimage" || e.kind === "minisiege") {
    const bonus = 15 + run.wave * 2;
    bankAdd(run, bonus);
    floater(run, e.x, e.y - 40, `CACHE +${bonus}`, "#8a5a00", true);
    run.pickups.push({ kind: "heart", x: e.x - 14, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.pickups.push({ kind: "rf", x: e.x + 14, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.events.push({ t: "elite" });
    announce(run, "MINI-BOSS DOWN!", "The plot breathes again.");
  }
  // Thieves drop what they stole (recoverable loot).
  if (e.kind === "thief" && e.stolen > 0) {
    bankAdd(run, e.stolen);
    run.stolenBack += e.stolen;
    floater(run, e.x, e.y - 30, `RECOVERED +${e.stolen}`, "#2f6b2f", true);
    run.events.push({ t: "recovered", amount: e.stolen });
  }
  const rf = Math.round(e.rf * rfGainMult(run));
  if (rf > 0) {
    bankAdd(run, rf);
    floater(run, e.x, e.y, `+${rf}`, "#2f6b2f");
  }
  run.orbs.push({ x: e.x, y: e.y, vx: (run.rng() - 0.5) * 90, vy: -40 - run.rng() * 70, ttl: 0.6 });
  burst(run, e.x, e.y, e.kind === "boss" ? "#8a5a00" : "#6b5fa8", e.kind === "boss" ? 26 : 8);
  // Lightweight momentum: rapid kills build rhythm (move/pickup/fire-rate).
  run.momentum = Math.min(10, run.momentum + (e.elite || e.kind === "boss" ? 3 : 1));
  // Strong-impact hit-stop only (boss kills, elites): brief 40ms enemy freeze.
  if (!run.reducedMotion && (e.kind === "boss" || e.elite)) run.hitstop = Math.max(run.hitstop, 0.04);
  // Volatile builds: kills can pop.
  if (run.rng() < volatileChance(run)) explode(run, e.x, e.y, 55, run.derived.dmg * dmgMult(run) * 0.8);
  // Time Core relic: elite kills supercharge abilities.
  if (e.elite && run.relics.includes("re-time")) run.timeCoreT = 10;
  if (run.corpses.length > 24) run.corpses.shift();
  run.corpses.push({ x: e.x, y: e.y, kind: e.kind, ttl: 0.5, scale: e.kind === "boss" ? 8 : 4.4 });
  dropPickup(run, e.x, e.y, e.elite, e.kind === "boss");
  if (e.kind === "split" && run.enemies.length < MAX_ENEMIES - 2) {
    for (let i = 0; i < 2; i++) {
      const base = baseSpec("splitling");
      // Spawn on the parent's validated ground, let separation spread them.
      const sx = e.x + (i === 0 ? -4 : 4), sy = e.y + (i === 0 ? -3 : 3);
      run.enemies.push({
        id: run.nextId++, kind: "splitling",
        x: sx, y: sy,
        hp: Math.round(base.hp * waveHpMult(run.wave)), maxHp: Math.round(base.hp * waveHpMult(run.wave)),
        dmg: Math.round(base.dmg * waveDmgMult(run.wave)), speed: ENEMY_SPEED.splitling * waveSpeedMult(run.wave),
        xp: base.xp, rf: base.rf, radius: base.radius, body: BODY_R.splitling, stopDist: 0,
        slowT: 0, slowF: 1, burnT: 0, burnDps: 0, shieldHp: 0, shieldMax: 0,
        elite: false, eliteMod: null, mods: [], pattern: null, bossName: "", phase: 0,
        wardT: 0, wardDown: 0, blinkT: 0, addT: 0,
        atkCd: 0.6, shootCd: 99, burstT: 99, summonT: 99,
        slamT: 0, slamX: 0, slamY: 0, slamCd: 99,
        chargeState: "roam", chargeT: 0, chargeDx: 0, chargeDy: 0, chargeCd: 99,
        fuseT: 0, aimT: 0, aimDx: 0, aimDy: 0, orbitDir: 1, orbitT: 0, skipT: 4, skipPhase: 0, leapState: "roam", leapT: 0, leapX: 0, leapY: 0, burrowState: "roam", burrowT: 3, burrowX: 0, burrowY: 0, mageCd: 3, drainT: 0, objective: "friend" as const, structCd: 1, stolen: 0, mineT: 3, reviveT: 6, bombardT: 2, fleeing: false,
        flash: 0, walkPhase: run.rng() * 6, lungeT: 0, spawnT: 0.4,
        facing: "down", px: e.x, py: e.y, waypoints: [], repathT: 0,
        goalX: e.x, goalY: e.y,
        stuckT: 0, lastX: e.x, lastY: e.y, stuckFails: 0,
      });
    }
    floater(run, e.x, e.y - 22, "SPLIT!", "#33415e", true);
  }
  if (e.kind === "boss") {
    run.bosses++;
    run.bossId = null;
    run.celebrateT = 1.6;
    // Chapter-end cleanup: remaining non-elite adds burst into rewards.
    const adds = run.enemies.filter(o => o !== e && o.kind !== "boss" && !o.elite);
    for (const o of adds) {
      burst(run, o.x, o.y, "#8a5a00", 8);
      run.kills++;
      run.xp += o.xp;
      bankAdd(run, Math.round(o.rf * rfGainMult(run)) + run.wave);
    }
    run.enemies = run.enemies.filter(o => o === e || o.kind === "boss" || o.elite);
    run.pickups.push({ kind: "heart", x: e.x - 20, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.pickups.push({ kind: "rf", x: e.x + 20, y: e.y, vx: 0, vy: -40, ttl: 25 });
    if (run.stacks.burn >= 3) {
      for (const o of run.enemies) {
        if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 100) {
          o.burnT = 3; o.burnDps = Math.max(o.burnDps, run.derived.dmg * 1.2);
        }
      }
    }
    run.events.push({ t: "bossdown", wave: run.wave });
    announce(run, "SHADOW BOSS DEFEATED!", "The plot holds… for now.");
    const lucky = run.luckyWave === run.wave ? 0.25 : 0;
    if (run.rng() < bossDropChance(run.wave, luckBonus(run)) + lucky + run.expLoot) {
      const pool = bossDropPool(run.wave);
      const gearId = pool[Math.floor(run.rng() * pool.length)];
      run.gearDrops.push(gearId);
      run.events.push({ t: "geardrop", gearId });
      floater(run, e.x, e.y - 40, "GEAR!", "#8a5a00", true);
    }
    run.shake = Math.max(run.shake, 0.35);
  }
  checkLevel(run);
}

function checkLevel(run: RunState): void {
  while (run.xp >= run.xpNext && !run.frozen && !run.over) {
    run.xp -= run.xpNext;
    run.level++;
    run.xpNext = xpForLevel(run.level);
    run.offers = makeOffers(run);
    run.rerollsUsed = 0;
    run.frozen = true;
    run.mover.stop();
    run.events.push({ t: "levelup" });
  }
}

function availableUpgrades(run: RunState): UpgradeId[] {
  return UPGRADE_IDS.filter(id => run.stacks[id] < UPGRADES[id].maxStacks);
}

/** Active loadout: Blast + up to 2 acquired actives. Oldest non-blast rotates out. */
export function abilitySlots(run: RunState): AbilityId[] {
  return run.abilities.slice(0, MAX_ACTIVE_ABILITIES);
}

export function makeOffers(run: RunState): Offer[] {
  const avail = availableUpgrades(run);
  const picks: UpgradeId[] = [];
  const pool = [...avail];
  while (picks.length < 3 && pool.length > 0) {
    const i = Math.floor(run.rng() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  const offers = picks.map(id => toOffer(run, id));
  // Ability discovery: sometimes one slot becomes a new ability from the
  // altar-unlocked pool (Blast-only start; discovery through progression).
  // Owned abilities below max rank can appear again to RANK UP.
  const ownedAb = new Set(run.abilities);
  const poolAb = abilitiesForAltar(run.altarLevel, run.unlocks);
  const unowned = poolAb.filter(a => a !== "ab-blast" && !ownedAb.has(a));
  // Blast never ranks (it scales via cooldown/damage upgrades instead).
  const rankable = poolAb.filter(a => a !== "ab-blast" && ownedAb.has(a) && (run.abilityRank[a] ?? 1) < ABILITY_MAX_RANK);
  // Early levels skew to behavior changes over raw stats: higher ability odds.
  // Training posts widen choices (reroll-lite: extra pick chance for abilities).
  const abOdds = Math.min(0.65, (run.level <= 4 ? 0.5 : 0.35) + run.training * 0.05);
  const abPool = [...unowned, ...rankable];
  if (abPool.length > 0 && offers.length > 0 && run.rng() < abOdds) {
    const aid = abPool[Math.floor(run.rng() * abPool.length)];
    const def = ABILITIES[aid];
    const rk = run.abilityRank[aid] ?? 1;
    const isRank = ownedAb.has(aid);
    offers[offers.length - 1] = {
      id: aid, name: isRank ? `${def.name} RANK ${rk + 1} [${def.key}]` : `${def.name} [${def.key}]`,
      desc: isRank ? `Rank up: bigger, wider, longer. (ability · ${def.role})` : `${def.desc} (ability · ${def.role} · ${def.rarity})`,
      icon: "★", evolved: isRank, stacks: isRank ? rk : 0, maxStacks: ABILITY_MAX_RANK,
    };
  }
  while (offers.length < 3) {
    offers.push({ id: "snack", name: "Snack Break", desc: "Heal 40 HP and stash +10 RF (simulated)", icon: "S", evolved: false, stacks: 0, maxStacks: 99 });
  }
  return offers;
}

function toOffer(run: RunState, id: UpgradeId): Offer {
  const def = UPGRADES[id];
  const stacks = run.stacks[id];
  const evolved = stacks + 1 >= def.maxStacks && !!def.evolvedName;
  return {
    id,
    name: evolved && def.evolvedName ? def.evolvedName : def.name,
    desc: evolved && def.evolvedDesc ? def.evolvedDesc : def.desc,
    icon: def.icon, evolved, stacks, maxStacks: def.maxStacks,
  };
}

export function applyUpgrade(run: RunState, id: UpgradeId | "snack" | AbilityId): void {
  const [fx, fy] = friendPos(run);
  if (id === "snack") {
    run.hp = Math.min(run.maxHp, run.hp + 40);
    bankAdd(run, 10);
    floater(run, fx, fy - 30, "+40 HP  +10", "#2f6b2f", true);
  } else if (id.startsWith("ab-")) {
    const aid = id as AbilityId;
    if (!run.abilities.includes(aid)) {
      run.abilities.push(aid);
      run.abilityRank[aid] = 1;
      // Loadout cap: Blast + 2 actives. Rotate the oldest non-blast out.
      while (run.abilities.length > MAX_ACTIVE_ABILITIES) {
        const idx = run.abilities.findIndex(a => a !== "ab-blast");
        if (idx < 0) break;
        const [dropped] = run.abilities.splice(idx, 1);
        delete run.abilityRank[dropped];
        announce(run, `${ABILITIES[aid].name.toUpperCase()} SWAPPED IN`, `${ABILITIES[dropped]?.name ?? dropped} rotated out (loadout: Blast + 2).`);
      }
      const def = ABILITIES[aid];
      announce(run, def.name.toUpperCase() + " UNLOCKED!", `${def.desc} Press ${def.key}.`);
      floater(run, fx, fy - 36, def.name + "!", "#8a5a00", true);
    } else {
      // Re-pick ranks up: bigger, wider, longer (max ABILITY_MAX_RANK).
      const rk = Math.min(ABILITY_MAX_RANK, (run.abilityRank[aid] ?? 1) + 1);
      run.abilityRank[aid] = rk;
      const def = ABILITIES[aid];
      announce(run, `${def.name.toUpperCase()} RANK ${rk}!`, "Bigger, wider, longer.");
      floater(run, fx, fy - 36, `${def.name} ${rk}!`, "#8a5a00", true);
      run.events.push({ t: "evolved", name: `${def.name} ${rk}` });
    }
  } else {
    const uid = id as UpgradeId;
    const def = UPGRADES[uid];
    if (!def) {
      // Defensive: unknown ids must never break the loop; skip cleanly.
      run.offers = [];
      run.frozen = false;
      return;
    }
    run.stacks[uid]++;
    if (uid === "vitality") {
      run.maxHp += 30;
      run.hp = Math.min(run.maxHp, run.hp + 30);
    }
    if (uid === "ironskin") run.armor += 2;
    if (uid === "minifriend") syncCompanions(run);
    if (run.stacks[uid] >= def.maxStacks && def.evolvedName) {
      run.events.push({ t: "evolved", name: def.evolvedName });
      announce(run, def.evolvedName, "Upgrade EVOLVED!");
      floater(run, fx, fy - 36, def.evolvedName + "!", "#8a5a00", true);
    }
    checkGearEvos(run);
  }
  run.offers = [];
  run.frozen = false;
}

/** Weapon/upgrade synergy evolutions (a few exciting build goals). */
export function checkGearEvos(run: RunState): void {
  const fam = run.derived.family;
  const has = (name: string) => !run.evos.includes(name);
  const grant = (name: string, sub: string) => {
    run.evos.push(name);
    announce(run, name, sub);
    const [fx, fy] = friendPos(run);
    floater(run, fx, fy - 40, name + "!", "#8a5a00", true);
    run.events.push({ t: "evolved", name });
  };
  if (has("FRIEND BARRAGE") && fam === "twin" && run.stacks.multishot >= 3) {
    grant("FRIEND BARRAGE", "Twin fire goes wide!");
  }
  if (has("VOID LANCE") && fam === "needle" && run.stacks.pierce >= 2) {
    grant("VOID LANCE", "Piercing shots deal +30%.");
  }
  if (has("INFERNO SCATTER") && fam === "scatter" && run.stacks.burn >= 3) {
    grant("INFERNO SCATTER", "Burning pellets spread inferno!");
  }
  if (has("PINBALL") && run.stacks.ricochet >= 2 && run.stacks.multishot >= 1) {
    grant("PINBALL", "Bounces +2, +20% damage!");
  }
  if (has("THUNDERHEAD") && run.stacks.storm >= 2 && run.stacks.crit >= 1) {
    grant("THUNDERHEAD", "Crits call lightning!");
  }
}

function isBarrage(run: RunState): boolean { return run.evos.includes("FRIEND BARRAGE"); }
function isPinball(run: RunState): boolean { return run.evos.includes("PINBALL"); }
function isThunder(run: RunState): boolean { return run.evos.includes("THUNDERHEAD"); }
function isLance(run: RunState): boolean { return run.evos.includes("VOID LANCE"); }
function isInfernoScatter(run: RunState): boolean { return run.evos.includes("INFERNO SCATTER"); }

function syncCompanions(run: RunState): void {
  const [fx, fy] = friendPos(run);
  const want = run.stacks.minifriend >= 3 ? 2 : run.stacks.minifriend >= 1 ? 1 : 0;
  const power = (run.stacks.minifriend >= 2 && want === 1 ? 1.5 : 1) * (1 + run.derived.compDmg + 0.4 * run.stacks.buddy);
  while (run.companions.length < want) {
    run.companions.push({ angle: run.rng() * Math.PI * 2, cd: 0.5, power, x: fx + 30, y: fy + 20 });
  }
  run.companions.length = want;
  for (const c of run.companions) c.power = power;
}

export function reroll(run: RunState): boolean {
  if (run.bankRf < REROLL_COST || run.rerollsUsed >= 1) return false;
  if (!bankSpend(run, REROLL_COST)) return false;
  run.rerollsUsed++;
  run.offers = makeOffers(run);
  return true;
}

export function blast(run: RunState): boolean {
  const cd = BLAST_COOLDOWN * (1 - run.derived.cdr - 0.15 * run.stacks.quick);
  if (run.blastCd > 0 || run.over || run.frozen || run.shopOpen) return false;
  run.blastCd = Math.max(8, cd);
  const [fx, fy] = friendPos(run);
  const dmg = run.derived.dmg * dmgMult(run) * BLAST_DMG_MULT;
  for (const e of run.enemies) {
    const dx = e.x - fx, dy = e.y - fy;
    const d = Math.hypot(dx, dy);
    if (d < BLAST_RADIUS_W + e.body) {
      damageEnemy(run, e, dmg, true);
      const push = (e.kind === "boss" ? 24 : 130) + run.derived.knockback;
      const n = Math.max(1, d);
      const nx = e.x + (dx / n) * push, ny = e.y + (dy / n) * push;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.x = Math.min(WORLD_W - 12, Math.max(12, nx));
        e.y = Math.min(WORLD_H - 12, Math.max(12, ny));
      }
    }
  }
  burst(run, fx, fy, "#7db83e", 30);
  run.shake = Math.max(run.shake, 0.4);
  run.events.push({ t: "blast" });
  return true;
}

export function heal(run: RunState): boolean {
  const cost = healCost(run.healUses, run.medbayLvl);
  if (run.bankRf < cost || run.over || run.frozen || run.shopOpen || run.hp >= run.maxHp) return false;
  if (!bankSpend(run, cost)) return false;
  run.healUses++;
  run.hp = Math.min(run.maxHp, run.hp + HEAL_AMOUNT);
  const [fx, fy] = friendPos(run);
  floater(run, fx, fy - 30, `+${HEAL_AMOUNT} HP`, "#2f6b2f", true);
  burst(run, fx, fy, "#7db83e", 12);
  run.events.push({ t: "heal" });
  return true;
}

/** Use a consumable from inventory (atomic: decrements only on success). */
export function useConsumable(run: RunState, id: string): boolean {  if (run.over || run.frozen || run.shopOpen) return false;
  if ((run.cons[id] ?? 0) <= 0) return false;
  const [fx, fy] = friendPos(run);
  if (id === "heal") {
    if (run.hp >= run.maxHp) return false;
    run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * 0.6));
    floater(run, fx, fy - 30, "FULL HEAL", "#2f6b2f", true);
  } else if (id === "ward") {
    run.shieldHp += 40;
    floater(run, fx, fy - 30, "WARDED", "#3f7fbf", true);
  } else if (id === "tonic") {
    run.tonicT = 30;
    floater(run, fx, fy - 30, "POWER UP", "#8a5a00", true);
  } else if (id === "token") {
    run.luckyWave = run.wave + 1;
    floater(run, fx, fy - 30, "LUCKY", "#8a5a00", true);
  } else if (id === "magnet") {
    for (const p of run.pickups) {
      const dx = fx - p.x, dy = fy - p.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      p.vx = (dx / d) * 320; p.vy = (dy / d) * 320;
    }
    floater(run, fx, fy - 30, "MAGNET!", "#3f7fbf", true);
  } else if (id === "fury") {
    run.furyT = 12;
    floater(run, fx, fy - 30, "RARE FURY!", "#e8823a", true);
  } else return false;
  run.cons[id]--;
  run.events.push({ t: "heal" });
  return true;
}

/** Trader block for a wave (boss waves open the shop for the cleared block). */
export function traderBlockFor(wave: number): number {
  return Math.max(0, Math.floor(wave / 5) - 1);
}

/** Precompute the upcoming Trader stock BEFORE the UI opens (no hitch on paint). */
export function precomputeShop(
  run: RunState, owned: string[],
  mods: TraderMods = {},
): StockItem[] {
  const block = traderBlockFor(run.wave);
  const stock = traderStock(run.rng, block, owned, {
    ...mods, ownedAbilities: [...run.abilities], ownedRelics: [...run.relics],
  });
  run.shopPre = stock;
  run.shopPreBlock = block;
  return stock;
}

/** Trader stock for the current block (uses precomputed stock when fresh). */
export function genStock(
  run: RunState, owned: string[],
  mods: TraderMods = {},
): StockItem[] {
  const block = traderBlockFor(run.wave);
  if (run.shopPre && run.shopPreBlock === block) {
    const out = run.shopPre;
    run.shopPre = null;
    return out;
  }
  return traderStock(run.rng, block, owned, {
    ...mods, ownedAbilities: [...run.abilities], ownedRelics: [...run.relics],
  });
}

export function summarize(run: RunState): RunSummary {
  return {
    timeSurvived: Math.round(run.time),
    wave: run.wave, mapIdx: run.mapIdx, kills: run.kills, bosses: run.bosses,
    rfEarned: run.earned, rfSpent: run.spent, gearDrops: [...run.gearDrops],
  };
}

/* ---------------- manual locomotion ---------------- */

/** Screen-intuitive WASD mapped into world space (matches projection). */
const KEYMAP: Record<string, [number, number]> = {
  w: [-1, -1], s: [1, 1], a: [-1, 1], d: [1, -1],
  arrowup: [-1, -1], arrowdown: [1, 1], arrowleft: [-1, 1], arrowright: [1, -1],
};

function manualStep(run: RunState, dt: number): void {
  let dx = 0, dy = 0;
  for (const k of run.keys) {
    const v = KEYMAP[k];
    if (v) { dx += v[0]; dy += v[1]; }
  }
  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    dx /= mag; dy /= mag;
    run.tapDest = null;
  } else if (run.tapDest) {
    const tx = run.tapDest[0] - run.mpos[0], ty = run.tapDest[1] - run.mpos[1];
    const d = Math.hypot(tx, ty);
    if (d < 8) {
      run.tapDest = null;
    } else {
      dx = tx / d; dy = ty / d;
    }
  }
  if (dx === 0 && dy === 0) {
    run.mwalking = false;
    return;
  }
  const stepLen = FRIEND_SPEED * moveSpeedOf(run) * (run.slowMe > 0 ? 0.55 : 1) * dt;
  const nx = run.mpos[0] + dx * stepLen, ny = run.mpos[1] + dy * stepLen;
  const nav = run.scene.navigator;
  const from: WorldPoint = [run.mpos[0], run.mpos[1]];
  if (nav.segmentClear(from, [nx, ny])) {
    run.mpos = [nx, ny];
    run.mwalking = true;
  } else {
    // Axis slide so walls feel smooth, never sticky.
    const sx: WorldPoint = [nx, run.mpos[1]];
    const sy: WorldPoint = [run.mpos[0], ny];
    if (Math.abs(dx) > 0.01 && nav.segmentClear(from, sx)) {
      run.mpos = sx;
      run.mwalking = true;
    } else if (Math.abs(dy) > 0.01 && nav.segmentClear(from, sy)) {
      run.mpos = sy;
      run.mwalking = true;
    } else {
      run.mwalking = false;
      run.tapDest = null;
    }
  }
  run.mpos = [
    Math.min(WORLD_W - 14, Math.max(14, run.mpos[0])),
    Math.min(WORLD_H - 14, Math.max(14, run.mpos[1])),
  ];
  run.mfacing = facingOf(dx, dy, run.mfacing);
}

/* ---------------- autonomous Friend AI ---------------- */

function friendAI(run: RunState, dt: number): void {
  const [fx, fy] = friendPos(run);
  run.aiT -= dt;
  if (Math.hypot(fx - run.lastPos[0], fy - run.lastPos[1]) > 6) {
    run.lastPos = [fx, fy];
    run.stuckT = 0;
  } else if (run.mover.state.destination) {
    run.stuckT += dt;
    if (run.stuckT > 2.2) {
      run.stuckT = 0;
      run.mover.stop();
      run.aiT = 0;
    }
  }
  const danger = ventDanger(run, fx, fy) ?? chargerDanger(run, fx, fy) ?? mageZoneDanger(run, fx, fy);
  const threat = nearestEnemy(run, fx, fy, 9999, true);
  const threatD = threat ? Math.hypot(threat.x - fx, threat.y - fy) : Infinity;
  // Sensible cooldowns: shield up when hurt, patch up when critical.
  if (!run.over && !run.frozen && run.phase === "combat") {
    const hurtFrac = run.hp / Math.max(1, run.maxHp);
    const ready = (id: AbilityId) => run.abilities.includes(id) && (run.abilityCd[id] ?? 0) <= 0;
    if (hurtFrac < 0.55 && (ready("ab-barrier") || ready("ab-bulwark") || ready("ab-mend"))) {
      if (ready("ab-barrier")) useAbility(run, "ab-barrier");
      else if (ready("ab-mend") && hurtFrac < 0.5) useAbility(run, "ab-mend");
      else if (ready("ab-bulwark")) useAbility(run, "ab-bulwark");
    }
    if (hurtFrac < 0.35 && (run.cons.heal ?? 0) > 0) useConsumable(run, "heal");
    // Defend the base: drift toward raiders chewing structures.
    const raid = run.enemies.find(e => e.hp > 0 && e.spawnT <= 0 &&
      (e.kind === "saboteur" || e.kind === "thief" || e.kind === "siege") &&
      Math.hypot(e.x - run.home[0], e.y - run.home[1]) < 150);
    if (raid && run.aiT <= 0 && threatD > 120) {
      run.aiT = 1.4;
      run.mood = "seek";
      pilotTo(run, [raid.x, raid.y]);
      return;
    }
  }
  if (run.intermission > 0 && run.enemies.length === 0) {
    if (run.mood !== "home") {
      run.mood = "home";
      pilotTo(run, run.home);
    } else if (!run.mover.state.destination && run.aiT <= 0) {
      run.aiT = 2 + run.rng() * 3;
      if (run.rng() < 0.6) pilotTo(run, randomWalkable(run.scene.world, run.rng, run.home[0], run.home[1], 70));
    }
    return;
  }
  // Valuable pickup nearby and fairly safe: detour.
  const pickup = nearestPickup(run, fx, fy);
  if (pickup && threatD > 60 && run.aiT <= 0) {
    run.aiT = 1.2;
    pilotTo(run, [pickup.x, pickup.y]);
    return;
  }
  if (danger && run.aiT <= 0) {
    // Sidestep telegraphed danger.
    run.aiT = 0.7;
    run.mood = "kite";
    const dx = fx - danger[0], dy = fy - danger[1];
    const n = Math.max(1, Math.hypot(dx, dy));
    const px = -dy / n, py = dx / n;
    run.pathReqs++; run.mover.moveTo([
      Math.min(WORLD_W - 24, Math.max(24, fx + px * 70)),
      Math.min(WORLD_H - 24, Math.max(24, fy + py * 70)),
    ]);
    return;
  }
  if (!threat) {
    run.mood = "seek";
    if (!run.mover.state.destination && run.aiT <= 0) {
      run.aiT = 1.5;
      pilotTo(run, randomWalkable(run.scene.world, run.rng));
    }
    return;
  }
  // Stray hunt: close directly instead of wandering.
  if (run.strayHunt) {
    run.mood = "seek";
    if (run.aiT <= 0) {
      run.aiT = 0.5;
      pilotTo(run, [threat.x, threat.y]);
    }
    return;
  }
  const threatReach = threat ? threat.body + FRIEND_BODY + 6 : 30;
  // Bosses demand a wider berth (slam + reach).
  const crowdAt = threat && threat.kind === "boss" ? 100 : 52;
  if (threatD < crowdAt) {
    run.mood = "retreat";
    if (run.aiT <= 0) {
      run.aiT = 0.9;
      const dx = fx - threat.x, dy = fy - threat.y;
      const n = Math.max(1, Math.hypot(dx, dy));
      const dist = threat.kind === "boss" ? 135 : 95;
      const dest: WorldPoint = [
        Math.min(WORLD_W - 24, Math.max(24, fx + (dx / n) * dist)),
        Math.min(WORLD_H - 24, Math.max(24, fy + (dy / n) * dist)),
      ];
      if (!pilotTo(run, dest)) pilotTo(run, randomWalkable(run.scene.world, run.rng));
    }
    return;
  }
  if (threatD > FRIEND_RANGE * 0.78) {
    run.mood = "seek";
    if (run.aiT <= 0) {
      run.aiT = 0.8;
      if (!pilotTo(run, [threat.x, threat.y])) {
        pilotTo(run, randomWalkable(run.scene.world, run.rng, fx, fy, 90));
      }
    }
    return;
  }
  run.mood = "fight";
  run.strafeT -= dt;
  if (run.strafeT <= 0 && !run.mover.state.destination) {
    run.strafeT = 1.6 + run.rng() * 1.8;
    if (run.rng() < 0.3) run.strafeDir *= -1;
    const dx = threat.x - fx, dy = threat.y - fy;
    const n = Math.max(1, Math.hypot(dx, dy));
    const px = -dy / n * run.strafeDir, py = dx / n * run.strafeDir;
    const orbit = Math.max(55, threatReach + 26);
    const dest: WorldPoint = [
      Math.min(WORLD_W - 24, Math.max(24, fx + px * orbit)),
      Math.min(WORLD_H - 24, Math.max(24, fy + py * orbit)),
    ];
    run.pathReqs++; run.mover.moveTo(dest);
  }
}

/** Nearest active telegraph danger point (vents), if the Friend stands in one. */
function ventDanger(run: RunState, fx: number, fy: number): WorldPoint | null {
  for (const v of run.vents) {
    if (v.phase === "tele" && Math.hypot(fx - v.x, fy - v.y) < 34) return [v.x, v.y];
  }
  return null;
}

/** Nearest mage-fire zone underfoot, if the Friend stands in one. */
function mageZoneDanger(run: RunState, fx: number, fy: number): WorldPoint | null {
  for (const z of run.zones) {
    if (z.kind === "mage" && Math.hypot(fx - z.x, fy - z.y) < z.r) return [z.x, z.y];
  }
  return null;
}

/** Nearest charging enemy's path origin, if it threatens the Friend. */
function chargerDanger(run: RunState, fx: number, fy: number): WorldPoint | null {
  for (const e of run.enemies) {
    if ((e.kind === "charger" && e.chargeState === "tele") || (e.kind === "boss" && e.slamT > 0)) {
      const px = e.kind === "boss" ? e.slamX : e.x + e.chargeDx * 40;
      const py = e.kind === "boss" ? e.slamY : e.y + e.chargeDy * 40;
      if (Math.hypot(fx - px, fy - py) < 60) return [px, py];
    }
  }
  return null;
}

function nearestPickup(run: RunState, fx: number, fy: number): Pickup | null {
  let best: Pickup | null = null;
  let bestD = 130 * 130;
  for (const p of run.pickups) {
    const dx = p.x - fx, dy = p.y - fy;
    const d = dx * dx + dy * dy;
    if (d < bestD) { bestD = d; best = p; }
  }
  return best;
}

/* ---------------- main step ---------------- */

export function stepRun(run: RunState, dt: number): void {
  if (run.over || run.frozen || run.shopOpen || run.phase !== "combat") return;
  const start = performance.now();
  let remaining = Math.min(dt, 0.25);
  while (remaining > 0) {
    const h = Math.min(1 / 60, remaining);
    step(run, h);
    remaining -= h;
    if (run.over || run.frozen) break;
  }
  const ms = performance.now() - start;
  run.stepMs = run.stepMs * 0.95 + ms * 0.05;
}

function step(run: RunState, dt: number): void {
  run.time += dt;
  if (run.shake > 0) run.shake = Math.max(0, run.shake - dt * 1.6);
  if (run.blastCd > 0) run.blastCd -= dt;
  if (run.muzzleT > 0) run.muzzleT -= dt;
  if (run.celebrateT > 0) run.celebrateT -= dt;
  if (run.tapMark) {
    run.tapMark.ttl -= dt;
    if (run.tapMark.ttl <= 0) run.tapMark = null;
  }
  if (run.tonicT > 0) run.tonicT -= dt;
  if (run.powerT > 0) run.powerT -= dt;
  if (run.hasteT > 0) run.hasteT -= dt;
  if (run.beamT > 0) run.beamT -= dt;
  if (run.iframes > 0) run.iframes -= dt;
  if (run.slowMe > 0) run.slowMe -= dt;
  if (run.overT > 0) run.overT -= dt;
  if (run.furyT > 0) run.furyT -= dt;
  if (run.timeCoreT > 0) run.timeCoreT -= dt;
  if (run.hitstop > 0) run.hitstop -= dt;
  // Momentum decays when combat slows (rhythm, not snowball).
  if (run.time - run.lastKillT > 4) run.momentum = Math.max(0, run.momentum - dt * 2);
  else run.momentum = Math.max(0, run.momentum - dt * 0.4);
  if (run.shieldT > 0) {
    run.shieldT -= dt;
    if (run.shieldT <= 0) run.shieldHp = 0;
  }
  for (const k of Object.keys(run.abilityCd)) {
    run.abilityCd[k] -= dt;
    if (run.abilityCd[k] <= 0) delete run.abilityCd[k];
  }
  for (let i = run.announce.length - 1; i >= 0; i--) {
    run.announce[i].ttl -= dt;
    if (run.announce[i].ttl <= 0) run.announce.splice(i, 1);
  }
  for (let i = run.corpses.length - 1; i >= 0; i--) {
    run.corpses[i].ttl -= dt;
    if (run.corpses[i].ttl <= 0) run.corpses.splice(i, 1);
  }

  // Spawning (capped so late waves stay smooth).
  if (run.queue.length > 0) {
    run.spawnT += dt;
    while (run.queue.length > 0 && run.queue[0].delay <= run.spawnT && run.enemies.length < MAX_ENEMIES) {
      const next = run.queue.shift();
      if (next) spawnEnemy(run, next.kind, next.gate, next.forceElite);
    }
  } else if (run.enemies.length === 0 && !run.over) {
    if (run.intermission <= 0) {
      run.intermission = 2.2;
      const stipend = 3 + run.wave * 2;
      bankAdd(run, stipend);
      const [hx, hy] = friendPos(run);
      floater(run, hx, hy - 30, `CLEAR +${stipend}`, "#2f6b2f", true);
      // Flawless defense: no structure took damage this wave.
      if (!run.waveStructHit && run.wave >= 5 && Object.keys(run.structMax).length > 0) {
        run.flawlessWaves++;
        floater(run, hx, hy - 52, "FLAWLESS!", "#8a5a00", true);
      }
    }
    run.intermission -= dt;
    if (run.intermission <= 0) {
      // Boss waves and every 5th wave open the Trader; closing it advances
      // (closeTrader emits mapswap on %5 so maps rotate every block).
      if (run.wave % 5 === 0) openTrader(run);
      else startWave(run, run.wave + 1);
    }
  }

  // Stray cleanup: one or two distant non-boss stragglers get hunted —
  // faster enemies plus auto-pilot pursuit, never a teleport.
  run.strayHunt = !run.over && run.enemies.length > 0 && run.enemies.length <= 2 &&
    !run.enemies.some(e => e.kind === "boss") && run.time - run.lastKillT > 12;

  // Locomotion: manual positioning or auto-pilot.
  if (run.manual) {
    manualStep(run, dt);
  } else {
    friendAI(run, dt);
    run.mover.update(dt * 1000 * (run.slowMe > 0 ? 0.55 : 1));
  }
  const [fx, fy] = friendPos(run);

  const regen = regenRate(run);
  if (regen > 0) run.hp = Math.min(run.maxHp, run.hp + regen * dt);
  if (run.healerLvl > 0 && (run.structHp.healer ?? 1) > 0) {
    run.healerT += dt;
    if (run.healerT >= 3) {
      run.healerT = 0;
      run.hp = Math.min(run.maxHp, run.hp + 4 + 3 * run.healerLvl);
    }
  }
  // Structure sabotage timers decay.
  for (const k of Object.keys(run.structOff)) {
    run.structOff[k] -= dt;
    if (run.structOff[k] <= 0) delete run.structOff[k];
  }
  if (run.overchargeT > 0) run.overchargeT -= dt;
  if (run.reflectT > 0) run.reflectT -= dt;
  if (run.domeT > 0) run.domeT -= dt;
  if (run.bulwarkT > 0) {
    run.bulwarkT -= dt;
    if (run.bulwarkT <= 0) { run.armor = Math.max(0, run.armor - run.bulwarkArmor); run.bulwarkArmor = 0; }
  }

  // Fire: mouse-aimed stream in manual-desktop, target aim otherwise.
  // Auto-fire while moving (shots originate from the CURRENT position).
  // The aim angle is the TRUE continuous world vector — never quantized.
  run.fireCd -= dt;
  if (run.fireCd <= 0) {
    if (run.manual && run.aimMode === "mouse" && run.aimSet) {
      const ang = continuousAimAngle(fx, fy, run.aimWorld[0], run.aimWorld[1]);
      fireMouse(run, fx, fy, ang);
    } else {
      const target = nearestEnemy(run, fx, fy, FRIEND_RANGE, true);
      if (target) {
        fireVolley(run, fx, fy, target, 1, run.weaponTint, run.derived.family === "heavy" ? 6 : 5);
        run.fireCd = interval(run) * (run.derived.family === "heavy" ? 1.25 : 1);
      } else {
        run.fireCd = 0.12;
      }
    }
  }

  // Turret structure at its world anchor (offline while destroyed/sabotaged).
  if (run.turretLvl > 0 && (run.structHp.turret ?? 1) > 0 && (run.structOff.turret ?? 0) <= 0) {
    const [tx, ty] = run.scene.anchors.turret;
    run.turretCd -= dt * (run.overchargeT > 0 ? 2 : 1);
    const target = nearestEnemy(run, tx, ty, 185, false);
    if (target) run.turretAngle = Math.atan2(target.y - ty, target.x - tx);
    if (run.turretCd <= 0 && target) {
      const dmg = (8 + run.turretLvl * 7) * (1 + run.wave * 0.02);
      const speed = 420;
      run.shots.push({
        x: tx, y: ty - 8, px: tx, py: ty - 8,
        vx: Math.cos(run.turretAngle) * speed, vy: Math.sin(run.turretAngle) * speed,
        dmg: Math.round(dmg * 10) / 10, pierce: run.turretLvl >= 3 ? 2 : 0, bounce: 0,
        explosive: 0, explosiveR: 0, burnDps: 0, burnDur: 0,
        slowF: 1, slowDur: 0, freeze: false, crit: false,
        life: 1.1, color: "#3f7fbf", size: 4, hitIds: [],
      });
      run.turretCd = Math.max(0.35, 1.1 - run.turretLvl * 0.15);
    }
    if (!target) run.turretCd = Math.min(run.turretCd, 0.15);
  }
  // Frost spire: chilling aura + weak bolts (offline while destroyed).
  if (run.frostLvl > 0 && (run.structHp.frost ?? 1) > 0 && (run.structOff.frost ?? 0) <= 0) {
    const [fx2, fy2] = run.scene.anchors.frost;
    const R = 120 + run.frostLvl * 20;
    for (const e of run.enemies) {
      if (Math.hypot(e.x - fx2, e.y - fy2) < R) {
        e.slowT = Math.max(e.slowT, 0.4);
        e.slowF = Math.min(e.slowF || 1, 0.7 - run.frostLvl * 0.05);
      }
    }
  }
  // Collector trickle: the base produces even mid-fight.
  if (run.collectorLvl > 0 && (run.structHp.collector ?? 1) > 0) {
    run.prodTick += (collectorRate(run.collectorLvl) / 60) * dt;
    if (run.prodTick >= 1) {
      const whole = Math.floor(run.prodTick);
      run.prodTick -= whole;
      bankAdd(run, whole);
    }
  }

  // Companions trail the Friend through the world.
  run.companions.forEach((c) => {
    c.cd -= dt;
    c.angle += dt * 1.4;
    const gx = fx + Math.cos(c.angle) * 42;
    const gy = fy + Math.sin(c.angle) * 42 - 6;
    const dx = gx - c.x, dy = gy - c.y;
    const d = Math.hypot(dx, dy);
    if (d > 2) {
      const stepLen = Math.min(d, 150 * dt);
      const nx = c.x + (dx / d) * stepLen, ny = c.y + (dy / d) * stepLen;
      if (run.scene.navigator.segmentClear([c.x, c.y], [nx, ny])) {
        c.x = nx; c.y = ny;
      } else {
        c.x = gx; c.y = gy;
      }
    }
    if (c.cd <= 0) {
      const target = nearestEnemy(run, c.x, c.y, 150, false);
      if (target) {
        const ang = Math.atan2(target.y - c.y, target.x - c.x);
        const band = run.relics.includes("re-band") ? 1.5 : 1;
        const dmg = Math.round(run.derived.dmg * dmgMult(run) * 0.4 * c.power * band * 10) / 10;
        run.shots.push({
          x: c.x, y: c.y, px: c.x, py: c.y,
          vx: Math.cos(ang) * 400, vy: Math.sin(ang) * 400,
          dmg, pierce: 0, bounce: 0, explosive: 0, explosiveR: 0,
          burnDps: run.stacks.burn > 0 ? dmg * 0.5 : 0, burnDur: 2,
          slowF: 1, slowDur: 0, freeze: false, crit: false,
          life: 1, color: "#7a5fc0", size: 4, hitIds: [],
        });
        c.cd = 1.1;
      } else c.cd = 0.15;
    }
  });

  // Hit-stop: strong impacts freeze enemies briefly (never the player/AUTO pilot).
  const edt = run.hitstop > 0 ? dt * 0.05 : dt;
  updateEnemies(run, edt, fx, fy);
  updateShots(run, dt);
  updateBolts(run, dt, fx, fy);
  updateOrbitals(run, dt, fx, fy);
  updateStrikes(run, dt);
  updateZones(run, dt, fx, fy);
  updateTraps(run, dt, fx, fy);
  updateWisps(run, dt, fx, fy);
  updatePickups(run, dt, fx, fy);
  updateVents(run, dt, fx, fy);
  updateFx(run, dt);
  // Precompute the Trader stock while the boss dies (UI opens with zero work).
  const boss = run.enemies.find(e => e.kind === "boss");
  if (boss && boss.hp < boss.maxHp * 0.25 && run.shopPreBlock !== traderBlockFor(run.wave)) {
    try { precomputeShop(run, []); } catch { /* best-effort */ }
  }

  if (run.hp <= 0 && !run.over) {
    run.hp = 0;
    run.over = true;
    run.events.push({ t: "gameover", summary: summarize(run) });
  }
  // Home Core lost = invasion lost (reduced rewards, base itself is safe).
  if ((run.structHp[HOME_CORE.id] ?? 1) <= 0 && !run.over) {
    run.over = true;
    announce(run, "HOME CORE DOWN!", "The invasion is lost — repair and defend again.");
    run.events.push({ t: "gameover", summary: summarize(run) });
  }
}

function openTrader(run: RunState): void {
  run.phase = "shop";
  run.intermission = 0;
  const block = Math.max(0, Math.floor(run.wave / 5) - 1);
  const owned: string[] = [];
  run.shop = { block, stock: [], rerolls: 0, wave: run.wave };
  void owned;
  run.events.push({ t: "trader", block });
  announce(run, "TRADER ARRIVED", "Spend RF·sim, then continue the defense.");
  // Stroll to the stall in both modes.
  if (!run.manual) { run.pathReqs++; run.mover.moveTo(run.scene.anchors.trader); }
  else run.tapDest = [...run.scene.anchors.trader];
}
/** Shell calls this when the player leaves the shop. */
export function closeTrader(run: RunState): void {
  run.phase = "combat";
  run.shopOpen = false;
  run.shop = null;
  if (run.wave % 5 === 0) {
    run.events.push({ t: "mapswap", mapIdx: mapForWave(run.wave + 1) });
    run.intermission = 60;
  } else {
    startWave(run, run.wave + 1);
  }
}

/** Begin a specific wave (map transitions, debug hooks). */
export function beginWave(run: RunState, wave: number): void {
  run.queue = [];
  run.enemies = [];
  run.shots = [];
  run.bolts = [];
  run.bossId = null;
  run.intermission = 0;
  run.phase = "combat";
  // Fresh lanes per wave: goals shift as the Friend repositions.
  run.routeCache.clear();
  startWave(run, wave);
}

/** Prep briefing for an upcoming wave (threat preview, no spawning). Pure data. */
export function prepInfo(wave: number, mapIdx: number): {
  wave: number; encounter: EncounterId; name: string; desc: string;
  kinds: EnemyArchetype[]; boss: string | null;
} {
  const plan = planWave(wave, mapIdx);
  const encounter = plan.type === "boss" ? "boss" as EncounterId : planEncounter(wave, mapIdx, plan.type);
  const kinds = plan.type === "boss"
    ? (["boss"] as EnemyArchetype[])
    : [...new Set(unlockedKinds(wave, mapIdx))].slice(0, 6);
  const boss = plan.type === "boss" ? bossSpec(wave).name : null;
  const def = ENCOUNTERS[encounter];
  return { wave, encounter, name: plan.type === "boss" ? boss ?? "BOSS" : def.name, desc: def.desc, kinds, boss };
}

/** Enter the short preparation phase before a wave (inspect, repair, loadout). */
export function beginPrep(run: RunState, wave: number): void {
  run.queue = [];
  run.enemies = [];
  run.shots = [];
  run.bolts = [];
  run.bossId = null;
  run.intermission = 0;
  run.phase = "prep";
  run.prepT = 0;
  run.wave = wave;
  run.events.push({ t: "prepdone", wave });
}

/** Advance prep; returns true when the player may launch (shell gates on UI). */
export function stepPrep(run: RunState, dt: number): boolean {
  if (run.phase !== "prep") return false;
  run.prepT += dt;
  return run.prepT > 0.5;
}

/** Launch the prepared wave (prep → combat). */
export function launchWave(run: RunState): void {
  if (run.phase !== "prep") return;
  run.phase = "combat";
  startWave(run, run.wave);
}

/** Re-anchor the auto-pilot mover to the manual position (mode switch). */
export function reanchorMover(run: RunState): void {
  const [x, y] = run.mpos;
  run.mover = createWorldMovement(run.scene.world, [x, y], { speed: FRIEND_SPEED, radius: 9 });
  run.tapDest = null;
}

/** Copy auto-pilot position into the manual body (mode switch). */
export function adoptMoverPos(run: RunState): void {
  const p = run.mover.state.position;
  run.mpos = [p[0], p[1]];
  run.mfacing = run.mover.state.facing;
  run.mover.stop();
  run.tapDest = null;
  run.keys.clear();
}

/** Apply a new gear loadout mid-run (Trader purchases take effect now). */
export function applyLoadout(run: RunState, derived: DerivedStats, weaponTint: string): void {
  run.derived = derived;
  run.weaponTint = weaponTint;
  run.maxHp = derived.maxHp + 30 * run.stacks.vitality;
  run.hp = Math.min(run.hp, run.maxHp);
  run.armor = derived.armor + 2 * run.stacks.ironskin;
  syncCompanions(run);
  checkGearEvos(run);
}

/** Reroll the current trader stock (escalating cost, atomic). */
export function rerollShop(run: RunState, owned: string[]): boolean {
  if (!run.shop) return false;
  const cost = rerollCost(run.shop.rerolls);
  if (!bankSpend(run, cost)) return false;
  run.shop.rerolls++;
  const block = run.shop.block;
  const wave = run.shop.wave;
  run.shop = { block, wave, stock: traderStock(run.rng, block, owned), rerolls: run.shop.rerolls };
  return true;
}

/** Dev-only: open the trader immediately (localhost-gated by the shell). */
export function debugShop(run: RunState): void {
  run.wave = 5;
  run.queue = [];
  run.enemies = [];
  openTrader(run);
}

function updateEnemies(run: RunState, dt: number, fx: number, fy: number): void {
  const wallR = run.wallLvl > 0 ? BARRICADE_RADIUS : 0;
  const list = run.enemies;
  const commanders = list.filter(o => o.kind === "commander" && o.hp > 0);
  for (const e of list) {
    e.walkPhase += dt * 6;
    if (e.flash > 0) e.flash -= dt;
    if (e.lungeT > 0) e.lungeT -= dt;
    if (e.spawnT > 0) { e.spawnT -= dt; continue; }
    if (e.burnT > 0) {
      e.burnT -= dt;
      e.hp -= e.burnDps * dt;
      if (run.rng() < dt * 8) burst(run, e.x, e.y - 8, "#c96a2e", 1);
    }
    const dx = fx - e.x, dy = fy - e.y;
    const dist = Math.hypot(dx, dy) || 1;
    let speed = e.speed * (run.strayHunt ? 1.8 : 1);
    // Mud slows Shadows (tactical terrain).
    for (const m of run.scene.mud) {
      if (Math.hypot(e.x - m.x, e.y - m.y) < m.r) { speed *= 0.6; break; }
    }
    // Commander aura: nearby allies hastened while it lives (kill it first).
    for (const o of commanders) {
      if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 110) { speed *= 1.25; break; }
    }
    // Support aura: nearby allies hastened (applied symmetric check below).
    if (e.slowT > 0) { e.slowT -= dt; speed *= e.slowF; }
    if (wallR > 0 && Math.hypot(e.x - run.home[0], e.y - run.home[1]) < wallR + 70) speed *= 0.65;
    if (e.kind === "boss" && e.mods.includes("Regenerating")) {
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01 * dt);
    }
    if (e.elite && e.eliteMod === "frenzied") e.atkCd -= dt * 0.3;

    if (e.kind === "charger") {
      updateCharger(run, e, dt, fx, fy, dist);
    } else if (e.kind === "boss") {
      updateBoss(run, e, dt, fx, fy, dist, speed);
    } else if (e.kind === "bomber" || e.kind === "sniper" || e.kind === "orbiter" || e.kind === "blinker" || e.kind === "leaper"
      || e.kind === "mage" || e.kind === "burrower" || e.kind === "commander" || e.kind === "drainer"
      || e.kind === "saboteur" || e.kind === "thief" || e.kind === "artillery"
      || e.kind === "necromancer" || e.kind === "traplayer" || e.kind === "siege") {
      updateSpecial(run, e, dt, fx, fy, dist, speed);
    } else {
      updateChaser(run, e, dt, fx, fy, dist, speed);
    }

    // Support aura: heal + cleanse nearby allies.
    if (e.kind === "support") supportPulse(run, e, dt);
  }
  separate(run, list, dt);
  // Deaths.
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].hp <= 0) {
      const [dead] = list.splice(i, 1);
      killEnemy(run, dead);
      if (run.frozen || run.over) return;
    }
  }
  // Stuck watchdog (last-resort recovery, counted for debug).
  for (const e of list) watchdog(run, e, dt);
}

/** New-archetype behaviors: bomber, sniper, orbiter, blinker, leaper + tactical + raider cast. */
function updateSpecial(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  if (e.kind === "mage" || e.kind === "burrower" || e.kind === "commander" || e.kind === "drainer") {
    updateTactical(run, e, dt, fx, fy, dist, speed);
    return;
  }
  if (e.kind === "saboteur" || e.kind === "thief" || e.kind === "artillery"
    || e.kind === "necromancer" || e.kind === "traplayer" || e.kind === "siege"
    || e.kind === "cryo" || e.kind === "corrupter" || e.kind === "elitehunter"
    || e.kind === "minimage" || e.kind === "minisiege") {
    updateRaider(run, e, dt, fx, fy, dist, speed);
    return;
  }
  if (e.kind === "minibrute") {
    updateCharger(run, e, dt, fx, fy, dist);
    return;
  }
  const reach = e.body + FRIEND_BODY + 5;
  if (e.kind === "bomber") {
    // Runs at the Friend, beeps, then detonates (hurts Shadows too).
    if (e.fuseT <= 0 && dist < 70) {
      e.fuseT = 0.6;
      e.waypoints = [];
    }
    if (e.fuseT > 0) {
      e.fuseT -= dt;
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      if (e.fuseT <= 0) {
        explode(run, e.x, e.y, 55, e.dmg * 1.6);
        if (Math.hypot(fx - e.x, fy - e.y) < 55 + FRIEND_BODY) {
          hurtFriend(run, Math.round(e.dmg * 1.6));
        }
        e.hp = 0; // consumed by its own blast (no kill credit farming)
        return;
      }
      return;
    }
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 0.5;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
    return;
  }
  if (e.kind === "sniper") {
    // Extreme range, long aim telegraph, heavy bolt. Yield ground if rushed.
    if (dist < 150) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y;
        e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
      e.aimT = 0;
      return;
    }
    if (dist > 320) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
      e.aimT = 0;
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.aimT += dt;
    if (e.aimT < 1.2) {
      // Track until 0.3s before the shot, then the aim LOCKS (dodgeable).
      if (e.aimT < 0.9) {
        e.aimDx = (fx - e.x) / dist;
        e.aimDy = (fy - e.y) / dist;
      }
      return;
    }
    e.aimT = -2.2; // cooldown after the shot
    const sp = 300;
    run.bolts.push({
      x: e.x, y: e.y, px: e.x, py: e.y,
      vx: e.aimDx * sp, vy: e.aimDy * sp, dmg: e.dmg, life: 2.5,
    });
    burst(run, e.x, e.y, "#3f7fbf", 3);
    run.events.push({ t: "eshot" });
    return;
  }
  if (e.kind === "orbiter") {
    // Circles the Friend, darting in to strike.
    e.orbitT -= dt;
    const wantR = 130;
    const ang = Math.atan2(e.y - fy, e.x - fx) + (e.orbitDir * speed * dt) / Math.max(40, dist);
    const tx = fx + Math.cos(ang) * wantR, ty = fy + Math.sin(ang) * wantR;
    const dx = tx - e.x, dy = ty - e.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.5) {
      const nx = e.x + (dx / d) * speed * dt, ny = e.y + (dy / d) * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y;
        e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    }
    if (e.orbitT <= 0 && dist < wantR + 30) {
      e.orbitT = 3;
      e.atkCd = 0; // strike now
    }
    if (dist <= reach) {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1.1;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    return;
  }
  if (e.kind === "blinker") {
    // Blinks around the Friend's flanks; never on top of the player.
    e.skipT -= dt;
    if (e.skipPhase > 0) {
      e.skipPhase -= dt;
      if (e.skipPhase <= 0) {
        burst(run, e.x, e.y, "#7a5fc0", 8);
      }
      return;
    }
    if (e.skipT <= 0) {
      e.skipT = 4 + run.rng() * 2;
      const a = Math.atan2(e.y - fy, e.x - fx) + (run.rng() < 0.5 ? 1 : -1) * (0.8 + run.rng() * 0.8);
      const r = 80 + run.rng() * 60;
      const nx = fx + Math.cos(a) * r, ny = fy + Math.sin(a) * r;
      if (isWorldWalkable(run.scene.world, [nx, ny], 8) &&
        regionAt(run.scene.regions, nx, ny) === run.scene.regions.homeId &&
        Math.hypot(nx - fx, ny - fy) > 60) {
        burst(run, e.x, e.y, "#7a5fc0", 6);
        e.x = Math.min(WORLD_W - 14, Math.max(14, nx));
        e.y = Math.min(WORLD_H - 14, Math.max(14, ny));
        e.skipPhase = 0.4;
        e.waypoints = [];
        e.repathT = 0;
      }
      return;
    }
    // Between blinks: drift toward the Friend like a skirmisher.
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1.0;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    return;
  }
  // leaper: telegraph crouch, then ballistic leap to the locked point + impact.
  if (e.leapState === "roam") {
    e.chargeCd -= dt;
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 0.8;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1.0;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    if (e.chargeCd <= 0 && dist < 200 && dist > 60) {
      e.leapState = "tele";
      e.leapT = 0.6;
      e.leapX = fx; e.leapY = fy; // locked early: dodgeable
      e.waypoints = [];
    }
    return;
  }
  if (e.leapState === "tele") {
    e.leapT -= dt;
    e.facing = facingOf(e.leapX - e.x, e.leapY - e.y, e.facing);
    if (e.leapT <= 0) {
      e.leapState = "air";
      e.leapT = 0.35;
      e.chargeDx = e.x; e.chargeDy = e.y; // leap start (reused fields)
    }
    return;
  }
  // air: ballistic interpolate start → locked landing, then impact.
  e.leapT -= dt;
  {
    const k = Math.max(0, Math.min(1, 1 - e.leapT / 0.35));
    e.px = e.x; e.py = e.y;
    e.x = e.chargeDx + (e.leapX - e.chargeDx) * k;
    e.y = e.chargeDy + (e.leapY - e.chargeDy) * k;
    e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
  }
  if (e.leapT <= 0) {
    e.leapState = "roam";
    e.chargeCd = 3.5;
    burst(run, e.x, e.y, "#2f6b2f", 12);
    if (Math.hypot(fx - e.x, fy - e.y) < 42 + FRIEND_BODY) {
      hurtFriend(run, Math.round(e.dmg * 1.3));
      burst(run, fx, fy, "#b03a3a", 6);
    }
    return;
  }
  return;
  // NOTE: mage/burrower/commander/drainer handled below (kept after leaper).
}

/** Tactical cast: mage zones, burrower ambush, commander aura, drainer tether. */
function updateTactical(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const reach = e.body + FRIEND_BODY + 5;
  if (e.kind === "mage") {
    // Keeps distance, paints telegraphed danger zones instead of direct shots.
    if (dist < 130) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y; e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    }
    e.mageCd -= dt;
    if (e.mageCd <= 0 && dist < 260) {
      e.mageCd = 4.5;
      if (run.zones.length < 10) {
        run.zones.push({ kind: "mage", x: fx, y: fy, r: 52, ttl: 2.2, max: 2.2, dps: e.dmg * 1.6, slowF: 1 });
        floater(run, fx, fy - 22, "DANGER!", "#d95f4b", false);
      }
    }
    return;
  }
  if (e.kind === "burrower") {
    // Cycles: roam → down (telegraphed dust) → up under the Friend.
    e.burrowT -= dt;
    if (e.burrowState === "roam") {
      if (dist > reach) {
        e.repathT -= dt;
        if (e.repathT <= 0 || e.waypoints.length === 0) {
          e.repathT = 0.8;
          requestRoute(run, e, [fx, fy]);
        }
        followWaypoints(run, e, speed * dt);
      } else {
        e.atkCd -= dt;
        if (e.atkCd <= 0) { e.atkCd = 1.1; e.lungeT = 0.28; meleeHit(run, e, e.dmg, fx, fy); }
      }
      if (e.burrowT <= 0) {
        e.burrowState = "down"; e.burrowT = 0.7;
        e.burrowX = fx; e.burrowY = fy; // locked early: dodgeable
        burst(run, e.x, e.y, "#8a7a5a", 10);
      }
      return;
    }
    if (e.burrowState === "down") {
      if (e.burrowT <= 0) {
        e.burrowState = "up"; e.burrowT = 0.5;
        e.x = Math.min(WORLD_W - 14, Math.max(14, e.burrowX));
        e.y = Math.min(WORLD_H - 14, Math.max(14, e.burrowY));
        e.px = e.x; e.py = e.y;
        burst(run, e.x, e.y, "#8a7a5a", 14);
        if (Math.hypot(fx - e.x, fy - e.y) < 40 + FRIEND_BODY) hurtFriend(run, e.dmg);
      }
      return;
    }
    if (e.burrowT <= 0) { e.burrowState = "roam"; e.burrowT = 3 + run.rng() * 2; }
    return;
  }
  if (e.kind === "commander") {
    // Slow bruiser: nearby allies gain speed/damage while it lives. Priority target.
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    for (const o of run.enemies) {
      if (o === e || o.kind === "boss") continue;
      if (Math.hypot(o.x - e.x, o.y - e.y) < 110) o.lungeT = Math.max(o.lungeT, 0.01);
    }
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.atkCd -= dt;
      if (e.atkCd <= 0) { e.atkCd = 1.2; e.lungeT = 0.28; meleeHit(run, e, e.dmg, fx, fy); }
    }
    return;
  }
  if (e.kind === "drainer") {
    // Holds range, channels a visible tether that slows while LOS holds.
    if (dist > 170) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 0.8;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
      e.drainT = 0;
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.drainT += dt;
    if (e.drainT > 0.5) {
      hurtFriend(run, Math.max(1, Math.round(e.dmg * 0.35)));
      e.drainT = 0;
      burst(run, fx, fy, "#3f7fbf", 2);
    }
    return;
  }
}

/**
 * Base-raider cast: foes that make the settlement matter. Each answers
 * "what must the player do differently": intercept saboteurs, guard the
 * Collector from thieves, close on artillery, focus necromancers, sweep
 * wide around trap layers, kite siege brutes off the walls.
 */
function updateRaider(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const seek = (tx: number, ty: number, sp: number) => {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 0.8;
      requestRoute(run, e, [tx, ty]);
    }
    followWaypoints(run, e, sp * dt);
  };
  if (e.kind === "saboteur") {
    // Sprints for the turret/frost and disables it with a shock.
    const tgt = structureTarget(run, "structure");
    if (!tgt) { seek(fx, fy, speed); }
    else {
      const d = Math.hypot(tgt.x - e.x, tgt.y - e.y);
      if (d > e.body + 16) seek(tgt.x, tgt.y, speed * 1.1);
      else {
        e.facing = facingOf(tgt.x - e.x, tgt.y - e.y, e.facing);
        e.structCd -= dt;
        if (e.structCd <= 0) {
          e.structCd = 4;
          damageStructure(run, tgt.id, e.dmg * 1.5);
          run.structOff[tgt.id] = Math.max(run.structOff[tgt.id] ?? 0, 6);
          burst(run, tgt.x, tgt.y, "#e8c53a", 10);
          floater(run, tgt.x, tgt.y - 24, "SABOTAGED!", "#d93a3a", true);
        }
      }
    }
    return;
  }
  if (e.kind === "thief") {
    // Grabs banked RF at the Collector, then flees to the nearest gate.
    const col = run.scene.anchors.collector;
    if (!e.fleeing) {
      const d = Math.hypot(col[0] - e.x, col[1] - e.y);
      if (!(run.structHp.collector > 0)) { seek(fx, fy, speed); }
      else if (d > e.body + 14) seek(col[0], col[1], speed * 1.15);
      else {
        e.structCd -= dt;
        if (e.structCd <= 0 && run.bankRf > 0) {
          e.structCd = 1.5;
          const take = Math.min(run.bankRf, 4 + Math.floor(run.wave / 2));
          run.bankRf -= take; e.stolen += take;
          run.stolenLost += take;
          run.events.push({ t: "stolen", amount: take });
          burst(run, col[0], col[1], "#7db83e", 6);
          if (e.stolen >= 12) e.fleeing = true;
        }
      }
      if (dist < 40) { // caught red-handed: drops the chase, fights
        e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      }
    } else {
      const gates = run.scene.gates;
      const g = gates.length > 0 ? gates[e.id % gates.length] : run.home;
      const d = Math.hypot(g[0] - e.x, g[1] - e.y);
      if (d < 24) {
        e.hp = 0; // escaped with the loot (no kill credit)
        floater(run, e.x, e.y - 20, "ESCAPED!", "#d93a3a", true);
        return;
      }
      seek(g[0], g[1], speed * 1.25);
    }
    return;
  }
  if (e.kind === "artillery") {
    // Holds extreme range, lobs telegraphed shells at structures.
    const tgt = structureTarget(run, "structure");
    const ax = tgt ? tgt.x : fx, ay = tgt ? tgt.y : fy;
    const d = Math.hypot(ax - e.x, ay - e.y);
    if (d > 260) { seek(ax, ay, speed); return; }
    e.facing = facingOf(ax - e.x, ay - e.y, e.facing);
    e.bombardT -= dt;
    if (e.bombardT <= 0) {
      e.bombardT = 5;
      run.strikes.push({ x: ax, y: ay, t: 1.2 });
      floater(run, ax, ay - 20, "INCOMING!", "#d93a3a", false);
    }
    return;
  }
  if (e.kind === "necromancer") {
    // Revives a fallen corpse as a shadow, then keeps distance.
    e.reviveT -= dt;
    if (e.reviveT <= 0 && run.corpses.length > 0 && run.enemies.length < MAX_ENEMIES - 1) {
      e.reviveT = 9;
      const c = run.corpses.pop();
      if (c) {
        burst(run, c.x, c.y, "#5b3f8c", 12);
        summonMinionKind(run, { x: c.x, y: c.y } as Enemy, "shadow");
        floater(run, c.x, c.y - 22, "RISE!", "#5b3f8c", true);
      }
    }
    if (dist < 150) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y; e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
      return;
    }
    if (dist > 200) { seek(fx, fy, speed); return; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0) {
      e.shootCd = 2.4;
      const d = Math.max(1, Math.hypot(fx - e.x, fy - e.y));
      const sp = 300;
      run.bolts.push({
        x: e.x, y: e.y, px: e.x, py: e.y,
        vx: ((fx - e.x) / d) * sp, vy: ((fy - e.y) / d) * sp, dmg: e.dmg, life: 2.5,
      });
      burst(run, e.x, e.y, "#5b3f8c", 3);
      run.events.push({ t: "eshot" });
    }
    return;
  }
  if (e.kind === "traplayer") {
    // Circles the Friend, seeding slow mines.
    e.mineT -= dt;
    if (e.mineT <= 0 && run.traps.length < 10) {
      e.mineT = 4.5;
      run.traps.push({ x: e.x, y: e.y, r: 30, ttl: 20, dmg: e.dmg, foe: true, slowF: 0.5 });
      burst(run, e.x, e.y, "#8a7a5a", 4);
    }
    const want = 120;
    if (dist > want + 30) { seek(fx, fy, speed); return; }
    if (dist < want - 30) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y; e.x = nx; e.y = ny;
      }
      return;
    }
    // Strafe orbit.
    const a = Math.atan2(e.y - fy, e.x - fx) + dt * 1.2;
    const nx = fx + Math.cos(a) * want, ny = fy + Math.sin(a) * want;
    e.px = e.x; e.py = e.y;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    return;
  }
  if (e.kind === "cryo") {
    // Frost skirmisher: keeps range, fires chilling bolts that slow.
    if (dist > 200) { seek(fx, fy, speed); return; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0 && dist < 260) {
      e.shootCd = 2.2;
      const d = Math.max(1, dist);
      const sp = 280;
      run.bolts.push({
        x: e.x, y: e.y, px: e.x, py: e.y,
        vx: ((fx - e.x) / d) * sp, vy: ((fy - e.y) / d) * sp, dmg: e.dmg, life: 2.5, chill: true,
      });
      burst(run, e.x, e.y, "#9db8dd", 3);
      run.events.push({ t: "eshot" });
    }
    return;
  }
  if (e.kind === "corrupter") {
    // Denies the economy: devours pickups it touches, then mauls.
    for (let i = run.pickups.length - 1; i >= 0; i--) {
      const p = run.pickups[i];
      if (Math.hypot(p.x - e.x, p.y - e.y) < 26) {
        run.pickups.splice(i, 1);
        burst(run, p.x, p.y, "#5b3f8c", 5);
        e.hp = Math.min(e.maxHp, e.hp + 4);
      }
    }
    if (dist > e.body + FRIEND_BODY + 5) { seek(fx, fy, speed); return; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) { e.atkCd = 1.1; e.lungeT = 0.28; meleeHit(run, e, e.dmg, fx, fy); }
    return;
  }
  if (e.kind === "elitehunter") {
    // Companion hunter: runs down wisps/companions first, blindingly fast.
    let tx = fx, ty = fy;
    let bd = Infinity;
    for (const c of run.companions) {
      const d = Math.hypot(c.x - e.x, c.y - e.y);
      if (d < bd) { bd = d; tx = c.x; ty = c.y; }
    }
    for (const w of run.wisps) {
      const d = Math.hypot(w.x - e.x, w.y - e.y);
      if (d < bd) { bd = d; tx = w.x; ty = w.y; }
    }
    const d = Math.hypot(tx - e.x, ty - e.y);
    if (d > e.body + FRIEND_BODY + 5) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 0.5;
        requestRoute(run, e, [tx, ty]);
      }
      followWaypoints(run, e, speed * 1.15 * dt);
      return;
    }
    e.facing = facingOf(tx - e.x, ty - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) { e.atkCd = 0.8; e.lungeT = 0.28; meleeHit(run, e, e.dmg, fx, fy); }
    return;
  }
  if (e.kind === "minimage") {
    // Mini-boss: pale summoner (max 2 living minions) + aimed bolts.
    let living = 0;
    for (const o of run.enemies) if (o !== e && o.kind !== "boss") living++;
    e.reviveT -= dt;
    if (e.reviveT <= 0 && living < 4 && run.enemies.length < MAX_ENEMIES - 2) {
      e.reviveT = 7;
      summonMinionKind(run, e, run.rng() < 0.5 ? "swarm" : "shadow");
      burst(run, e.x, e.y, "#c9a8ff", 10);
    }
    if (dist > 210) { seek(fx, fy, speed); return; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0) {
      e.shootCd = 2.0;
      const d = Math.max(1, dist);
      const sp = 300;
      for (const off of [-0.12, 0, 0.12]) {
        const a = Math.atan2(fy - e.y, fx - e.x) + off;
        run.bolts.push({ x: e.x, y: e.y, px: e.x, py: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, dmg: e.dmg, life: 2.5 });
      }
      run.events.push({ t: "eshot" });
    }
    return;
  }
  if (e.kind === "minisiege") {
    // Mini-boss: wall-eater lite — structure march + shockwave slam.
    const tgt2 = structureTarget(run, "structure");
    if (tgt2 && dist > 200) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [tgt2.x, tgt2.y]);
      }
      followWaypoints(run, e, speed * dt);
      return;
    }
    if (dist > e.body + FRIEND_BODY + 5) { seek(fx, fy, speed); return; }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.structCd -= dt;
    if (e.structCd <= 0) {
      e.structCd = 3;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
      burst(run, e.x, e.y, "#d95f4b", 10);
      run.shake = Math.max(run.shake, 0.2);
    }
    return;
  }
  // siege: slow brute that chews through structures, then the Friend.
  const tgt = structureTarget(run, "structure");
  if (tgt) {
    const d = Math.hypot(tgt.x - e.x, tgt.y - e.y);
    if (d > e.body + 20) { seek(tgt.x, tgt.y, speed); return; }
    e.facing = facingOf(tgt.x - e.x, tgt.y - e.y, e.facing);
    e.structCd -= dt;
    if (e.structCd <= 0) {
      e.structCd = 2.2;
      e.lungeT = 0.28;
      damageStructure(run, tgt.id, e.dmg * 2);
      burst(run, tgt.x, tgt.y, "#b03a3a", 12);
      run.shake = Math.max(run.shake, 0.25);
    }
    return;
  }
  seek(fx, fy, speed);
}

/** Standard seek/attack behavior with pathing, separation of concerns intact. */
function updateChaser(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const reach = e.stopDist > 0 ? e.stopDist : e.body + FRIEND_BODY + 5;
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 && (e.waypoints.length === 0 || Math.hypot(fx - e.goalX, fy - e.goalY) > 40)) {
      e.repathT = 1.2 + run.rng() * 1.0;
      let goal: WorldPoint = e.stopDist > 0
        ? [fx + (e.x - fx) / dist * e.stopDist, fy + (e.y - fy) / dist * e.stopDist]
        : [fx, fy];
      // Standoff points inside props are unroutable: fall back to approach.
      if (e.stopDist > 0 && !isWorldWalkable(run.scene.world, goal, 6)) goal = [fx, fy];
      requestRoute(run, e, goal, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
    // Ranged kiting: back off when crowded.
    if (e.stopDist > 0 && dist < 70) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y;
        e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    }
  } else if (e.stopDist === 0) {
    e.facing = facingOf(dx(fx, e.x), dy(fy, e.y), e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = e.elite && e.eliteMod === "frenzied" ? 0.7 : 1.0;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    // Support heals instead of shooting; summoner summons + weak bolts.
    if (e.kind === "support") {
      e.shootCd -= dt;
      if (e.shootCd <= 0) {
        e.shootCd = 3;
        burst(run, e.x, e.y, "#d95f4b", 6);
      }
      return;
    }
    e.shootCd -= dt;
    if (e.shootCd <= 0) {
      // Projectile pressure grows with wave tier (never HP-only difficulty).
      e.shootCd = Math.max(1.4, (e.kind === "summoner" ? 2.6 : 2.2) - run.wave * 0.03);
      const ang = Math.atan2(fy - e.y, fx - e.x);
      run.bolts.push({
        x: e.x, y: e.y, px: e.x, py: e.y,
        vx: Math.cos(ang) * 150, vy: Math.sin(ang) * 150, dmg: e.dmg, life: 3,
      });
      burst(run, e.x, e.y, "#7a5fc0", 2);
      if (e.kind === "summoner") {
        e.summonT -= dt * 10; // summon clock runs via shoot cycle too
        if (e.summonT <= 0 && run.enemies.length < MAX_ENEMIES - 1 && run.enemies.length < 40) {
          e.summonT = 9;
          summonMinion(run, e);
          floater(run, e.x, e.y - 30, "SUMMON", "#7a5fc0", true);
        }
      }
    }
  }
}

function dx(a: number, b: number): number { return a - b; }
function dy(a: number, b: number): number { return a - b; }

/** Melee strike with thorns reflection. */
function meleeHit(run: RunState, e: Enemy, dmg: number, fx: number, fy: number): void {
  const lost = hurtFriend(run, dmg);
  burst(run, fx, fy, "#b03a3a", 5);
  if (lost > 0 && run.derived.thorns > 0) {
    damageEnemy(run, e, dmg * run.derived.thorns, false);
  }
}

/**
 * Route request with stuck accounting: repeated null routes (unreachable
 * pocket) relocate the enemy to validated ground instead of A*-spinning
 * forever. Counts toward the debug watchdog stats.
 */
/** Quantized lane key: spawn-cluster -> goal-cluster share one A* lane. */
function laneKey(fx: number, fy: number, gx: number, gy: number): string {
  const q = (v: number) => Math.round(v / 28);
  return `${q(fx)},${q(fy)}>${q(gx)},${q(gy)}`;
}

function requestRoute(run: RunState, e: Enemy, goal: WorldPoint, fallback?: WorldPoint): void {
  run.pathReqs++;
  // Cached defense lanes: followers from the same gate-cluster to the same
  // goal-cluster copy waypoints instead of running A* (see §87). Lanes are
  // rebuilt per wave (beginWave clears) and bounded to avoid stale memory.
  const dx0 = goal[0] - e.x, dy0 = goal[1] - e.y;
  const d0 = Math.hypot(dx0, dy0);
  if (d0 > 60) {
    const key = laneKey(e.x, e.y, goal[0], goal[1]);
    const hit = run.routeCache.get(key);
    if (hit && hit.length > 0) {
      e.waypoints = [...hit];
      e.goalX = goal[0]; e.goalY = goal[1];
      return;
    }
  }
  // Bound worst-case A*: far goals route via a nearer subgoal; arrival
  // re-routes as the target moves. Direct steering covers the rest.
  const dx = goal[0] - e.x, dy = goal[1] - e.y;
  const d = Math.hypot(dx, dy);
  if (d > 230) {
    const leg: WorldPoint = [e.x + (dx / d) * 200, e.y + (dy / d) * 200];
    if (isWorldWalkable(run.scene.world, leg, 6)) {
      const short = run.scene.navigator.route([e.x, e.y], leg);
      if (short) {
        e.waypoints = short.length > 0 ? short : [leg];
        e.goalX = goal[0]; e.goalY = goal[1];
        if (run.routeCache.size < 48) run.routeCache.set(laneKey(e.x, e.y, leg[0], leg[1]), [...e.waypoints]);
        return;
      }
    }
    // Unwalkable subgoal: steer directly and retry later.
    e.waypoints = [goal];
    return;
  }
  const route = run.scene.navigator.route([e.x, e.y], goal);
  if (!route && fallback) {
    const fb = run.scene.navigator.route([e.x, e.y], fallback);
    if (fb) {
      e.waypoints = fb.length > 0 ? fb : [fallback];
      e.goalX = fallback[0]; e.goalY = fallback[1];
      if (run.routeCache.size < 48) run.routeCache.set(laneKey(e.x, e.y, fallback[0], fallback[1]), [...e.waypoints]);
      return;
    }
  }
  if (!route) {
    e.stuckFails++;
    e.repathT = 0.5;
    if (e.stuckFails >= 3) {
      const spot = validatedSpawn(run);
      e.x = spot[0]; e.y = spot[1];
      e.px = e.x; e.py = e.y;
      e.waypoints = [];
      e.stuckFails = 0;
      e.repathT = 0.5;
      run.stuckFixes++;
      run.stuckRoute++;
    } else {
      e.waypoints = [goal];
    }
    return;
  }
  e.waypoints = route.length > 0 ? route : [goal];
  if (d0 > 60 && route.length > 0 && run.routeCache.size < 48) {
    run.routeCache.set(laneKey(e.x, e.y, goal[0], goal[1]), [...e.waypoints]);
  }
}
function followWaypoints(run: RunState, e: Enemy, stepLen: number): void {
  const wp = e.waypoints[0];
  if (!wp) return;
  const wx = wp[0] - e.x, wy = wp[1] - e.y;
  const wd = Math.hypot(wx, wy);
  if (wd < 7) {
    e.waypoints.shift();
    return;
  }
  const nx = e.x + (wx / wd) * stepLen, ny = e.y + (wy / wd) * stepLen;
  if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
    e.px = e.x; e.py = e.y;
    e.x = nx; e.y = ny;
    e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
  } else {
    // Grid route vs fine steering mismatch (tight corners): skip the
    // unreachable node, sidestep for room, and repath shortly — never spin.
    e.waypoints.shift();
    const sx = -wy / wd, sy = wx / wd;
    const s1x = e.x + sx * stepLen, s1y = e.y + sy * stepLen;
    const s2x = e.x - sx * stepLen, s2y = e.y - sy * stepLen;
    if (run.scene.navigator.segmentClear([e.x, e.y], [s1x, s1y])) {
      e.px = e.x; e.py = e.y;
      e.x = s1x; e.y = s1y;
    } else if (run.scene.navigator.segmentClear([e.x, e.y], [s2x, s2y])) {
      e.px = e.x; e.py = e.y;
      e.x = s2x; e.y = s2y;
    }
    e.repathT = Math.min(e.repathT, 0.4);
  }
}

/** Charger: telegraph (dodgeable) → dash → vulnerable on miss. */
function updateCharger(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number): void {
  if (e.chargeState === "roam") {
    e.chargeCd -= dt;
    const reach = e.body + FRIEND_BODY + 5;
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 && (e.waypoints.length === 0 || Math.hypot(fx - e.goalX, fy - e.goalY) > 48)) {
        e.repathT = 1.0 + run.rng() * 0.6;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, e.speed * dt);
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1.0;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    if (e.chargeCd <= 0 && dist < 170 && dist > 50) {
      e.chargeState = "tele";
      e.chargeT = 0.7;
      e.waypoints = [];
    }
  } else if (e.chargeState === "tele") {
    e.chargeT -= dt;
    // Track until the last instant so manual players can bait it.
    if (e.chargeT > 0.2) {
      const n = Math.max(1, dist);
      e.chargeDx = (fx - e.x) / n;
      e.chargeDy = (fy - e.y) / n;
      e.facing = facingOf(e.chargeDx, e.chargeDy, e.facing);
    }
    if (e.chargeT <= 0) {
      e.chargeState = "dash";
      e.chargeT = 0.45;
    }
  } else if (e.chargeState === "dash") {
    e.chargeT -= dt;
    const nx = e.x + e.chargeDx * 260 * dt;
    const ny = e.y + e.chargeDy * 260 * dt;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.px = e.x; e.py = e.y;
      e.x = nx; e.y = ny;
    } else {
      e.chargeT = 0;
    }
    burst(run, e.x, e.y, "#c96a2e", 1);
    // Ram check against the Friend's body.
    if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
      meleeHit(run, e, Math.round(e.dmg * 1.5), fx, fy);
      e.chargeT = 0;
      e.chargeCd = 4;
      e.chargeState = "roam";
      return;
    }
    if (e.chargeT <= 0) {
      // Missed: briefly vulnerable.
      e.chargeState = "vuln";
      e.chargeT = 1.2;
      e.chargeCd = 4;
      floater(run, e.x, e.y - 22, "WIDE OPEN!", "#8a5a00", true);
    }
  } else {
    // vuln: sluggish.
    e.chargeT -= dt;
    if (dist > e.body + FRIEND_BODY + 5) followWaypoints(run, e, e.speed * 0.4 * dt);
    if (e.chargeT <= 0) e.chargeState = "roam";
  }
}

/** Orbital family: orbs circle the Friend and shred contact. */
function updateOrbitals(run: RunState, dt: number, fx: number, fy: number): void {
  if (run.derived.family !== "orbital") return;
  run.orbTick -= dt;
  if (run.orbTick > 0) return;
  run.orbTick = 0.33;
  const count = Math.max(2, projectileCount(run));
  const dmg = run.derived.dmg * dmgMult(run) * 0.8;
  for (let i = 0; i < count; i++) {
    const a = run.time * 2.4 + (i * Math.PI * 2) / count;
    const ox = fx + Math.cos(a) * 58, oy = fy + Math.sin(a) * 58;
    for (const e of run.enemies) {
      if (e.spawnT > 0.4) continue;
      if (Math.hypot(e.x - ox, e.y - oy) < e.body + 10) {
        damageEnemy(run, e, dmg, false);
        burst(run, ox, oy, run.weaponTint, 2);
      }
    }
  }
}

/** Ground zones: mage fire burns the Friend, freeze/gravity slow Shadows. */
function updateZones(run: RunState, dt: number, fx: number, fy: number): void {
  for (let i = run.zones.length - 1; i >= 0; i--) {
    const z = run.zones[i];
    z.ttl -= dt;
    if (z.ttl <= 0) { run.zones.splice(i, 1); continue; }
    if (z.kind === "mage") {
      if (Math.hypot(fx - z.x, fy - z.y) < z.r) hurtFriend(run, z.dps * dt);
    } else {
      for (const e of run.enemies) {
        if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.body) {
          e.slowT = Math.max(e.slowT, 0.3); e.slowF = Math.min(e.slowF || 1, z.slowF);
          if (z.kind === "gravity") {
            const d = Math.max(1, Math.hypot(e.x - z.x, e.y - z.y));
            e.x += ((z.x - e.x) / d) * 26 * dt;
            e.y += ((z.y - e.y) / d) * 26 * dt;
          }
        }
      }
    }
  }
}

/** Traps and hostile mines: trigger on proximity, then gone. */
function updateTraps(run: RunState, dt: number, fx: number, fy: number): void {
  for (let i = run.traps.length - 1; i >= 0; i--) {
    const tr = run.traps[i];
    tr.ttl -= dt;
    if (tr.ttl <= 0) { run.traps.splice(i, 1); continue; }
    if (tr.foe) {
      if (Math.hypot(fx - tr.x, fy - tr.y) < tr.r + FRIEND_BODY) {
        run.traps.splice(i, 1);
        hurtFriend(run, tr.dmg);
        burst(run, tr.x, tr.y, "#8a7a5a", 8);
      }
    } else {
      let hit = false;
      for (const e of run.enemies) {
        if (e.spawnT > 0.4) continue;
        if (Math.hypot(e.x - tr.x, e.y - tr.y) < tr.r + e.body) {
          damageEnemy(run, e, tr.dmg, false);
          e.slowT = Math.max(e.slowT, 1.5); e.slowF = Math.min(e.slowF || 1, tr.slowF);
          hit = true;
        }
      }
      if (hit) {
        run.traps.splice(i, 1);
        burst(run, tr.x, tr.y, "#7db83e", 10);
      }
    }
  }
}

/** Temporary wisp fighters: orbit the Friend, zap Shadows, then fade. */
function updateWisps(run: RunState, dt: number, fx: number, fy: number): void {
  void fx; void fy;
  for (let i = run.wisps.length - 1; i >= 0; i--) {
    const w = run.wisps[i];
    w.ttl -= dt;
    if (w.ttl <= 0) { run.wisps.splice(i, 1); continue; }
    w.angle += dt * 2.2;
    const [px, py] = friendPos(run);
    w.x = px + Math.cos(w.angle) * 52;
    w.y = py + Math.sin(w.angle) * 52 - 6;
    w.cd -= dt;
    if (w.cd <= 0) {
      const target = nearestEnemy(run, w.x, w.y, 170, false);
      if (target) {
        const ang = Math.atan2(target.y - w.y, target.x - w.x);
        const dmg = Math.round(run.derived.dmg * dmgMult(run) * 0.5 * w.power * 10) / 10;
        run.shots.push({
          x: w.x, y: w.y, px: w.x, py: w.y,
          vx: Math.cos(ang) * 400, vy: Math.sin(ang) * 400,
          dmg, pierce: 0, bounce: 0, explosive: 0, explosiveR: 0,
          burnDps: 0, burnDur: 0, slowF: 1, slowDur: 0, freeze: false, crit: false,
          life: 1, color: "#9db8dd", size: 4, hitIds: [],
        });
        w.cd = 0.9;
      } else w.cd = 0.2;
    }
  }
}

/** Delayed orbital strikes land. */
function updateStrikes(run: RunState, dt: number): void {
  for (let i = run.strikes.length - 1; i >= 0; i--) {
    const s = run.strikes[i];
    s.t -= dt;
    if (s.t <= 0) {
      run.strikes.splice(i, 1);
      explode(run, s.x, s.y, 70, run.derived.dmg * dmgMult(run) * 5);
      run.shake = Math.max(run.shake, 0.3);
      floater(run, s.x, s.y - 30, "STRIKE!", "#8a5a00", true);
    }
  }
}

/** Active abilities: Blast + mobility/defense/offense/control kit. */
export function abilityCd(run: RunState, id: AbilityId): number {
  if (id === "ab-blast") return Math.max(0, run.blastCd);
  return Math.max(0, run.abilityCd[id] ?? 0);
}

export function abilityCdMax(run: RunState, id: AbilityId): number {
  const def = ABILITIES[id];
  if (id === "ab-blast") return Math.max(8, BLAST_COOLDOWN * (1 - run.derived.cdr - 0.15 * run.stacks.quick));
  if (id === "ab-dash") return dashCooldown(run) * abilityCdScale(run);
  return def.cd * abilityCdScale(run);
}

export function useAbility(run: RunState, id: AbilityId): boolean {
  if (run.over || run.frozen || run.shopOpen) return false;
  if (id !== "ab-blast" && !run.abilities.includes(id)) return false;
  if (abilityCd(run, id) > 0) return false;
  const [fx, fy] = friendPos(run);
  if (id === "ab-blast") return blast(run);
  if (id === "ab-dash") {
    // Dodge toward movement input, else aim, else away from nearest threat.
    let dx = 0, dy = 0;
    for (const k of run.keys) {
      const v = KEYMAP[k];
      if (v) { dx += v[0]; dy += v[1]; }
    }
    if (dx === 0 && dy === 0 && run.aimMode === "mouse" && run.aimSet) {
      dx = run.aimWorld[0] - fx; dy = run.aimWorld[1] - fy;
    }
    if (dx === 0 && dy === 0) {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { dx = fx - t.x; dy = fy - t.y; }
      else { dx = 1; dy = 0; }
    }
    const n = Math.max(0.01, Math.hypot(dx, dy));
    // Stepwise so dashes slide along walls instead of sticking.
    for (const f of [1, 0.6, 0.3]) {
      const nx = fx + (dx / n) * 70 * f, ny = fy + (dy / n) * 70 * f;
      if (run.scene.navigator.segmentClear([fx, fy], [nx, ny])) {
        // Stay in the current control mode: re-anchor the pilot, don't strand it.
        run.mpos = [nx, ny];
        reanchorMover(run);
        break;
      }
    }
    run.iframes = 0.3;
    run.abilityCd[id] = dashCooldown(run);
    burst(run, fx, fy, "#ffffff", 8);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-nova") {
    const dmg = run.derived.dmg * dmgMult(run) * 3;
    for (const e of run.enemies) {
      const ddx = e.x - fx, ddy = e.y - fy;
      const d = Math.hypot(ddx, ddy);
      if (d < 110 + e.body) {
        damageEnemy(run, e, dmg, false);
        const n = Math.max(1, d);
        const nx = e.x + (ddx / n) * 90, ny = e.y + (ddy / n) * 90;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
          e.x = Math.min(WORLD_W - 12, Math.max(12, nx));
          e.y = Math.min(WORLD_H - 12, Math.max(12, ny));
        }
      }
    }
    burst(run, fx, fy, "#e8c53a", 24);
    run.shake = Math.max(run.shake, 0.3);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-barrier") {
    run.shieldHp = Math.max(run.shieldHp, 50);
    run.shieldT = 12;
    floater(run, fx, fy - 30, "BARRIER", "#3f7fbf", true);
    burst(run, fx, fy, "#3f7fbf", 12);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-strike") {
    if (run.strikes.length >= 3) return false;
    let tx = fx, ty = fy - 100;
    if (run.aimMode === "mouse" && run.aimSet) {
      tx = run.aimWorld[0]; ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { tx = t.x; ty = t.y; }
    }
    run.strikes.push({ x: tx, y: ty, t: 0.8 });
    floater(run, tx, ty - 20, "MARKED", "#8a5a00", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    return true;
  }
  if (id === "ab-overdrive") {
    run.overT = 6;
    floater(run, fx, fy - 30, "OVERDRIVE!", "#e8c53a", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-phase") {
    // Short blink toward aim through Shadows (never through walls).
    let dx = 0, dy = 0;
    if (run.aimMode === "mouse" && run.aimSet) {
      dx = run.aimWorld[0] - fx; dy = run.aimWorld[1] - fy;
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { dx = t.x - fx; dy = t.y - fy; }
      else { dx = 1; dy = 0; }
    }
    const n = Math.max(0.01, Math.hypot(dx, dy));
    const nx = fx + (dx / n) * 95, ny = fy + (dy / n) * 95;
    if (run.scene.navigator.segmentClear([fx, fy], [nx, ny])) {
      run.mpos = [Math.min(WORLD_W - 14, Math.max(14, nx)), Math.min(WORLD_H - 14, Math.max(14, ny))];
      reanchorMover(run);
    }
    run.iframes = Math.max(run.iframes, 0.35);
    burst(run, fx, fy, "#7a5fc0", 10);
    burst(run, run.mpos[0], run.mpos[1], "#7a5fc0", 10);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-gravity") {
    let tx = fx, ty = fy;
    if (run.aimMode === "mouse" && run.aimSet) { tx = run.aimWorld[0]; ty = run.aimWorld[1]; }
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { tx = t.x; ty = t.y; }
    }
    for (const e of run.enemies) {
      if (e.kind === "boss") continue;
      const d = Math.hypot(e.x - tx, e.y - ty);
      if (d < 150) {
        const n = Math.max(1, d);
        const nx = tx + ((e.x - tx) / n) * 46, ny = ty + ((e.y - ty) / n) * 46;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
        e.slowT = Math.max(e.slowT, 2.5); e.slowF = Math.min(e.slowF || 1, 0.55);
      }
    }
    run.zones.push({ kind: "gravity", x: tx, y: ty, r: 60, ttl: 2.5, max: 2.5, dps: 0, slowF: 0.6 });
    burst(run, tx, ty, "#7a5fc0", 18);
    floater(run, tx, ty - 24, "GRAVITY!", "#7a5fc0", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-chain") {
    const dmg = run.derived.dmg * dmgMult(run) * 2.2;
    let tx = fx, ty = fy;
    const first = nearestEnemy(run, run.aimMode === "mouse" && run.aimSet ? run.aimWorld[0] : fx, run.aimMode === "mouse" && run.aimSet ? run.aimWorld[1] : fy, 260, false);
    if (!first) return false;
    chainLightning(run, first.x, first.y, dmg, -1);
    burst(run, first.x, first.y, "#e8c53a", 12);
    floater(run, first.x, first.y - 24, "CHAIN!", "#e8c53a", true);
    void tx; void ty;
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-freeze") {
    let tx = fx, ty = fy - 60;
    if (run.aimMode === "mouse" && run.aimSet) { tx = run.aimWorld[0]; ty = run.aimWorld[1]; }
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { tx = t.x; ty = t.y; }
    }
    if (run.zones.length > 8) run.zones.shift();
    run.zones.push({ kind: "freeze", x: tx, y: ty, r: 70, ttl: 6, max: 6, dps: 0, slowF: 0.45 });
    floater(run, tx, ty - 24, "FREEZE!", "#9db8dd", true);
    burst(run, tx, ty, "#9db8dd", 14);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  const rank = run.abilityRank[id] ?? 1;
  if (id === "ab-bulwark") {
    const armor = 4 + (rank - 1) * 3;
    if (run.bulwarkT > 0) run.armor = Math.max(0, run.armor - run.bulwarkArmor);
    run.bulwarkArmor = armor;
    run.armor += armor;
    run.bulwarkT = 10 + (rank - 1) * 4;
    floater(run, fx, fy - 30, `BULWARK +${armor}`, "#6b6558", true);
    burst(run, fx, fy, "#6b6558", 12);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-mend") {
    const pct = 0.35 + (rank - 1) * 0.12;
    run.hp = Math.min(run.maxHp, run.hp + Math.round(run.maxHp * pct));
    // Rank 2+: shake off slows (cleanse).
    if (rank >= 2) run.iframes = Math.max(run.iframes, 0.5);
    floater(run, fx, fy - 30, `MENDED +${Math.round(run.maxHp * pct)}`, "#2f6b2f", true);
    burst(run, fx, fy, "#2f6b2f", 14);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-snare") {
    const r = 90 + (rank - 1) * 30;
    const dmg = run.derived.dmg * dmgMult(run) * (rank >= 3 ? 2 : 0.5);
    for (const e of run.enemies) {
      if (e.kind === "boss" && rank < 3) continue;
      const d = Math.hypot(e.x - fx, e.y - fy);
      if (d < r + e.body) {
        if (dmg > 0) damageEnemy(run, e, dmg, false);
        // Stun: full stop briefly (bosses only slowed).
        e.slowT = Math.max(e.slowT, e.kind === "boss" ? 1 : 1.2 + (rank - 1) * 0.5);
        e.slowF = Math.min(e.slowF || 1, e.kind === "boss" ? 0.5 : 0);
      }
    }
    burst(run, fx, fy, "#e8d44b", 20);
    run.shake = Math.max(run.shake, 0.25);
    floater(run, fx, fy - 30, "SNARED!", "#e8d44b", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-wisp") {
    const n = rank >= 2 ? 2 : 1;
    for (let i = 0; i < n && run.wisps.length < 3; i++) {
      run.wisps.push({ x: fx, y: fy, cd: 0.3, ttl: 25, power: 1 + (rank - 1) * 0.5, angle: run.rng() * Math.PI * 2 });
    }
    floater(run, fx, fy - 30, n > 1 ? "WISPS!" : "WISP!", "#9db8dd", true);
    burst(run, fx, fy, "#9db8dd", 14);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-overcharge") {
    run.overchargeT = 8 + (rank - 1) * 4;
    // Field repair: structures patched to keep the line alive.
    for (const k of Object.keys(run.structHp)) {
      if (run.structHp[k] > 0 && run.structHp[k] < run.structMax[k]) {
        run.structHp[k] = Math.min(run.structMax[k], run.structHp[k] + Math.round(run.structMax[k] * 0.2));
      }
    }
    floater(run, fx, fy - 30, "OVERCHARGED!", "#e8c53a", true);
    burst(run, fx, fy, "#e8c53a", 16);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-spike") {
    let tx = fx, ty = fy - 60;
    if (run.aimMode === "mouse" && run.aimSet) { tx = run.aimWorld[0]; ty = run.aimWorld[1]; }
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { tx = t.x; ty = t.y; }
    }
    const n = 1 + (rank >= 2 ? 1 : 0) + (rank >= 3 ? 1 : 0);
    for (let i = 0; i < n && run.traps.length < 10; i++) {
      run.traps.push({
        x: tx + (run.rng() - 0.5) * 40, y: ty + (run.rng() - 0.5) * 30,
        r: 34, ttl: 30, dmg: run.derived.dmg * dmgMult(run) * (2 + rank), foe: false, slowF: 0.5,
      });
    }
    floater(run, tx, ty - 24, n > 1 ? "TRAPS SET!" : "TRAP SET!", "#7db83e", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    return true;
  }
  if (id === "ab-piercing") {
    // Hypersonic lance down the TRUE aim vector: shreds whole lines.
    let ang: number;
    if (run.aimMode === "mouse" && run.aimSet) ang = continuousAimAngle(fx, fy, run.aimWorld[0], run.aimWorld[1]);
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      ang = t ? Math.atan2(t.y - fy, t.x - fx) : 0;
    }
    const len = 230 + (rank - 1) * 40, w = 10 + (rank - 1) * 4;
    const ex = fx + Math.cos(ang) * len, ey = fy + Math.sin(ang) * len;
    const dmg = run.derived.dmg * dmgMult(run) * (2 + rank * 0.8);
    for (const e of run.enemies) {
      if (e.spawnT > 0.4) continue;
      if (segDist(e.x, e.y, fx, fy, ex, ey) < e.body + w) {
        damageEnemy(run, e, dmg * (e.kind === "boss" ? 1 + run.derived.bossDmg : 1), false);
        const n = Math.max(1, Math.hypot(e.x - fx, e.y - fy));
        const nx = e.x + ((e.x - fx) / n) * 40, ny = e.y + ((e.y - fy) / n) * 40;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
        burst(run, e.x, e.y, run.weaponTint, 3);
      }
    }
    run.beamT = 0.12; run.beamAng = ang;
    burst(run, fx + Math.cos(ang) * 20, fy + Math.sin(ang) * 20, "#ffffff", 6);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-mortar") {
    let tx = fx, ty = fy - 100;
    if (run.aimMode === "mouse" && run.aimSet) { tx = run.aimWorld[0]; ty = run.aimWorld[1]; }
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { tx = t.x; ty = t.y; }
    }
    // Cluster: one marked shell that fractures into three timed blasts.
    run.strikes.push({ x: tx, y: ty, t: 0.9 });
    run.strikes.push({ x: tx - 44, y: ty + 26, t: 1.1 });
    run.strikes.push({ x: tx + 44, y: ty + 26, t: 1.3 });
    floater(run, tx, ty - 24, "MORTAR OUT!", "#e8823a", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    return true;
  }
  if (id === "ab-whirlwind") {
    const r = 110 + (rank - 1) * 30;
    const dmg = run.derived.dmg * dmgMult(run) * (1.6 + rank * 0.5);
    for (const e of run.enemies) {
      const d = Math.hypot(e.x - fx, e.y - fy);
      if (d < r + e.body) {
        damageEnemy(run, e, dmg, false);
        const n = Math.max(1, d);
        const nx = e.x + ((e.x - fx) / n) * 70, ny = e.y + ((e.y - fy) / n) * 70;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
      }
    }
    // Cyclone shreds incoming bolts too.
    for (let i = run.bolts.length - 1; i >= 0; i--) {
      const b = run.bolts[i];
      if (Math.hypot(b.x - fx, b.y - fy) < r) { burst(run, b.x, b.y, "#9db8dd", 2); run.bolts.splice(i, 1); }
    }
    burst(run, fx, fy, "#9db8dd", 22);
    run.shake = Math.max(run.shake, 0.3);
    floater(run, fx, fy - 30, "CYCLONE!", "#9db8dd", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-blade") {
    let ang: number;
    if (run.aimMode === "mouse" && run.aimSet) ang = continuousAimAngle(fx, fy, run.aimWorld[0], run.aimWorld[1]);
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      ang = t ? Math.atan2(t.y - fy, t.x - fx) : 0;
    }
    const arc = 0.9 + (rank - 1) * 0.3, reach = 130;
    const dmg = run.derived.dmg * dmgMult(run) * (3 + rank);
    for (const e of run.enemies) {
      const d = Math.hypot(e.x - fx, e.y - fy);
      if (d > reach + e.body) continue;
      let da = Math.atan2(e.y - fy, e.x - fx) - ang;
      while (da > Math.PI) da -= Math.PI * 2;
      while (da < -Math.PI) da += Math.PI * 2;
      if (Math.abs(da) > arc / 2 && d > 30) continue;
      damageEnemy(run, e, dmg, true);
      const n = Math.max(1, d);
      const nx = e.x + ((e.x - fx) / n) * 110, ny = e.y + ((e.y - fy) / n) * 110;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
      burst(run, e.x, e.y, "#e8c53a", 4);
    }
    burst(run, fx + Math.cos(ang) * 60, fy + Math.sin(ang) * 60, "#e8c53a", 12);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-reflect") {
    run.reflectT = 6 + (rank - 1) * 3;
    run.shieldHp = Math.max(run.shieldHp, 30 * rank);
    run.shieldT = Math.max(run.shieldT, 8);
    floater(run, fx, fy - 30, "PRISM UP!", "#9db8dd", true);
    burst(run, fx, fy, "#9db8dd", 14);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-shielddome") {
    run.shieldHp = Math.max(run.shieldHp, 60 + (rank - 1) * 40);
    run.shieldT = 12;
    run.domeT = 10;
    // Dome steadies nearby structures: brief offline clear + patch.
    for (const k of Object.keys(run.structOff)) delete run.structOff[k];
    for (const k of Object.keys(run.structHp)) {
      if (run.structHp[k] > 0) run.structHp[k] = Math.min(run.structMax[k], run.structHp[k] + 15 * rank);
    }
    floater(run, fx, fy - 30, "SANCTUARY!", "#7ee787", true);
    burst(run, fx, fy, "#7ee787", 18);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-leap") {
    let dx = 0, dy = 0;
    if (run.aimMode === "mouse" && run.aimSet) { dx = run.aimWorld[0] - fx; dy = run.aimWorld[1] - fy; }
    else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) { dx = t.x - fx; dy = t.y - fy; }
      else { dx = 1; dy = 0; }
    }
    const n = Math.max(0.01, Math.hypot(dx, dy));
    const lx = fx + (dx / n) * 150, ly = fy + (dy / n) * 150;
    if (run.scene.navigator.segmentClear([fx, fy], [lx, ly])) {
      run.mpos = [Math.min(WORLD_W - 14, Math.max(14, lx)), Math.min(WORLD_H - 14, Math.max(14, ly))];
      reanchorMover(run);
    }
    run.iframes = Math.max(run.iframes, 0.4);
    const [lfx, lfy] = friendPos(run);
    explode(run, lfx, lfy, 70 + (rank - 1) * 20, run.derived.dmg * dmgMult(run) * (2.5 + rank));
    for (const e of run.enemies) {
      if (Math.hypot(e.x - lfx, e.y - lfy) < 80 && e.kind !== "boss") {
        e.slowT = Math.max(e.slowT, 1.5); e.slowF = Math.min(e.slowF || 1, 0);
      }
    }
    floater(run, lfx, lfy - 30, "COMET!", "#e8823a", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-stunwave") {
    const r = 170;
    const dur = 2.5 + rank * 0.8;
    for (const e of run.enemies) {
      if (Math.hypot(e.x - fx, e.y - fy) > r + e.body) continue;
      if (e.kind === "boss") {
        e.slowT = Math.max(e.slowT, 2); e.slowF = Math.min(e.slowF || 1, 0.5);
        continue;
      }
      e.slowT = Math.max(e.slowT, dur); e.slowF = Math.min(e.slowF || 1, 0);
      const n = Math.max(1, Math.hypot(e.x - fx, e.y - fy));
      const nx = e.x + ((e.x - fx) / n) * 50, ny = e.y + ((e.y - fy) / n) * 50;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) { e.x = nx; e.y = ny; }
    }
    burst(run, fx, fy, "#e8c53a", 26);
    run.shake = Math.max(run.shake, 0.3);
    floater(run, fx, fy - 30, "STUNNED!", "#e8c53a", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  return false;
}

/** Boss patterns: brute (slam), hunter (charges), swarmkeeper (summons). */
function updateBoss(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const pattern = e.pattern ?? "brute";
  const reach = e.body + FRIEND_BODY + 6;
  // Phases escalate at 60% and 30% HP (announced once each).
  const wantPhase = e.hp > e.maxHp * 0.6 ? 0 : e.hp > e.maxHp * 0.3 ? 1 : 2;
  if (wantPhase > e.phase) {
    e.phase = wantPhase;
    announce(run, `${e.bossName} ENRAGED`, e.phase === 1 ? "It fights harder!" : "Final fury!");
    run.events.push({ t: "elite" });
  }
  // Controlled supporting adds (capped): bosses demand target priority.
  e.addT -= dt;
  if (e.addT <= 0 && run.enemies.length < 30) {
    e.addT = 15 - e.phase * 3;
    const kinds: EnemyArchetype[] = pattern === "artillerist" ? ["ranged", "swift"]
      : pattern === "warden" ? ["shield", "tank"]
      : pattern === "swarmkeeper" ? ["swarm", "swarm"]
      : pattern === "siegebreaker" ? ["siege", "saboteur", "shield"]
      : ["swift", "shadow"];
    const k = kinds[Math.floor(run.rng() * kinds.length)];
    const base = baseSpec(k);
    run.enemies.push({
      id: run.nextId++, kind: k,
      x: e.x + (run.rng() - 0.5) * 80, y: e.y + (run.rng() - 0.5) * 60,
      hp: Math.round(base.hp * waveHpMult(run.wave)), maxHp: Math.round(base.hp * waveHpMult(run.wave)),
      dmg: Math.round(base.dmg * waveDmgMult(run.wave)), speed: (ENEMY_SPEED[k] ?? 36) * waveSpeedMult(run.wave),
      xp: base.xp, rf: base.rf, radius: base.radius, body: BODY_R[k] ?? 8, stopDist: base.range > 0 ? 120 : 0,
      slowT: 0, slowF: 1, burnT: 0, burnDps: 0, shieldHp: 0, shieldMax: 0,
      elite: false, eliteMod: null, mods: [], pattern: null, bossName: "", phase: 0,
      wardT: 0, wardDown: 0, blinkT: 0, addT: 0,
      atkCd: 0.8, shootCd: 1 + run.rng(), burstT: 99, summonT: 99,
      slamT: 0, slamX: 0, slamY: 0, slamCd: 99,
      chargeState: "roam", chargeT: 0, chargeDx: 0, chargeDy: 0, chargeCd: 99,
      fuseT: 0, aimT: 0, aimDx: 0, aimDy: 0, orbitDir: 1, orbitT: 0,
      skipT: 4, skipPhase: 0, leapState: "roam", leapT: 0, leapX: 0, leapY: 0,
      burrowState: "roam", burrowT: 3, burrowX: 0, burrowY: 0, mageCd: 3, drainT: 0, objective: "friend" as const, structCd: 1, stolen: 0, mineT: 3, reviveT: 6, bombardT: 2, fleeing: false,
      flash: 0, walkPhase: run.rng() * 6, lungeT: 0, spawnT: 0.6,
      facing: "down", px: e.x, py: e.y, waypoints: [], repathT: 0,
      goalX: e.x, goalY: e.y,
      stuckT: 0, lastX: e.x, lastY: e.y, stuckFails: 0,
    });
  }
  if (pattern === "brute") {
    if (e.phase >= 2 && e.chargeState === "roam") {
      // Phase 3: the Brute charges like a charger.
      e.chargeCd -= dt;
      if (e.chargeCd <= 0 && dist < 220 && dist > 60) {
        e.chargeState = "tele";
        e.chargeT = 0.6;
        e.waypoints = [];
      }
    }
    if (e.chargeState === "tele" || e.chargeState === "dash" || e.chargeState === "vuln") {
      updateChargerLike(run, e, dt, fx, fy, dist, speed * 0.9);
      return;
    }
    if (e.slamT > 0) {
      // Telegraph counting down; the slam lands where marked.
      e.slamT -= dt;
      if (e.slamT <= 0) {
        burst(run, e.slamX, e.slamY, "#d95f4b", 16);
        run.shake = Math.max(run.shake, 0.3);
        if (Math.hypot(fx - e.slamX, fy - e.slamY) < 48) {
          hurtFriend(run, Math.round(e.dmg * 1.25));
          burst(run, fx, fy, "#b03a3a", 8);
        }
        slamHitsCore(run, e.slamX, e.slamY, 48, Math.round(e.dmg * 1.25));
      }
    } else {
      e.slamCd -= dt;
      if (e.slamCd <= 0 && dist < 190) {
        e.slamCd = Math.max(3.5, 7 - e.phase * 1.8);
        e.slamT = 1.2;
        e.slamX = fx; e.slamY = fy; // marked at telegraph start: dodge it
      }
    }
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 0.9;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
  } else if (pattern === "hunter") {
    // Reuses the charger cycle at boss scale, plus strafing jumps.
    if (e.chargeState === "roam") {
      e.chargeCd -= dt;
      if (dist > reach) {
        e.repathT -= dt;
        if (e.repathT <= 0 && (e.waypoints.length === 0 || Math.hypot(fx - e.goalX, fy - e.goalY) > 48)) {
          e.repathT = 0.9 + run.rng() * 0.5;
          requestRoute(run, e, [fx, fy]);
        }
        followWaypoints(run, e, speed * dt);
      } else {
        e.atkCd -= dt;
        if (e.atkCd <= 0) {
          e.atkCd = 0.8;
          e.lungeT = 0.28;
          meleeHit(run, e, e.dmg, fx, fy);
        }
      }
      if (e.chargeCd <= 0 && dist < 220 && dist > 60) {
        e.chargeState = "tele";
        e.chargeT = 0.6;
        e.waypoints = [];
      }
    } else if (e.chargeState === "tele") {
      e.chargeT -= dt;
      if (e.chargeT > 0.15) {
        const n = Math.max(1, dist);
        e.chargeDx = (fx - e.x) / n;
        e.chargeDy = (fy - e.y) / n;
        e.facing = facingOf(e.chargeDx, e.chargeDy, e.facing);
      }
      if (e.chargeT <= 0) { e.chargeState = "dash"; e.chargeT = 0.4; }
    } else if (e.chargeState === "dash") {
      e.chargeT -= dt;
      const nx = e.x + e.chargeDx * 300 * dt;
      const ny = e.y + e.chargeDy * 300 * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y;
        e.x = nx; e.y = ny;
      } else e.chargeT = 0;
      if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
        meleeHit(run, e, Math.round(e.dmg * 1.3), fx, fy);
        e.chargeT = 0;
      }
      if (e.chargeT <= 0) { e.chargeState = "roam"; e.chargeCd = 5; }
    }
    // Radial bursts, smaller than before.
    e.burstT -= dt;
    if (e.burstT <= 0) {
      e.burstT = 7;
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + run.time;
        run.bolts.push({
          x: e.x, y: e.y, px: e.x, py: e.y,
          vx: Math.cos(a) * 110, vy: Math.sin(a) * 110,
          dmg: Math.max(1, Math.round(e.dmg * 0.6)), life: 3.2,
        });
      }
      burst(run, e.x, e.y, "#8a5a00", 10);
    }
  } else {
    // Swarmkeeper: keeps distance, summons, weak bolts.
    if (dist < 120) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x; e.py = e.y;
        e.x = nx; e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    } else if (dist > 200) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1.0;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.summonT -= dt;
    if (e.summonT <= 0 && run.enemies.length < MAX_ENEMIES - 2 && run.enemies.length < 40) {
      e.summonT = e.mods.includes("Summoner") ? 10 : 11;
      for (let i = 0; i < 2; i++) summonMinion(run, e);
      floater(run, e.x, e.y - 44, "SUMMONED!", "#7a5fc0", true);
    }
    e.shootCd -= dt;
    if (e.shootCd <= 0 && dist < 260) {
      e.shootCd = 2.4;
      const ang = Math.atan2(fy - e.y, fx - e.x);
      run.bolts.push({
        x: e.x, y: e.y, px: e.x, py: e.y,
        vx: Math.cos(ang) * 140, vy: Math.sin(ang) * 140, dmg: e.dmg, life: 3,
      });
    }
  }
  if (pattern === "artillerist") {
    updateArtillerist(run, e, dt, fx, fy, dist);
  } else if (pattern === "warden") {
    updateWarden(run, e, dt, fx, fy, dist, speed);
  } else if (pattern === "blink") {
    updateBlink(run, e, dt, fx, fy, dist, speed);
  } else if (pattern === "siegebreaker") {
    updateSiegebreaker(run, e, dt, fx, fy, dist, speed);
  }
  if (e.mods.includes("Regenerating")) {
    e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01 * dt);
  }
}

/** THE SIEGEBREAKER: marches on structures, slams the Friend, periodically
 * disables a structure. Milestone base assault — repair crews ready. */
function updateSiegebreaker(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const reach = e.body + FRIEND_BODY + 6;
  // The base-assault boss marches on the whole base INCLUDING the Home Core.
  const tgt = structureTarget(run, "structure", true);
  // Disable pulse: knock a structure offline for a while.
  e.bombardT -= dt;
  if (e.bombardT <= 0) {
    e.bombardT = 12 - e.phase * 2;
    // The heart of the home cannot be hexed offline — but it can be broken.
    const ids = Object.keys(run.structHp).filter(id => id !== HOME_CORE.id && run.structHp[id] > 0);
    if (ids.length > 0) {
      const id = ids[Math.floor(run.rng() * ids.length)];
      run.structOff[id] = Math.max(run.structOff[id] ?? 0, 8);
      burst(run, run.scene.anchors[id as keyof typeof run.scene.anchors]?.[0] ?? fx,
        run.scene.anchors[id as keyof typeof run.scene.anchors]?.[1] ?? fy, "#d93a3a", 14);
      announce(run, `${structLabel(id).toUpperCase()} DISABLED!`, "The Siegebreaker hexes your base!");
      run.events.push({ t: "structhurt", id });
    }
  }
  if (tgt && dist > 220) {
    // March on the base while far from the Friend.
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1.0;
      requestRoute(run, e, [tgt.x, tgt.y]);
    }
    followWaypoints(run, e, speed * dt);
    e.facing = facingOf(tgt.x - e.x, tgt.y - e.y, e.facing);
    return;
  }
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1.0;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1.4;
      e.lungeT = 0.28;
      meleeHit(run, e, Math.round(e.dmg * 1.2), fx, fy);
    }
  }
  // Slam telegraph shared with the brute kit.
  if (e.slamT > 0) {
    e.slamT -= dt;
    if (e.slamT <= 0) {
      burst(run, e.slamX, e.slamY, "#d95f4b", 18);
      run.shake = Math.max(run.shake, 0.35);
      if (Math.hypot(fx - e.slamX, fy - e.slamY) < 52) hurtFriend(run, Math.round(e.dmg * 1.3));
      slamHitsCore(run, e.slamX, e.slamY, 52, Math.round(e.dmg * 1.3));
    }
  } else {
    e.slamCd -= dt;
    if (e.slamCd <= 0 && dist < 200) {
      e.slamCd = Math.max(4, 7 - e.phase * 1.5);
      e.slamT = 1.2;
      e.slamX = fx; e.slamY = fy;
    }
  }
}

/** Boss-scale charge cycle shared by charger-likes (brute P3). */
function updateChargerLike(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  if (e.chargeState === "tele") {
    e.chargeT -= dt;
    if (e.chargeT > 0.15) {
      const n = Math.max(1, dist);
      e.chargeDx = (fx - e.x) / n;
      e.chargeDy = (fy - e.y) / n;
      e.facing = facingOf(e.chargeDx, e.chargeDy, e.facing);
    }
    if (e.chargeT <= 0) { e.chargeState = "dash"; e.chargeT = 0.4; }
    return;
  }
  if (e.chargeState === "dash") {
    e.chargeT -= dt;
    const nx = e.x + e.chargeDx * 300 * dt;
    const ny = e.y + e.chargeDy * 300 * dt;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.px = e.x; e.py = e.y;
      e.x = nx; e.y = ny;
    } else e.chargeT = 0;
    burst(run, e.x, e.y, "#c96a2e", 2);
    if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
      meleeHit(run, e, Math.round(e.dmg * 1.3), fx, fy);
      e.chargeT = 0;
    }
    if (e.chargeT <= 0) { e.chargeState = "vuln"; e.chargeT = 1.0; e.chargeCd = 5; }
    return;
  }
  e.chargeT -= dt;
  if (e.chargeT <= 0) e.chargeState = "roam";
}

/** THE ARTILLERIST: keeps range, fires telegraphed spreads, summons ranged. */
function updateArtillerist(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number): void {
  const reach = e.body + FRIEND_BODY + 6;
  if (dist < 170) {
    const nx = e.x + (e.x - fx) / dist * e.speed * dt;
    const ny = e.y + (e.y - fy) / dist * e.speed * dt;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.px = e.x; e.py = e.y;
      e.x = nx; e.y = ny;
    }
  } else if (dist > 300) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1.0;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, e.speed * dt);
  }
  e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
  // Spread volley: telegraph, then a fan of bolts.
  if (e.slamT > 0) {
    e.slamT -= dt;
    e.slamX = fx; e.slamY = fy; // tracks until release, then locked fan
    if (e.slamT <= 0) {
      const n = 3 + e.phase * 2;
      const base = Math.atan2(e.slamY - e.y, e.slamX - e.x);
      for (let i = 0; i < n; i++) {
        const a = base + (i - (n - 1) / 2) * 0.22;
        run.bolts.push({
          x: e.x, y: e.y, px: e.x, py: e.y,
          vx: Math.cos(a) * 190, vy: Math.sin(a) * 190,
          dmg: Math.max(1, Math.round(e.dmg * 0.55)), life: 3,
        });
      }
      burst(run, e.x, e.y, "#c96a2e", 8);
      e.slamCd = Math.max(3.5, 6.5 - e.phase * 1.2);
    }
  } else {
    e.slamCd -= dt;
    if (e.slamCd <= 0 && dist < 340) {
      e.slamCd = 6.5;
      e.slamT = 0.9;
      e.slamX = fx; e.slamY = fy;
    }
  }
  if (dist <= reach) {
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1.0;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  }
  e.summonT -= dt;
  if (e.summonT <= 0 && run.enemies.length < 40) {
    e.summonT = Math.max(6, 12 - e.phase * 2.5);
    summonMinionKind(run, e, "ranged");
    floater(run, e.x, e.y - 44, "SUPPORT INCOMING", "#3f7fbf", true);
  }
}

/** THE WARDEN: armored while warded; vulnerability windows; protects adds. */
function updateWarden(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const reach = e.body + FRIEND_BODY + 6;
  // Ward cycle: protected, then a 4s vulnerability window.
  e.wardT -= dt;
  if (e.wardDown > 0) {
    e.wardDown -= dt;
    if (e.wardDown <= 0) {
      e.wardT = Math.max(8, 13 - e.phase * 2);
      announce(run, "WARDEN SHIELDED", "Wait for the ward to drop!");
    }
  } else if (e.wardT <= 0) {
    e.wardDown = 4;
    announce(run, "WARD DOWN!", "Hit the Warden NOW!");
  }
  // While warded, nearby adds regenerate shields.
  if (e.wardDown <= 0) {
    for (const o of run.enemies) {
      if (o === e || o.kind === "boss") continue;
      if (Math.hypot(o.x - e.x, o.y - e.y) < 130 && o.shieldMax > 0 && o.shieldHp < o.shieldMax) {
        o.shieldHp = Math.min(o.shieldMax, o.shieldHp + o.shieldMax * 0.1 * dt * 10);
      }
    }
  }
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1.0;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1.0;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  }
  // Slam like the brute, slightly slower.
  if (e.slamT > 0) {
    e.slamT -= dt;
    if (e.slamT <= 0) {
      burst(run, e.slamX, e.slamY, "#d95f4b", 16);
      run.shake = Math.max(run.shake, 0.3);
      if (Math.hypot(fx - e.slamX, fy - e.slamY) < 48) {
        hurtFriend(run, Math.round(e.dmg * 1.25));
        burst(run, fx, fy, "#b03a3a", 8);
      }
    }
  } else {
    e.slamCd -= dt;
    if (e.slamCd <= 0 && dist < 190) {
      e.slamCd = Math.max(4, 8 - e.phase);
      e.slamT = 1.2;
      e.slamX = fx; e.slamY = fy;
    }
  }
}

/** THE BLINK KING: teleports, leaves delayed blasts, snipes after blinking. */
function updateBlink(run: RunState, e: Enemy, dt: number, fx: number, fy: number, dist: number, speed: number): void {
  const reach = e.body + FRIEND_BODY + 6;
  e.skipT -= dt;
  if (e.blinkT <= 0) {
    e.blinkT = Math.max(2.2, 5 - e.phase * 0.9);
    // Leave a delayed blast where it stood, then blink to a flank.
    e.slamT = 1.0;
    e.slamX = e.x; e.slamY = e.y;
    // Teleport to a valid flank, never on top of the player.
    for (let i = 0; i < 8; i++) {
      const a = run.rng() * Math.PI * 2;
      const r = 120 + run.rng() * 80;
      const nx = fx + Math.cos(a) * r, ny = fy + Math.sin(a) * r;
      if (nx < 20 || ny < 20 || nx > WORLD_W - 20 || ny > WORLD_H - 20) continue;
      if (!isWorldWalkable(run.scene.world, [nx, ny], 10)) continue;
      if (regionAt(run.scene.regions, nx, ny) !== run.scene.regions.homeId) continue;
      if (Math.hypot(nx - fx, ny - fy) < 70) continue;
      burst(run, e.x, e.y, "#7a5fc0", 10);
      e.x = nx; e.y = ny;
      // Sync locomotion anchor: the blink reads as disappear → reappear,
      // never a leg-churning slide from the stale position.
      e.px = nx; e.py = ny;
      e.waypoints = [];
      e.repathT = 0;
      burst(run, e.x, e.y, "#7a5fc0", 10);
      break;
    }
    // Post-blink triple shot.
    for (let i = -1; i <= 1; i++) {
      const base = Math.atan2(fy - e.y, fx - e.x) + i * 0.18;
      run.bolts.push({
        x: e.x, y: e.y, px: e.x, py: e.y,
        vx: Math.cos(base) * 200, vy: Math.sin(base) * 200,
        dmg: Math.max(1, Math.round(e.dmg * 0.5)), life: 3,
      });
    }
  }
  // Delayed blast left behind.
  if (e.slamT > 0) {
    e.slamT -= dt;
    if (e.slamT <= 0) {
      burst(run, e.slamX, e.slamY, "#7a5fc0", 16);
      if (Math.hypot(fx - e.slamX, fy - e.slamY) < 55) {
        hurtFriend(run, Math.round(e.dmg * 1.2));
      }
    }
  }
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 0.8;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 0.9;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  }
}

function summonMinionKind(run: RunState, from: Enemy, kind: EnemyArchetype): void {
  const base = baseSpec(kind);
  const x = from.x + (run.rng() - 0.5) * 60, y = from.y + (run.rng() - 0.5) * 44;
  if (!isValidSpawn(run.scene.world, run.scene.navigator, [x, y], run.home)) return;
  run.enemies.push({
    id: run.nextId++, kind, x, y,
    hp: Math.round(base.hp * waveHpMult(run.wave)), maxHp: Math.round(base.hp * waveHpMult(run.wave)),
    dmg: Math.round(base.dmg * waveDmgMult(run.wave)), speed: (ENEMY_SPEED[kind] ?? 36) * waveSpeedMult(run.wave),
    xp: base.xp, rf: base.rf, radius: base.radius, body: BODY_R[kind] ?? 8, stopDist: base.range > 0 ? 120 : 0,
    slowT: 0, slowF: 1, burnT: 0, burnDps: 0, shieldHp: 0, shieldMax: 0,
    elite: false, eliteMod: null, mods: [], pattern: null, bossName: "", phase: 0,
    wardT: 0, wardDown: 0, blinkT: 0, addT: 0,
    atkCd: 0.8, shootCd: 1 + run.rng(), burstT: 99, summonT: 99,
    slamT: 0, slamX: 0, slamY: 0, slamCd: 99,
    chargeState: "roam", chargeT: 0, chargeDx: 0, chargeDy: 0, chargeCd: 99,
    fuseT: 0, aimT: 0, aimDx: 0, aimDy: 0, orbitDir: 1, orbitT: 0,
    skipT: 4, skipPhase: 0, leapState: "roam", leapT: 0, leapX: 0, leapY: 0,
    burrowState: "roam", burrowT: 3, burrowX: 0, burrowY: 0, mageCd: 3, drainT: 0, objective: "friend" as const, structCd: 1, stolen: 0, mineT: 3, reviveT: 6, bombardT: 2, fleeing: false,
    flash: 0, walkPhase: run.rng() * 6, lungeT: 0, spawnT: 0.5,
    facing: "down", px: x, py: y, waypoints: [], repathT: 0,
    goalX: x, goalY: y,
    stuckT: 0, lastX: x, lastY: y, stuckFails: 0,
  });
}

function summonMinion(run: RunState, from: Enemy): void {
  const base = baseSpec("shadow");
  const x = from.x + (run.rng() - 0.5) * 60, y = from.y + (run.rng() - 0.5) * 44;
  if (!isValidSpawn(run.scene.world, run.scene.navigator, [x, y], run.home)) return;
  run.enemies.push({
    id: run.nextId++, kind: "shadow", x, y,
    hp: Math.round(base.hp * waveHpMult(run.wave)), maxHp: Math.round(base.hp * waveHpMult(run.wave)),
    dmg: Math.round(base.dmg * waveDmgMult(run.wave)), speed: ENEMY_SPEED.shadow * waveSpeedMult(run.wave),
    xp: base.xp, rf: base.rf, radius: base.radius, body: BODY_R.shadow, stopDist: 0,
    slowT: 0, slowF: 1, burnT: 0, burnDps: 0, shieldHp: 0, shieldMax: 0,
    elite: false, eliteMod: null, mods: [], pattern: null, bossName: "", phase: 0,
    wardT: 0, wardDown: 0, blinkT: 0, addT: 0,
    atkCd: 0.8, shootCd: 99, burstT: 99, summonT: 99,
    slamT: 0, slamX: 0, slamY: 0, slamCd: 99,
    chargeState: "roam", chargeT: 0, chargeDx: 0, chargeDy: 0, chargeCd: 99,
    fuseT: 0, aimT: 0, aimDx: 0, aimDy: 0, orbitDir: 1, orbitT: 0,
    skipT: 4, skipPhase: 0, leapState: "roam", leapT: 0, leapX: 0, leapY: 0,
    burrowState: "roam", burrowT: 3, burrowX: 0, burrowY: 0, mageCd: 3, drainT: 0, objective: "friend" as const, structCd: 1, stolen: 0, mineT: 3, reviveT: 6, bombardT: 2, fleeing: false,
    flash: 0, walkPhase: run.rng() * 6, lungeT: 0, spawnT: 0.5,
    facing: "down", px: x, py: y, waypoints: [], repathT: 0,
    goalX: x, goalY: y,
    stuckT: 0, lastX: x, lastY: y, stuckFails: 0,
  });
}

/** Spatial-hash separation: clusters read as swarms, never a single blob. */
const hashCell = new Map<string, Enemy[]>();
function cellKey(x: number, y: number): string {
  return `${Math.floor(x / 44)},${Math.floor(y / 44)}`;
}

function separate(run: RunState, list: Enemy[], dt: number): void {
  if (list.length <= 1) return;
  if (list.length <= 30) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) pushApart(run, list[i], list[j], dt);
    }
    return;
  }
  hashCell.clear();
  for (const e of list) {
    const k = cellKey(e.x, e.y);
    let arr = hashCell.get(k);
    if (!arr) { arr = []; hashCell.set(k, arr); }
    arr.push(e);
  }
  for (const e of list) {
    const cx = Math.floor(e.x / 44), cy = Math.floor(e.y / 44);
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const arr = hashCell.get(`${gx},${gy}`);
        if (!arr) continue;
        for (const o of arr) {
          if (o.id <= e.id) continue;
          pushApart(run, e, o, dt);
        }
      }
    }
  }
}

function pushApart(run: RunState, a: Enemy, b: Enemy, dt: number): void {
  const dx = b.x - a.x, dy = b.y - a.y;
  const min = (a.body + b.body) * 0.9;
  const d2 = dx * dx + dy * dy;
  if (d2 > 0.01 && d2 < min * min) {
    const d = Math.sqrt(d2);
    const overlap = min - d;
    const push = (overlap / d) * 3 * dt;
    const anx = a.x - dx * push, any = a.y - dy * push;
    const bnx = b.x + dx * push, bny = b.y + dy * push;
    // Sub-pixel nudges cannot tunnel blockers: skip the raycast storm that
    // made swarm clumps superlinear. Full nav check only for large shoves.
    if (overlap < 4) {
      a.x = anx; a.y = any;
      b.x = bnx; b.y = bny;
      return;
    }
    const nav = run.scene.navigator;
    if (nav.segmentClear([a.x, a.y], [anx, any])) {
      a.x = anx; a.y = any;
    }
    if (nav.segmentClear([b.x, b.y], [bnx, bny])) {
      b.x = bnx; b.y = bny;
    }
  }
}

/**
 * Stuck watchdog: an enemy with intent but no progress gets repathed, nudged,
 * and finally relocated to a validated point. Counts fixes for debug.
 */
function watchdog(run: RunState, e: Enemy, dt: number): void {
  const hasIntent = e.waypoints.length > 0 || e.chargeState === "dash";
  if (!hasIntent || e.spawnT > 0) {
    e.stuckT = 0;
    e.lastX = e.x; e.lastY = e.y;
    return;
  }
  e.stuckT += dt;
  if (e.stuckT < 1.2) return;
  const moved = Math.hypot(e.x - e.lastX, e.y - e.lastY);
  e.lastX = e.x; e.lastY = e.y;
  e.stuckT = 0;
  if (moved >= 5) {
    e.stuckFails = 0;
    return;
  }
  e.stuckFails++;
  e.repathT = 0;
  e.waypoints = [];
  // Small valid steering correction.
  const [fx, fy] = friendPos(run);
  const dx = fx - e.x, dy = fy - e.y;
  const n = Math.max(1, Math.hypot(dx, dy));
  const tryPts: WorldPoint[] = [
    [e.x + (dx / n) * 20, e.y + (dy / n) * 20],
    [e.x - (dy / n) * 24, e.y + (dx / n) * 24],
    [e.x + (dy / n) * 24, e.y - (dx / n) * 24],
  ];
  for (const p of tryPts) {
    if (run.scene.navigator.segmentClear([e.x, e.y], p)) {
      e.waypoints = [p];
      break;
    }
  }
  if (e.stuckFails >= 3) {
    // Last resort: relocate to the nearest validated gate area point.
    const spot = validatedSpawn(run);
    e.x = spot[0]; e.y = spot[1];
    e.px = e.x; e.py = e.y;
    e.waypoints = [];
    e.stuckFails = 0;
    run.stuckFixes++;
    run.stuckWatch++;
  }
}

function explode(run: RunState, x: number, y: number, radius: number, dmg: number): void {
  burst(run, x, y, "#8a5a00", 10);
  run.shake = Math.max(run.shake, 0.12);
  for (const e of run.enemies) {
    if (e.spawnT > 0.4) continue;
    if (Math.hypot(e.x - x, e.y - y) < radius + e.body) damageEnemy(run, e, dmg, false);
  }
}

/** Chain lightning: arc to up to 2 nearby Shadows (no recursion). */
function chainLightning(run: RunState, x: number, y: number, dmg: number, excludeId: number): void {
  let hits = 0;
  const sorted = [...run.enemies]
    .filter(e => e.id !== excludeId && e.spawnT <= 0.4)
    .sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
  for (const e of sorted) {
    if (hits >= 2) break;
    if (Math.hypot(e.x - x, e.y - y) > 130) break;
    damageEnemy(run, e, dmg, false);
    burst(run, e.x, e.y, "#e8c53a", 3);
    hits++;
  }
  if (hits > 0) burst(run, x, y, "#e8c53a", 4);
}

/** Segment-point distance for swept projectile collision. */
export function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 0.0001) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function updateShots(run: RunState, dt: number): void {  const many = run.enemies.length > 30;
  let grid: Map<string, Enemy[]> | null = null;
  if (many) {
    grid = new Map();
    for (const e of run.enemies) {
      if (e.spawnT > 0.4) continue;
      const k = cellKey(e.x, e.y);
      let arr = grid.get(k);
      if (!arr) { arr = []; grid.set(k, arr); }
      arr.push(e);
    }
  }
  for (let i = run.shots.length - 1; i >= 0; i--) {
    const s = run.shots[i];
    s.px = s.x; s.py = s.y;
    // Seeker homing: curve toward the nearest Shadow.
    const turn = (s.homing ?? 0) + 2.2 * run.stacks.seeker;
    if (turn > 0 && s.life > 0.15) {
      const tgt = nearestEnemy(run, s.x, s.y, 200, false);
      if (tgt && !s.hitIds.includes(tgt.id)) {
        const sp = Math.hypot(s.vx, s.vy);
        const cur = Math.atan2(s.vy, s.vx);
        const want = Math.atan2(tgt.y - s.y, tgt.x - s.x);
        let diff = want - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const na = cur + Math.max(-turn * dt, Math.min(turn * dt, diff));
        s.vx = Math.cos(na) * sp;
        s.vy = Math.sin(na) * sp;
      }
    }
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    let dead = s.life <= 0 || s.x < 8 || s.x > WORLD_W - 8 || s.y < 8 || s.y > WORLD_H - 8;
    if (!dead) {
      const cands = candidatesNear(grid, run.enemies, s.x, s.y);
      for (const e of cands) {
        if (e.spawnT > 0.4 || s.hitIds.includes(e.id)) continue;
        // Swept circle: the segment the shot traveled this frame.
        const d = segDist(e.x, e.y, s.px, s.py, s.x, s.y);
        if (d < e.body + s.size * 0.4) {
          damageEnemy(run, e, s.dmg, s.crit);
          burst(run, s.x, s.y, s.color, 2);
          const kb = run.derived.knockback + (heavyFamily(run) ? 26 : 8);
          if (e.kind !== "boss" && kb > 0) {
            const nx = e.x + s.vx * 0.02 * (kb / 30), ny = e.y + s.vy * 0.02 * (kb / 30);
            if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
              e.x = Math.min(WORLD_W - 12, Math.max(12, nx));
              e.y = Math.min(WORLD_H - 12, Math.max(12, ny));
            }
          }
          if (s.burnDps > 0) { e.burnT = s.burnDur; e.burnDps = Math.max(e.burnDps, s.burnDps); }
          if (s.slowDur > 0) {
            if (s.freeze) { e.slowT = 1.0; e.slowF = 0; }
            else if (e.slowT <= 0) { e.slowT = s.slowDur; e.slowF = s.slowF; }
          }
          if (s.explosive > 0) explode(run, s.x, s.y, s.explosiveR, s.dmg * s.explosive);
          // Storm chain (+Thunderhead on crits): arc to nearby Shadows.
          const chainCh = run.stacks.storm > 0 ? 0.3 * run.stacks.storm : 0;
          if (chainCh > 0 && run.rng() < chainCh) chainLightning(run, s.x, s.y, s.dmg * 0.5, e.id);
          if (s.crit && isThunder(run)) chainLightning(run, s.x, s.y, s.dmg * 0.6, e.id);
          s.hitIds.push(e.id);
          if (s.bounce > 0) {
            const next = nearestEnemy(run, s.x, s.y, 150, false);
            if (next && next.id !== e.id) {
              const ang = Math.atan2(next.y - s.y, next.x - s.x);
              const sp = Math.hypot(s.vx, s.vy);
              s.vx = Math.cos(ang) * sp; s.vy = Math.sin(ang) * sp;
              s.bounce--;
              s.dmg *= 0.8;
              dead = false;
              break;
            }
            s.bounce = 0;
          }
          if (s.pierce > 0) { s.pierce--; s.dmg *= 0.9; }
          else dead = true;
          break;
        }
      }
    }
    if (dead) run.shots.splice(i, 1);
  }
  if (run.shots.length > 400) run.shots.splice(0, run.shots.length - 400);
}

function candidatesNear(grid: Map<string, Enemy[]> | null, all: Enemy[], x: number, y: number): Enemy[] {
  if (!grid) return all;
  const out: Enemy[] = [];
  const cx = Math.floor(x / 44), cy = Math.floor(y / 44);
  for (let gx = cx - 1; gx <= cx + 1; gx++) {
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const arr = grid.get(`${gx},${gy}`);
      if (arr) out.push(...arr);
    }
  }
  return out;
}

function updateBolts(run: RunState, dt: number, fx: number, fy: number): void {
  for (let i = run.bolts.length - 1; i >= 0; i--) {
    const b = run.bolts[i];
    b.px = b.x; b.py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    // Prism Wall: incoming bolts shatter on the crystal and sting back.
    if (run.reflectT > 0 && Math.hypot(b.x - fx, b.y - fy) < 70) {
      burst(run, b.x, b.y, "#9db8dd", 3);
      run.bolts.splice(i, 1);
      continue;
    }
    let dead = b.life <= 0 || b.x < 8 || b.x > WORLD_W - 8 || b.y < 8 || b.y > WORLD_H - 8;
    if (!dead && segDist(fx, fy, b.px, b.py, b.x, b.y) < FRIEND_BODY + 3) {
      hurtFriend(run, b.dmg);
      if (b.chill && !run.over) {
        // Chilled: heavy slow briefly (cryo territory control).
        run.slowMe = 1.2;
      }
      burst(run, fx, fy, "#b03a3a", 4);
      dead = true;
    }
    if (dead) run.bolts.splice(i, 1);
  }
}

function updatePickups(run: RunState, dt: number, fx: number, fy: number): void {
  const magnetR = 60 + run.derived.magnet + run.plotPickup + 40 * run.stacks.keen + Math.min(30, run.momentum * 3);
  for (let i = run.pickups.length - 1; i >= 0; i--) {
    const p = run.pickups[i];
    p.ttl -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - 2 * dt;
    p.vy *= 1 - 2 * dt;
    let dead = p.ttl <= 0;
    if (!dead) {
      const dx = fx - p.x, dy = fy - p.y;
      const d = Math.hypot(dx, dy);
      if (d < magnetR) {
        // Magnet tug (faster: XP arrives quickly, less waiting).
        const pull = 320 * dt;
        p.x += (dx / Math.max(1, d)) * pull;
        p.y += (dy / Math.max(1, d)) * pull;
      }
      if (d < FRIEND_BODY + 6) {
        collectPickup(run, p);
        dead = true;
      }
    }
    if (dead) run.pickups.splice(i, 1);
  }
}

function collectPickup(run: RunState, p: Pickup): void {
  const [fx, fy] = [p.x, p.y];
  if (p.kind === "rf") {
    const v = Math.round(10 * rfGainMult(run));
    bankAdd(run, v);
    floater(run, fx, fy, `+${v}`, "#2f6b2f", true);
  } else if (p.kind === "heart") {
    run.hp = Math.min(run.maxHp, run.hp + 30);
    floater(run, fx, fy, "+30 HP", "#2f6b2f", true);
  } else if (p.kind === "ward") {
    run.shieldHp += 25;
    floater(run, fx, fy, "WARD +25", "#3f7fbf", true);
  } else if (p.kind === "haste") {
    run.hasteT = 8;
    floater(run, fx, fy, "HASTE!", "#3f7fbf", true);
  } else {
    run.powerT = 10;
    floater(run, fx, fy, "POWER!", "#8a5a00", true);
  }
  run.events.push({ t: "pickup", kind: p.kind });
}

function updateVents(run: RunState, dt: number, fx: number, fy: number): void {
  if (run.vents.length === 0 || run.phase !== "combat") return;
  for (const v of run.vents) {
    v.t -= dt;
    if (v.phase === "idle" && v.t <= 0) {
      v.phase = "tele";
      v.t = 1.5;
    } else if (v.phase === "tele" && v.t <= 0) {
      v.phase = "burst";
      v.t = 0.4;
      burst(run, v.x, v.y, "#d95f4b", 14);
      run.shake = Math.max(run.shake, 0.15);
      if (Math.hypot(fx - v.x, fy - v.y) < 28) {
        hurtFriend(run, 14);
        burst(run, fx, fy, "#b03a3a", 6);
      }
      for (const e of run.enemies) {
        if (Math.hypot(e.x - v.x, e.y - v.y) < 28) damageEnemy(run, e, 25, false);
      }
    } else if (v.phase === "burst" && v.t <= 0) {
      v.phase = "idle";
      v.t = 5.5 + run.rng() * 3;
    }
  }
}

function updateFx(run: RunState, dt: number): void {
  for (let i = run.floaters.length - 1; i >= 0; i--) {
    const f = run.floaters[i];
    f.ttl -= dt;
    f.y -= dt * 26;
    if (f.ttl <= 0) run.floaters.splice(i, 1);
  }
  for (let i = run.orbs.length - 1; i >= 0; i--) {
    const o = run.orbs[i];
    o.ttl -= dt;
    o.x += o.vx * dt;
    o.y += o.vy * dt;
    o.vy += 170 * dt;
    if (o.ttl <= 0) run.orbs.splice(i, 1);
  }
  for (let i = run.particles.length - 1; i >= 0; i--) {
    const p = run.particles[i];
    p.ttl -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 1 - 2.4 * dt;
    p.vy *= 1 - 2.4 * dt;
    if (p.ttl <= 0) run.particles.splice(i, 1);
  }
}

// Support aura implementation (heal + cleanse allies in radius).
export function supportPulse(run: RunState, e: Enemy, dt: number): void {
  for (const o of run.enemies) {
    if (o === e || o.hp <= 0) continue;
    if (Math.hypot(o.x - e.x, o.y - e.y) < 90) {
      o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.04 * dt);
      if (o.slowT > 0) o.slowT = Math.max(0, o.slowT - dt * 2);
    }
  }
}
