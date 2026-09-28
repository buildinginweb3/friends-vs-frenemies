/**
 * FRIENDS vs FRENEMIES — peaceful home-plot life + AFK simulation.
 * The Friend wanders its land with createWorldMovement: stroll to a point,
 * pause, look around, occasionally inspect a structure, drift home.
 * AFK mode: the Friend visibly works the base (collector, house, workshop,
 * defender patrol) with pauses/reactions and production pulses — never
 * static jitter. Interaction events feed the AFK summary via the shell.
 */
import { createWorldMovement } from "@rarefriends/friendsdk/movement";
import { randomWalkable, type Scene, type WorldPoint } from "./world-scene";

export interface HomePlot {
  mover: ReturnType<typeof createWorldMovement>;
  rng: () => number;
  waitT: number;
  lookT: number;
  structures: WorldPoint[];
  /** Named points of interest for readable wandering (house, collector...). */
  pois: { label: string; at: WorldPoint }[];
  /** Current interaction (world-readable): visit + pause + bubble. */
  visit: { label: string; t: number; dur: number } | null;
  /** Recent visit log for AFK summary flavor (shell reads length). */
  visits: number;
  /** Reaction bubble text + ttl (renderer may show). */
  bubble: { text: string; t: number } | null;
}

const BUBBLES = [
  "hm!",
  "nice.",
  "home~",
  "+rf?",
  "zzz",
  "oh!",
];

export function createHomePlot(scene: Scene, seed: number): HomePlot {
  let a = seed >>> 0;
  const rng = () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pois = [
    { label: "house", at: scene.anchors.homecore },
    { label: "collector", at: scene.anchors.collector },
    { label: "turret", at: scene.anchors.turret },
    { label: "healer", at: scene.anchors.healer },
    { label: "frost", at: scene.anchors.frost },
  ];
  return {
    mover: createWorldMovement(scene.world, scene.home, { speed: 62, radius: 9 }),
    rng,
    waitT: 1.5,
    lookT: 0,
    structures: [scene.anchors.turret, scene.anchors.healer, scene.anchors.collector, scene.anchors.homecore],
    pois,
    visit: null,
    visits: 0,
    bubble: null,
  };
}

export function stepHomePlot(plot: HomePlot, scene: Scene, dt: number, hasStructures: boolean, afk = false): void {
  const mover = plot.mover;
  if (plot.bubble && plot.bubble.t > 0) plot.bubble.t -= dt;
  else if (plot.bubble) plot.bubble = null;
  // Visiting: stand at the POI, then count it and drift on.
  if (plot.visit) {
    plot.visit.t -= dt;
    if (plot.visit.t <= 0) {
      plot.visit = null;
      plot.visits += 1;
      if (plot.rng() < (afk ? 0.5 : 0.25)) {
        plot.bubble = { text: BUBBLES[Math.floor(plot.rng() * BUBBLES.length)], t: 2.2 };
      }
      plot.waitT = afk ? 0.8 + plot.rng() * 1.6 : 2 + plot.rng() * 4;
    }
    return;
  }
  if (mover.state.destination) {
    mover.update(dt * 1000);
    // Arrived near a POI: start a visit instead of instantly leaving.
    if (!mover.state.destination) {
      const st = mover.state.position;
      const near = plot.pois.find(p => Math.hypot(p.at[0] - st[0], p.at[1] - st[1]) < 46);
      if (near && plot.rng() < (afk ? 0.8 : 0.5)) {
        plot.visit = { label: near.label, t: afk ? 1.6 + plot.rng() * 1.8 : 1.2 + plot.rng() * 2.2, dur: 2 };
        return;
      }
      plot.waitT = afk ? 0.6 + plot.rng() * 1.8 : 1 + plot.rng() * 3;
    }
    return;
  }
  plot.waitT -= dt;
  if (plot.waitT > 0) return;
  plot.waitT = afk ? 0.6 + plot.rng() * 1.8 : 2 + plot.rng() * 4;
  const roll = plot.rng();
  // AFK: purposeful rounds between structures (collector fills, house, workshop).
  if (afk && hasStructures && roll < 0.62) {
    const poi = plot.pois[Math.floor(plot.rng() * plot.pois.length)];
    mover.moveTo([poi.at[0] + 30 + plot.rng() * 20, poi.at[1] + 24 + plot.rng() * 12]);
  } else if (hasStructures && roll < 0.3) {
    // Amble over to inspect a structure, then drift back later.
    const s = plot.structures[Math.floor(plot.rng() * plot.structures.length)];
    mover.moveTo([s[0] + 30 + plot.rng() * 20, s[1] + 24 + plot.rng() * 12]);
  } else if (roll < 0.45) {
    mover.moveTo([...scene.home]);
  } else {
    mover.moveTo(randomWalkable(scene.world, plot.rng, scene.home[0], scene.home[1], 120));
  }
}

export interface HomePlotView {
  seedNum: number;
  reducedMotion: boolean;
  pokeT: number;
}
