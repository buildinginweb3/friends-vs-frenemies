/**
 * FRIENDS vs FRENEMIES — Friend artwork.
 *
 * Uses the real FriendSDK sprite reader (canonical on-chain Generations sprites)
 * when reachable, with a fast procedural fallback so the game NEVER blank-screens
 * (missing artwork, offline, slow RPC, mock test harness, …).
 * Adapting/recoloring is explicitly allowed: WORLD_RULES.md has no
 * pixel-preservation requirement and NOTICE.md permits custom representations.
 */
import { readFriendArtwork, readFramesArtwork, type FriendArt, type FriendClips, type SpriteFacing } from "./chain-art";

export type { FriendArt, FriendClips, SpriteFacing };

const cache = new Map<string, FriendArt>();
const foeCache = new Map<string, FriendArt>();
const foeInflight = new Map<string, Promise<FriendArt>>();

/**
 * Curated Frenemy identities: each archetype maps to a DISTINCT official
 * Generations family (+ fixed seed), so foes read as different Rare Friends,
 * not clones of the player. (family, seed) are pure generator inputs — no
 * owner's token is ever referenced. Bosses keyed by pattern.
 *
 * Families: 0 Skeleton, 1 Mask, 2 Family, 3 Cellular, 4 Asymmetry,
 * 5 Hoverer, 6 Colossus, 7 Sparkling, 8 Hollow.
 */
export const FRENEMY_IDENTITY: Record<string, { family: number; seed: number }> = {
  shadow: { family: 2, seed: 11 },
  swift: { family: 5, seed: 77 },
  tank: { family: 6, seed: 9 },
  ranged: { family: 1, seed: 31 },
  swarm: { family: 3, seed: 7 },
  splitling: { family: 3, seed: 13 },
  charger: { family: 4, seed: 41 },
  split: { family: 3, seed: 91 },
  shield: { family: 0, seed: 55 },
  support: { family: 7, seed: 23 },
  summoner: { family: 8, seed: 66 },
  bomber: { family: 4, seed: 88 },
  sniper: { family: 1, seed: 77 },
  orbiter: { family: 5, seed: 131 },
  blinker: { family: 8, seed: 133 },
  leaper: { family: 4, seed: 55 },
  mage: { family: 7, seed: 71 },
  burrower: { family: 0, seed: 101 },
  commander: { family: 6, seed: 61 },
  drainer: { family: 8, seed: 41 },
  saboteur: { family: 4, seed: 117 },
  thief: { family: 5, seed: 171 },
  artillery: { family: 6, seed: 121 },
  necromancer: { family: 8, seed: 171 },
  traplayer: { family: 0, seed: 141 },
  siege: { family: 6, seed: 191 },
  "boss:brute": { family: 6, seed: 7 },
  "boss:hunter": { family: 4, seed: 7 },
  "boss:swarmkeeper": { family: 3, seed: 33 },
  "boss:artillerist": { family: 1, seed: 7 },
  "boss:warden": { family: 0, seed: 7 },
  "boss:blink": { family: 8, seed: 7 },
  "boss:siegebreaker": { family: 6, seed: 77 },
  cryo: { family: 7, seed: 151 },
  corrupter: { family: 3, seed: 181 },
  elitehunter: { family: 4, seed: 199 },
  minibrute: { family: 6, seed: 211 },
  minimage: { family: 7, seed: 231 },
  minisiege: { family: 6, seed: 241 },
};

/** Deterministic identity for an enemy kind (+ boss pattern). Pure: safe in tests. */
export function frenemyIdentity(kind: string, pattern?: string | null): { family: number; seed: number } {
  if (kind === "boss") return FRENEMY_IDENTITY[`boss:${pattern ?? "brute"}`] ?? FRENEMY_IDENTITY["boss:brute"];
  return FRENEMY_IDENTITY[kind] ?? FRENEMY_IDENTITY.shadow;
}

export function foeKey(family: number, seed: number): string {
  return `${family}:${seed}`;
}

const FAMILY_NAMES = [
  "Skeleton", "Mask", "Family", "Cellular", "Asymmetry", "Hoverer", "Colossus", "Sparkling", "Hollow",
] as const;

/** Canonical 16x16 bitmaps for each official Generation family so foes NEVER fall back to generic blobs. */
export function generateFamilyRows(familyId: number, seed: number, facing: SpriteFacing, walkFrame: number): string[] {
  const fam = Math.max(0, Math.min(8, Math.floor(familyId)));
  const rows: string[] = [];
  const shiftX = facing === "left" ? -1 : facing === "right" ? 1 : 0;
  const walkBob = walkFrame % 2 === 1 ? -1 : 0;
  const legShift = walkFrame % 4 === 1 ? 1 : walkFrame % 4 === 3 ? -1 : 0;

  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 16; x++) {
      const cx = x - 7.5 - shiftX * 0.5;
      const cy = y - 8 - walkBob;
      let on = false;

      switch (fam) {
        case 0: // Skeleton: skull with temples, narrow spine, bony ribs, thin legs
          if (cy >= -6 && cy <= -1) on = Math.abs(cx) <= 3.5; // skull
          if (cy >= -5 && cy <= -3 && Math.abs(cx) === 1.5 && facing !== "up") on = false; // eye holes
          if (cy === 0) on = Math.abs(cx) <= 1.5; // neck/spine
          if (cy >= 1 && cy <= 3) on = Math.abs(cx) <= (cy === 2 ? 3 : 2); // ribs
          if (cy >= 4 && cy <= 6) {
            on = Math.abs(cx - (cx > 0 ? legShift : -legShift)) === 2; // legs
          }
          break;

        case 1: // Mask: broad angular crest, visor brow, triangular jaw
          if (cy >= -7 && cy <= -5) on = Math.abs(cx) <= 4.5 && Math.abs(cx) >= 1; // horn crest
          if (cy >= -4 && cy <= 0) on = Math.abs(cx) <= 4.2; // visor face
          if (cy === -2 && Math.abs(cx) <= 2.5 && facing !== "up") on = false; // visor slot
          if (cy >= 1 && cy <= 4) on = Math.abs(cx) <= (4 - cy * 0.8); // tapered jaw
          if (cy >= 5 && cy <= 6) on = Math.abs(cx) <= 2; // compact feet
          break;

        case 2: // Family: canonical cozy rounded friend with two cute ears
          if (cy >= -7 && cy <= -4) {
            on = (cx + 3.5) * (cx + 3.5) + (cy + 5.5) * (cy + 5.5) <= 3.5 ||
                 (cx - 3.5) * (cx - 3.5) + (cy + 5.5) * (cy + 5.5) <= 3.5; // round ears
          }
          if (cx * cx + cy * cy <= 22) on = true; // body
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 3.5; // feet
          break;

        case 3: // Cellular: cluster of bubbly circular pods / mitosis cells
          on = (cx + 2) * (cx + 2) + (cy + 2) * (cy + 2) <= 8 ||
               (cx - 2.5) * (cx - 2.5) + (cy + 1) * (cy + 1) <= 9 ||
               (cx) * (cx) + (cy - 3) * (cy - 3) <= 7.5 ||
               (cx + 3) * (cx + 3) + (cy - 2) * (cy - 2) <= 5;
          break;

        case 4: // Asymmetry: single sweeping crest on left, angled torso
          if (cx <= -1 && cy >= -7 && cy <= -2) on = Math.abs(cx + 3.5) <= 1.5; // left horn/crest
          if ((cx - 0.5) * (cx - 0.5) + cy * cy <= 19) on = true; // body offset
          if (cy >= 3 && cy <= 6) on = cx >= -3 && cx <= 2; // stance
          break;

        case 5: // Hoverer: levitating tapered teardrop with stabilizer side fins
          if (cy >= -6 && cy <= 2) on = Math.abs(cx) <= (cy <= -2 ? 3.5 : 4 - (cy + 2) * 0.6); // teardrop body
          if (cy >= -1 && cy <= 2) on = on || Math.abs(cx) <= 5.5; // side fins
          if (cy >= 3 && cy <= 5) on = Math.abs(cx) <= (5 - cy) * 0.8; // tapered energy tail
          break;

        case 6: // Colossus: massive broad 12-wide shoulders, blocky square frame
          if (cy >= -6 && cy <= -4) on = Math.abs(cx) <= 4; // brow
          if (cy >= -3 && cy <= 3) on = Math.abs(cx) <= 5.5; // massive shoulders
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 4.5 && Math.abs(cx) >= 0.5; // wide pillars
          break;

        case 7: // Sparkling: star/diamond crown facets, radiating silhouette
          if (Math.abs(cx) <= 1 && cy >= -7 && cy <= -4) on = true; // top point
          if (Math.abs(cy + 1) <= 1 && Math.abs(cx) <= 5.5) on = true; // side points
          if (Math.abs(cx) + Math.abs(cy) <= 5) on = true; // diamond core
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 2.5; // pedestal feet
          break;

        case 8: // Hollow: draped hood, floating shadowy shroud, empty core
          if (cy >= -7 && cy <= 1) on = Math.abs(cx) <= (cy <= -3 ? 3.5 : 4.5); // hood
          if (cy >= -4 && cy <= -1 && Math.abs(cx) <= 2 && facing !== "up") on = false; // dark face void
          if (cy >= 2 && cy <= 6) on = Math.abs(cx) <= 4 - (cy - 4) * 0.4; // robe
          break;
      }

      row += on ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

const fallbackArts = new Map<string, FriendArt>();
export function getFamilyFallbackArt(familyId: number, seed: number): FriendArt {
  const key = foeKey(familyId, seed);
  const hit = fallbackArts.get(key);
  if (hit) return hit;

  const clip = (walking: boolean): Record<SpriteFacing, string[][]> => {
    const out = {} as Record<SpriteFacing, string[][]>;
    const facings: SpriteFacing[] = ["down", "up", "left", "right"];
    for (const f of facings) {
      const frames: string[][] = [];
      for (let i = 0; i < 8; i++) {
        frames.push(generateFamilyRows(familyId, seed, f, walking ? i : 0));
      }
      out[f] = frames;
    }
    return out;
  };

  const clips: FriendClips = {
    idle: clip(false),
    walk: clip(true),
    familyId,
  };
  const art: FriendArt = {
    rows: clips.idle.down[0],
    clips,
    familyName: FAMILY_NAMES[familyId] ?? "Rare Friend",
    live: false,
  };
  fallbackArts.set(key, art);
  return art;
}

/** Unreachable generator reads, with expiry: avoids retry storms offline while
 * still picking up official bodies when the network returns. */
const foeDead = new Map<string, number>();
const FOE_DEAD_TTL = 60_000;

/** Cached official-art read for one Frenemy identity (best-effort, never throws). */
export function loadFrenemyArt(family: number, seed: number, timeoutMs = 8000): Promise<FriendArt | null> {
  const key = foeKey(family, seed);
  const hit = foeCache.get(key);
  if (hit) return Promise.resolve(hit);
  const deadAt = foeDead.get(key);
  if (deadAt !== undefined && Date.now() - deadAt < FOE_DEAD_TTL) return Promise.resolve(null);
  if (deadAt !== undefined) foeDead.delete(key);
  const flight = foeInflight.get(key);
  if (flight) return flight.then(a => a).catch(() => null);
  const p = readFramesArtwork(family, seed, timeoutMs)
    .then(a => {
      if (foeCache.size > 64) foeCache.clear();
      foeCache.set(key, a);
      foeInflight.delete(key);
      return a as FriendArt;
    })
    .catch(() => {
      foeInflight.delete(key);
      foeDead.set(key, Date.now());
      if (foeDead.size > 128) foeDead.clear();
      return null;
    });
  foeInflight.set(key, p as Promise<FriendArt>);
  return p;
}

/** Synchronous cache read for the renderer — GUARANTEED to return valid canonical family art, never null! */
export function getFrenemyArtSync(family: number, seed: number): FriendArt {
  return foeCache.get(foeKey(family, seed)) ?? getFamilyFallbackArt(family, seed);
}

/** Preload a set of archetype arts (fire-and-forget, concurrency-bounded). */
export function preloadFrenemyArts(kinds: string[], timeoutMs = 8000): Promise<(FriendArt | null)[]> {
  const seen = new Set<string>();
  const jobs: Promise<FriendArt | null>[] = [];
  for (const kind of kinds) {
    const [base, pattern] = kind.split(":");
    const id = frenemyIdentity(base, pattern ?? null);
    const key = foeKey(id.family, id.seed);
    if (seen.has(key)) continue;
    seen.add(key);
    jobs.push(loadFrenemyArt(id.family, id.seed, timeoutMs));
    if (jobs.length >= 12) break;
  }
  return Promise.all(jobs);
}

/** For tests: clear the foe cache. */
export function resetFoeCacheForTests(): void {
  foeCache.clear();
  foeInflight.clear();
  foeDead.clear();
  fallbackArts.clear();
}

export async function loadFriendArt(friendId: bigint, timeoutMs = 8000): Promise<FriendArt> {
  const key = friendId.toString();
  const cached = cache.get(key);
  if (cached) return cached;
  const fallback: FriendArt = { rows: null, clips: null, familyName: "Friend", live: false };
  try {
    const art = await readFriendArtwork(friendId, timeoutMs);
    cache.set(key, art);
    return art;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}

/** Pick the canonical frame rows for a facing/walking/anim-time state. */
export function frameRows(
  art: FriendArt, facing: SpriteFacing, walking: boolean, now: number, reducedMotion: boolean,
): readonly string[] | null {
  if (!art.clips) return art.rows;
  let resolved = facing;
  if (art.clips.familyId === 6 && (facing === "down" || facing === "up")) resolved = "right"; // Colossus has no verticals
  const set = walking ? art.clips.walk : art.clips.idle;
  const frames = set[resolved];
  if (!frames) return art.rows;
  const idx = reducedMotion || !walking ? 0 : Math.floor(now / 0.11) % 8;
  return frames[idx] ?? art.rows;
}

/** Procedural rows: family-specific silhouette generator based on seed. */
export function proceduralRows(seed: number, wobble: number): string[] {
  const familyId = Math.abs(seed) % 9;
  return generateFamilyRows(familyId, seed, "down", wobble > 0 ? 1 : 0);
}
