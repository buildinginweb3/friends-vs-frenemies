/**
 * FRIENDS vs FRENEMIES — Rare Friends-native isometric renderer.
 * Canonical garden-oval island (color palette), SDK projection, x+y depth
 * sorting, pixel Friend sprites with walk frames, corrupted Shadow variants,
 * physical structure props, compact canvas announcements.
 *
 * ART BIBLE (pixel 2.5D toy-diorama — applies to every asset below):
 * - Characters: canonical 16x16 one-bit frames at 5x (80px), feet-anchored,
 *   white 1px halo + INK outline stayed from SDK stills; walk cycle 8 frames.
 * - Light: top-down-soft; shadows are flat ground ellipses (alpha 0.22) at the
 *   ground anchor, never blurred gradients. Height shown via `lift` only.
 * - Perspective: SDK shallow projection; upright bodies sort by x+y of the
 *   ground anchor; feet planted on terrain (no floating).
 * - Outlines: INK (#141414) 1.5-2px on structures/props; bodies outlined by
 *   their halo pass, not strokes (keeps pixel edges crisp).
 * - Palette: PAPER ground UI, garden greens (#5da24a/#7db83e), signal accents,
 *   ember red reserved for hostile eyes/telegraphs, gold for rare/legendary.
 *   Per-map biome dressing (tuft/flower/stone/foam/torch) harmonizes per map.
 * - Pixel density: imageSmoothingEnabled=false; canvas shapes snapped with
 *   Math.round; chunky rects/arcs only — no gradients, no anti-aliased blobs.
 * - Ground: dressing derives ONLY from real SDK world data (path polylines,
 *   patch rects, polygon rims, prop footprints) + scene-seeded scatter that
 *   is walkability- and clearance-checked. Nothing floats; nothing invented.
 * - Structures: packed-dirt footing + platform + right-side shade + eave
 *   lines = miniature physical construction. Foundation rows, back shards,
 *   deck platforms — every building sits IN the world.
 * - Friend attacks: the Friend IS the weapon. Projectiles originate at the
 *   Friend's body edge on the aim side with a brief charge flash, recoil
 *   squash and pixel muzzle spark. No held guns, no permanent orbiting
 *   weapon-orb. (The opt-in Orbiting Charms attack style keeps its two
 *   contact wisps as its explicit mechanic; nothing else orbits by default.)
 * - Enemies: official (family,seed) bodies + dark corruption + ROLE eyes +
 *   role ground rings + per-archetype class props; role NEVER carried by
 *   tint alone. Bosses add crown + rotating rune ticks.
 * - VFX: pixel hit stars, orbiting pickup glints, victory sparkles, torch
 *   flames, foam glints — chunky, brief, readable. No particle spam.
 * - UI plates: stepped pixel corners + double border (in canvas and CSS);
 *   checker inlays; rarity bars + icon tiles; Friend portrait cameos.
 * - Structures: toy-like Friend-built contraptions (timber, crystal, woven
 *   paper). Turrets are whimsical seed-launchers, never gun turrets.
 */
import { loadWorldAssets } from "@rarefriends/friendsdk/assets";
import { VIEW, isWorldWalkable, findAnchor, type Scene, type WorldPoint } from "./world-scene";
import { project, PROP_FOOTPRINTS } from "@rarefriends/friendsdk/world";
import type { RunState, Enemy, Pickup } from "./engine";
import { friendPos, friendFacing, friendWalking, FRIEND_RANGE, projectileCount, pendingGates } from "./engine";
import { FRIEND_BODY, mulberry32 } from "./balance";
import { frameRows, frenemyIdentity, foeKey, type FriendArt, type SpriteFacing } from "./sprites";
import type { HomePlotView } from "./home-plot";
import type { WeaponFamily } from "./balance";

export const PAPER = "#f2efe4";
const INK = "#141414";
const SIGNAL = "#8fc41c";

export interface IsoAssets {
  terrain: HTMLImageElement;
  objects: { kind: string; x: number; y: number; depth: number; image: HTMLImageElement }[];
}

const assetCache = new Map<string, Promise<IsoAssets>>();

export function loadIsoAssets(scene: Scene): Promise<IsoAssets> {
  const key = scene.world.id;
  let p = assetCache.get(key);
  if (!p) {
    p = loadWorldAssets(scene.world, { color: true, signals: false }).then(a => ({
      terrain: a.terrain,
      objects: a.objects.map(o => ({ kind: o.kind, x: o.x, y: o.y, depth: o.depth, image: o.image })),
    }));
    // Bounded cache: one entry per preset (6 max) + home shares map-0's entry.
    // Entries are never evicted mid-session: re-entering a map must not hitch.
    assetCache.set(key, p);
  }
  return p;
}

/** Quietly prepare the next map's visuals during the current block. */
export function preloadIsoAssets(scene: Scene): void {
  void loadIsoAssets(scene).catch(() => {});
}

export function toScreen(x: number, y: number, lift = 0): [number, number] {
  return project(x, y, lift);
}

/* ---------------- pixel friends ---------------- */

function drawShadowEllipse(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number): void {
  ctx.fillStyle = "rgba(20,20,20,0.22)";
  ctx.beginPath();
  ctx.ellipse(sx, sy, w, w * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Canonical 16x16 rows at 5x with halo, feet-anchored at world (x, y). */
export function drawPixelFriend(
  ctx: CanvasRenderingContext2D,
  rows: readonly string[] | null,
  seedNum: number,
  x: number, y: number,
  opts: {
    scale?: number; xScale?: number; yScale?: number;
    dark?: boolean; aura?: string; blink?: boolean;
    lift?: number; alpha?: number; flash?: boolean; tint?: string;
    /** Ember-eye override for role readability (default hostile red). */
    eye?: string;
  } = {},
): void {
  const scale = opts.scale ?? 5;
  const xs = opts.xScale ?? 1, ys = opts.yScale ?? 1;
  const [sx, sy] = toScreen(x, y, opts.lift ?? 0);
  const size = 16 * scale;
  const left = Math.round(sx - (size * xs) / 2);
  const top = Math.round(sy - size * ys + scale); // feet anchor near bottom row
  ctx.save();
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  drawShadowEllipse(ctx, sx, sy + 2, size * 0.30 * xs);
  if (opts.aura) {
    ctx.fillStyle = opts.aura;
    ctx.beginPath();
    ctx.ellipse(sx, sy - size * 0.45, size * 0.62 * xs, size * 0.55 * ys, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (rows) {
    const px = scale;
    // Hit pop: bright halo flash, pixels stay readable (never white-out).
    ctx.fillStyle = opts.dark ? (opts.flash ? "#e8e4da" : "#241a3d") : "#ffffff";
    for (let ry = 0; ry < 16; ry++) {
      const row = rows[ry] ?? "";
      for (let rx = 0; rx < 16; rx++) {
        if (row[rx] === "#") ctx.fillRect(left + rx * px * xs - 2, top + ry * px * ys - 2, px * xs + 4, px * ys + 4);
      }
    }
    ctx.fillStyle = opts.dark ? "#100b1e" : INK;
    for (let ry = 0; ry < 16; ry++) {
      const row = rows[ry] ?? "";
      for (let rx = 0; rx < 16; rx++) {
        if (row[rx] === "#") ctx.fillRect(left + rx * px * xs, top + ry * px * ys, px * xs, px * ys);
      }
    }
    if (opts.dark) {
      // Corrupted counterparts: same beloved shape, drained light, role eyes.
      ctx.fillStyle = opts.eye ?? "#ff4545";
      const ew = Math.max(3, px);
      ctx.fillRect(sx - size * 0.20 - ew / 2, sy - size * 0.62, ew, ew);
      ctx.fillRect(sx + size * 0.20 - ew / 2, sy - size * 0.62, ew, ew);
    }
    if (opts.flash) {
      // Pixel hit star: impact reads instantly, never a white-out.
      ctx.fillStyle = "#ffffff";
      const cy0 = sy - size * 0.78;
      ctx.fillRect(sx - 9, cy0 - 2, 18, 4);
      ctx.fillRect(sx - 2, cy0 - 9, 4, 18);
    }
  } else {
    drawFallbackBlob(ctx, seedNum, sx, sy, size, !!opts.dark, !!opts.blink);
  }
  ctx.restore();
}

function drawFallbackBlob(
  ctx: CanvasRenderingContext2D, seedNum: number, sx: number, sy: number,
  size: number, dark: boolean, blink: boolean,
): void {
  const hue = seedNum % 360;
  ctx.fillStyle = dark ? "#17102b" : `hsl(${hue},55%,60%)`;
  ctx.beginPath();
  ctx.ellipse(sx, sy - size * 0.42, size * 0.36, size * 0.40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = dark ? "#241a3d" : "#ffffff";
  ctx.stroke();
  ctx.fillStyle = dark ? "#ff4545" : INK;
  if (blink) {
    ctx.fillRect(sx - size * 0.16, sy - size * 0.5, size * 0.12, 3);
    ctx.fillRect(sx + size * 0.04, sy - size * 0.5, size * 0.12, 3);
  } else {
    ctx.beginPath();
    ctx.arc(sx - size * 0.10, sy - size * 0.5, 3.4, 0, Math.PI * 2);
    ctx.arc(sx + size * 0.10, sy - size * 0.5, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------------- structures (physical world props) ---------------- */

interface StructDraw { x: number; y: number; depth: number; draw: (ctx: CanvasRenderingContext2D, t: number) => void }

function structureLayers(
  anchors: { turret: WorldPoint; healer: WorldPoint; collector: WorldPoint; frost: WorldPoint; homecore: WorldPoint },
  levels: { turret: number; wall: number; healer: number; collector: number; frost?: number },
  turretAngle: number, reducedMotion: boolean, home: WorldPoint,
  /** Live HP by structure id (absent = full). 0 draws rubble + smoke. */
  hp?: Record<string, number>,
  t = 0,
): StructDraw[] {
  const out: StructDraw[] = [];
  const broken = (id: string) => hp !== undefined && (hp[id] ?? 1) <= 0;
  const tierPips = (ctx: CanvasRenderingContext2D, sx: number, sy: number, n: number) => {
    ctx.fillStyle = SIGNAL;
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.arc(sx - 14 + i * 9, sy + 12, 3, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    }
  };
  const rubble = (ctx: CanvasRenderingContext2D, sx: number, sy: number) => {
    drawShadowEllipse(ctx, sx, sy + 2, 20);
    ctx.fillStyle = "#6b6558";
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.fillRect(sx - 14, sy - 12, 28, 12);
    ctx.strokeRect(sx - 14, sy - 12, 28, 12);
    if (!reducedMotion) {
      const k = (t % 2) / 2;
      ctx.fillStyle = "rgba(120,120,120,0.5)";
      ctx.beginPath(); ctx.arc(sx + 4, sy - 22 - k * 14, 4 + k * 3, 0, Math.PI * 2); ctx.fill();
    }
  };
  /** Packed-dirt footing so every structure sits IN the world, not on it. */
  const dirt = (ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number) => {
    ctx.fillStyle = "#b99a68";
    ctx.beginPath(); ctx.ellipse(sx, sy + 1, w, w * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a88a58";
    ctx.beginPath(); ctx.ellipse(sx, sy + 3, w * 0.8, w * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  };
  // HOME CORE: the Friend's house. Always present; its look grows with the
  // whole base (total structure tiers), so new and developed plots differ
  // at a glance. If its HP hits zero the invasion is lost.
  {
    const [x, y] = anchors.homecore;
    const total = levels.turret + levels.wall + levels.healer + levels.collector + (levels.frost ?? 0);
    const tier = Math.min(4, 1 + Math.floor(total / 3));
    out.push({
      x, y, depth: x + y,
      draw: (ctx) => {
        const [sx, sy] = toScreen(x, y);
        if (broken("homecore")) { rubble(ctx, sx, sy); return; }
        const w = 30 + tier * 5;
        dirt(ctx, sx, sy, w + 6);
        drawShadowEllipse(ctx, sx, sy + 2, w);
        // Stone foundation row: the house is built, not pasted.
        ctx.fillStyle = "#8a8578";
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
        for (let i = -2; i <= 2; i++) {
          ctx.fillRect(sx + i * 11 - 5, sy - 8, 10, 8);
          ctx.strokeRect(sx + i * 11 - 5, sy - 8, 10, 8);
        }
        // Timber walls, taller and wider per tier.
        const wallH = 24 + tier * 4;
        ctx.fillStyle = tier >= 3 ? "#a88458" : "#8a6f4d";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.fillRect(sx - w / 2, sy - wallH, w, wallH);
        ctx.strokeRect(sx - w / 2, sy - wallH, w, wallH);
        // Right-side shade = wall thickness (2.5D read).
        ctx.fillStyle = "rgba(20,16,10,0.22)";
        ctx.fillRect(sx + w / 2 - 8, sy - wallH + 2, 6, wallH - 4);
        // Pitched roof: thatch → planks → shingle → shingle + ridge beam.
        ctx.fillStyle = tier === 1 ? "#c9a85e" : tier === 2 ? "#7a6248" : "#5d4a36";
        ctx.beginPath();
        ctx.moveTo(sx - w / 2 - 6, sy - wallH);
        ctx.lineTo(sx, sy - wallH - 18 - tier * 3);
        ctx.lineTo(sx + w / 2 + 6, sy - wallH);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Eave shadow line under the roof overhang.
        ctx.fillStyle = "rgba(20,16,10,0.25)";
        ctx.fillRect(sx - w / 2 - 4, sy - wallH, w + 8, 3);
        if (tier >= 4) {
          ctx.fillStyle = "#e8c53a";
          ctx.fillRect(sx - 3, sy - wallH - 22, 6, 8);
          ctx.strokeRect(sx - 3, sy - wallH - 22, 6, 8);
        }
        // Door + warm window (the Friend lives here).
        ctx.fillStyle = "#3a2e1e";
        ctx.fillRect(sx - 6, sy - 16, 12, 16);
        ctx.strokeRect(sx - 6, sy - 16, 12, 16);
        ctx.fillStyle = "#ffd964";
        ctx.fillRect(sx + w / 2 - 14, sy - wallH + 6, 8, 8);
        ctx.strokeRect(sx + w / 2 - 14, sy - wallH + 6, 8, 8);
        // Chimney smoke from tier 2 (life cue, still in peaceful mode).
        if (tier >= 2) {
          ctx.fillStyle = "#6b6558";
          ctx.fillRect(sx - w / 2 + 4, sy - wallH - 26, 7, 14);
          ctx.strokeRect(sx - w / 2 + 4, sy - wallH - 26, 7, 14);
          if (!reducedMotion) {
            const k = (t % 2.4) / 2.4;
            ctx.fillStyle = "rgba(140,140,140,0.55)";
            ctx.beginPath(); ctx.arc(sx - w / 2 + 7, sy - wallH - 30 - k * 16, 3 + k * 3, 0, Math.PI * 2); ctx.fill();
          }
        }
        // Heart emblem over the door: this house belongs to a Friend.
        ctx.fillStyle = "#d95f4b";
        ctx.beginPath(); ctx.arc(sx - 3, sy - wallH + 5, 3, 0, Math.PI * 2); ctx.arc(sx + 3, sy - wallH + 5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.moveTo(sx - 5.6, sy - wallH + 6); ctx.lineTo(sx, sy - wallH + 12); ctx.lineTo(sx + 5.6, sy - wallH + 6); ctx.closePath(); ctx.fill();
        tierPips(ctx, sx, sy, Math.min(4, tier));
      },
    });
  }
  if (levels.turret > 0) {
    const [x, y] = anchors.turret;
    const tier = levels.turret;    out.push({
      x, y, depth: x + y,
      draw: (ctx) => {
        const [sx, sy] = toScreen(x, y);
        if (broken("turret")) { rubble(ctx, sx, sy); return; }
        dirt(ctx, sx, sy, 30);
        drawShadowEllipse(ctx, sx, sy + 2, 26);
        const grow = 1 + (tier - 1) * 0.12;
        // Timber + moss base so the turret reads as plot-built, not pasted.
        ctx.fillStyle = "#6b6558";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(sx, sy - 4, 22, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#5da24a";
        ctx.beginPath(); ctx.ellipse(sx - 10, sy - 6, 5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(sx + 11, sy - 3, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#7a6248";
        ctx.fillRect(sx - 8, sy - 34, 16, 24);
        ctx.strokeRect(sx - 8, sy - 34, 16, 24);
        // Post side shade for thickness.
        ctx.fillStyle = "rgba(20,16,10,0.25)";
        ctx.fillRect(sx + 3, sy - 32, 4, 20);
        ctx.fillStyle = "#8a6f4d";
        ctx.beginPath(); ctx.arc(sx, sy - 36, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Seed-launcher: woven cup + floating power seed leaning toward the
        // aim side. No barrels, no muzzles: a Friend-built toy contraption.
        const [bx, by] = toScreen(x + Math.cos(turretAngle) * 20, y + Math.sin(turretAngle) * 20);
        const ang = Math.atan2(by - (sy - 36), bx - sx);
        const aimX = Math.cos(ang), aimY = Math.sin(ang);
        ctx.fillStyle = "#7a6248";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(sx, sy - 32, 12, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#5d4a36";
        ctx.beginPath(); ctx.ellipse(sx, sy - 34, 12, 7, 0, Math.PI, Math.PI * 2); ctx.fill();
        const seedX = sx + aimX * (9 + grow * 3), seedY = sy - 44 + aimY * 6;
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = SIGNAL;
        ctx.beginPath(); ctx.arc(seedX, seedY, 9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.fillStyle = SIGNAL;
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(seedX, seedY - 7); ctx.lineTo(seedX + 5, seedY); ctx.lineTo(seedX, seedY + 7); ctx.lineTo(seedX - 5, seedY);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillRect(seedX - 1, seedY - 3, 2, 2);
        // Leaf pennant shows tier + flutters toward the aim side.
        ctx.strokeStyle = "#3a3f45"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx, sy - 36); ctx.lineTo(sx, sy - 52 - tier * 2); ctx.stroke();
        ctx.fillStyle = tier >= 3 ? "#e8c53a" : "#5da24a";
        ctx.beginPath();
        ctx.moveTo(sx, sy - 52 - tier * 2);
        ctx.lineTo(sx + (aimX >= 0 ? 12 : -12), sy - 48 - tier * 2);
        ctx.lineTo(sx, sy - 44 - tier * 2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        tierPips(ctx, sx, sy, tier);
      },
    });
  }
  if ((levels.frost ?? 0) > 0) {
    const [x, y] = anchors.frost;
    const tier = levels.frost ?? 0;
    out.push({
      x, y, depth: x + y,
      draw: (ctx, tt) => {
        const [sx, sy] = toScreen(x, y);
        if (broken("frost")) { rubble(ctx, sx, sy); return; }
        const bob = reducedMotion ? 0 : Math.sin(tt * 2.6) * 2;
        dirt(ctx, sx, sy, 26);
        drawShadowEllipse(ctx, sx, sy + 2, 22);
        // Back shard (darker): the spire has depth, not a flat triangle.
        ctx.fillStyle = "#6e8ab0";
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx + 4, sy - 4);
        ctx.lineTo(sx + 12, sy - 4 - (30 + tier * 8) * 0.7 + bob);
        ctx.lineTo(sx + 16, sy - 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Pixel ice spire: stacked shards, taller per tier.
        ctx.fillStyle = "#9db8dd";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        const h = 30 + tier * 8;
        ctx.beginPath();
        ctx.moveTo(sx - 12, sy - 4);
        ctx.lineTo(sx, sy - 4 - h + bob);
        ctx.lineTo(sx + 12, sy - 4);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#e8f4ff";
        ctx.beginPath();
        ctx.moveTo(sx - 5, sy - 8);
        ctx.lineTo(sx, sy - 8 - h * 0.6 + bob);
        ctx.lineTo(sx + 5, sy - 8);
        ctx.closePath(); ctx.fill();
        tierPips(ctx, sx, sy, tier);
      },
    });
  }
  if (levels.healer > 0) {
    const [x, y] = anchors.healer;
    const tier = levels.healer;
    out.push({
      x, y, depth: x + y,
      draw: (ctx, t) => {
        const [sx, sy] = toScreen(x, y);
        if (broken("healer")) { rubble(ctx, sx, sy); return; }
        const pulse = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * 3);
        dirt(ctx, sx, sy, 30);
        ctx.strokeStyle = `rgba(126,184,62,${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(sx, sy - 6, 30 + pulse * 8, 13 + pulse * 3, 0, 0, Math.PI * 2); ctx.stroke();
        drawShadowEllipse(ctx, sx, sy + 2, 24);
        ctx.fillStyle = "#f4f1e6";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.fillRect(sx - 16, sy - 44, 32, 30);
        ctx.strokeRect(sx - 16, sy - 44, 32, 30);
        // Right wall shade + eave line for the kiosk roof.
        ctx.fillStyle = "rgba(20,16,10,0.18)";
        ctx.fillRect(sx + 8, sy - 42, 6, 26);
        ctx.beginPath();
        ctx.moveTo(sx - 16, sy - 44); ctx.lineTo(sx, sy - 54); ctx.lineTo(sx + 16, sy - 44); ctx.closePath();
        ctx.fillStyle = "#e0d5b8"; ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#d95f4b";
        ctx.fillRect(sx - 3, sy - 40, 6, 18);
        ctx.fillRect(sx - 8, sy - 35, 16, 6);
        tierPips(ctx, sx, sy, tier);
      },
    });
  }
  if (levels.collector > 0) {
    const [x, y] = anchors.collector;
    const tier = levels.collector;
    out.push({
      x, y, depth: x + y,
      draw: (ctx, t) => {
        const [sx, sy] = toScreen(x, y);
        if (broken("collector")) { rubble(ctx, sx, sy); return; }
        const bob = reducedMotion ? 0 : Math.sin(t * 2.2) * 2;
        dirt(ctx, sx, sy, 28);
        drawShadowEllipse(ctx, sx, sy + 2, 22);
        ctx.fillStyle = "#6b6558";
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(sx, sy - 2, 20, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const shards: [number, number, string][] = [[-9, 0, "#7db83e"], [5, -bob, "#a8e02e"], [14, 2, "#e8d44b"]];
        // Dark back crystal for depth behind the bright row.
        ctx.fillStyle = "#4a6e2e";
        ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx - 16, sy - 6);
        ctx.lineTo(sx - 11, sy - 6 - (18 + tier * 3));
        ctx.lineTo(sx - 6, sy - 6);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        for (const [ox, hgt, col] of shards) {
          const h = 22 + Math.abs(ox) + tier * 3;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(sx + ox - 7, sy - 6);
          ctx.lineTo(sx + ox, sy - 6 - h);
          ctx.lineTo(sx + ox + 7, sy - 6);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        tierPips(ctx, sx, sy, tier);
      },
    });
  }
  if (levels.wall > 0) {
    // Barricade: arc of timber posts guarding the home clearing.
    // Higher tiers: taller posts + iron bands.
    for (let i = 0; i < 5; i++) {
      const a = Math.PI * (0.15 + 0.175 * i);
      const x = home[0] + Math.cos(a) * 62;
      const y = home[1] + Math.sin(a) * 46;
      const tier = levels.wall;
      out.push({
        x, y, depth: x + y,
        draw: (ctx) => {
          const [sx, sy] = toScreen(x, y);
          const tall = 24 + tier * 4;
          // Dirt footing + base stone: posts are planted, not pasted.
          ctx.fillStyle = "#a88a58";
          ctx.beginPath(); ctx.ellipse(sx, sy + 1, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#8a8578";
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
          ctx.fillRect(sx - 6, sy - 6, 12, 6);
          ctx.strokeRect(sx - 6, sy - 6, 12, 6);
          ctx.fillStyle = "#7a6248";
          ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.fillRect(sx - 4, sy - tall, 8, tall);
          ctx.strokeRect(sx - 4, sy - tall, 8, tall);
          if (tier >= 2) {
            ctx.fillStyle = "#3a3f45";
            ctx.fillRect(sx - 4, sy - tall + 6, 8, 4);
          }
          if (tier >= 3) {
            ctx.fillStyle = "#3a3f45";
            ctx.fillRect(sx - 4, sy - 10, 8, 4);
          }
          ctx.beginPath();
          ctx.moveTo(sx - 4, sy - tall); ctx.lineTo(sx, sy - tall - 6); ctx.lineTo(sx + 4, sy - tall); ctx.closePath();
          ctx.fillStyle = "#5d4a36"; ctx.fill(); ctx.stroke();
        },
      });
    }
  }
  // Empty build slots: only at HOME (combat passes live hp, so signs never
  // clutter an invasion). A wooden foundation + flag marks where the Friend
  // can build next — build slots integrated into the environment.
  if (hp === undefined) {
    const empties: [WorldPoint, string][] = [];
    if (levels.turret === 0) empties.push([anchors.turret, "DEF"]);
    if (levels.healer === 0) empties.push([anchors.healer, "AID"]);
    if (levels.collector === 0) empties.push([anchors.collector, "RF"]);
    if ((levels.frost ?? 0) === 0) empties.push([anchors.frost, "CHILL"]);
    for (const [pt, tag] of empties) {
      const [x, y] = pt;
      out.push({
        x, y, depth: x + y,
        draw: (ctx, tt) => {
          const [sx, sy] = toScreen(x, y);
          const sway = reducedMotion ? 0 : Math.sin(tt * 2 + x) * 2;
          ctx.fillStyle = "#a88a58";
          ctx.beginPath(); ctx.ellipse(sx, sy + 1, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
          drawShadowEllipse(ctx, sx, sy + 2, 16);
          // Wooden foundation frame.
          ctx.fillStyle = "#b99a68";
          ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.fillRect(sx - 14, sy - 6, 28, 6);
          ctx.strokeRect(sx - 14, sy - 6, 28, 6);
          ctx.fillRect(sx - 14, sy - 14, 6, 8);
          ctx.strokeRect(sx - 14, sy - 14, 6, 8);
          ctx.fillRect(sx + 8, sy - 14, 6, 8);
          ctx.strokeRect(sx + 8, sy - 14, 6, 8);
          // Flag post with build tag.
          ctx.fillStyle = "#7a6248";
          ctx.fillRect(sx - 2, sy - 44, 4, 32);
          ctx.strokeRect(sx - 2, sy - 44, 4, 32);
          ctx.fillStyle = "#e8c53a";
          ctx.beginPath();
          ctx.moveTo(sx + 2, sy - 44);
          ctx.lineTo(sx + 20 + sway, sy - 39);
          ctx.lineTo(sx + 2, sy - 34);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          mono(ctx, 10);
          ctx.fillStyle = INK;
          ctx.fillText(tag, sx, sy - 50);
        },
      });
    }
  }
  return out;
}

/* ---------------- gear layers (non-destructive equipment visuals) ---------------- */

/**
 * Screen-space attack angle for a world aim angle (pure: same math as the
 * drawn attack focus, no sprite facing, no buckets). Exported for tests proving
 * the Friend's attack direction rotates smoothly through the full 360° range.
 * (Kept under its historic name so saved logic tests keep passing.)
 */
export function weaponScreenAngle(fx: number, fy: number, aimAngle: number): number {
  const [sx, sy] = toScreen(fx, fy);
  const [bx, by] = toScreen(fx + Math.cos(aimAngle) * 16, fy + Math.sin(aimAngle) * 16);
  return Math.atan2(by - sy, bx - sx);
}

/**
 * The Friend IS the weapon: Friend-originated attack presence.
 * No permanent orbiting weapon-orb. A brief aim-side energy gathering,
 * pixel muzzle spark at the Friend's edge, expanding pixel ring on fire,
 * plus subtle recoil squash / directional lean driven by run.muzzleT.
 * Family changes the muzzle shape and tint only (except the opt-in
 * "orbital" family, which keeps its two contact wisps as its mechanic).
 * The canonical Friend sprite is never altered beyond a 1-2px squash.
 */
function drawFriendFocus(ctx: CanvasRenderingContext2D, run: RunState, fx: number, fy: number, family: WeaponFamily, tint: string): void {
  const [sx, sy] = toScreen(fx, fy);
  const [bx, by] = toScreen(fx + Math.cos(run.aimAngle) * 16, fy + Math.sin(run.aimAngle) * 16);
  const ang = Math.atan2(by - sy, bx - sx);
  const t = run.time;
  const firing = run.muzzleT > 0;
  const k = firing ? 1 - run.muzzleT / 0.09 : 0;
  // Aim-side energy gathering: small pixel cluster at the Friend's edge.
  const gx = Math.round(sx + Math.cos(ang) * 18), gy = Math.round(sy - 30 + Math.sin(ang) * 9);
  const pulse = firing ? 1 : 0.45 + 0.15 * Math.sin(t * 5);
  ctx.save();
  ctx.globalAlpha = 0.28 * pulse + 0.12;
  ctx.fillStyle = tint;
  // Stepped pixel glow (no smooth radial gradient).
  ctx.fillRect(gx - 8, gy - 3, 16, 6);
  ctx.fillRect(gx - 3, gy - 8, 6, 16);
  ctx.restore();
  // Muzzle spark: chunky pixel cross at the Friend edge, family-tinted.
  const spark = (len: number, col: string) => {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.fillStyle = col;
    ctx.fillRect(-2, -2, len, 4);
    ctx.fillRect(Math.round(len / 2) - 2, -5, 4, 10);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, -1, 4, 2);
    ctx.restore();
  };
  if (family === "twin") {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.fillStyle = tint;
    ctx.fillRect(-2, -7, 9, 3);
    ctx.fillRect(-2, 4, 9, 3);
    ctx.fillStyle = "#fff";
    ctx.fillRect(2, -6, 3, 1);
    ctx.fillRect(2, 5, 3, 1);
    ctx.restore();
  } else if (family === "heavy" || family === "buster") {
    // Heavy: brief charge brackets then large pixel pulse.
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.fillStyle = tint;
    const w = firing ? 12 : 7;
    ctx.fillRect(-3, -7, w, 3);
    ctx.fillRect(-3, 4, w, 3);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, -1, 5, 2);
    ctx.restore();
  } else if (family === "needle") {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.fillStyle = tint;
    ctx.beginPath();
    ctx.moveTo(10, 0); ctx.lineTo(0, -3); ctx.lineTo(-8, 0); ctx.lineTo(0, 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(1, -1, 4, 2);
    ctx.restore();
  } else if (family === "spark") {
    spark(10, tint);
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(t * 9);
    ctx.fillStyle = tint;
    ctx.fillRect(-7, -1, 14, 2);
    ctx.fillRect(-1, -7, 2, 14);
    ctx.restore();
  } else if (family === "beam") {
    ctx.save();
    ctx.strokeStyle = tint;
    ctx.lineWidth = 2;
    ctx.strokeRect(gx - 6, gy - 6, 12, 12);
    ctx.fillStyle = "#fff";
    ctx.fillRect(gx - 2, gy - 2, 4, 4);
    ctx.restore();
  } else if (family === "scatter") {
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(ang);
    ctx.fillStyle = tint;
    for (let i = -1; i <= 1; i++) ctx.fillRect(0, i * 5 - 1, 8, 2);
    ctx.restore();
  } else if (family === "orbital") {
    // Opt-in mechanic only: two small contact wisps circle the Friend.
    if (!run.reducedMotion) {
      for (let i = 0; i < 2; i++) {
        const a = t * 2.2 + (i * Math.PI);
        const ox = Math.round(sx + Math.cos(a) * 30), oy = Math.round(sy - 30 + Math.sin(a) * 22);
        ctx.fillStyle = tint;
        ctx.fillRect(ox - 3, oy - 3, 6, 6);
        ctx.fillStyle = "#fff";
        ctx.fillRect(ox - 1, oy - 1, 2, 2);
      }
    }
    spark(8, tint);
  } else {
    // standard / rapid / homing: single Friend spark.
    spark(family === "rapid" ? 7 : 9, tint);
  }
  // Fire flash: expanding stepped pixel ring toward the aim, never a muzzle.
  if (firing) {
    const big = family === "heavy" || family === "buster" || family === "scatter";
    const r = Math.round(6 + k * (big ? 20 : 13));
    ctx.save();
    ctx.globalAlpha = 0.85 * (1 - k);
    ctx.fillStyle = family === "spark" ? tint : "#fff";
    // Chunky ring from 8 rects (pixel language, no smooth arc).
    ctx.fillRect(gx - r, gy - 2, 5, 4);
    ctx.fillRect(gx + r - 5, gy - 2, 5, 4);
    ctx.fillRect(gx - 2, gy - r, 4, 5);
    ctx.fillRect(gx - 2, gy + r - 5, 4, 5);
    const d = Math.round(r * 0.7);
    ctx.fillRect(gx - d - 2, gy - d - 2, 4, 4);
    ctx.fillRect(gx + d - 2, gy - d - 2, 4, 4);
    ctx.fillRect(gx - d - 2, gy + d - 2, 4, 4);
    ctx.fillRect(gx + d - 2, gy + d - 2, 4, 4);
    ctx.restore();
  }
}

/** Historic alias: the held-blaster renderer is gone; the Friend is the weapon. */
function drawBlaster(ctx: CanvasRenderingContext2D, run: RunState, fx: number, fy: number, family: WeaponFamily, tint: string): void {
  drawFriendFocus(ctx, run, fx, fy, family, tint);
}

/** Armor ring styles + trinket orbit charms. */
function drawWornGear(ctx: CanvasRenderingContext2D, fx: number, fy: number, gear: GearLook, t: number, reducedMotion: boolean): void {
  const [sx, sy] = toScreen(fx, fy);
  const armor = gear.armor;
  if (armor === "a6" || armor === "a11") {
    // Bulwark/Warden: thick plate arcs (warden paler + heavier).
    ctx.strokeStyle = armor === "a11" ? "#e0d5b8" : INK;
    ctx.lineWidth = armor === "a11" ? 6 : 5;
    ctx.beginPath(); ctx.ellipse(sx, sy - 34, 30, 26, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  } else if (armor === "a5" || armor === "a9") {
    // Scout/Blink: slim dashed ring (blink adds a second fast tick).
    ctx.strokeStyle = armor === "a9" ? "#7ee787" : "#3f7fbf";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.ellipse(sx, sy - 30, 34, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  } else if (armor === "a7") {
    // Mirror: pale sheen arc.
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(sx, sy - 34, 28, 24, 0, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  } else if (armor === "a8") {
    // Berserker: red jagged aura ticks.
    ctx.strokeStyle = "#d93a3a";
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + t * 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 32, sy - 32 + Math.sin(a) * 28);
      ctx.lineTo(sx + Math.cos(a) * 38, sy - 32 + Math.sin(a) * 33);
      ctx.stroke();
    }
  } else if (armor === "a10") {
    // Ember guard: warm rim.
    ctx.strokeStyle = "#e8823a";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(sx, sy - 32, 33, 28, 0, 0, Math.PI * 2); ctx.stroke();
  } else if (armor === "a12") {
    // Hunter scope: cool visor arc + tick.
    ctx.strokeStyle = "#9db8dd";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(sx, sy - 36, 30, 12, 0, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  } else if (armor === "a3" || armor === "a4") {
    ctx.strokeStyle = "#5da24a";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy - 30, 32, 28, 0, 0, Math.PI * 2); ctx.stroke();
  }
  const trinket = gear.trinket;
  if (trinket && trinket !== "t0") {
    const cols: Record<string, string> = {
      t1: "#7db83e", t2: "#e8c53a", t3: "#9db8dd", t4: "#d95f4b", t5: "#3f7fbf",
      t6: "#5b3f8c", t7: "#7a5fc0", t8: "#8a5a00",
      t9: "#3f7fbf", t10: "#e8d44b", t11: "#e8823a", t12: "#7a5fc0", t13: "#7ee787", t14: "#d93a3a",
    };
    const col = cols[trinket] ?? "#8a5a00";
    const n = trinket === "t4" || trinket === "t8" || trinket === "t12" ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const a = t * (reducedMotion ? 0 : 2.2) + (i * Math.PI * 2) / n;
      const ox = sx + Math.cos(a) * 40, oy = sy - 34 + Math.sin(a) * 30;
      ctx.fillStyle = col;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ox, oy, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
}

function drawPickup(ctx: CanvasRenderingContext2D, p: Pickup, t: number): void {
  const bob = Math.sin(t * 4 + p.x) * 3;
  const [sx, sy] = toScreen(p.x, p.y, 14 + bob);
  const blink = p.ttl < 5 && Math.floor(t * 6) % 2 === 0;
  if (blink) return;
  ctx.save();
  drawShadowEllipse(ctx, sx, sy + 12, 8);
  if (p.kind === "rf") {
    ctx.fillStyle = "#7db83e";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 8); ctx.lineTo(sx + 6, sy); ctx.lineTo(sx, sy + 8); ctx.lineTo(sx - 6, sy);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (p.kind === "heart") {
    ctx.fillStyle = "#d95f4b";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx - 3.5, sy - 2, 4.5, 0, Math.PI * 2); ctx.arc(sx + 3.5, sy - 2, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx - 7.4, sy); ctx.lineTo(sx, sy + 8); ctx.lineTo(sx + 7.4, sy); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (p.kind === "haste") {
    ctx.fillStyle = "#3f7fbf";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx + 2, sy - 9); ctx.lineTo(sx - 5, sy + 1); ctx.lineTo(sx, sy + 1); ctx.lineTo(sx - 2, sy + 9); ctx.lineTo(sx + 5, sy - 1); ctx.lineTo(sx, sy - 1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {
    ctx.fillStyle = "#e8c53a";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 9 : 4;
      ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  // Orbiting glint: pickups beg to be grabbed.
  const ga = t * 3 + p.x;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(Math.round(sx + Math.cos(ga) * 11) - 1, Math.round(sy + Math.sin(ga) * 8) - 1, 3, 3);
  ctx.restore();
}

/** Rare Trader: a character + stall that lives in the world (palette-matched, grounded, depth-sorted). */
function drawTrader(ctx: CanvasRenderingContext2D, scene: Scene, t: number, reducedMotion: boolean): void {
  const [x, y] = scene.anchors.trader;
  const [sx, sy] = toScreen(x, y);
  // Wide grounded shadow: the stall sits ON the terrain, never floating.
  drawShadowEllipse(ctx, sx, sy + 3, 34);
  drawShadowEllipse(ctx, sx + 34, sy + 2, 12);
  // Timber deck platform: the stall is built on the plot.
  ctx.fillStyle = "#a88458";
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(sx + 4, sy, 44, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(20,16,10,0.18)";
  ctx.beginPath(); ctx.ellipse(sx + 4, sy + 4, 44, 14, 0, 0, Math.PI); ctx.fill();
  // Stall: woven paper counter + garden-green striped canopy, timber posts.
  ctx.fillStyle = "#e8dcc0";
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(sx, sy - 10, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f4f1e6";
  ctx.fillRect(sx - 26, sy - 36, 52, 22);
  ctx.strokeRect(sx - 26, sy - 36, 52, 22);
  // Goods on the counter: tiny RF shard + wearable trinkets (world-consistent).
  ctx.fillStyle = "#7db83e";
  ctx.beginPath(); ctx.moveTo(sx - 12, sy - 18); ctx.lineTo(sx - 8, sy - 28); ctx.lineTo(sx - 4, sy - 18); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e8c53a";
  ctx.beginPath(); ctx.arc(sx + 6, sy - 22, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#9db8dd";
  ctx.beginPath(); ctx.arc(sx + 16, sy - 22, 3, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 ? "#5da24a" : "#f4f1e6";
    ctx.fillRect(sx - 30 + i * 10, sy - 64, 10, 14);
    ctx.strokeRect(sx - 30 + i * 10, sy - 64, 10, 14);
  }
  // Canopy underside shade: fabric has thickness.
  ctx.fillStyle = "rgba(20,16,10,0.22)";
  ctx.fillRect(sx - 30, sy - 52, 60, 3);
  ctx.fillStyle = "#5d4a36";
  ctx.strokeStyle = INK; ctx.lineWidth = 2;
  ctx.fillRect(sx - 30, sy - 50, 4, 40);
  ctx.strokeRect(sx - 30, sy - 50, 4, 40);
  ctx.fillRect(sx + 26, sy - 50, 4, 40);
  ctx.strokeRect(sx + 26, sy - 50, 4, 40);
  // Vendor: round Rare Friends-adjacent body, leaf cap, satchel, idle wave.
  const bob = reducedMotion ? 0 : Math.sin(t * 2.4) * 2;
  const wave = reducedMotion ? 0 : Math.sin(t * 2.4) * 4;
  ctx.fillStyle = "#3a2e1e";
  ctx.beginPath(); ctx.ellipse(sx + 36, sy - 22 + bob, 11, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
  // Leaf cap.
  ctx.fillStyle = "#5da24a";
  ctx.beginPath(); ctx.ellipse(sx + 36, sy - 34 + bob, 12, 5, -0.15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Eyes + smile.
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(sx + 32, sy - 24 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sx + 40, sy - 24 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = INK; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(sx + 36, sy - 21 + bob, 4, 0.2, Math.PI - 0.2); ctx.stroke();
  // Waving arm.
  ctx.strokeStyle = "#3a2e1e"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(sx + 44, sy - 22 + bob); ctx.lineTo(sx + 50, sy - 32 + bob + wave); ctx.stroke();
  // Signal satchel.
  ctx.fillStyle = "#7db83e";
  ctx.fillRect(sx + 30, sy - 14 + bob, 12, 8);
  ctx.strokeRect(sx + 30, sy - 14 + bob, 12, 8);
  mono(ctx, 11);
  const label = "TRADER";
  const w = ctx.measureText(label).width + 16;
  pill(ctx, sx + 8, sy - 82, w, 20);
  ctx.fillStyle = INK;
  ctx.fillText(label, sx + 8, sy - 78);
}

/* ---------------- ground dressing: map-native pixel detail ----------------
 * Everything here derives from real SDK world data (paths, patches, polygon
 * rims, prop footprints) plus a scene-seeded scatter — no invented geometry.
 * Precomputed once per scene (WeakMap, dies with the scene); per-frame work
 * is bounded tiny rect/ellipse ops. Static unless noted (motion-gated).
 */

interface BiomePal {
  tuft: string; tuftDark: string; flowerA: string; flowerB: string;
  stone: string; stoneDark: string; foam: string; lip: string; torch: string;
  reed: string; rug: string; rugDark: string;
}

const BIOMES: BiomePal[] = [
  { tuft: "#3f8a33", tuftDark: "#2f7327", flowerA: "#e86a8a", flowerB: "#f4f1e6", stone: "#a8a094", stoneDark: "#6e685e", foam: "#eaf6f6", lip: "#a8e063", torch: "#e8823a", reed: "#2f7a4e", rug: "#d8b96a", rugDark: "#a88a48" },
  { tuft: "#2f8a5e", tuftDark: "#226b47", flowerA: "#e8c53a", flowerB: "#7dd7ff", stone: "#9a8a72", stoneDark: "#64563e", foam: "#eaf6f6", lip: "#7dd7a0", torch: "#e8823a", reed: "#2a6e4e", rug: "#c98a4e", rugDark: "#96622e" },
  { tuft: "#7a7434", tuftDark: "#5c5826", flowerA: "#e86a3a", flowerB: "#f4e3b0", stone: "#9a7a5c", stoneDark: "#66503a", foam: "#f4e8d0", lip: "#e8c86a", torch: "#e84a2a", reed: "#6e7a30", rug: "#c9a05e", rugDark: "#96703a" },
  { tuft: "#2a7a5c", tuftDark: "#1c5a44", flowerA: "#7dd7ff", flowerB: "#eaf6f6", stone: "#8a9aa0", stoneDark: "#5a686e", foam: "#ffffff", lip: "#7dd7b0", torch: "#3ab0e8", reed: "#1e6e52", rug: "#7aba9a", rugDark: "#4e8a6c" },
  { tuft: "#4e9e4a", tuftDark: "#3a7a38", flowerA: "#f4f1e6", flowerB: "#c9a8ff", stone: "#b0b0b8", stoneDark: "#76767e", foam: "#f4f8ff", lip: "#b0e88a", torch: "#e8c53a", reed: "#3e8a5e", rug: "#d8c27a", rugDark: "#a8944e" },
  { tuft: "#463e86", tuftDark: "#342e66", flowerA: "#c9a8ff", flowerB: "#7dd7ff", stone: "#7e74a0", stoneDark: "#4e4868", foam: "#e8e4ff", lip: "#9d8dd7", torch: "#9d7dff", reed: "#3e5e8e", rug: "#8a7ac0", rugDark: "#5e5490" },
];

interface DressDot { x: number; y: number; v: number; ph: number }

interface GroundDress {
  pal: BiomePal;
  stones: { x: number; y: number }[];
  tufts: DressDot[]; flowers: DressDot[]; pebbles: DressDot[]; reeds: DressDot[];
  waters: { x: number; y: number; w: number; h: number }[];
  lip: WorldPoint[][];
  props: { x: number; y: number; kind: "sign" | "lantern" | "shroom" | "bush" }[];
}

const dressCache = new WeakMap<Scene, GroundDress>();

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Precompute deterministic dressing for a scene (walkability-checked). */
export function groundDress(scene: Scene): GroundDress {
  const hit = dressCache.get(scene);
  if (hit) return hit;
  const pal = BIOMES[scene.mapIdx % BIOMES.length] ?? BIOMES[0];
  const rng = mulberry32(hashStr(scene.presetId) ^ (scene.mapIdx * 7919));
  const world = scene.world;
  const avoid: WorldPoint[] = [
    scene.home, scene.anchors.turret, scene.anchors.healer, scene.anchors.collector,
    scene.anchors.frost, scene.anchors.homecore, scene.anchors.trader,
    ...scene.gates,
  ];
  const clearOf = (x: number, y: number, r: number): boolean => {
    for (const [ax, ay] of avoid) if (Math.hypot(ax - x, ay - y) < r) return false;
    for (const p of world.props ?? []) {
      const fp = (PROP_FOOTPRINTS as Record<string, { w: number; h: number } | null>)[(p as { type?: string }).type ?? ""];
      if (Math.hypot(p.x - x, p.y - y) < (fp ? Math.max(fp.w, fp.h) / 2 + 8 : 16)) return false;
    }
    return true;
  };
  const dress: GroundDress = {
    pal, stones: [], tufts: [], flowers: [], pebbles: [], reeds: [],
    waters: [], lip: [], props: [],
  };
  // Path edge stones from real SDK path polylines.
  const paths = (world as unknown as { paths?: readonly { points: readonly WorldPoint[]; width: number }[] }).paths ?? [];
  for (const path of paths) {
    const pts = path.points ?? [];
    for (let i = 0; i + 1 < pts.length && dress.stones.length < 48; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      const len = Math.max(1, Math.hypot(x2 - x1, y2 - y1));
      const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
      const off = path.width / 2 + 5;
      for (let d = 12; d < len - 6 && dress.stones.length < 48; d += 24) {
        const tt = d / len;
        for (const s of [-1, 1]) {
          if (rng() < 0.25) continue;
          const x = x1 + (x2 - x1) * tt + nx * off * s;
          const y = y1 + (y2 - y1) * tt + ny * off * s;
          if (x < 16 || y < 16 || x > 560 || y > 368) continue;
          if (!isWorldWalkable(world, [x, y], 6) || !clearOf(x, y, 12)) continue;
          dress.stones.push({ x: Math.round(x), y: Math.round(y) });
        }
      }
    }
  }
  // Water + dense patches from real SDK patch rects.
  const patches = (world as unknown as { patches?: readonly { x: number; y: number; w: number; h: number; pattern: string }[] }).patches ?? [];
  for (const p of patches) {
    if (p.pattern === "water") dress.waters.push({ x: p.x, y: p.y, w: p.w, h: p.h });
  }
  // Meadow scatter: seeded, walkable, clear of gameplay points.
  const scatter = (
    out: DressDot[], tries: number, needR: number, avoidR: number,
  ): void => {
    for (let i = 0; i < tries && out.length < needR * 4; i++) {
      const x = 24 + rng() * 528, y = 24 + rng() * 336;
      if (!isWorldWalkable(world, [x, y], 6) || !clearOf(x, y, avoidR)) continue;
      out.push({ x: Math.round(x), y: Math.round(y), v: Math.floor(rng() * 3), ph: rng() * 6.28 });
    }
  };
  scatter(dress.tufts, 150, 18, 24);
  scatter(dress.flowers, 70, 7, 26);
  scatter(dress.pebbles, 46, 5, 20);
  // Reeds hug water patch edges (marsh identity where water exists).
  for (const w of dress.waters) {
    for (let i = 0; i < 10; i++) {
      const edge = Math.floor(rng() * 4);
      const x = edge === 0 ? w.x + rng() * w.w : edge === 1 ? w.x + rng() * w.w : edge === 2 ? w.x - 4 : w.x + w.w + 4;
      const y = edge === 0 ? w.y - 4 : edge === 1 ? w.y + w.h + 4 : w.y + rng() * w.h;
      if (!isWorldWalkable(world, [x, y], 6) || !clearOf(x, y, 14)) continue;
      dress.reeds.push({ x: Math.round(x), y: Math.round(y), v: Math.floor(rng() * 2), ph: rng() * 6.28 });
    }
  }
  // Cliff lip rings from real SDK geometry polygons.
  const polys = (world as unknown as { geometry?: { polygons?: readonly (readonly WorldPoint[])[] } }).geometry?.polygons ?? [];
  for (const ring of polys) {
    if (ring.length >= 3) dress.lip.push([...ring]);
  }
  // A few handcrafted pixel props near the home clearing (never blocking).
  const near = (dx: number, dy: number, kind: GroundDress["props"][number]["kind"]): void => {
    const c = findAnchor(world, scene.home[0] + dx, scene.home[1] + dy, 14);
    if (Math.hypot(c[0] - scene.home[0], c[1] - scene.home[1]) > 120) return;
    if (!clearOf(c[0], c[1], 16)) return;
    dress.props.push({ x: c[0], y: c[1], kind });
  };
  near(-62, 40, "sign");
  near(64, 36, "lantern");
  near(-40, -52, "shroom");
  near(52, -48, "bush");
  dressCache.set(scene, dress);
  return dress;
}

/** Flat grounded shadow sized from the SDK prop footprint (map-native). */
export function drawPropShadows(ctx: CanvasRenderingContext2D, scene: Scene): void {
  for (const p of scene.world.props ?? []) {
    const fp = (PROP_FOOTPRINTS as Record<string, { w: number; h: number } | null>)[(p as { type?: string }).type ?? ""];
    const s = (p as { scale?: number }).scale ?? 1;
    const w = Math.max(10, ((fp?.w ?? 20) * s) * 0.9);
    drawShadowEllipse(ctx, p.x, p.y + 2, w);
  }
}

function dressTuft(ctx: CanvasRenderingContext2D, sx: number, sy: number, pal: BiomePal, v: number): void {
  ctx.fillStyle = v === 2 ? pal.tuftDark : pal.tuft;
  const h = 5 + v;
  ctx.fillRect(sx - 3, sy - h, 2, h);
  ctx.fillRect(sx, sy - h - 2, 2, h + 2);
  ctx.fillRect(sx + 3, sy - h + 1, 2, h - 1);
}

function dressFlower(ctx: CanvasRenderingContext2D, sx: number, sy: number, pal: BiomePal, v: number): void {
  ctx.fillStyle = pal.tuftDark;
  ctx.fillRect(sx, sy - 7, 2, 7);
  ctx.fillStyle = v === 2 ? pal.flowerB : pal.flowerA;
  ctx.fillRect(sx - 2, sy - 11, 2, 2);
  ctx.fillRect(sx + 2, sy - 11, 2, 2);
  ctx.fillRect(sx, sy - 13, 2, 2);
  ctx.fillRect(sx, sy - 9, 2, 2);
  ctx.fillStyle = "#e8c53a";
  ctx.fillRect(sx, sy - 11, 2, 2);
}

/** Per-frame ground dressing. `torches` = gate indices with enemies inbound. */
export function drawGroundDress(
  ctx: CanvasRenderingContext2D, scene: Scene, dress: GroundDress,
  t: number, reducedMotion: boolean, torches?: Set<number>,
): void {
  const pal = dress.pal;
  // Cliff grass lip along the real island rim.
  ctx.save();
  ctx.strokeStyle = pal.lip;
  ctx.lineWidth = 3;
  ctx.setLineDash([7, 5]);
  for (const ring of dress.lip) {
    ctx.beginPath();
    ring.forEach(([x, y], i) => {
      const [sx, sy] = toScreen(x, y);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
  // Water foam + glints on real water patches.
  for (const w of dress.waters) {
    const [ax, ay] = toScreen(w.x, w.y);
    const [bx, by] = toScreen(w.x + w.w, w.y + w.h);
    ctx.save();
    ctx.strokeStyle = pal.foam;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    if (!reducedMotion) ctx.lineDashOffset = -t * 6;
    ctx.strokeRect(ax, ay, bx - ax, by - ay);
    ctx.setLineDash([]);
    ctx.fillStyle = pal.foam;
    for (let i = 0; i < 3; i++) {
      const gx = ax + ((w.x * 13 + i * 47 + (reducedMotion ? 0 : t * 9)) % Math.max(8, (bx - ax)));
      const gy = ay + ((w.y * 7 + i * 31) % Math.max(8, (by - ay)));
      const tw = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(t * 3 + i * 2.1);
      ctx.globalAlpha = 0.35 + 0.45 * tw;
      ctx.fillRect(Math.round(gx), Math.round(gy), 3, 2);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  // Path edge stones.
  for (const s of dress.stones) {
    const [sx, sy] = toScreen(s.x, s.y);
    ctx.fillStyle = pal.stoneDark;
    ctx.fillRect(sx - 3, sy - 1, 6, 4);
    ctx.fillStyle = pal.stone;
    ctx.fillRect(sx - 3, sy - 2, 6, 3);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(sx - 2, sy - 2, 2, 1);
  }
  // Meadow scatter.
  for (const d of dress.tufts) {
    const [sx, sy] = toScreen(d.x, d.y);
    dressTuft(ctx, sx, sy, pal, d.v);
  }
  for (const d of dress.flowers) {
    const [sx, sy] = toScreen(d.x, d.y);
    dressFlower(ctx, sx, sy, pal, d.v);
  }
  for (const d of dress.pebbles) {
    const [sx, sy] = toScreen(d.x, d.y);
    ctx.fillStyle = pal.stoneDark;
    ctx.beginPath(); ctx.ellipse(sx, sy, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.stone;
    ctx.beginPath(); ctx.ellipse(sx, sy - 1, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
  }
  for (const d of dress.reeds) {
    const [sx, sy] = toScreen(d.x, d.y);
    const sway = reducedMotion ? 0 : Math.round(Math.sin(t * 2 + d.ph) * 1.5);
    ctx.fillStyle = pal.reed;
    ctx.fillRect(sx - 3 + sway, sy - 12, 2, 12);
    ctx.fillRect(sx + 1 - sway, sy - 10, 2, 10);
    ctx.fillStyle = "#8a6a48";
    ctx.fillRect(sx - 3 + sway, sy - 14, 2, 3);
    ctx.fillRect(sx + 1 - sway, sy - 12, 2, 3);
  }
  // Home rug: braided clearing marking your spot.
  {
    const [hx, hy] = toScreen(scene.home[0], scene.home[1]);
    ctx.fillStyle = pal.rugDark;
    ctx.beginPath(); ctx.ellipse(hx, hy + 2, 30, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.rug;
    ctx.beginPath(); ctx.ellipse(hx, hy, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.rugDark;
    ctx.beginPath(); ctx.ellipse(hx, hy, 16, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.rug;
    ctx.beginPath(); ctx.ellipse(hx, hy, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
  }
  // Gate slabs + pennants; lit torches while enemies are inbound.
  scene.gates.forEach(([gx, gy], gi) => {
    const [sx, sy] = toScreen(gx, gy);
    drawShadowEllipse(ctx, sx, sy + 2, 14);
    ctx.fillStyle = pal.stoneDark;
    ctx.beginPath(); ctx.ellipse(sx, sy, 13, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pal.stone;
    ctx.beginPath(); ctx.ellipse(sx, sy - 1, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(sx, sy - 1, 11, 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#7a6248";
    ctx.fillRect(sx + 8, sy - 30, 3, 24);
    ctx.strokeStyle = INK; ctx.lineWidth = 1;
    ctx.strokeRect(sx + 8, sy - 30, 3, 24);
    const lit = torches?.has(gi) ?? false;
    ctx.fillStyle = lit ? "#e84a2a" : pal.torch;
    ctx.beginPath();
    ctx.moveTo(sx + 11, sy - 30);
    ctx.lineTo(sx + 24, sy - 26);
    ctx.lineTo(sx + 11, sy - 22);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (lit) {
      const fl = reducedMotion ? 0 : Math.sin(t * 11 + gi * 2.4) * 1.5;
      ctx.fillStyle = "#e8823a";
      ctx.fillRect(sx + 8, sy - 38 + fl, 4, 9);
      ctx.fillStyle = "#ffd964";
      ctx.fillRect(sx + 9, sy - 36 + fl, 2, 5);
    }
  });
}

export interface DressPropDraw { x: number; y: number; depth: number; draw: (ctx: CanvasRenderingContext2D, t: number) => void }

/** Handcrafted pixel props near home (depth-sorted, grounded, tiny). */
export function dressPropLayers(scene: Scene, dress: GroundDress, reducedMotion: boolean): DressPropDraw[] {
  const out: DressPropDraw[] = [];
  for (const p of dress.props) {
    out.push({
      x: p.x, y: p.y, depth: p.x + p.y,
      draw: (ctx, t) => {
        const [sx, sy] = toScreen(p.x, p.y);
        drawShadowEllipse(ctx, sx, sy + 2, 12);
        if (p.kind === "sign") {
          // Waypost: timber post + board with heart + tiny roof.
          ctx.fillStyle = "#7a6248";
          ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.fillRect(sx - 3, sy - 40, 6, 40);
          ctx.strokeRect(sx - 3, sy - 40, 6, 40);
          ctx.fillStyle = "#a88458";
          ctx.fillRect(sx - 18, sy - 58, 36, 18);
          ctx.strokeRect(sx - 18, sy - 58, 36, 18);
          ctx.fillStyle = "#5d4a36";
          ctx.beginPath();
          ctx.moveTo(sx - 20, sy - 58); ctx.lineTo(sx, sy - 68); ctx.lineTo(sx + 20, sy - 58);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Heart emblem: this plot is loved.
          ctx.fillStyle = "#d95f4b";
          ctx.beginPath(); ctx.arc(sx - 5, sy - 51, 4, 0, Math.PI * 2); ctx.arc(sx + 3, sy - 51, 4, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.moveTo(sx - 8.4, sy - 50); ctx.lineTo(sx - 1, sy - 42); ctx.lineTo(sx + 6.4, sy - 50); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#5d4a36";
          ctx.fillRect(sx + 8, sy - 52, 6, 6);
          ctx.beginPath(); ctx.moveTo(sx + 8, sy - 52); ctx.lineTo(sx + 11, sy - 56); ctx.lineTo(sx + 14, sy - 52); ctx.closePath(); ctx.fill();
        } else if (p.kind === "lantern") {
          // Lantern post: warm lamp with soft halo for cozy nights.
          ctx.fillStyle = "#3a3f45";
          ctx.strokeStyle = INK; ctx.lineWidth = 2;
          ctx.fillRect(sx - 2, sy - 46, 4, 46);
          ctx.strokeRect(sx - 2, sy - 46, 4, 46);
          ctx.beginPath(); ctx.moveTo(sx - 8, sy - 46); ctx.lineTo(sx, sy - 54); ctx.lineTo(sx + 8, sy - 46); ctx.closePath();
          ctx.fillStyle = "#5d4a36"; ctx.fill(); ctx.stroke();
          const flick = reducedMotion ? 0 : Math.sin(t * 7 + p.x) * 0.5;
          ctx.fillStyle = "rgba(255,217,100,0.20)";
          ctx.beginPath(); ctx.arc(sx, sy - 38, 14, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffd964";
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
          ctx.fillRect(sx - 5, sy - 44 + flick, 10, 10);
          ctx.strokeRect(sx - 5, sy - 44 + flick, 10, 10);
          ctx.fillStyle = "#fff";
          ctx.fillRect(sx - 3, sy - 42 + flick, 3, 3);
        } else if (p.kind === "shroom") {
          // Toadstool cluster: tamagotchi charm, zero gameplay.
          const sway = reducedMotion ? 0 : Math.sin(t * 2 + p.y) * 1;
          ctx.fillStyle = "#e8e4da";
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
          ctx.fillRect(sx - 8 + sway, sy - 10, 5, 10);
          ctx.strokeRect(sx - 8 + sway, sy - 10, 5, 10);
          ctx.fillRect(sx + 4 - sway, sy - 8, 4, 8);
          ctx.strokeRect(sx + 4 - sway, sy - 8, 4, 8);
          ctx.fillStyle = "#d95f4b";
          ctx.beginPath(); ctx.arc(sx - 5.5 + sway, sy - 10, 8, Math.PI, 0); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(sx + 6 - sway, sy - 8, 6, Math.PI, 0); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.fillRect(sx - 8 + sway, sy - 15, 2, 2);
          ctx.fillRect(sx - 3 + sway, sy - 13, 2, 2);
          ctx.fillRect(sx + 5 - sway, sy - 12, 2, 2);
        } else {
          // Berry bush: leafy cluster with dotted berries.
          ctx.fillStyle = "#3f8a33";
          ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(sx - 7, sy - 8, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(sx + 7, sy - 8, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#5da24a";
          ctx.beginPath(); ctx.arc(sx, sy - 13, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#d95f4b";
          ctx.fillRect(sx - 8, sy - 12, 3, 3);
          ctx.fillRect(sx + 4, sy - 10, 3, 3);
          ctx.fillRect(sx - 1, sy - 17, 3, 3);
        }
      },
    });
  }
  return out;
}

export interface GearLook {
  weapon: string;
  armor: string;
  trinket: string;
  family: WeaponFamily;
}

/** World-space circle → screen ellipse (telegraphs, pulses, ranges). */
function groundEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width = 2, dash: number[] = []): void {
  const [sx, sy] = toScreen(x, y);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.ellipse(sx, sy, r * 1.32, r * 0.62, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export interface CombatView {
  art: FriendArt;
  seedNum: number;
  reducedMotion: boolean;
  now: number;
  gear: GearLook;
  /** Official Frenemy bodies by foeKey(family, seed); absent = fallback body. */
  foes?: Map<string, FriendArt> | null;
}

/** Development-only collision debug overlay (H key). Never normal UI. */
export function drawDebug(ctx: CanvasRenderingContext2D, run: RunState, perf?: { fps: number; renderMs: number; pathPs: number; loops: number }): void {
  ctx.save();
  ctx.translate(-VIEW.x, -VIEW.y);
  // Blocked geometry as projected quads.
  ctx.strokeStyle = "rgba(200,40,40,0.8)";
  ctx.lineWidth = 2;
  for (const b of run.scene.world.collision?.blocked ?? []) {
    const corners = [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]].map(([x, y]) => toScreen(x, y));
    ctx.beginPath();
    corners.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.stroke();
  }
  // Validated spawn gates.
  for (const [gx, gy] of run.scene.gates) {
    const [sx, sy] = toScreen(gx, gy);
    ctx.fillStyle = "#3f7fbf";
    ctx.beginPath();
    ctx.moveTo(sx, sy - 8); ctx.lineTo(sx + 8, sy); ctx.lineTo(sx, sy + 8); ctx.lineTo(sx - 8, sy);
    ctx.closePath(); ctx.fill();
  }
  // Body colliders.
  const body = (x: number, y: number, r: number, color: string) => {
    const [sx, sy] = toScreen(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(sx, sy, r * 1.32, r * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
  };
  const [fx, fy] = friendPos(run);
  body(fx, fy, FRIEND_BODY, "#2f9e44");
  for (const e of run.enemies) body(e.x, e.y, e.body, e.kind === "boss" ? "#e67700" : "#d93a3a");
  // Projectile swept segments.
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 1;
  for (const s of run.shots) {
    const [ax, ay] = toScreen(s.px, s.py);
    const [bx, by] = toScreen(s.x, s.y);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  }
  // Friend target line.
  let best: Enemy | null = null;
  let bestD = FRIEND_RANGE * FRIEND_RANGE;
  for (const e of run.enemies) {
    const d = (e.x - fx) * (e.x - fx) + (e.y - fy) * (e.y - fy);
    if (d < bestD) { bestD = d; best = e; }
  }
  if (best) {
    const [ax, ay] = toScreen(fx, fy - 10);
    const [bx, by] = toScreen(best.x, best.y - 10);
    ctx.strokeStyle = "#2f9e44";
    ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);
  }
  // Aim debug: player pos, cursor world point, normalized aim vector (green),
  // projectile vector (gold), sprite facing (ink). Proves facing never leaks.
  {
    const [ax, ay] = toScreen(fx, fy - 10);
    const aimDx = run.aimWorld[0] - fx, aimDy = run.aimWorld[1] - fy;
    const n = Math.max(1, Math.hypot(aimDx, aimDy));
    const [cx, cy] = toScreen(run.aimWorld[0], run.aimWorld[1]);
    ctx.fillStyle = "#3f7fbf";
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    const [gx, gy] = toScreen(fx + (aimDx / n) * 60, fy + (aimDy / n) * 60);
    ctx.strokeStyle = "#2f9e44";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(gx, gy - 10); ctx.stroke();
    const [px, py] = toScreen(fx + Math.cos(run.aimAngle) * 60, fy + Math.sin(run.aimAngle) * 60);
    ctx.strokeStyle = "#b98a1c";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(px, py - 10); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.font = "bold 11px ui-monospace,Menlo,Consolas,monospace";
    const deg = ((run.aimAngle * 180) / Math.PI + 360) % 360;
    ctx.fillText(`aim ${deg.toFixed(1)}deg face ${run.aimFace}${run.aimMode === "mouse" ? " mouse" : " auto"}`, ax + 8, ay - 8);
    ctx.textAlign = "center";
  }
  ctx.restore();
  // Stats readout.
  mono(ctx, 11, "normal");
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  const lines = [
    `step ${run.stepMs.toFixed(2)}ms render ${(perf?.renderMs ?? 0).toFixed(2)}ms fps ${perf?.fps ?? 0}`,
    `foes ${run.enemies.length} shots ${run.shots.length} parts ${run.particles.length} path/s ${perf?.pathPs ?? 0} loops ${perf?.loops ?? 0}`,
    `stuckFix ${run.stuckFixes} rejects ${run.spawnRejects} wave ${run.wave}${run.waveType !== "standard" ? ` ${run.waveType}` : ""}`,
    `map ${run.mapIdx} mode ${run.manual ? "MAN" : "AUTO"} phase ${run.phase}`,
  ];
  lines.forEach((l, i) => ctx.fillText(l, 10, VIEW.height - 44 + i * 14));
  ctx.textAlign = "center";
}

export interface HomeView {
  art: FriendArt;
  seedNum: number;
  tokenId: string;
  reducedMotion: boolean;
  now: number;
  pokeT: number;
  gear: GearLook;
  /** Uncollected production: the collector glints when this is > 0. */
  prodBank: number;
}

export function drawIsoHome(
  ctx: CanvasRenderingContext2D,
  assets: IsoAssets,
  scene: Scene,
  fx: number, fy: number, facing: SpriteFacing, walking: boolean,
  levels: { turret: number; wall: number; healer: number; collector: number; frost?: number },
  view: HomeView,
): void {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(-40, -40, VIEW.width + 80, VIEW.height + 80);
  ctx.translate(-VIEW.x, -VIEW.y);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assets.terrain, 0, 0);
  // Map-native dressing: prop shadows, pixel detail, gate slabs, home rug.
  const dress = groundDress(scene);
  drawGroundDress(ctx, scene, dress, view.now, view.reducedMotion);
  drawPropShadows(ctx, scene);

  const layers: { depth: number; draw: () => void }[] = [];
  for (const o of assets.objects) {
    layers.push({ depth: o.depth, draw: () => { ctx.drawImage(o.image, 0, 0); } });
  }
  for (const d of dressPropLayers(scene, dress, view.reducedMotion)) {
    layers.push({ depth: d.depth - 0.25, draw: () => d.draw(ctx, view.now) });
  }
  for (const s of structureLayers(scene.anchors, levels, -0.6, view.reducedMotion, scene.home)) {
    layers.push({ depth: s.depth - 0.5, draw: () => s.draw(ctx, view.now) });
  }
  layers.push({
    depth: fx + fy + 0.5,
    draw: () => {
      const hop = view.pokeT < 0.6 ? Math.sin((view.pokeT / 0.6) * Math.PI) * -30 : 0;
      const rows = frameRows(view.art, facing, walking, view.now, view.reducedMotion);
      drawPixelFriend(ctx, rows,
        view.seedNum, fx, fy, { lift: hop, blink: (view.now % 3.7) < 0.12 });
      drawWornGear(ctx, fx, fy, view.gear, view.now, view.reducedMotion);
      const [sx, sy] = toScreen(fx, fy);
      // Nameplate with Friend cameo: the star gets a portrait badge.
      mono(ctx, 12);
      const label = `Friend #${view.tokenId}`;
      const tw = ctx.measureText(label).width;
      const pw = rows ? 30 : 0;
      pill(ctx, sx + pw / 2, sy - 104, tw + 20 + pw, 30);
      if (rows) drawPortraitBadge(ctx, rows, sx - tw / 2 - 10 + pw / 2, sy - 104);
      ctx.fillStyle = INK;
      ctx.fillText(label, sx + pw / 2, sy - 100);
    },
  });
  layers.sort((a, b) => a.depth - b.depth);
  for (const l of layers) l.draw();

  // Collector ready glint: tap BASE to collect (world-readable production).
  if (levels.collector > 0 && view.prodBank > 0) {
    const [cx, cy] = toScreen(scene.anchors.collector[0], scene.anchors.collector[1]);
    const bob = view.reducedMotion ? 0 : Math.sin(view.now * 4) * 4;
    const tw = view.reducedMotion ? 1 : 0.6 + 0.4 * Math.sin(view.now * 5);
    ctx.save();
    ctx.globalAlpha = tw;
    ctx.fillStyle = "#ffd964";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    const r = 9, yy = cy - 66 + bob;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * 0.45;
      const px = cx + Math.cos(a) * rr, py = yy + Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  if (!view.reducedMotion) {
    // Drifting pollen + leaves over the peaceful plot.
    ctx.fillStyle = "rgba(120,140,60,0.5)";
    for (let i = 0; i < 10; i++) {
      const px = (view.seedNum * 37 + i * 173 + view.now * 9) % 1600;
      const py = 360 + ((view.seedNum * 11 + i * 97 + view.now * 6) % 560);
      ctx.fillRect(px, py, 3, 3);
    }
    ctx.fillStyle = "rgba(93,162,74,0.65)";
    for (let i = 0; i < 6; i++) {
      const px = (view.seedNum * 53 + i * 271 + view.now * 14) % 1600;
      const py = 380 + ((view.seedNum * 29 + i * 131 + view.now * 9) % 520);
      ctx.fillRect(px, py + Math.sin(view.now * 2 + i) * 3, 4, 2);
    }
  }
  ctx.restore();
}

const KIND_AURA: Record<string, string | undefined> = {
  shadow: "rgba(90,70,160,0.30)",
  swift: "rgba(150,90,200,0.30)",
  tank: "rgba(160,60,60,0.30)",
  ranged: "rgba(70,130,200,0.30)",
  swarm: "rgba(120,110,180,0.28)",
  boss: "rgba(200,140,20,0.35)",
  charger: "rgba(200,110,50,0.32)",
  split: "rgba(60,80,140,0.30)",
  splitling: "rgba(60,80,140,0.25)",
  shield: "rgba(110,120,130,0.32)",
  support: "rgba(215,95,75,0.30)",
  summoner: "rgba(122,95,192,0.34)",
  bomber: "rgba(200,110,50,0.32)",
  sniper: "rgba(70,130,160,0.32)",
  orbiter: "rgba(120,160,80,0.30)",
  blinker: "rgba(150,90,200,0.32)",
  leaper: "rgba(80,160,110,0.30)",
  mage: "rgba(160,70,160,0.34)",
  burrower: "rgba(150,120,80,0.30)",
  commander: "rgba(200,70,70,0.34)",
  drainer: "rgba(70,130,180,0.34)",
  saboteur: "rgba(180,80,140,0.34)",
  thief: "rgba(110,160,90,0.32)",
  artillery: "rgba(200,120,60,0.34)",
  necromancer: "rgba(110,110,200,0.34)",
  traplayer: "rgba(170,170,90,0.32)",
  siege: "rgba(190,60,60,0.36)",
  cryo: "rgba(140,190,220,0.34)",
  corrupter: "rgba(120,80,180,0.34)",
  elitehunter: "rgba(220,120,60,0.34)",
  minibrute: "rgba(200,70,70,0.38)",
  minimage: "rgba(170,140,220,0.38)",
  minisiege: "rgba(200,90,60,0.38)",
};
/**
 * Per-archetype Friend variants (all derived from canonical pixels via
 * non-destructive silhouette transforms + accessories — no other NFTs used).
 * s = base scale, xs/ys = silhouette proportions.
 * Exported for deterministic variant tests.
 */
export const KIND_FORM: Record<string, { s: number; xs: number; ys: number; visor?: string; cross?: boolean }> = {
  shadow: { s: 4.4, xs: 1, ys: 1 },
  swift: { s: 3.8, xs: 0.78, ys: 1.05 },
  tank: { s: 5.6, xs: 1.18, ys: 0.95 },
  ranged: { s: 4.4, xs: 0.9, ys: 1.02, visor: "#3f7fbf" },
  swarm: { s: 3.2, xs: 1, ys: 1 },
  boss: { s: 8, xs: 1.1, ys: 1 },
  charger: { s: 4.6, xs: 1.08, ys: 0.95 },
  split: { s: 4.6, xs: 1, ys: 1 },
  splitling: { s: 3.2, xs: 1, ys: 1 },
  shield: { s: 4.8, xs: 1.1, ys: 0.98 },
  support: { s: 4.4, xs: 1, ys: 1, cross: true },
  summoner: { s: 4.8, xs: 1, ys: 1.12 },
  bomber: { s: 4.2, xs: 1, ys: 0.95 },
  sniper: { s: 4.6, xs: 0.8, ys: 1.15, visor: "#1e3a4a" },
  orbiter: { s: 4.2, xs: 1, ys: 1 },
  blinker: { s: 4.2, xs: 0.92, ys: 1.05 },
  leaper: { s: 4.6, xs: 1.05, ys: 1 },
  mage: { s: 4.4, xs: 0.95, ys: 1.1 },
  burrower: { s: 4.4, xs: 1.1, ys: 0.85 },
  commander: { s: 5.2, xs: 1.15, ys: 1 },
  drainer: { s: 4.2, xs: 0.9, ys: 1.05 },
  saboteur: { s: 4.2, xs: 0.9, ys: 1.05 },
  thief: { s: 3.8, xs: 0.85, ys: 1 },
  artillery: { s: 4.8, xs: 1.05, ys: 1 },
  necromancer: { s: 4.6, xs: 1, ys: 1.1 },
  traplayer: { s: 4.2, xs: 1, ys: 0.95 },
  siege: { s: 6, xs: 1.2, ys: 1 },
  cryo: { s: 4.4, xs: 0.95, ys: 1.05 },
  corrupter: { s: 4.4, xs: 1, ys: 1 },
  elitehunter: { s: 4.2, xs: 0.85, ys: 1.1 },
  minibrute: { s: 6.4, xs: 1.2, ys: 1 },
  minimage: { s: 5.6, xs: 1.05, ys: 1.12 },
  minisiege: { s: 6.8, xs: 1.25, ys: 1 },
};
/** Boss-pattern silhouettes + crown colors. Exported for tests. */
export const BOSS_FORM: Record<string, { s: number; xs: number; crown: string }> = {
  brute: { s: 8, xs: 1.15, crown: "#8a5a00" },
  hunter: { s: 7.6, xs: 0.95, crown: "#d93a3a" },
  swarmkeeper: { s: 8, xs: 1.05, crown: "#8a5a00" },
  artillerist: { s: 8.2, xs: 1.2, crown: "#c96a2e" },
  warden: { s: 8.4, xs: 1.25, crown: "#6b6558" },
  blink: { s: 7.8, xs: 1, crown: "#7a5fc0" },
  siegebreaker: { s: 8.8, xs: 1.3, crown: "#d93a3a" },
};

function mono(ctx: CanvasRenderingContext2D, size: number, weight = "bold"): void {
  ctx.font = `${weight} ${size}px ui-monospace,Menlo,Consolas,monospace`;
  ctx.textAlign = "center";
}

/** Tiny portrait badge painter (screen space, no ground shadow): Friend cameo
 * for plates and panels. Exported so UI portraits share one painter. */
export function drawPortraitBadge(
  ctx: CanvasRenderingContext2D,
  rows: readonly string[],
  cx: number, cy: number, scale = 1.4, dark = false,
): void {
  ctx.save();
  ctx.fillStyle = dark ? "#241a3d" : "#ffffff";
  for (let ry = 0; ry < 16; ry++) {
    const row = rows[ry] ?? "";
    for (let rx = 0; rx < 16; rx++) {
      if (row[rx] === "#") ctx.fillRect(cx + (rx - 8) * scale - 1, cy + (ry - 8) * scale - 1, scale + 2, scale + 2);
    }
  }
  ctx.fillStyle = dark ? "#100b1e" : INK;
  for (let ry = 0; ry < 16; ry++) {
    const row = rows[ry] ?? "";
    for (let rx = 0; rx < 16; rx++) {
      if (row[rx] === "#") ctx.fillRect(cx + (rx - 8) * scale, cy + (ry - 8) * scale, scale, scale);
    }
  }
  ctx.restore();
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {  // Pixel plate: stepped corners + double border (tamagotchi UI, not SaaS).
  const c = 6;
  ctx.fillStyle = "rgba(244,241,230,0.94)";
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2 + c, y - h / 2);
  ctx.lineTo(x + w / 2 - c, y - h / 2);
  ctx.lineTo(x + w / 2, y - h / 2 + c);
  ctx.lineTo(x + w / 2, y + h / 2 - c);
  ctx.lineTo(x + w / 2 - c, y + h / 2);
  ctx.lineTo(x - w / 2 + c, y + h / 2);
  ctx.lineTo(x - w / 2, y + h / 2 - c);
  ctx.lineTo(x - w / 2, y - h / 2 + c);
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = "rgba(20,20,20,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w / 2 + 3, y - h / 2 + 3, w - 6, h - 6);
}

export function drawIsoCombat(ctx: CanvasRenderingContext2D, assets: IsoAssets, run: RunState, view: CombatView): void {
  const { scene } = run;
  const t = run.time;
  ctx.save();
  if (run.shake > 0 && !view.reducedMotion) {
    ctx.translate((run.rng() - 0.5) * run.shake * 18, (run.rng() - 0.5) * run.shake * 18);
  }
  ctx.fillStyle = PAPER;
  ctx.fillRect(-40, -40, VIEW.width + 80, VIEW.height + 80);
  ctx.translate(-VIEW.x, -VIEW.y);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(assets.terrain, 0, 0);
  // Map-native dressing under everything (prop shadows ground the SDK set).
  const dress = groundDress(scene);
  drawGroundDress(ctx, scene, dress, t, view.reducedMotion,
    run.queue.length > 0 ? new Set(pendingGates(run).map(g => g.gate)) : undefined);
  drawPropShadows(ctx, scene);

  // Orbs + particles under actors.
  for (const o of run.orbs) {
    const [sx, sy] = toScreen(o.x, o.y);
    ctx.fillStyle = "#b98a1c";
    ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  if (!view.reducedMotion) {
    for (const p of run.particles) {
      const [sx, sy] = toScreen(p.x, p.y);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.ttl * 3));
      ctx.fillStyle = p.color;
      ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;
  }

  // Ground layer: corpses, vents, mud, telegraph rings.
  for (const c of run.corpses) {
    const [sx, sy] = toScreen(c.x, c.y);
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, c.ttl));
    ctx.fillStyle = "#241a3d";
    ctx.beginPath(); ctx.ellipse(sx, sy - 6, 16 * (c.scale / 4.4), 12 * (c.scale / 4.4), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const v of run.vents) {
    if (v.phase === "tele") {
      const k = 1 - v.t / 1.5;
      groundEllipse(ctx, v.x, v.y, 26, `rgba(217,95,75,${0.35 + k * 0.5})`, 2 + k * 2, [8, 5]);
    } else if (v.phase === "burst") {
      groundEllipse(ctx, v.x, v.y, 28, "#d95f4b", 4);
    } else if (!view.reducedMotion) {
      const [sx, sy] = toScreen(v.x, v.y);
      ctx.fillStyle = "rgba(120,90,60,0.5)";
      ctx.beginPath(); ctx.ellipse(sx, sy, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  for (const m of scene.mud) {
    const [sx, sy] = toScreen(m.x, m.y);
    ctx.save();
    ctx.fillStyle = "rgba(90,110,140,0.30)";
    ctx.beginPath(); ctx.ellipse(sx, sy, m.r * 1.32, m.r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(90,110,140,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.stroke();
    ctx.restore();
  }
  // Ground zones: mage fire (red), freeze fields (blue), gravity wells (purple).
  // Each matches its HUD pixel icon: freeze snowflake, gravity inward ticks.
  for (const z of run.zones) {
    const k = Math.max(0, Math.min(1, z.ttl / z.max));
    const col = z.kind === "mage" ? `rgba(217,95,75,${0.35 + (1 - k) * 0.3})`
      : z.kind === "freeze" ? `rgba(120,170,220,${0.30 + 0.25 * k})`
      : `rgba(122,95,192,${0.30 + 0.25 * k})`;
    groundEllipse(ctx, z.x, z.y, z.r * (z.kind === "mage" ? (0.6 + (1 - k) * 0.4) : 1), col, 2, z.kind === "mage" ? [] : [10, 6]);
    if (!view.reducedMotion) {
      const [zx, zy] = toScreen(z.x, z.y);
      if (z.kind === "freeze") {
        // Snowflake pixel cross (matches freeze icon).
        ctx.fillStyle = "rgba(220,240,255,0.9)";
        ctx.fillRect(Math.round(zx) - 8, Math.round(zy) - 10 - 1, 16, 2);
        ctx.fillRect(Math.round(zx) - 1, Math.round(zy) - 10 - 8, 2, 16);
        ctx.fillRect(Math.round(zx) - 5, Math.round(zy) - 10 - 5, 3, 3);
        ctx.fillRect(Math.round(zx) + 2, Math.round(zy) - 10 - 5, 3, 3);
        ctx.fillRect(Math.round(zx) - 5, Math.round(zy) - 10 + 2, 3, 3);
        ctx.fillRect(Math.round(zx) + 2, Math.round(zy) - 10 + 2, 3, 3);
      } else if (z.kind === "gravity") {
        // Inward pixel ticks (matches gravity icon).
        ctx.fillStyle = "rgba(201,168,255,0.9)";
        const r = Math.round(z.r * 0.55 * (0.7 + 0.3 * Math.sin(t * 4)));
        ctx.fillRect(Math.round(zx) - r, Math.round(zy) - 12, 8, 3);
        ctx.fillRect(Math.round(zx) + r - 8, Math.round(zy) - 12, 8, 3);
        ctx.fillRect(Math.round(zx) - 2, Math.round(zy) - 12 - r * 0.5, 4, 8);
      }
    }
    if (z.kind === "mage" && !view.reducedMotion) {
      const [zx, zy] = toScreen(z.x, z.y);
      ctx.fillStyle = "rgba(217,95,75,0.7)";
      for (let i = 0; i < 3; i++) {
        const a = t * 5 + i * 2.1;
        ctx.fillRect(zx + Math.cos(a) * z.r * 0.5, zy - 10 + Math.sin(a) * z.r * 0.25, 3, 3);
      }
    }
  }
  const bossSlam = run.enemies.find(e => e.kind === "boss" && e.slamT > 0);
  if (bossSlam) {
    const k = 1 - bossSlam.slamT / 1.2;
    groundEllipse(ctx, bossSlam.slamX, bossSlam.slamY, 48, `rgba(217,95,75,${0.4 + k * 0.5})`, 3, [12, 7]);
  }

  // Depth-sorted world: SDK props + structures + actors, ordered by x+y.
  const [fx, fy] = friendPos(run);
  const ffacing = friendFacing(run);
  const fwalking = friendWalking(run);
  const layers: { depth: number; draw: () => void }[] = [];
  for (const o of assets.objects) {
    layers.push({ depth: o.depth, draw: () => { ctx.drawImage(o.image, 0, 0); } });
  }
  for (const d of dressPropLayers(scene, dress, view.reducedMotion)) {
    layers.push({ depth: d.depth - 0.25, draw: () => d.draw(ctx, t) });
  }
  for (const s of structureLayers(scene.anchors,
    { turret: run.turretLvl, wall: run.wallLvl, healer: run.healerLvl, collector: run.collectorLvl, frost: run.frostLvl },
    run.turretAngle, view.reducedMotion, run.home, run.structHp, t)) {
    layers.push({ depth: s.depth - 0.5, draw: () => s.draw(ctx, t) });
  }
  if (run.phase === "shop") {
    const [tx, ty] = scene.anchors.trader;
    layers.push({ depth: tx + ty, draw: () => drawTrader(ctx, scene, t, view.reducedMotion) });
  }
  const sortedFoes = [...run.enemies].sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const e of sortedFoes) {
    layers.push({ depth: e.x + e.y, draw: () => drawEnemy(ctx, run, e, view, fx, fy) });
  }
  for (const c of run.companions) {
    layers.push({
      depth: c.x + c.y,
      draw: () => drawPixelFriend(ctx, frameRows(view.art, ffacing, true, t, view.reducedMotion),
        view.seedNum, c.x, c.y, { scale: 2.6 }),
    });
  }
  layers.push({
    depth: fx + fy + 0.5,
    draw: () => {
      const hop = run.celebrateT > 0 && !view.reducedMotion ? Math.abs(Math.sin(run.celebrateT * 10)) * 26 : 0;
      // Attack response: 1-2px recoil squash + directional lean + brief flash.
      // Never distorts canonical art beyond a subtle pop.
      const atk = run.muzzleT > 0 && !view.reducedMotion ? 1 - run.muzzleT / 0.09 : 0;
      const squashY = atk > 0 ? 1 - atk * 0.06 : 1;
      const squashX = atk > 0 ? 1 + atk * 0.05 : 1;
      const lean = atk > 0 ? Math.cos(run.aimAngle) * atk * 2 : 0;
      drawPixelFriend(ctx, frameRows(view.art, ffacing, fwalking, t, view.reducedMotion),
        view.seedNum, fx + lean, fy, { lift: hop, blink: (t % 3.7) < 0.12, xScale: squashX, yScale: squashY, flash: atk > 0.6 });
      drawBlaster(ctx, run, fx, fy, view.gear.family, run.weaponTint);
      drawWornGear(ctx, fx, fy, view.gear, t, view.reducedMotion);
      const [sx, sy] = toScreen(fx, fy);
      // Victory sparkles rise off the Friend (pure function of time).
      if (run.celebrateT > 0 && !view.reducedMotion) {
        ctx.fillStyle = "#ffd964";
        for (let i = 0; i < 6; i++) {
          const k = ((t * 1.6 + i * 0.35) % 1.2) / 1.2;
          const px = sx + Math.sin(i * 2.4) * (20 + k * 26);
          const py = sy - 40 - k * 70;
          ctx.globalAlpha = 1 - k;
          ctx.fillRect(Math.round(px) - 2, Math.round(py), 5, 2);
          ctx.fillRect(Math.round(px), Math.round(py) - 2, 2, 5);
        }
        ctx.globalAlpha = 1;
      }
      mono(ctx, 10);
      const you = "YOU";
      const yw = ctx.measureText(you).width + 12;
      pill(ctx, sx, sy - 102, yw, 15);
      ctx.fillStyle = INK;
      ctx.fillText(you, sx, sy - 99);
      if (run.hp < run.maxHp) {
        ctx.fillStyle = INK;
        ctx.fillRect(sx - 22, sy - 92, 44, 6);
        ctx.fillStyle = run.hp < run.maxHp * 0.3 ? "#d95f4b" : "#5da24a";
        ctx.fillRect(sx - 21, sy - 91, 42 * Math.max(0, run.hp / run.maxHp), 4);
      }
    },
  });
  layers.sort((a, b) => a.depth - b.depth);
  for (const l of layers) l.draw();

  // Projectiles above the world (shape varies by attack style).
  const fam = run.derived.family;
  for (const s of run.shots) {
    const [sx, sy] = toScreen(s.x, s.y, 10);
    if (!view.reducedMotion) {
      const [px2, py2] = toScreen(s.x - s.vx * 0.035, s.y - s.vy * 0.035, 10);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = fam === "needle" ? 2 : 3;
      ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(sx, sy); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = s.crit ? "#8a5a00" : s.color;
    const ix = Math.round(sx), iy = Math.round(sy);
    if (fam === "needle") {
      const ang = Math.atan2(s.vy, s.vx);
      const c = Math.cos(ang), si = Math.sin(ang);
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(Math.atan2((si - c * 0.3), (c + si * 0.3)));
      ctx.fillRect(-7, -2, 14, 4);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, -1, 5, 2);
      ctx.restore();
    } else if (fam === "heavy" || fam === "buster") {
      // Chunky stepped pulse: no smooth circle.
      ctx.fillRect(ix - 5, iy - 5, 10, 10);
      ctx.fillRect(ix - 7, iy - 3, 14, 6);
      ctx.fillRect(ix - 3, iy - 7, 6, 14);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      ctx.strokeRect(ix - 5.5, iy - 5.5, 11, 11);
      ctx.fillStyle = "#fff";
      ctx.fillRect(ix - 1, iy - 1, 3, 3);
    } else if (fam === "spark") {
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(t * 9);
      ctx.fillRect(-5, -2, 10, 4);
      ctx.fillRect(-2, -5, 4, 10);
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.fillRect(ix - 1, iy - 1, 2, 2);
    } else {
      // Pixel spark: stepped cross, not a smooth bubble.
      const r = fam === "rapid" ? 3 : 4;
      ctx.fillRect(ix - r, iy - 2, r * 2, 4);
      ctx.fillRect(ix - 2, iy - r, 4, r * 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(ix - 1, iy - 1, 2, 2);
    }
  }
  for (const p of run.pickups) drawPickup(ctx, p, t);
  // Traps (friendly spikes) + hostile mines: chunky pixel markers, never subtle.
  for (const tr of run.traps) {
    const [sx, sy] = toScreen(tr.x, tr.y);
    if (tr.foe) {
      ctx.fillStyle = "#4a2e1e";
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sx, sy - 4, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d93a3a";
      ctx.fillRect(sx - 1.5, sy - 12, 3, 5);
    } else {
      ctx.fillStyle = "#2f6b2f";
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
      for (const ox of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(sx + ox - 4, sy - 2); ctx.lineTo(sx + ox, sy - 12); ctx.lineTo(sx + ox + 4, sy - 2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
  }
  // Wisps: small bright companions with orbit trails.
  for (const w of run.wisps) {
    const [sx, sy] = toScreen(w.x, w.y, 8);
    ctx.fillStyle = "#9db8dd";
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(sx - 1, sy - 1, 2, 0, Math.PI * 2); ctx.fill();
  }
  // Damaged structures: HP bar above the anchor.
  for (const id of Object.keys(run.structMax)) {
    const max = run.structMax[id] ?? 0;
    const cur = run.structHp[id] ?? max;
    if (max <= 0 || cur >= max) continue;
    const a = run.scene.anchors[id as keyof typeof run.scene.anchors];
    if (!a) continue;
    const [sx, sy] = toScreen(a[0], a[1]);
    ctx.fillStyle = INK;
    ctx.fillRect(sx - 22, sy - 92, 44, 6);
    ctx.fillStyle = cur / max > 0.4 ? "#5da24a" : "#d95f4b";
    ctx.fillRect(sx - 21, sy - 91, 42 * Math.max(0, cur / max), 4);
  }
  if (run.tapMark) {
    const k = run.tapMark.ttl / 0.5;
    groundEllipse(ctx, run.tapMark.x, run.tapMark.y, 10 + (1 - k) * 14, `rgba(93,162,74,${k})`, 2);
  }
  // Lane warnings: gates with enemies still inbound pulse while the wave lands.
  if (run.queue.length > 0 && !view.reducedMotion) {
    const blink = 0.55 + 0.45 * Math.sin(t * 6);
    mono(ctx, 12);
    for (const { gate, count } of pendingGates(run)) {
      const g = run.scene.gates[gate % Math.max(1, run.scene.gates.length)];
      if (!g) continue;
      const [sx, sy] = toScreen(g[0], g[1], 26);
      ctx.save();
      ctx.globalAlpha = blink;
      ctx.fillStyle = "#d95f4b";
      ctx.strokeStyle = INK; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy - 12); ctx.lineTo(sx + 10, sy); ctx.lineTo(sx, sy + 12); ctx.lineTo(sx - 10, sy);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillText(`!${count}`, sx, sy + 4);
      ctx.restore();
    }
  }
  for (const b of run.bolts) {
    const [sx, sy] = toScreen(b.x, b.y, 10);
    const ix = Math.round(sx), iy = Math.round(sy);
    ctx.fillStyle = "#5b3f8c";
    ctx.fillRect(ix - 4, iy - 4, 8, 8);
    ctx.fillRect(ix - 6, iy - 2, 12, 4);
    ctx.fillStyle = "#ff4545";
    ctx.fillRect(ix - 2, iy - 2, 4, 4);
  }

  // Beam flash: stepped pixel lane along the last beam angle (matches beam icon).
  if (run.beamT > 0) {
    const k = run.beamT / 0.12;
    const [fx2, fy2] = [fx, fy];
    const [ax, ay] = toScreen(fx2, fy2, 10);
    const [bx, by] = toScreen(fx2 + Math.cos(run.beamAng) * 200, fy2 + Math.sin(run.beamAng) * 200, 10);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.65 * k;
    // Chunky stepped beam: 3 parallel pixel strips, no smooth gradient.
    const dx = bx - ax, dy = by - ay;
    const n = Math.hypot(dx, dy) || 1;
    const px = -dy / n, py = dx / n;
    ctx.fillStyle = run.weaponTint;
    for (const off of [-4, 0, 4]) {
      ctx.fillRect(Math.round(ax + px * off) - 2, Math.round(ay + py * off) - 2, 4, 4);
      ctx.fillRect(Math.round((ax + bx) / 2 + px * off) - 3, Math.round((ay + by) / 2 + py * off) - 3, 6, 6);
      ctx.fillRect(Math.round(bx + px * off) - 2, Math.round(by + py * off) - 2, 4, 4);
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(Math.round(ax) - 1, Math.round(ay) - 1, 3, 3);
    ctx.fillRect(Math.round((ax + bx) / 2) - 1, Math.round((ay + by) / 2) - 1, 3, 3);
    ctx.restore();
  }
  // Orbital ring orbs (opt-in Orbiting Charms style only).
  if (run.derived.family === "orbital") {
    const count = Math.max(2, projectileCount(run));
    for (let i = 0; i < count; i++) {
      const a = t * 2.4 + (i * Math.PI * 2) / count;
      const [sx, sy] = toScreen(fx + Math.cos(a) * 58, fy + Math.sin(a) * 58, 8);
      const ix = Math.round(sx), iy = Math.round(sy);
      ctx.fillStyle = run.weaponTint;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.fillRect(ix - 4, iy - 4, 8, 8);
      ctx.strokeRect(ix - 4.5, iy - 4.5, 9, 9);
      ctx.fillStyle = "#fff";
      ctx.fillRect(ix - 1, iy - 1, 2, 2);
    }
  }
  // Aim marker: subtle diamond where the cursor points (manual mouse only).
  if (run.manual && run.aimMode === "mouse" && run.aimSet && !view.reducedMotion) {
    const [sx, sy] = toScreen(run.aimWorld[0], run.aimWorld[1], 6);
    ctx.save();
    ctx.strokeStyle = "#5da24a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 8); ctx.lineTo(sx + 8, sy); ctx.lineTo(sx, sy + 8); ctx.lineTo(sx - 8, sy);
    ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  // Floating numbers (capped, mono, minimal).
  for (const f of run.floaters) {
    const [sx, sy] = toScreen(f.x, f.y);
    ctx.globalAlpha = Math.max(0, Math.min(1, f.ttl * 2));
    mono(ctx, f.big ? 17 : 12);
    ctx.fillStyle = INK;
    ctx.fillText(f.text, sx + 1, sy + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, sx, sy);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Frame-space overlays: announcements + boss bar.
  for (const a of run.announce) {
    const alpha = Math.max(0, Math.min(1, a.ttl / (a.max * 0.5)));
    ctx.save();
    ctx.globalAlpha = alpha;
    const boss = /BOSS/i.test(a.text);
    mono(ctx, 24);
    const w = ctx.measureText(a.text).width + 44;
    pill(ctx, VIEW.width / 2, 64, w, 44);
    if (boss) {
      ctx.strokeStyle = "#d95f4b";
      ctx.lineWidth = 3;
      const bx = VIEW.width / 2 - w / 2, by = 64 - 22;
      ctx.beginPath();
      ctx.moveTo(bx + 8, by); ctx.lineTo(bx + w - 8, by);
      ctx.lineTo(bx + w, by + 8); ctx.lineTo(bx + w, by + 36);
      ctx.lineTo(bx + w - 8, by + 44); ctx.lineTo(bx + 8, by + 44);
      ctx.lineTo(bx, by + 36); ctx.lineTo(bx, by + 8);
      ctx.closePath(); ctx.stroke();
    }
    ctx.fillStyle = INK;
    ctx.fillText(a.text, VIEW.width / 2, 60);
    if (a.sub) {
      mono(ctx, 12, "normal");
      ctx.fillText(a.sub, VIEW.width / 2, 80);
    }
    ctx.restore();
  }
  const boss = run.enemies.find(e => e.kind === "boss");
  if (boss) {
    mono(ctx, 12);
    ctx.fillStyle = INK;
    ctx.fillText("SHADOW BOSS", VIEW.width / 2, 112);
    ctx.fillStyle = INK;
    ctx.fillRect(VIEW.width / 2 - 130, 118, 260, 10);
    ctx.fillStyle = "#d95f4b";
    ctx.fillRect(VIEW.width / 2 - 128, 120, 256 * Math.max(0, boss.hp / boss.maxHp), 6);
  }
}

/**
 * Role eye colors: most Shadows burn ember-red; specialists read by gaze.
 * Bosses stay menacing red — crowns + rune rings carry their identity.
 */
export const KIND_EYE: Record<string, string> = {
  support: "#ffd964",
  sniper: "#7dd7ff",
  necromancer: "#c9a8ff",
  summoner: "#c9a8ff",
  mage: "#c9a8ff",
  commander: "#ff9045",
  drainer: "#7dd7ff",
  cryo: "#bfe8ff",
};

/** Thin role ring under specialists (glance-readable archetypes). */
const KIND_RING: Record<string, string> = {
  support: "rgba(255,217,100,0.55)",
  commander: "rgba(255,144,69,0.55)",
  sniper: "rgba(125,215,255,0.55)",
  mage: "rgba(201,168,255,0.55)",
  necromancer: "rgba(201,168,255,0.55)",
  drainer: "rgba(125,215,255,0.55)",
  summoner: "rgba(201,168,255,0.5)",
};

/**
 * ORIGINAL Shadow Friend bodies: each archetype gets its own recognizable
 * silhouette in a Rare Friends-adjacent dark-plum pixel language. The player's
 * canonical Friend art is NEVER reused here — the player stays special.
 * (SDK NOTICE.md permits custom character representations.)
 */
function drawShadowBody(
  ctx: CanvasRenderingContext2D, kind: string, pattern: string | null,
  sx: number, sy: number, form: { s: number; xs: number; ys: number },
  giant: number, t: number, walkPhase: number, flash: boolean, reducedMotion: boolean,
  eye?: string,
): void {
  const w = form.s * 9 * form.xs * giant;
  const h = form.s * 9 * form.ys * giant;
  const bob = reducedMotion ? 0 : Math.sin(t * 6 + walkPhase) * h * 0.03;
  const body = "#241a3d";
  const rim = "#100b1e";
  const eyeCol = eye ?? "#ff4545";
  ctx.save();
  ctx.translate(sx, sy + bob);
  if (flash) {
    ctx.fillStyle = "rgba(232,228,218,0.85)";
    ctx.beginPath(); ctx.ellipse(0, -h * 0.45, w * 0.62, h * 0.55, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = body;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2;
  const ellipse = (x: number, y: number, rx: number, ry: number) => {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  };
  const eyes = (dx: number, dy: number, gap: number, s = 3.2) => {
    ctx.fillStyle = eyeCol;
    ctx.fillRect(-gap / 2 - s / 2 + dx, dy, s, s);
    ctx.fillRect(gap / 2 - s / 2 + dx, dy, s, s);
    ctx.fillStyle = body;
  };
  if (flash) {
    // Pixel hit star over the impact point.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-9, -h * 0.72 - 2, 18, 4);
    ctx.fillRect(-2, -h * 0.72 - 9, 4, 18);
  }
  switch (kind) {
    case "swift": // small light dart, long stride fins
      ellipse(0, -h * 0.42, w * 0.30, h * 0.40);
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.moveTo(-w * 0.28, -h * 0.5); ctx.lineTo(-w * 0.52, -h * 0.28); ctx.lineTo(-w * 0.28, -h * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.28, -h * 0.5); ctx.lineTo(w * 0.52, -h * 0.28); ctx.lineTo(w * 0.28, -h * 0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
      eyes(0, -h * 0.5, w * 0.28);
      break;
    case "tank": // large broad slab + brow plate
      ellipse(0, -h * 0.42, w * 0.46, h * 0.40);
      ctx.fillStyle = "#31224d";
      ctx.fillRect(-w * 0.34, -h * 0.72, w * 0.68, h * 0.10);
      ctx.strokeRect(-w * 0.34, -h * 0.72, w * 0.68, h * 0.10);
      eyes(0, -h * 0.5, w * 0.30, 4);
      break;
    case "ranged": // visor band + barrel nub
      ellipse(0, -h * 0.44, w * 0.34, h * 0.42);
      ctx.fillStyle = "#3f7fbf";
      ctx.fillRect(-w * 0.30, -h * 0.62, w * 0.60, h * 0.12);
      ctx.strokeRect(-w * 0.30, -h * 0.62, w * 0.60, h * 0.12);
      ctx.fillStyle = "#222b34";
      ctx.fillRect(w * 0.18, -h * 0.44, w * 0.30, h * 0.08);
      eyes(0, -h * 0.48, w * 0.22, 2.6);
      break;
    case "sniper": // tall narrow + long barrel
      ellipse(0, -h * 0.48, w * 0.26, h * 0.46);
      ctx.fillStyle = "#222b34";
      ctx.fillRect(-2, -h * 0.55, w * 0.55, 4);
      ctx.fillStyle = "#1e3a4a";
      ctx.fillRect(-w * 0.2, -h * 0.66, w * 0.40, h * 0.10);
      ctx.strokeRect(-w * 0.2, -h * 0.66, w * 0.40, h * 0.10);
      eyes(0, -h * 0.52, w * 0.20, 2.6);
      break;
    case "swarm": case "splitling": // tiny shard
      ctx.beginPath(); ctx.moveTo(0, -h * 0.8); ctx.lineTo(w * 0.3, -h * 0.25); ctx.lineTo(-w * 0.3, -h * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
      eyes(0, -h * 0.42, w * 0.20, 2.4);
      break;
    case "charger": // forward wedge + horn
      ctx.beginPath(); ctx.moveTo(w * 0.5, -h * 0.4); ctx.lineTo(-w * 0.35, -h * 0.75); ctx.lineTo(-w * 0.35, -h * 0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#c96a2e";
      ctx.beginPath(); ctx.moveTo(w * 0.5, -h * 0.4); ctx.lineTo(w * 0.28, -h * 0.5); ctx.lineTo(w * 0.28, -h * 0.3); ctx.closePath(); ctx.fill();
      eyes(w * 0.05, -h * 0.48, w * 0.24);
      break;
    case "split": // double lobe (reads as splitter before it pops)
      ellipse(-w * 0.16, -h * 0.42, w * 0.24, h * 0.38);
      ellipse(w * 0.16, -h * 0.42, w * 0.24, h * 0.38);
      eyes(0, -h * 0.5, w * 0.30);
      break;
    case "shield": // body + front plate
      ellipse(0, -h * 0.42, w * 0.36, h * 0.40);
      ctx.fillStyle = "#3a3f4a";
      ctx.strokeStyle = rim;
      ctx.beginPath(); ctx.ellipse(w * 0.30, -h * 0.42, w * 0.12, h * 0.32, 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      eyes(-w * 0.05, -h * 0.5, w * 0.26);
      break;
    case "support": // staff + cross beacon
      ellipse(0, -h * 0.42, w * 0.32, h * 0.40);
      ctx.fillStyle = "#6b6558";
      ctx.fillRect(w * 0.30, -h * 0.95, 3, h * 0.6);
      ctx.fillStyle = "#d95f4b";
      ctx.fillRect(w * 0.30 - 2, -h * 1.02, 7, 14);
      ctx.fillRect(w * 0.30 - 6, -h * 0.98, 15, 6);
      eyes(0, -h * 0.5, w * 0.26);
      break;
    case "summoner": // hood + halo ring
      ctx.beginPath(); ctx.moveTo(0, -h * 0.95); ctx.lineTo(w * 0.34, -h * 0.2); ctx.lineTo(-w * 0.34, -h * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#7a5fc0";
      ctx.beginPath(); ctx.ellipse(0, -h * 0.92, w * 0.22, h * 0.08, 0, 0, Math.PI * 2); ctx.stroke();
      eyes(0, -h * 0.5, w * 0.22);
      break;
    case "bomber": // round volatile pack + fuse spark
      ellipse(0, -h * 0.38, w * 0.38, h * 0.36);
      ctx.fillStyle = "#5e2e1e";
      ctx.beginPath(); ctx.arc(0, -h * 0.55, w * 0.16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e8c53a";
      ctx.beginPath(); ctx.arc(w * 0.05, -h * 0.78, 3, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.42, w * 0.28);
      break;
    case "orbiter": // ring + core
      ellipse(0, -h * 0.42, w * 0.30, h * 0.38);
      ctx.strokeStyle = "#7db83e";
      ctx.beginPath(); ctx.ellipse(0, -h * 0.42, w * 0.48, h * 0.20, -0.4, 0, Math.PI * 2); ctx.stroke();
      eyes(0, -h * 0.5, w * 0.24);
      break;
    case "blinker": // split glitch halves
      ctx.save(); ctx.translate(-w * 0.08, 0); ellipse(0, -h * 0.42, w * 0.22, h * 0.40); ctx.restore();
      ctx.save(); ctx.translate(w * 0.08, 0); ctx.globalAlpha = 0.75; ellipse(0, -h * 0.44, w * 0.22, h * 0.38); ctx.restore();
      eyes(0, -h * 0.5, w * 0.26);
      break;
    case "leaper": // compressed spring + haunches
      ellipse(0, -h * 0.36, w * 0.36, h * 0.32);
      ctx.fillStyle = body;
      ctx.fillRect(-w * 0.34, -h * 0.30, w * 0.2, h * 0.14);
      ctx.fillRect(w * 0.14, -h * 0.30, w * 0.2, h * 0.14);
      eyes(0, -h * 0.46, w * 0.26);
      break;
    case "mage": // pointed hat + staff orb
      ellipse(0, -h * 0.40, w * 0.32, h * 0.38);
      ctx.fillStyle = "#3a1e4d";
      ctx.beginPath(); ctx.moveTo(0, -h * 1.0); ctx.lineTo(w * 0.22, -h * 0.55); ctx.lineTo(-w * 0.22, -h * 0.55); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#c9a8ff";
      ctx.beginPath(); ctx.arc(w * 0.34, -h * 0.6, 4, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.48, w * 0.24);
      break;
    case "burrower": // low mound + claw ridges
      ellipse(0, -h * 0.30, w * 0.42, h * 0.28);
      for (let i = -1; i <= 1; i++) {
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(i * w * 0.16, -h * 0.5); ctx.lineTo(i * w * 0.16 + 5, -h * 0.68); ctx.lineTo(i * w * 0.16 + 10, -h * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      eyes(0, -h * 0.36, w * 0.26);
      break;
    case "commander": // broad + banner crest
      ellipse(0, -h * 0.44, w * 0.44, h * 0.42);
      ctx.fillStyle = "#6b2e2e";
      ctx.fillRect(-w * 0.06, -h * 1.02, w * 0.12, h * 0.30);
      ctx.beginPath(); ctx.moveTo(-w * 0.06, -h * 1.02); ctx.lineTo(-w * 0.30, -h * 0.94); ctx.lineTo(-w * 0.06, -h * 0.86); ctx.closePath(); ctx.fill();
      eyes(0, -h * 0.52, w * 0.30, 4);
      break;
    case "drainer": // narrow + tendril
      ellipse(0, -h * 0.44, w * 0.28, h * 0.42);
      ctx.strokeStyle = "#3f7fbf";
      ctx.beginPath(); ctx.moveTo(0, -h * 0.5); ctx.quadraticCurveTo(w * 0.4, -h * 0.6, w * 0.5, -h * 0.3); ctx.stroke();
      eyes(0, -h * 0.52, w * 0.22);
      break;
    case "saboteur": // slim + sparking wrench arm
      ellipse(0, -h * 0.42, w * 0.30, h * 0.40);
      ctx.strokeStyle = "#e8c53a";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w * 0.2, -h * 0.4); ctx.lineTo(w * 0.45, -h * 0.6); ctx.stroke();
      ctx.fillStyle = "#e8c53a";
      ctx.beginPath(); ctx.arc(w * 0.45, -h * 0.6, 2.5, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.5, w * 0.24);
      break;
    case "thief": // small + sack lump
      ellipse(0, -h * 0.40, w * 0.28, h * 0.36);
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.ellipse(w * 0.32, -h * 0.3, w * 0.14, h * 0.14, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      eyes(-w * 0.04, -h * 0.48, w * 0.22, 2.6);
      break;
    case "artillery": // squat + mortar tube
      ellipse(0, -h * 0.36, w * 0.38, h * 0.34);
      ctx.fillStyle = "#222b34";
      ctx.save(); ctx.translate(0, -h * 0.55); ctx.rotate(-0.5); ctx.fillRect(-4, -16, 8, 22); ctx.restore();
      eyes(0, -h * 0.44, w * 0.26);
      break;
    case "necromancer": // tattered cloak + skull staff
      ctx.beginPath(); ctx.moveTo(0, -h * 0.95); ctx.lineTo(w * 0.3, -h * 0.2); ctx.lineTo(-w * 0.3, -h * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#e8e4da";
      ctx.beginPath(); ctx.arc(-w * 0.32, -h * 0.6, 3.5, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.5, w * 0.22);
      break;
    case "traplayer": // low + mine satchel
      ellipse(0, -h * 0.34, w * 0.36, h * 0.32);
      ctx.fillStyle = "#6b6558";
      ctx.fillRect(-w * 0.3, -h * 0.32, 8, 6);
      ctx.fillStyle = "#d93a3a";
      ctx.beginPath(); ctx.arc(-w * 0.3 + 4, -h * 0.36, 2, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.44, w * 0.26);
      break;
    case "siege": // massive ram prow
      ellipse(0, -h * 0.40, w * 0.46, h * 0.38);
      ctx.fillStyle = "#3a3f45";
      ctx.beginPath(); ctx.moveTo(0, -h * 0.75); ctx.lineTo(w * 0.2, -h * 0.35); ctx.lineTo(-w * 0.2, -h * 0.35); ctx.closePath(); ctx.fill(); ctx.stroke();
      eyes(0, -h * 0.48, w * 0.30, 4.5);
      break;
    case "cryo": // frost shards + cold core
      ellipse(0, -h * 0.42, w * 0.32, h * 0.40);
      ctx.fillStyle = "#9db8dd";
      for (const ox of [-0.2, 0, 0.2]) {
        ctx.beginPath(); ctx.moveTo(w * ox, -h * 0.7); ctx.lineTo(w * ox + 4, -h * 0.9); ctx.lineTo(w * ox + 8, -h * 0.7); ctx.closePath(); ctx.fill();
      }
      eyes(0, -h * 0.5, w * 0.24);
      break;
    case "corrupter": // raw + void maw
      ellipse(0, -h * 0.42, w * 0.34, h * 0.40);
      ctx.fillStyle = "#100b1e";
      ctx.beginPath(); ctx.ellipse(0, -h * 0.38, w * 0.12, h * 0.10, 0, 0, Math.PI * 2); ctx.fill();
      eyes(0, -h * 0.56, w * 0.26);
      break;
    case "elitehunter": // lean + twin blades
      ellipse(0, -h * 0.44, w * 0.28, h * 0.42);
      ctx.fillStyle = body;
      ctx.beginPath(); ctx.moveTo(-w * 0.4, -h * 0.5); ctx.lineTo(-w * 0.6, -h * 0.3); ctx.lineTo(-w * 0.4, -h * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w * 0.4, -h * 0.5); ctx.lineTo(w * 0.6, -h * 0.3); ctx.lineTo(w * 0.4, -h * 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
      eyes(0, -h * 0.52, w * 0.22);
      break;
    case "minibrute": // brute prow, mini crown nubs
      ellipse(0, -h * 0.42, w * 0.44, h * 0.40);
      ctx.fillStyle = "#6b2e2e";
      for (const ox of [-0.18, 0.18]) {
        ctx.beginPath(); ctx.moveTo(w * ox - 5, -h * 0.8); ctx.lineTo(w * ox, -h * 0.95); ctx.lineTo(w * ox + 5, -h * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      eyes(0, -h * 0.5, w * 0.30, 4.5);
      break;
    case "minimage": // choir hood + triple halo
      ctx.beginPath(); ctx.moveTo(0, -h * 0.95); ctx.lineTo(w * 0.32, -h * 0.2); ctx.lineTo(-w * 0.32, -h * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#c9a8ff";
      ctx.lineWidth = 2;
      for (const oy of [-0.9, -0.98, -1.06]) {
        ctx.beginPath(); ctx.ellipse(0, h * oy, w * 0.16, h * 0.05, 0, 0, Math.PI * 2); ctx.stroke();
      }
      eyes(0, -h * 0.5, w * 0.22);
      break;
    case "minisiege": // ram + banner
      ellipse(0, -h * 0.40, w * 0.46, h * 0.38);
      ctx.fillStyle = "#3a3f45";
      ctx.beginPath(); ctx.moveTo(0, -h * 0.78); ctx.lineTo(w * 0.2, -h * 0.38); ctx.lineTo(-w * 0.2, -h * 0.38); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d93a3a";
      ctx.fillRect(w * 0.3, -h * 0.9, w * 0.1, h * 0.25);
      eyes(0, -h * 0.48, w * 0.30, 4.5);
      break;
    case "boss":
      ellipse(0, -h * 0.44, w * 0.46, h * 0.42);
      if (pattern === "hunter") {
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(-w * 0.5, -h * 0.4); ctx.lineTo(-w * 0.72, -h * 0.2); ctx.lineTo(-w * 0.5, -h * 0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(w * 0.5, -h * 0.4); ctx.lineTo(w * 0.72, -h * 0.2); ctx.lineTo(w * 0.5, -h * 0.15); ctx.closePath(); ctx.fill(); ctx.stroke();
      } else if (pattern === "artillerist") {
        ctx.fillStyle = "#222b34";
        ctx.fillRect(-w * 0.5, -h * 0.5, w * 0.22, h * 0.10);
        ctx.fillRect(w * 0.28, -h * 0.5, w * 0.22, h * 0.10);
      } else if (pattern === "warden") {
        ctx.strokeStyle = "#6b6558";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(0, -h * 0.44, w * 0.58, h * 0.48, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (pattern === "blink") {
        ctx.save(); ctx.globalAlpha = 0.6; ctx.translate(w * 0.12, 0);
        ellipse(0, -h * 0.44, w * 0.34, h * 0.40); ctx.restore();
      } else if (pattern === "swarmkeeper") {
        ellipse(-w * 0.3, -h * 0.3, w * 0.16, h * 0.16);
        ellipse(w * 0.3, -h * 0.3, w * 0.16, h * 0.16);
      } else if (pattern === "siegebreaker") {
        ctx.fillStyle = "#3a3f45";
        ctx.beginPath(); ctx.moveTo(0, -h * 0.85); ctx.lineTo(w * 0.22, -h * 0.4); ctx.lineTo(-w * 0.22, -h * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#d93a3a";
        ctx.fillRect(-w * 0.4, -h * 0.62, w * 0.12, h * 0.2);
      }
      eyes(0, -h * 0.52, w * 0.30, 5);
      break;
    default: // shadow: balanced Friend-like but ORIGINAL silhouette
      ellipse(0, -h * 0.42, w * 0.34, h * 0.40);
      ellipse(-w * 0.26, -h * 0.72, w * 0.10, h * 0.10);
      ellipse(w * 0.26, -h * 0.72, w * 0.10, h * 0.10);
      eyes(0, -h * 0.5, w * 0.26);
      break;
  }
  ctx.restore();
}

function drawEnemy(ctx: CanvasRenderingContext2D, run: RunState, e: Enemy, view: CombatView, fx: number, fy: number): void {
  const giant = e.elite && e.eliteMod === "giant" ? 1.35 : 1;
  const form = KIND_FORM[e.kind] ?? KIND_FORM.shadow;
  const bossForm = e.kind === "boss" ? BOSS_FORM[e.pattern ?? "brute"] ?? BOSS_FORM.brute : null;
  const scale = (bossForm ? bossForm.s : form.s) * giant;
  const xs = (bossForm ? bossForm.xs : form.xs) * (giant > 1 ? 1.1 : 1);
  let ys = form.ys;
  // Leaper crouch / airborne read.
  let lift = 0;
  if (e.kind === "leaper") {
    if (e.leapState === "tele") ys *= 0.85;
    else if (e.leapState === "air") lift = 34;
  }
  // Burrower hides underground except when roaming/attacking.
  const burrowed = e.kind === "burrower" && e.burrowState !== "roam";
  // Melee lunge toward the Friend.
  let lx = e.x, ly = e.y;
  if (e.lungeT > 0) {
    const dx = fx - e.x, dy = fy - e.y;
    const n = Math.max(1, Math.hypot(dx, dy));
    const k = (e.lungeT / 0.28) * 7;
    lx += (dx / n) * k; ly += (dy / n) * k;
  }
  const spawning = e.spawnT > 0;
  let alpha: number | undefined = undefined;
  if (spawning) {
    lift += e.spawnT * 60;
    alpha = 1 - e.spawnT / 0.8;
  }
  const aura = e.kind === "boss"
    ? e.pattern === "hunter" ? "rgba(200,70,70,0.35)"
    : e.pattern === "blink" ? "rgba(122,95,192,0.4)"
    : e.pattern === "artillerist" ? "rgba(200,110,50,0.35)"
    : e.pattern === "warden" ? "rgba(110,120,130,0.35)"
    : e.pattern === "swarmkeeper" ? "rgba(122,95,192,0.38)" : KIND_AURA.boss
    : KIND_AURA[e.kind];
  // Bomber fuse blink; blinker fade.
  let flash = e.flash > 0;
  if (e.kind === "bomber" && e.fuseT > 0 && !view.reducedMotion) {
    flash = Math.floor(e.fuseT * 12) % 2 === 0;
  }
  if (e.kind === "blinker" && e.skipPhase > 0) alpha = 0.45;
  if (burrowed) alpha = 0.35;
  {
    const [asx, asy] = toScreen(lx, ly, lift);
    const size = 16 * scale;
    drawShadowEllipse(ctx, asx, asy + 2, size * 0.30);
    // Role ring: specialists carry a thin ground halo in their role color.
    const ring = KIND_RING[e.kind];
    if (ring) {
      ctx.save();
      ctx.strokeStyle = ring;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(asx, asy + 2, size * 0.42, size * 0.42 * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (aura) {
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.ellipse(asx, asy - size * 0.45, size * 0.62, size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Frenemy body: official (family, seed) Rare Friend art when loaded —
  // a DIFFERENT canonical character per archetype, corrupted dark with ember
  // eyes. Procedural shadow body only while art loads / when offline.
  {
    const [sx, sy] = toScreen(lx, ly, lift);
    ctx.save();
    if (alpha !== undefined) ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    const id = frenemyIdentity(e.kind, e.pattern);
    const foe = view.foes?.get(foeKey(id.family, id.seed)) ?? null;
    // Locomotion: animate only when actually displacing (no sliding).
    // Knockback / lunge / spawn offsets must not drive the walk cycle.
    const epx = e.px ?? e.x, epy = e.py ?? e.y;
    const displaced = Math.hypot(e.x - epx, e.y - epy);
    const dashing = e.chargeState === "dash" || e.kind === "blinker" && e.skipPhase > 0;
    const moving = e.spawnT <= 0 && (displaced > 0.6 || dashing);
    // Animation speed scales with archetype speed so swifts flutter, tanks stomp.
    const animT = run.time * Math.max(0.6, Math.min(1.8, (e.speed || 60) / 62)) + e.walkPhase;
    const rows = foe ? frameRows(foe, e.facing, moving, animT, view.reducedMotion) : null;
    if (rows) {
      drawPixelFriend(ctx, rows, id.seed, lx, ly, {
        scale, xScale: xs, yScale: ys, dark: true, aura, lift, flash,
        eye: KIND_EYE[e.kind],
      });
    } else {
      drawShadowBody(ctx, e.kind, e.pattern, sx, sy,
        { s: scale, xs, ys }, 1, run.time, e.walkPhase, flash, view.reducedMotion,
        KIND_EYE[e.kind]);
    }
    ctx.restore();
  }
  const [sx, sy] = toScreen(lx, ly);
  // Sniper aim line while locked.
  if (e.kind === "sniper" && e.aimT > 0.3 && !view.reducedMotion) {
    const [ax, ay] = toScreen(e.x + e.aimDx * 30, e.y + e.aimDy * 30);
    const [bx, by] = toScreen(e.x + e.aimDx * 190, e.y + e.aimDy * 190);
    ctx.save();
    ctx.strokeStyle = e.aimT >= 0.9 ? "rgba(217,58,58,0.85)" : "rgba(217,58,58,0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(ax, ay - 20); ctx.lineTo(bx, by - 20); ctx.stroke();
    ctx.restore();
  }
  // Warden ward bubble while protected.
  if (e.kind === "boss" && e.pattern === "warden" && e.wardDown <= 0) {
    ctx.save();
    ctx.strokeStyle = "rgba(107,101,88,0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(sx, sy - 40, 52, 40, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // Leaper landing marker.
  if (e.kind === "leaper" && e.leapState === "tele") {
    groundEllipse(ctx, e.leapX, e.leapY, 30, "rgba(47,107,47,0.7)", 2, [10, 6]);
  }
  // Burrower resurface marker (dodgeable: locked at burrow start).
  if (e.kind === "burrower" && e.burrowState !== "roam" && !view.reducedMotion) {
    groundEllipse(ctx, e.burrowState === "down" ? e.burrowX : e.x, e.burrowState === "down" ? e.burrowY : e.y,
      30, "rgba(138,122,90,0.8)", 2, [10, 6]);
  }
  // Drainer tether: visible line while channeling.
  if (e.kind === "drainer" && Math.hypot(fx - e.x, fy - e.y) < 190 && !view.reducedMotion) {
    const [ax, ay] = toScreen(e.x, e.y - 20);
    const [bx, by] = toScreen(fx, fy - 20);
    ctx.save();
    ctx.strokeStyle = "rgba(63,127,191,0.75)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.restore();
  }
  // Commander aura: allies inside the ring fight harder (kill it first).
  if (e.kind === "commander" && !view.reducedMotion) {
    ctx.save();
    ctx.strokeStyle = "rgba(200,70,70,0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 8]);
    const [ax, ay] = toScreen(e.x, e.y);
    ctx.beginPath(); ctx.ellipse(ax, ay, 110 * 1.32, 110 * 0.62, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  // Elite markers: frenzied ticks, armored ring, giant scale (above).
  if (e.elite && e.eliteMod === "frenzied" && !view.reducedMotion) {
    ctx.strokeStyle = "#d93a3a";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const a = run.time * 3 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(a) * 30, sy - 40 + Math.sin(a) * 12);
      ctx.lineTo(sx + Math.cos(a) * 36, sy - 40 + Math.sin(a) * 15);
      ctx.stroke();
    }
  }
  if (e.elite && e.eliteMod === "armored") {
    ctx.strokeStyle = "#6b6558";
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(sx, sy - 2, 32, 13, 0, 0, Math.PI * 2); ctx.stroke();
  }
  // Shield layer.
  if (e.shieldMax > 0 && e.shieldHp > 0) {
    ctx.strokeStyle = "#3f7fbf";
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4 + 0.6 * (e.shieldHp / e.shieldMax);
    ctx.beginPath(); ctx.ellipse(sx, sy - 34, 30, 26, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // Charger telegraph: chevrons along the locked dash line.
  if (e.chargeState === "tele") {
    const len = 70;
    const ex = lx + e.chargeDx * len, ey = ly + e.chargeDy * len;
    const [ax, ay] = toScreen(lx, ly);
    const [bx2, by2] = toScreen(ex, ey);
    ctx.save();
    ctx.strokeStyle = "#c96a2e";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(ax, ay - 20); ctx.lineTo(bx2, by2 - 20); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#c96a2e";
    for (let i = 1; i <= 2; i++) {
      const px = ax + ((bx2 - ax) * i) / 3, py = ay - 20 + ((by2 - ay) * i) / 3;
      ctx.beginPath();
      ctx.moveTo(px + 8, py); ctx.lineTo(px - 4, py - 6); ctx.lineTo(px - 4, py + 6);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // Support pulse + summoner swirl.
  if (e.kind === "support" && !view.reducedMotion) {
    const k = (run.time % 3) / 3;
    ctx.save();
    ctx.globalAlpha = 0.5 * (1 - k);
    ctx.strokeStyle = "#d95f4b";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy - 20, 20 + k * 60, 10 + k * 26, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (e.kind === "summoner" && !view.reducedMotion) {
    ctx.save();
    ctx.strokeStyle = "#7a5fc0";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy - 60, 14 + Math.sin(run.time * 4) * 3, 8, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  if (e.elite) {
    ctx.strokeStyle = "#8a5a00";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(sx, sy, 30, 12, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (e.kind === "boss") {
    ctx.fillStyle = (bossForm ? bossForm.crown : "#8a5a00");
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(sx + i * 13 - 6, sy - 92);
      ctx.lineTo(sx + i * 13, sy - 110);
      ctx.lineTo(sx + i * 13 + 6, sy - 92);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();
    }
    // Rotating rune ticks: the boss is unmistakably special.
    if (!view.reducedMotion) {
      ctx.save();
      ctx.strokeStyle = bossForm ? bossForm.crown : "#8a5a00";
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = run.time * 1.4 + (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(a) * 52, sy - 40 + Math.sin(a) * 22);
        ctx.lineTo(sx + Math.cos(a) * 60, sy - 40 + Math.sin(a) * 26);
        ctx.stroke();
      }
      ctx.restore();
    }
    mono(ctx, 12);
    ctx.fillStyle = INK;
    // Clean readable boss name: no decorative glyphs (headless fonts miss them).
    const bn = (e.bossName || "SHADOW BOSS").replace(/[◇◆★☆♥❤⚠⚒✦■□●○▶◀▲▼♦♢]/g, "").replace(/\s{2,}/g, " ").trim() || "SHADOW BOSS";
    ctx.fillText(bn, sx, sy - 118);
  } else if (e.kind === "minibrute" || e.kind === "minimage" || e.kind === "minisiege") {
    // Mini-boss arrival reads instantly: named banner, no mistaking it.
    mono(ctx, 11);
    ctx.fillStyle = INK;
    const nm = e.kind === "minibrute" ? "GRISTLE" : e.kind === "minimage" ? "VESPER" : "RAMPART";
    ctx.fillText(nm, sx, sy - 104);
    ctx.fillStyle = INK;
    ctx.fillRect(sx - 15, sy - 88, 30, 5);
    ctx.fillStyle = "#d93a3a";
    ctx.fillRect(sx - 14, sy - 87, 28 * Math.max(0, e.hp / e.maxHp), 3);
  } else if (e.hp < e.maxHp) {
    ctx.fillStyle = INK;
    ctx.fillRect(sx - 15, sy - 88, 30, 5);
    ctx.fillStyle = "#d95f4b";
    ctx.fillRect(sx - 14, sy - 87, 28 * Math.max(0, e.hp / e.maxHp), 3);
  }
}
