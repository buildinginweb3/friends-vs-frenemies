/**
 * FRIENDS vs FRENEMIES — profile (permanent progression) + versioned save.
 *
 * IMPORTANT SDK LIMITATION (documented, not hidden): the FriendSDK game sandbox
 * has no localStorage or IndexedDB access and the bridge supplies no save API —
 * simulated state is session-local by platform design. This module therefore uses
 * a guarded storage backend: real localStorage when available (e.g. future host
 * or non-sandbox builds), transparent in-memory fallback inside the SDK sandbox.
 * Either way the schema is versioned, validated, and safe against corrupt data.
 */
import { QUESTS, MILESTONES } from "./balance";

export const SAVE_VERSION = 4;
export const SAVE_KEY = "friends-vs-frenemies:v1";

export const VALID_PLOTS = [
  "garden-oval",
  "circuit-courtyard",
  "crystal-mesa",
  "rooftop-terrace",
  "tidal-islands",
  "orbital-hex",
] as const;
export type ValidPlotId = typeof VALID_PLOTS[number];

export interface CodexState {
  enemies: string[];
  gear: string[];
  maps: string[];
  abilities: string[];
  structures: string[];
  plots: string[];
  bosses: string[];
}

export interface Profile {
  version: number;
  /** Simulated RF. Clearly labeled simulated everywhere it is shown. */
  simRf: number;
  /** Permanent upgrade levels by PERMA_UPGRADES id. */
  levels: Record<string, number>;
  /** Equipped gear ids per slot. */
  gear: { weapon: string; armor: string; trinket: string };
  /** Owned (unequipped) gear ids. */
  vault: string[];
  bestWave: number;
  totalKills: number;
  totalBosses: number;
  runs: number;
  seenIntro: boolean;
  /** Control preference: true = AUTO-pilot, false = MANUAL (default). */
  autoMode: boolean;
  lifetimeEarned: number;
  lifetimeSpent: number;
  /** Bestiary-lite: discovered enemy kinds, gear ids, map names. */
  discovered: { enemies: string[]; gear: string[]; maps: string[] };
  traders: number;
  /** Home plot choice (visual-first). Empty = not yet chosen. */
  plotId: string;
  /** Settlement tiers by STRUCTURES id. */
  buildings: Record<string, number>;
  /** Uncollected idle production (SimRF), capped by vault tier. */
  prodBank: number;
  /** Last session timestamp (ms) for capped idle accumulation. */
  lastSeen: number;
  /** Collection/discovery across enemies, bosses, abilities, gear, structures, plots. */
  codex: CodexState;
  /** Completed quest ids. */
  quests: string[];
}

export function defaultProfile(): Profile {
  return {
    version: SAVE_VERSION,
    simRf: 0,
    levels: {},
    gear: { weapon: "w0", armor: "a0", trinket: "t0" },
    vault: [],
    bestWave: 0,
    totalKills: 0,
    totalBosses: 0,
    runs: 0,
    seenIntro: false,
    autoMode: false,
    lifetimeEarned: 0,
    lifetimeSpent: 0,
    discovered: { enemies: [], gear: [], maps: [] },
    traders: 0,
    plotId: "",
    buildings: {},
    prodBank: 0,
    lastSeen: 0,
    codex: { enemies: [], gear: [], maps: [], abilities: ["ab-blast"], structures: [], plots: [], bosses: [] },
    quests: [],
  };
}

function cleanNumber(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

/** Grant a quest once (+reward). Returns true on first completion. */
export function grantQuest(p: Profile, id: string): boolean {
  if (p.quests.includes(id)) return false;
  const q = QUESTS.find(x => x.id === id);
  if (!q) return false;
  p.quests.push(id);
  p.simRf += q.reward;
  p.lifetimeEarned += q.reward;
  return true;
}

/** Milestone conditions from profile stats (shared by shell + tests). */
export function milestoneCond(p: Profile): Record<string, boolean> {
  const tier2 = Object.values(p.buildings).filter(t => t >= 2).length;
  const tier4 = ["turret", "altar"].some(id => (p.buildings[id] ?? 0) >= 4);
  const areas = new Set(p.codex.maps.filter(m => m.startsWith("expedition-")).map(m => m.split("-")[1])).size
    + (p.codex.maps.some(m => !m.startsWith("expedition-")) ? 1 : 0);
  return {
    "m-land": p.plotId !== "",
    "m-turret": (p.buildings.turret ?? 0) >= 1,
    "m-collector": (p.buildings.collector ?? 0) >= 1,
    "m-defend-1": p.bestWave >= 1,
    "m-brute": p.codex.bosses.includes("brute"),
    "m-trader": p.traders >= 1,
    "m-altar": (p.buildings.altar ?? 0) >= 1,
    "m-frost": (p.buildings.frost ?? 0) >= 1,
    "m-vault": (p.buildings.vault ?? 0) >= 1,
    "m-swarm": p.codex.bosses.includes("swarmkeeper"),
    "m-tier2": tier2 >= 3,
    "m-hunter": p.codex.bosses.includes("hunter"),
    "m-expedition": areas >= 3,
    "m-warden": p.codex.bosses.includes("warden"),
    "m-tier4": tier4,
  };
}

/** Milestone achievements: evaluated from profile stats, rewarded once. */
export function checkMilestones(p: Profile): string[] {
  const cond = milestoneCond(p);
  const fresh: string[] = [];
  for (const m of MILESTONES) {
    if (p.quests.includes(m.id) || !cond[m.id]) continue;
    p.quests.push(m.id);
    p.simRf += m.rewardSimRf;
    p.lifetimeEarned += m.rewardSimRf;
    fresh.push(m.id);
  }
  return fresh;
}

/** Idle production accumulation: session-time based, hard-capped, exploit-safe.
 * Returns banked RF clamped to `cap`. `nowMs - lastSeenMs` is clamped to
 * 8 hours and negative deltas (clock skew) bank nothing. */
export function accumulateIdle(lastSeenMs: number, nowMs: number, ratePerMin: number, cap: number): number {
  if (!(ratePerMin > 0) || !(cap > 0)) return 0;
  const dtMs = nowMs - lastSeenMs;
  if (!Number.isFinite(dtMs) || dtMs <= 0) return 0;
  const dtMin = Math.min(dtMs, 8 * 60 * 60 * 1000) / 60000;
  return Math.min(cap, Math.floor(dtMin * ratePerMin));
}

/** Validate unknown loaded data; never trust stored values. Migrates v1/v2/v3 → v4. */
export function sanitizeProfile(raw: unknown): Profile {
  const fresh = defaultProfile();
  if (typeof raw !== "object" || raw === null) return fresh;
  const r = raw as Record<string, unknown>;
  const out: Profile = {
    ...fresh,
    simRf: cleanNumber(r.simRf, 0, 0, 999_999_999),
    bestWave: cleanNumber(r.bestWave, 0, 0, 99999),
    totalKills: cleanNumber(r.totalKills, 0, 0, 999_999_999),
    totalBosses: cleanNumber(r.totalBosses, 0, 0, 999_999_999),
    runs: cleanNumber(r.runs, 0, 0, 999_999_999),
    seenIntro: r.seenIntro === true,
    autoMode: r.autoMode === true,
    lifetimeEarned: cleanNumber(r.lifetimeEarned, 0, 0, 999_999_999_999),
    lifetimeSpent: cleanNumber(r.lifetimeSpent, 0, 0, 999_999_999_999),
    traders: cleanNumber(r.traders, 0, 0, 999_999_999),
    prodBank: cleanNumber(r.prodBank, 0, 0, 10_000_000),
    lastSeen: cleanNumber(r.lastSeen, Date.now(), 0, 999_999_999_999_999),
  };
  if (typeof r.levels === "object" && r.levels !== null) {
    for (const [k, v] of Object.entries(r.levels as Record<string, unknown>)) {
      if (/^[a-z]+$/.test(k) && typeof v === "number" && Number.isFinite(v)) {
        out.levels[k] = Math.min(9, Math.max(0, Math.floor(v)));
      }
    }
  }
  out.buildings = {};
  if (typeof r.buildings === "object" && r.buildings !== null) {
    for (const [k, v] of Object.entries(r.buildings as Record<string, unknown>)) {
      if (/^[a-z]+$/.test(k) && typeof v === "number" && Number.isFinite(v)) {
        out.buildings[k] = Math.min(9, Math.max(0, Math.floor(v)));
      }
    }
  }
  // Sync structure levels for existing saves
  for (const b of ["turret", "wall", "healer", "collector", "frost", "generator", "vault", "altar", "workshop", "beacon", "archive", "shrine"] as const) {
    if ((out.levels[b] ?? 0) > (out.buildings[b] ?? 0)) {
      out.buildings[b] = out.levels[b];
    }
  }
  if (typeof r.plotId === "string" && (VALID_PLOTS as readonly string[]).includes(r.plotId)) {
    out.plotId = r.plotId;
  } else if (r.plotId === "") {
    out.plotId = "";
  } else {
    out.plotId = out.runs > 0 ? "garden-oval" : "";
  }
  const gearIds = ["w0", "a0", "t0"];
  if (typeof r.gear === "object" && r.gear !== null) {
    const g = r.gear as Record<string, unknown>;
    if (typeof g.weapon === "string") gearIds[0] = g.weapon;
    if (typeof g.armor === "string") gearIds[1] = g.armor;
    if (typeof g.trinket === "string") gearIds[2] = g.trinket;
  }
  out.gear = { weapon: gearIds[0], armor: gearIds[1], trinket: gearIds[2] };
  if (Array.isArray(r.vault)) {
    out.vault = r.vault.filter((v): v is string => typeof v === "string").slice(0, 200);
  }
  if (typeof r.discovered === "object" && r.discovered !== null) {
    const d = r.discovered as Record<string, unknown>;
    for (const key of ["enemies", "gear", "maps"] as const) {
      if (Array.isArray(d[key])) {
        out.discovered[key] = (d[key] as unknown[]).filter((v): v is string => typeof v === "string").slice(0, 200);
      }
    }
  }
  const codex: CodexState = {
    enemies: [], gear: [], maps: [], abilities: ["ab-blast"], structures: [], plots: [], bosses: [],
  };
  if (typeof r.codex === "object" && r.codex !== null) {
    const c = r.codex as Record<string, unknown>;
    for (const k of ["enemies", "gear", "maps", "abilities", "structures", "plots", "bosses"] as const) {
      if (Array.isArray(c[k])) {
        codex[k] = (c[k] as unknown[]).filter((v): v is string => typeof v === "string").slice(0, 200);
      }
    }
  }
  if (!codex.abilities.includes("ab-blast")) codex.abilities.push("ab-blast");
  if (out.plotId && !codex.plots.includes(out.plotId)) codex.plots.push(out.plotId);
  out.codex = codex;
  if (Array.isArray(r.quests)) {
    out.quests = r.quests.filter((v): v is string => typeof v === "string").slice(0, 100);
  }
  return out;
}

interface StorageBackend {
  get(): string | null;
  set(value: string): void;
  clear(): void;
  readonly persistent: boolean;
}

function detectBackend(): StorageBackend {
  try {
    if (typeof localStorage !== "undefined") {
      const probe = "__fvf_probe__";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return {
        get: () => localStorage.getItem(SAVE_KEY),
        set: value => localStorage.setItem(SAVE_KEY, value),
        clear: () => localStorage.removeItem(SAVE_KEY),
        persistent: true,
      };
    }
  } catch {
    // Sandboxed iframe without storage access — fall through to memory.
  }
  let memory: string | null = null;
  return {
    get: () => memory,
    set: value => { memory = value; },
    clear: () => { memory = null; },
    persistent: false,
  };
}

let backend: StorageBackend | null = null;
export function storageBackend(): StorageBackend {
  if (!backend) backend = detectBackend();
  return backend;
}

/** For tests: force a fresh in-memory backend. */
export function resetBackendForTests(): void {
  let memory: string | null = null;
  backend = {
    get: () => memory,
    set: value => { memory = value; },
    clear: () => { memory = null; },
    persistent: false,
  };
}

export function loadProfile(): { profile: Profile; restarted: boolean; persistent: boolean } {
  const store = storageBackend();
  try {
    const raw = store.get();
    if (!raw) return { profile: defaultProfile(), restarted: false, persistent: store.persistent };
    const profile = sanitizeProfile(JSON.parse(raw));
    return { profile, restarted: profile.version !== SAVE_VERSION, persistent: store.persistent };
  } catch {
    return { profile: defaultProfile(), restarted: true, persistent: store.persistent };
  }
}

export function saveProfile(profile: Profile): void {
  try {
    storageBackend().set(JSON.stringify({ ...profile, version: SAVE_VERSION }));
  } catch {
    // Session-only fallback already in memory; never crash on save failure.
  }
}

export function resetProfile(): Profile {
  storageBackend().clear();
  const fresh = defaultProfile();
  saveProfile(fresh);
  return fresh;
}
