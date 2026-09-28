/**
 * FRIENDS vs FRENEMIES — Rare Friends-native world scene.
 * Uses the canonical SDK world system (01-garden-oval-complete, color palette):
 * world-space coordinates (576x384 plane), SDK projection to the 1600x1200
 * native canvas, fixed VIEW window like the fishing demo. No invented APIs.
 */
import {
  getWorldPreset, validateWorld, project, unproject, isWorldWalkable, sortWorldItems,
  type WorldConfig, type WorldPoint,
} from "@rarefriends/friendsdk/world";
import { createWorldNavigator } from "@rarefriends/friendsdk/navigation";

export type { WorldConfig, WorldPoint };
export { project, unproject, isWorldWalkable, sortWorldItems, getWorldPreset };

export const WORLD_W = 576;
export const WORLD_H = 384;
/** Camera window into the 1600x1200 native canvas. Follows the Friend
 * (see updateCamera) and clamps to the canvas so no void is ever shown. */
export const VIEW = { x: 320, y: 330, width: 960, height: 640 };

/** Follow camera: smooth follow with dead zone + clamped integer pixels.
 * At HOME the framing stays intimate; callers may pass wide=true during
 * invasions for slightly wider context (still Friend-readable). */
export function updateCamera(fx: number, fy: number, wide = false): void {
  const [cx, cy] = project(fx, fy, 0);
  const tx = Math.min(1600 - VIEW.width, Math.max(0, Math.round(cx - VIEW.width / 2)));
  const ty = Math.min(1200 - VIEW.height, Math.max(0, Math.round(cy - VIEW.height / 2)));
  // Dead zone: no jitter when the Friend idles near center.
  const dx = tx - VIEW.x, dy = ty - VIEW.y;
  if (Math.hypot(dx, dy) < (wide ? 52 : 40)) return;
  // Smooth follow: critically damped lerp, integer pixels stay crisp.
  const k = wide ? 0.14 : 0.1;
  VIEW.x = Math.round(VIEW.x + dx * k);
  VIEW.y = Math.round(VIEW.y + dy * k);
  void wide;
}
export const PRESET_ID = "01-garden-oval-complete";
export const HOME: WorldPoint = [288, 214];

export interface StructureAnchors {
  turret: WorldPoint;
  healer: WorldPoint;
  collector: WorldPoint;
  trader: WorldPoint;
  frost: WorldPoint;
  /** The Friend's house: always present, the invasion's central objective. */
  homecore: WorldPoint;
}

export interface RegionGrid {
  cell: Int16Array;
  cols: number;
  rows: number;
  homeId: number;
}

export interface Scene {
  presetId: string;
  mapIdx: number;
  world: WorldConfig;
  /** Combat/home anchor: center of the largest walkable region. */
  home: WorldPoint;
  anchors: StructureAnchors;
  entrances: WorldPoint[];
  /** Spawn gates validated against blockers + connectivity (Phase 6/7). */
  gates: WorldPoint[];
  vents: WorldPoint[];
  /** Mud/slow zones (tactical terrain, tides). */
  mud: { x: number; y: number; r: number }[];
  navigator: ReturnType<typeof createWorldNavigator>;
  /** Walkable-region labels for O(1) connectivity checks. */
  regions: RegionGrid;
}

/** Flood-label every walkable blob; the home region is the largest. */
export function labelRegions(world: WorldConfig): { grid: RegionGrid; home: WorldPoint } {
  const step = 12;
  const cols = Math.floor(WORLD_W / step), rows = Math.floor(WORLD_H / step);
  const open: boolean[][] = [];
  for (let gy = 0; gy < rows; gy++) {
    open.push([]);
    for (let gx = 0; gx < cols; gx++) {
      open[gy].push(isWorldWalkable(world, [gx * step + 6, gy * step + 6], 9));
    }
  }
  const cell = new Int16Array(cols * rows).fill(-1);
  const seen = open.map(r => r.map(() => false));
  let nextId = 0;
  let best = { n: 0, cx: HOME[0], cy: HOME[1], id: -1 };
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!open[gy][gx] || seen[gy][gx]) continue;
      const id = nextId++;
      let sx = 0, sy = 0, n = 0;
      const stack: [number, number][] = [[gx, gy]];
      seen[gy][gx] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        cell[cy * cols + cx] = id;
        sx += cx; sy += cy; n++;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && open[ny][nx] && !seen[ny][nx]) {
            seen[ny][nx] = true;
            stack.push([nx, ny]);
          }
        }
      }
      if (n > best.n) best = { n, cx: Math.round((sx / n) * step), cy: Math.round((sy / n) * step), id };
    }
  }
  return { grid: { cell, cols, rows, homeId: best.id }, home: [best.cx, best.cy] };
}

/** O(1) region lookup for connectivity checks. */
export function regionAt(regions: RegionGrid, x: number, y: number): number {
  const gx = Math.floor(x / 12), gy = Math.floor(y / 12);
  if (gx < 0 || gy < 0 || gx >= regions.cols || gy >= regions.rows) return -1;
  return regions.cell[gy * regions.cols + gx];
}

/** Spiral-search for a walkable point with clearance near a guess. */
export function findAnchor(world: WorldConfig, gx: number, gy: number, clearance = 26): WorldPoint {
  if (isWorldWalkable(world, [gx, gy], 10) && clearanceOk(world, gx, gy, clearance)) return [gx, gy];
  for (let r = 12; r < 160; r += 8) {
    for (let a = 0; a < 12; a++) {
      const x = gx + Math.cos((a / 12) * Math.PI * 2) * r;
      const y = gy + Math.sin((a / 12) * Math.PI * 2) * r;
      if (x < 20 || y < 20 || x > WORLD_W - 20 || y > WORLD_H - 20) continue;
      if (isWorldWalkable(world, [x, y], 10) && clearanceOk(world, x, y, clearance)) return [Math.round(x), Math.round(y)];
    }
  }
  return [gx, gy];
}

function clearanceOk(world: WorldConfig, x: number, y: number, clearance: number): boolean {
  for (const p of world.props) {
    if (Math.hypot(p.x - x, p.y - y) < clearance) return false;
  }
  return true;
}

/** Invasion gates: walkable rim points in the SAME region as home. */
export function findEntrances(world: WorldConfig, navigator: ReturnType<typeof createWorldNavigator>, home: WorldPoint, count = 6): WorldPoint[] {
  const cx = WORLD_W / 2, cy = WORLD_H / 2;
  // Cheap geometric pass first; route-check ONLY shortlisted candidates so map
  // builds stay off the critical path (was ~600 A* routes per transition).
  const cands: { x: number; y: number; ang: number; d: number }[] = [];
  for (let x = 24; x < WORLD_W; x += 24) {
    for (let y = 24; y < WORLD_H; y += 24) {
      if (!isWorldWalkable(world, [x, y], 12)) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d < 120) continue;
      cands.push({ x, y, ang: Math.atan2(y - cy, x - cx), d });
    }
  }
  cands.sort((a, b) => b.d - a.d);
  // Spread shortlist, then verify connectivity lazily until we have enough.
  const spread: typeof cands = [];
  for (const c of cands) {
    if (spread.length >= count * 4) break;
    if (spread.every(p => Math.abs(angDiff(p.ang, c.ang)) > 0.5)) spread.push(c);
  }
  const picked: typeof cands = [];
  for (const c of spread) {
    if (picked.length >= count) break;
    if (navigator.route([c.x, c.y], home) === null) continue;
    picked.push(c);
  }
  // Fallback: home itself so waves never stall even on odd geometry.
  if (picked.length === 0) return [home];
  return picked.map(p => [p.x, p.y] as WorldPoint);
}

function angDiff(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export interface StructureLevels {
  turret: number; healer: number; collector: number; frost?: number;
}

const sceneCache = new Map<string, Scene>();
function sceneKey(levels: StructureLevels, presetId: string, mapIdx: number): string {
  return `${presetId}|${mapIdx}|t${levels.turret}h${levels.healer}c${levels.collector}f${levels.frost ?? 0}`;
}
/** Cached scene lookup for map-transition smoothing (no rebuild when unchanged). */
export function cachedScene(levels: StructureLevels, presetId: string, mapIdx: number): Scene | null {
  return sceneCache.get(sceneKey(levels, presetId, mapIdx)) ?? null;
}
/** Quietly build + cache a scene off the critical path (idle precompute). */
export function prebuildScene(levels: StructureLevels, presetId: string, mapIdx: number): Scene {
  const key = sceneKey(levels, presetId, mapIdx);
  const hit = sceneCache.get(key);
  if (hit) return hit;
  const scene = buildScene(levels, presetId, mapIdx);
  return scene;
}

/** Build the validated world for a run, with purchased structures as obstacles. */
export function buildScene(levels: StructureLevels, presetId = PRESET_ID, mapIdx = 0): Scene {
  const key = sceneKey(levels, presetId, mapIdx);
  const hit = sceneCache.get(key);
  if (hit) return hit;
  const base = getWorldPreset(presetId);
  // Island connectivity: Reed Tides ships 3 disconnected polygons (probe:
  // 154-cell west + 101 east + 55 south). Append two shallow-crossing bridge
  // polygons to OUR geometry copy so all three masses connect: bridge A
  // links west to east, bridge B links west to south. Verified via navigator
  // routes W->E and W->S. SDK presets stay canonical; only our copy changes.
  let baseGeometry = base.geometry;
  let baseBlocked = [...(base.collision?.blocked ?? [])];
  if (presetId.includes("tidal")) {
    const bridgeA: WorldPoint[] = [[240, 148], [350, 140], [350, 172], [240, 180]];
    const bridgeB: WorldPoint[] = [[180, 200], [250, 200], [250, 260], [180, 260]];
    baseGeometry = {
      ...base.geometry,
      polygons: [...base.geometry.polygons, bridgeA, bridgeB],
    };
  }
  // Larger usable area: shrink structure footprints slightly so lanes stay
  // walkable; corridors and dash/tap space were audited via map-audit.
  const world = validateWorld({
    ...base,
    geometry: baseGeometry,
    props: [...base.props],
    actors: [],
    collision: { blocked: [...baseBlocked] },
  });
  // Curated guesses (composition-aware: clear of pond/vendor/bench/trees),
  // snapped to walkable ground with clearance.
  const turret = findAnchor(world, 448, 306);
  const healer = findAnchor(world, 132, 300);
  const collector = findAnchor(world, 250, 104);
  const frost = findAnchor(world, 360, 120);
  const structBlocked: { x: number; y: number; w: number; h: number }[] = [];
  if (levels.turret > 0) structBlocked.push(rect(turret, 40, 30));
  if (levels.healer > 0) structBlocked.push(rect(healer, 40, 30));
  if (levels.collector > 0) structBlocked.push(rect(collector, 34, 26));
  if ((levels.frost ?? 0) > 0) structBlocked.push(rect(frost, 34, 26));
  // Pass 1: structures placed, house not yet — finds the combat anchor.
  const pass1 = validateWorld({ ...world, props: [...world.props], actors: [], collision: { blocked: [...baseBlocked, ...structBlocked] } });
  const labeled1 = labelRegions(pass1);
  // Home Core goes next to the REAL home (same walkable region): spiral out
  // from the anchor, south-west first, and take the first prop-clear point
  // in the home region. On fragmented maps this keeps the house on the
  // combat island; corridors stay clear because the search starts at r=40
  // and nearby lanes/props push it aside rather than onto paths.
  const home1 = labeled1.home;
  const homeId1 = labeled1.grid.homeId;
  let homecore: WorldPoint = [...home1];
  let placed = false;
  for (const clearance of [26, 18, 12]) {
    if (placed) break;
    for (let r = 40; r <= 150 && !placed; r += 10) {
      for (let k = 0; k < 12 && !placed; k++) {
        // South-west first (angle ~113° in +y-south plane), then around.
        const a = (((4 + (k % 2 === 0 ? k / 2 : -(k + 1) / 2)) % 12) + 12) % 12;
        const ang = (a / 12) * Math.PI * 2;
        const gx = home1[0] + Math.cos(ang) * r;
        const gy = home1[1] + Math.sin(ang) * r;
        if (gx < 30 || gy < 30 || gx > WORLD_W - 30 || gy > WORLD_H - 30) continue;
        const cand = findAnchor(pass1, gx, gy, clearance);
        if (Math.hypot(cand[0] - home1[0], cand[1] - home1[1]) > 170) continue;
        if (regionAt(labeled1.grid, cand[0], cand[1]) === homeId1) {
          homecore = cand;
          placed = true;
        }
      }
    }
  }
  const myBlocked: { x: number; y: number; w: number; h: number }[] = [...baseBlocked, ...structBlocked];
  // The house is always there: a real obstacle from the first minute.
  myBlocked.push(rect(homecore, 36, 26));
  const finalWorld = validateWorld({ ...world, props: [...world.props], actors: [], collision: { blocked: myBlocked } });
  const navigator = createWorldNavigator(finalWorld, 9, 8);
  const labeled = labelRegions(finalWorld);
  // Keep the pass-1 combat anchor: the house was placed next to it, so home
  // stays stable (and next to the house) no matter what gets built. Only
  // re-snap when the final geometry actually covers it.
  let home: WorldPoint = [...labeled1.home];
  // The anchor can fall inside a hole or wall: snap to nearby walkable.
  if (!isWorldWalkable(finalWorld, home, 9)) {
    home = [...HOME];
    for (let r = 8; r < 200; r += 8) {
      let done = false;
      for (let a = 0; a < 16; a++) {
        const x = home[0] + Math.cos((a / 16) * Math.PI * 2) * r;
        const y = home[1] + Math.sin((a / 16) * Math.PI * 2) * r;
        if (x < 20 || y < 20 || x > WORLD_W - 20 || y > WORLD_H - 20) continue;
        if (isWorldWalkable(finalWorld, [x, y], 9)) {
          home = [Math.round(x), Math.round(y)];
          done = true;
          break;
        }
      }
      if (done) break;
    }
  }
  const trader = findAnchor(finalWorld, home[0], home[1] - 80, 34);
  const entrances = findEntrances(finalWorld, navigator, home);
  // Validated invasion gates: walkable with margin, clear of structures, and
  // routable to the combat area (connectivity checked once at map build).
  const gates = entrances.filter(g => isValidSpawn(finalWorld, navigator, g, home));
  const vents = mapVents(finalWorld, mapIdx);
  const mud = mapMud(finalWorld, mapIdx);
  const scene: Scene = {
    presetId, mapIdx,
    world: finalWorld,
    home,
    anchors: { turret, healer, collector, trader, frost, homecore },
    entrances,
    gates: gates.length > 0 ? gates : [home],
    vents,
    mud,
    navigator,
    regions: labeled.grid,
  };
  // Bounded cache: one entry per (preset, map, structures). Re-entering a map
  // must not rebuild navigation or re-decode assets mid-transition.
  if (sceneCache.size > 24) sceneCache.clear();
  sceneCache.set(key, scene);
  return scene;
}

/**
 * Spawn validation pipeline (Phase 6): inside region, walkable with margin,
 * clear of blocking geometry, and routable toward the combat area.
 */
export function isValidSpawn(world: WorldConfig, navigator: ReturnType<typeof createWorldNavigator>, [x, y]: WorldPoint, home: WorldPoint): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < 16 || y < 16 || x > WORLD_W - 16 || y > WORLD_H - 16) return false;
  if (!isWorldWalkable(world, [x, y], 12)) return false;
  for (const b of world.collision?.blocked ?? []) {
    if (x > b.x - 14 && x < b.x + b.w + 14 && y > b.y - 14 && y < b.y + b.h + 14) return false;
  }
  // Connectivity: must belong to the region that can reach the combat area.
  const route = navigator.route([x, y], home);
  return route !== null && route.length > 0;
}

/** Ember-vent hazard points for maps that have them (validated, spread out). */
function mapVents(world: WorldConfig, mapIdx: number): WorldPoint[] {
  if (mapIdx < 2) return [];
  const guesses: WorldPoint[] = [[180, 190], [400, 200], [290, 290]];
  return guesses.map(g => findAnchor(world, g[0], g[1], 20));
}

/** Mud slow zones (tides): validated open ground that slows Shadows. */
function mapMud(world: WorldConfig, mapIdx: number): { x: number; y: number; r: number }[] {
  if (mapIdx !== 3) return [];
  const guesses: WorldPoint[] = [[150, 250], [420, 250], [290, 120]];
  return guesses.map(g => {
    const [x, y] = findAnchor(world, g[0], g[1], 34);
    return { x, y, r: 34 };
  });
}

function rect([x, y]: WorldPoint, w: number, h: number): { x: number; y: number; w: number; h: number } {
  return { x: x - w / 2, y: y - h / 2, w, h };
}

/** Random walkable point (wander targets, fx). */
export function randomWalkable(world: WorldConfig, rng: () => number, cx = 288, cy = 200, radius = 150): WorldPoint {
  for (let i = 0; i < 24; i++) {
    const a = rng() * Math.PI * 2;
    const r = 40 + rng() * radius;
    const x = Math.min(WORLD_W - 24, Math.max(24, cx + Math.cos(a) * r));
    const y = Math.min(WORLD_H - 24, Math.max(24, cy + Math.sin(a) * r * 0.7));
    if (isWorldWalkable(world, [x, y], 9)) return [x, y];
  }
  return [cx, cy];
}

/** Pointer (client px) → world ground point, through display scale + camera. */
export function screenToWorld(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number, clientY: number,
): WorldPoint | null {
  if (!(rect.width > 0 && rect.height > 0)) return null;
  const cx = ((clientX - rect.left) / rect.width) * 960;
  const cy = ((clientY - rect.top) / rect.height) * 640;
  const [wx, wy] = unproject(VIEW.x + cx, VIEW.y + cy);
  if (!Number.isFinite(wx) || !Number.isFinite(wy)) return null;
  return [wx, wy];
}
