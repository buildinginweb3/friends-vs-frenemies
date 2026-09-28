/**
 * FRIENDS vs FRENEMIES — balance tables and catalogs.
 * Pure data + deterministic helpers. No framework imports so logic stays testable.
 * All currency here is simulated (SimRF). See README for the RF relationship.
 */

export type EnemyArchetype =
  | "shadow" | "swift" | "tank" | "ranged" | "swarm" | "boss"
  | "charger" | "split" | "shield" | "support" | "summoner" | "splitling"
  | "bomber" | "sniper" | "orbiter" | "blinker" | "leaper"
  | "mage" | "burrower" | "commander" | "drainer"
  | "saboteur" | "thief" | "artillery" | "necromancer" | "traplayer" | "siege"
  | "cryo" | "corrupter" | "elitehunter" | "minibrute" | "minimage" | "minisiege";

/** Combat objective: who this enemy tries to hurt. Structures make bases matter. */
export type EnemyObjective = "friend" | "structure" | "production" | "any";
export const ENEMY_OBJECTIVE: Record<EnemyArchetype, EnemyObjective> = {
  shadow: "friend", swift: "friend", tank: "friend", ranged: "friend", swarm: "friend", boss: "any",
  charger: "friend", split: "friend", shield: "friend", support: "friend", summoner: "friend", splitling: "friend",
  bomber: "friend", sniper: "friend", orbiter: "friend", blinker: "friend", leaper: "friend",
  mage: "friend", burrower: "any", commander: "friend", drainer: "friend",
  saboteur: "structure", thief: "production", artillery: "structure",
  necromancer: "friend", traplayer: "friend", siege: "structure",
  cryo: "friend", corrupter: "friend", elitehunter: "friend",
  minibrute: "any", minimage: "any", minisiege: "structure",
};

export interface EnemySpec {
  hp: number;
  dmg: number;
  speed: number;
  xp: number;
  rf: number;
  radius: number;
  range: number; // 0 = melee contact, >0 = stops and shoots at this distance
  tint: string;
  scale: number;
}

export const ENEMIES: Record<"shadow" | "swift" | "tank" | "ranged" | "swarm", EnemySpec> = {
  shadow: { hp: 30, dmg: 8, speed: 55, xp: 6, rf: 1, radius: 16, range: 0, tint: "#2a2140", scale: 1 },
  swift: { hp: 18, dmg: 6, speed: 98, xp: 7, rf: 1, radius: 13, range: 0, tint: "#3a2a55", scale: 0.85 },
  tank: { hp: 95, dmg: 14, speed: 32, xp: 14, rf: 2, radius: 22, range: 0, tint: "#1c1830", scale: 1.35 },
  ranged: { hp: 26, dmg: 7, speed: 48, xp: 12, rf: 2, radius: 15, range: 210, tint: "#40254a", scale: 1 },
  swarm: { hp: 10, dmg: 4, speed: 78, xp: 3, rf: 0, radius: 10, range: 0, tint: "#33244d", scale: 0.65 },
};

/** Body-collider radii in world units — substantially smaller than sprites. */
export const BODY_R: Record<EnemyArchetype, number> = {
  shadow: 8, swift: 6, tank: 11, ranged: 7, swarm: 5, boss: 20,
  charger: 8, split: 9, shield: 9, support: 7, summoner: 9, splitling: 5,
  bomber: 8, sniper: 7, orbiter: 8, blinker: 7, leaper: 9,
  mage: 7, burrower: 8, commander: 10, drainer: 7,
  saboteur: 7, thief: 6, artillery: 9, necromancer: 8, traplayer: 7, siege: 12,
  cryo: 8, corrupter: 9, elitehunter: 9, minibrute: 14, minimage: 13, minisiege: 16,
};
export const FRIEND_BODY = 8;

export const NEW_ENEMIES: Record<"charger" | "split" | "shield" | "support" | "summoner" | "splitling" | "bomber" | "sniper" | "orbiter" | "blinker" | "leaper" | "mage" | "burrower" | "commander" | "drainer" | "saboteur" | "thief" | "artillery" | "necromancer" | "traplayer" | "siege" | "cryo" | "corrupter" | "elitehunter" | "minibrute" | "minimage" | "minisiege", EnemySpec> = {
  charger: { hp: 42, dmg: 12, speed: 40, xp: 12, rf: 2, radius: 15, range: 0, tint: "#4a2a3a", scale: 1 },
  split: { hp: 55, dmg: 9, speed: 44, xp: 10, rf: 1, radius: 16, range: 0, tint: "#2e3a55", scale: 1.05 },
  shield: { hp: 70, dmg: 10, speed: 30, xp: 14, rf: 2, radius: 17, range: 0, tint: "#3a3f4a", scale: 1.1 },
  support: { hp: 34, dmg: 4, speed: 36, xp: 14, rf: 3, radius: 14, range: 150, tint: "#4a3040", scale: 1 },
  summoner: { hp: 60, dmg: 6, speed: 28, xp: 18, rf: 3, radius: 16, range: 140, tint: "#3a2a55", scale: 1.1 },
  splitling: { hp: 12, dmg: 5, speed: 66, xp: 3, rf: 0, radius: 9, range: 0, tint: "#33415e", scale: 0.7 },
  bomber: { hp: 30, dmg: 22, speed: 58, xp: 12, rf: 2, radius: 14, range: 0, tint: "#5e2e1e", scale: 0.95 },
  sniper: { hp: 30, dmg: 18, speed: 34, xp: 14, rf: 3, radius: 14, range: 230, tint: "#1e3a4a", scale: 1 },
  orbiter: { hp: 40, dmg: 10, speed: 66, xp: 12, rf: 2, radius: 14, range: 0, tint: "#3a4a2e", scale: 0.95 },
  blinker: { hp: 36, dmg: 9, speed: 44, xp: 12, rf: 2, radius: 13, range: 0, tint: "#4a2e5e", scale: 0.9 },
  leaper: { hp: 52, dmg: 15, speed: 42, xp: 13, rf: 2, radius: 15, range: 0, tint: "#2e4a3a", scale: 1 },
  mage: { hp: 38, dmg: 8, speed: 32, xp: 16, rf: 3, radius: 14, range: 190, tint: "#5e2e5e", scale: 1 },
  burrower: { hp: 46, dmg: 13, speed: 40, xp: 14, rf: 2, radius: 14, range: 0, tint: "#4a3a2e", scale: 0.95 },
  commander: { hp: 85, dmg: 10, speed: 30, xp: 20, rf: 4, radius: 17, range: 0, tint: "#6b2e2e", scale: 1.15 },
  drainer: { hp: 34, dmg: 5, speed: 38, xp: 15, rf: 3, radius: 13, range: 170, tint: "#2e4a5e", scale: 0.95 },
  saboteur: { hp: 40, dmg: 6, speed: 52, xp: 16, rf: 3, radius: 13, range: 0, tint: "#4a2e4a", scale: 0.95 },
  thief: { hp: 26, dmg: 4, speed: 74, xp: 12, rf: 4, radius: 12, range: 0, tint: "#2e4a2e", scale: 0.85 },
  artillery: { hp: 55, dmg: 16, speed: 26, xp: 18, rf: 4, radius: 15, range: 260, tint: "#5e3a1e", scale: 1.05 },
  necromancer: { hp: 65, dmg: 7, speed: 28, xp: 22, rf: 4, radius: 15, range: 170, tint: "#2e2e4a", scale: 1.05 },
  traplayer: { hp: 36, dmg: 6, speed: 44, xp: 14, rf: 3, radius: 13, range: 0, tint: "#4a4a2e", scale: 0.95 },
  siege: { hp: 150, dmg: 22, speed: 20, xp: 26, rf: 6, radius: 20, range: 0, tint: "#3a1e1e", scale: 1.3 },
  cryo: { hp: 48, dmg: 7, speed: 38, xp: 15, rf: 3, radius: 14, range: 160, tint: "#3a5e6b", scale: 1 },
  corrupter: { hp: 52, dmg: 8, speed: 42, xp: 16, rf: 3, radius: 15, range: 0, tint: "#3f2e5e", scale: 1.05 },
  elitehunter: { hp: 75, dmg: 14, speed: 64, xp: 20, rf: 4, radius: 15, range: 0, tint: "#5e1e2e", scale: 1.1 },
  minibrute: { hp: 180, dmg: 18, speed: 28, xp: 35, rf: 8, radius: 18, range: 0, tint: "#4a3520", scale: 1.35 },
  minimage: { hp: 140, dmg: 12, speed: 32, xp: 35, rf: 8, radius: 17, range: 180, tint: "#4a204a", scale: 1.3 },
  minisiege: { hp: 240, dmg: 26, speed: 20, xp: 40, rf: 10, radius: 21, range: 0, tint: "#4a1e1e", scale: 1.45 },
};

/** Spawn-budget costs: controlled encounter design, not wave*N spam. */
export const BUDGET_COST: Record<EnemyArchetype, number> = {
  shadow: 1, swift: 1, swarm: 1, splitling: 1,
  ranged: 2, charger: 2, split: 2, shield: 3, support: 3, tank: 3, summoner: 4, boss: 99,
  bomber: 2, sniper: 3, orbiter: 2, blinker: 2, leaper: 3,
  mage: 3, burrower: 3, commander: 4, drainer: 3,
  saboteur: 3, thief: 2, artillery: 4, necromancer: 4, traplayer: 3, siege: 5,
  cryo: 3, corrupter: 3, elitehunter: 4, minibrute: 8, minimage: 8, minisiege: 10,
};

export type WaveType =
  | "standard" | "swarm" | "heavy" | "ranged" | "elite" | "rush" | "surge" | "boss"
  | "patrol" | "assault" | "siege" | "ambush" | "commander" | "burrow" | "hunt" | "sniper" | "raid" | "holdout" | "breach";

export interface WavePlan {
  type: WaveType;
  label: string;
  budget: number;
  surge: boolean;
}

/** Central difficulty director: composition by budget, not raw counts. */
export function planWave(wave: number, mapIdx: number): WavePlan {
  if (wave % 5 === 0) return { type: "boss", label: "BOSS ASSAULT", budget: 0, surge: false };
  const budget = Math.round(5 + wave * 1.6 + mapIdx * 4);
  const r = ((wave * 2654435761 + mapIdx * 40503) >>> 0) % 100 / 100;
  if (wave % 5 === 3) {
    if (r < 0.4) return { type: "surge", label: "SHADOW SURGE", budget: Math.round(budget * 1.5), surge: true };
    return { type: "elite", label: "ELITE HUNT", budget, surge: false };
  }
  // Wave director templates for intentional pacing
  const kinds = unlockedKinds(wave, mapIdx);
  const has = (...ks: EnemyArchetype[]) => ks.some(k => kinds.includes(k));
  if (wave === 1) return { type: "standard", label: "PATROL", budget: 6, surge: false };
  if (wave === 4) return { type: "heavy", label: "SIEGE PROBE", budget: 11, surge: false };
  if (wave >= 9 && wave % 4 === 1 && has("saboteur", "thief")) {
    return { type: "standard", label: "RESOURCE RAID", budget, surge: false };
  }
  if (wave >= 11 && wave % 4 === 2 && has("burrower")) {
    return { type: "standard", label: "BURROW ATTACK", budget, surge: false };
  }
  if (wave >= 14 && has("commander")) {
    if (r < 0.25) return { type: "heavy", label: "COMMANDER PUSH", budget, surge: false };
  }
  if (r < 0.14 && has("swarm", "splitling", "split")) return { type: "swarm", label: "SWARM WAVE", budget: Math.round(budget * 1.2), surge: false };
  if (r < 0.26 && has("tank", "shield", "commander")) return { type: "heavy", label: "HEAVY ASSAULT", budget, surge: false };
  if (r < 0.38 && has("ranged", "sniper", "mage", "support")) return { type: "ranged", label: "RANGED ASSAULT", budget, surge: false };
  if (r < 0.48 && has("swift", "charger", "leaper", "orbiter")) return { type: "rush", label: "RUSH INVASION", budget, surge: false };
  return { type: "standard", label: "ASSAULT", budget, surge: false };
}

/** Which archetypes may appear at a wave on a map (progressive introduction). */
export function unlockedKinds(wave: number, mapIdx: number): EnemyArchetype[] {
  const kinds: EnemyArchetype[] = ["shadow", "swift"];
  if (wave >= 2) kinds.push("swarm");
  if (wave >= 3) kinds.push("ranged");
  if (wave >= 4) kinds.push("tank", "charger");
  if (wave >= 6 || mapIdx >= 1) kinds.push("split", "support");
  if (mapIdx >= 1) kinds.push("split", "support");
  if (wave >= 8 || mapIdx >= 1) kinds.push("cryo");
  if (wave >= 13 || mapIdx >= 2) kinds.push("split", "corrupter");
  if (wave >= 14 || mapIdx >= 2) kinds.push("support");
  if (wave >= 16 || mapIdx >= 2) kinds.push("summoner", "shield", "elitehunter");
  if (wave >= 18 || mapIdx >= 3) kinds.push("bomber", "sniper");
  if (wave >= 21 || mapIdx >= 4) kinds.push("orbiter", "blinker", "leaper");
  // New tactical cast enters from mid-game so early waves stay readable.
  if (wave >= 12 || mapIdx >= 2) kinds.push("mage");
  if (wave >= 14 || mapIdx >= 3) kinds.push("burrower", "drainer");
  if (wave >= 17 || mapIdx >= 4) kinds.push("commander");
  // Base-raider cast: structures must matter before these arrive.
  if (wave >= 9 || mapIdx >= 1) kinds.push("saboteur");
  if (wave >= 11 || mapIdx >= 2) kinds.push("thief", "traplayer");
  if (wave >= 15 || mapIdx >= 3) kinds.push("artillery", "necromancer");
  if (wave >= 19 || mapIdx >= 4) kinds.push("siege");
  // Mini-bosses arrive in non-boss milestone waves
  if (wave >= 7 && wave % 5 !== 0) kinds.push("minibrute");
  if (wave >= 12 && wave % 5 !== 0) kinds.push("minimage");
  if (wave >= 17 && wave % 5 !== 0) kinds.push("minisiege");
  return [...new Set(kinds)];
}

/**
 * Honest encounter contracts: each named template must spend a minimum share
 * of its budget on its advertised family. Enforced by the engine after the
 * budget roll (see ensureTemplateHonesty) and covered by deterministic tests.
 */
export type TemplateFamily = "ranged" | "heavy" | "swarm" | "rush" | "elite";
export const TEMPLATE_MIN_SHARE: Record<TemplateFamily, number> = {
  ranged: 0.45, heavy: 0.4, swarm: 0.5, rush: 0.5, elite: 0,
};
export const TEMPLATE_KINDS: Record<TemplateFamily, EnemyArchetype[]> = {
  ranged: ["ranged", "sniper", "mage", "support", "cryo", "minimage"],
  heavy: ["tank", "shield", "commander", "siege", "minibrute", "minisiege"],
  swarm: ["swarm", "splitling", "split"],
  rush: ["swift", "charger", "leaper", "orbiter", "elitehunter"],
  elite: [],
};
/** Budget share of `queue` spent on `kinds`. */
export function templateShare(
  queue: { kind: EnemyArchetype }[],
  kinds: EnemyArchetype[],
  cost: Record<EnemyArchetype, number>,
): number {
  let total = 0, part = 0;
  for (const q of queue) {
    const c = cost[q.kind] ?? 1;
    total += c;
    if (kinds.includes(q.kind)) part += c;
  }
  return total > 0 ? part / total : 0;
}
export function validateWaveComposition(
  type: WaveType,
  queue: { kind: EnemyArchetype }[],
): { ok: boolean; share: number; need: number } {
  if (type === "ranged" || type === "heavy" || type === "swarm" || type === "rush") {
    const fam = type as TemplateFamily;
    const share = templateShare(queue, TEMPLATE_KINDS[fam], BUDGET_COST);
    return { ok: share >= TEMPLATE_MIN_SHARE[fam], share, need: TEMPLATE_MIN_SHARE[fam] };
  }
  if (type === "elite") {
    const elites = queue.filter(q => (q as { forceElite?: boolean }).forceElite).length;
    return { ok: elites >= 2, share: elites, need: 2 };
  }
  return { ok: true, share: 1, need: 0 };
}

/**
 * Curated early encounters: small tactical mixes, never raw spam.
 * [kind, count][] per wave 1-4. Later waves use the budget director.
 */
export const EARLY_WAVES: Record<number, [Exclude<EnemyArchetype, "boss">, number][] > = {
  1: [["shadow", 4], ["swift", 2]],
  2: [["shadow", 3], ["swarm", 5], ["swift", 1]],
  3: [["shadow", 3], ["ranged", 2], ["swarm", 3]],
  4: [["shield", 1], ["charger", 2], ["ranged", 1], ["shadow", 3]],
};

export type BossPattern = "brute" | "hunter" | "swarmkeeper" | "artillerist" | "warden" | "blink" | "siegebreaker";

export function bossPatternFor(wave: number): BossPattern {
  const patterns: BossPattern[] = ["brute", "swarmkeeper", "hunter", "artillerist", "warden", "blink", "siegebreaker"];
  const tier = wave / 5;
  return patterns[(tier - 1) % patterns.length] ?? "brute";
}
export function waveHpMult(wave: number): number {
  const n = wave - 1;
  return 1 + n * 0.18 + n * n * 0.008;
}
export function waveDmgMult(wave: number): number {
  return 1 + (wave - 1) * 0.06;
}
export function waveSpeedMult(wave: number): number {
  return Math.min(1.45, 1 + (wave - 1) * 0.02);
}

export interface WaveComp {
  archetype: Exclude<EnemyArchetype, "boss">;
  count: number;
}

/** Progressive mix: new archetypes unlock over time, never everything at once. */
export function waveComp(wave: number): WaveComp[] {
  if (wave % 5 === 0) return bossWaveComp(wave);
  const budget = Math.min(34, 4 + wave * 2);
  const comp: WaveComp[] = [{ archetype: "shadow", count: Math.ceil(budget * 0.45) }];
  if (wave >= 2) comp.push({ archetype: "swarm", count: Math.ceil(budget * 0.2) });
  if (wave >= 3) comp.push({ archetype: "swift", count: Math.ceil(budget * 0.2) });
  if (wave >= 6) comp.push({ archetype: "tank", count: Math.max(1, Math.ceil(budget * 0.12)) });
  if (wave >= 7) comp.push({ archetype: "ranged", count: Math.max(1, Math.ceil(budget * 0.12)) });
  if (wave >= 9) comp.push({ archetype: "shadow", count: Math.ceil(budget * 0.15) });
  return comp;
}

function bossWaveComp(wave: number): WaveComp[] {
  const tier = wave / 5;
  return [
    { archetype: "shadow", count: 3 + tier * 2 },
    { archetype: "swift", count: 2 + tier },
    ...(wave >= 10 ? [{ archetype: "tank" as const, count: 1 + Math.floor(tier / 2) }] : []),
  ];
}

export interface BossSpec {
  hp: number;
  dmg: number;
  speed: number;
  xp: number;
  rf: number;
  modifiers: string[];
  pattern: BossPattern;
  name: string;
}

export function bossSpec(wave: number): BossSpec {
  const tier = wave / 5;
  const pattern = bossPatternFor(wave);
  const modifiers: string[] = [];
  if (wave >= 10) modifiers.push("Summoner");
  if (wave >= 15) modifiers.push("Regenerating");
  if (wave >= 20) modifiers.push("Fast");
  if (wave >= 25) modifiers.push("Armored");
  // Bosses scale on their own gentler curve (never runaway HP sponges).
  const n = wave - 1;
  const hpMult = 1 + n * 0.15 + n * n * 0.004;
  const base = {
    hp: Math.round((220 + tier * 160) * hpMult),
    dmg: Math.round((16 + tier * 4) * waveDmgMult(wave)),
    speed: 34,
    xp: 60 + tier * 30,
    rf: 25 + wave * 2,
    modifiers,
  };
  if (pattern === "brute") {
    // Tier 1 stays close to the classic first boss; later brutes bulk up.
    const hpM = 1 + 0.12 * (tier - 1);
    const dmgM = 1 + 0.07 * (tier - 1);
    const speed = Math.round(24 * (modifiers.includes("Fast") ? 1.5 : 1));
    return { ...base, hp: Math.round(base.hp * hpM), dmg: Math.round(base.dmg * dmgM), speed, pattern, name: "THE BRUTE" };
  }
  if (pattern === "hunter") {
    return { ...base, hp: Math.round(base.hp * 0.8), speed: 58, pattern, name: "THE HUNTER" };
  }
  if (pattern === "artillerist") {
    return { ...base, hp: Math.round(base.hp * 0.85), dmg: Math.round(base.dmg * 0.9), speed: 30, pattern, name: "THE ARTILLERIST" };
  }
  if (pattern === "warden") {
    return { ...base, hp: Math.round(base.hp * 1.4), dmg: Math.round(base.dmg * 0.9), speed: 24, pattern, name: "THE WARDEN" };
  }
  if (pattern === "blink") {
    return { ...base, hp: Math.round(base.hp * 0.85), speed: 40, pattern, name: "THE BLINK KING" };
  }
  if (pattern === "siegebreaker") {
    // Base assault: marches on structures with siege escorts, periodically
    // disables a structure. Milestone boss — bring repairs.
    modifiers.push("Siege");
    return { ...base, hp: Math.round(base.hp * 1.5), dmg: Math.round(base.dmg * 1.1), speed: 22, pattern, name: "THE SIEGEBREAKER" };
  }
  modifiers.push("Summoner");
  return { ...base, hp: Math.round(base.hp * 0.8), dmg: Math.round(base.dmg * 0.8), speed: 30, pattern, name: "THE SWARMKEEPER" };
}

/** Elites appear from wave 8: tougher, better rewards. */
export function eliteChance(wave: number): number {
  if (wave < 8) return 0;
  return Math.min(0.22, 0.05 + (wave - 8) * 0.015);
}

export function xpForLevel(level: number): number {
  return Math.round(8 + level * 6 + level * level * 1.2);
}

/* ------------------------------------------------------------------ */
/* Run (temporary) upgrades                                            */
/* ------------------------------------------------------------------ */

export type UpgradeId =
  | "power" | "rapid" | "multishot" | "pierce" | "ricochet" | "explosive"
  | "burn" | "freeze" | "crit" | "vitality" | "regen" | "minifriend"
  | "ironskin" | "buddy" | "deadeye" | "keen" | "quick" | "boots"
  | "heavy" | "seeker" | "storm" | "sidestep" | "adrenaline" | "fortune";

export type AbilityId =
  | "ab-blast" | "ab-dash" | "ab-nova" | "ab-barrier" | "ab-strike" | "ab-overdrive"
  | "ab-phase" | "ab-gravity" | "ab-chain" | "ab-freeze"
  | "ab-bulwark" | "ab-mend" | "ab-snare" | "ab-wisp" | "ab-overcharge" | "ab-spike"
  | "ab-piercing" | "ab-mortar" | "ab-whirlwind" | "ab-blade" | "ab-reflect" | "ab-shielddome"
  | "ab-leap" | "ab-stunwave";

export type AbilityRole = "offense" | "defense" | "mobility" | "control" | "summon" | "utility";
export type AbilityRarity = "Starter" | "Uncommon" | "Rare" | "Epic";

export interface AbilityDef {
  id: AbilityId;
  name: string;
  desc: string;
  cd: number;
  role: AbilityRole;
  rarity: AbilityRarity;
  /** Default hotkey slot hint (Space/Q/E/R). */
  key: string;
}

export const ABILITIES: Record<AbilityId, AbilityDef> = {
  "ab-blast": { id: "ab-blast", name: "Friend Blast", desc: "Damage + knock back nearby Shadows.", cd: 25, role: "offense", rarity: "Starter", key: "Space" },
  "ab-dash": { id: "ab-dash", name: "Dash", desc: "Quick dodge dash, brief protection.", cd: 6, role: "mobility", rarity: "Uncommon", key: "Q" },
  "ab-nova": { id: "ab-nova", name: "Shadow Nova", desc: "AoE burst around you.", cd: 18, role: "offense", rarity: "Uncommon", key: "Q" },
  "ab-barrier": { id: "ab-barrier", name: "Barrier", desc: "50 damage shield for 12s.", cd: 22, role: "defense", rarity: "Uncommon", key: "E" },
  "ab-strike": { id: "ab-strike", name: "Orbital Strike", desc: "Delayed AoE at aim point.", cd: 20, role: "offense", rarity: "Rare", key: "E" },
  "ab-overdrive": { id: "ab-overdrive", name: "RF Overdrive", desc: "+50% attack speed for 6s.", cd: 30, role: "utility", rarity: "Rare", key: "R" },
  "ab-phase": { id: "ab-phase", name: "Phase Step", desc: "Short blink toward aim through Shadows. No wall clipping.", cd: 8, role: "mobility", rarity: "Rare", key: "Q" },
  "ab-gravity": { id: "ab-gravity", name: "Gravity Pulse", desc: "Pull nearby Shadows to the aim point and slow them.", cd: 16, role: "control", rarity: "Epic", key: "E" },
  "ab-chain": { id: "ab-chain", name: "Chain Burst", desc: "Instant chain-lightning on up to 5 Shadows.", cd: 14, role: "offense", rarity: "Epic", key: "Q" },
  "ab-freeze": { id: "ab-freeze", name: "Freeze Field", desc: "Drop a 6s slow zone at the aim point.", cd: 18, role: "control", rarity: "Rare", key: "E" },
  "ab-bulwark": { id: "ab-bulwark", name: "Bulwark", desc: "+4 armor for 10s. Rank up: longer + reflect.", cd: 24, role: "defense", rarity: "Uncommon", key: "E" },
  "ab-mend": { id: "ab-mend", name: "Mend", desc: "Heal 35% max HP now. Rank up: bigger + cleanse slow.", cd: 28, role: "defense", rarity: "Rare", key: "E" },
  "ab-snare": { id: "ab-snare", name: "Snare Burst", desc: "Stun nearby Shadows briefly. Rank up: wider + damage.", cd: 20, role: "control", rarity: "Rare", key: "Q" },
  "ab-wisp": { id: "ab-wisp", name: "Wisp Call", desc: "Summon a temp wisp fighter for 25s. Rank up: two wisps.", cd: 32, role: "summon", rarity: "Epic", key: "R" },
  "ab-overcharge": { id: "ab-overcharge", name: "Overcharge", desc: "Structures fire 2x for 8s + repair 20. Rank up: longer.", cd: 30, role: "utility", rarity: "Epic", key: "R" },
  "ab-spike": { id: "ab-spike", name: "Spike Trap", desc: "Place a hidden trap at aim; triggers on touch. Rank up: +traps.", cd: 16, role: "control", rarity: "Uncommon", key: "Q" },
  "ab-piercing": { id: "ab-piercing", name: "Piercing Lance", desc: "High-speed piercing beam along aim that shreds lines of foes.", cd: 15, role: "offense", rarity: "Rare", key: "Q" },
  "ab-mortar": { id: "ab-mortar", name: "Cluster Mortar", desc: "Lob explosive cluster at cursor that fractures into secondary blasts.", cd: 22, role: "offense", rarity: "Epic", key: "E" },
  "ab-whirlwind": { id: "ab-whirlwind", name: "Blade Cyclone", desc: "Spinning energy blades shred melee foes and clear incoming bolts.", cd: 18, role: "offense", rarity: "Rare", key: "Q" },
  "ab-blade": { id: "ab-blade", name: "Energy Blade", desc: "Wide arc slash in front dealing heavy damage and massive knockback.", cd: 10, role: "offense", rarity: "Uncommon", key: "Q" },
  "ab-reflect": { id: "ab-reflect", name: "Prism Wall", desc: "Deploy an angled crystal barrier that reflects enemy projectiles.", cd: 20, role: "defense", rarity: "Rare", key: "E" },
  "ab-shielddome": { id: "ab-shielddome", name: "Sanctuary Dome", desc: "Create a 10s dome shielding Friend and nearby structures.", cd: 35, role: "defense", rarity: "Epic", key: "R" },
  "ab-leap": { id: "ab-leap", name: "Comet Leap", desc: "Leap high and crash down at aim, stunning and damaging enemies.", cd: 14, role: "mobility", rarity: "Rare", key: "Q" },
  "ab-stunwave": { id: "ab-stunwave", name: "EMP Shockwave", desc: "Paralyze all nearby Frenemies for 3.5s with an electric pulse.", cd: 24, role: "control", rarity: "Epic", key: "E" },
};

/** Ability rank cap during a run (re-pick ranks up: bigger, wider, longer). */
export const ABILITY_MAX_RANK = 3;

/** Blast + up to 2 acquired actives. Enforced on acquisition. */
export const MAX_ACTIVE_ABILITIES = 3;
/** Ability slot hotkeys shown on HUD. */
export const ABILITY_HOTKEYS = ["Space", "Q", "E"] as const;

export interface UpgradeDef {
  id: UpgradeId;
  name: string;
  desc: string;
  icon: string;
  maxStacks: number;
  /** Name shown once fully stacked (evolution fantasy). */
  evolvedName?: string;
  evolvedDesc?: string;
}

export const UPGRADES: Record<UpgradeId, UpgradeDef> = {
  power: { id: "power", name: "Power", desc: "+25% damage", icon: "power", maxStacks: 3, evolvedName: "OVERWHELM", evolvedDesc: "+25% damage, +10% crit chance" },
  rapid: { id: "rapid", name: "Rapid Fire", desc: "+20% attack speed", icon: "rapid", maxStacks: 3, evolvedName: "OVERCLOCKED", evolvedDesc: "Attacks much faster, 15% chance to fire twice" },
  multishot: { id: "multishot", name: "Multi-Shot", desc: "+1 projectile", icon: "multishot", maxStacks: 3, evolvedName: "FRIEND BARRAGE", evolvedDesc: "+2 projectiles and +20% damage" },
  pierce: { id: "pierce", name: "Pierce", desc: "Shots pass through +1 enemy", icon: "pierce", maxStacks: 2, evolvedName: "LANCE", evolvedDesc: "Shots pierce everything, +15% damage" },
  ricochet: { id: "ricochet", name: "Ricochet", desc: "Shots bounce to +1 enemy", icon: "ricochet", maxStacks: 2 },
  explosive: { id: "explosive", name: "Explosive Shot", desc: "Hits explode for 50% area damage", icon: "explosive", maxStacks: 2, evolvedDesc: "Bigger blasts, 80% area damage" },
  burn: { id: "burn", name: "Burn", desc: "Shots ignite: damage over time", icon: "burn", maxStacks: 3, evolvedName: "INFERNO", evolvedDesc: "Fierce burn that spreads to nearby Shadows" },
  freeze: { id: "freeze", name: "Freeze", desc: "30% chance to slow enemies", icon: "freeze", maxStacks: 2, evolvedDesc: "Full freeze instead of slow" },
  crit: { id: "crit", name: "Critical Hit", desc: "+12% crit chance (2x damage)", icon: "crit", maxStacks: 2, evolvedDesc: "Crits deal 3x damage" },
  vitality: { id: "vitality", name: "Vitality", desc: "+30 max health, heal 30 now", icon: "vitality", maxStacks: 3 },
  regen: { id: "regen", name: "Regeneration", desc: "Restore 1.2 HP per second", icon: "regen", maxStacks: 3 },
  minifriend: { id: "minifriend", name: "Mini Friend", desc: "A companion fights beside you", icon: "minifriend", maxStacks: 3, evolvedName: "FRIEND ARMY", evolvedDesc: "Two companions fight beside you" },
  ironskin: { id: "ironskin", name: "Iron Skin", desc: "+2 armor (flat damage reduction)", icon: "ironskin", maxStacks: 3 },
  buddy: { id: "buddy", name: "Buddy Training", desc: "Companions +40% damage", icon: "buddy", maxStacks: 3 },
  deadeye: { id: "deadeye", name: "Deadly Eye", desc: "+0.5 crit damage", icon: "deadeye", maxStacks: 2 },
  keen: { id: "keen", name: "Keen Eye", desc: "+40 pickup radius, +5% RF", icon: "keen", maxStacks: 2 },
  quick: { id: "quick", name: "Quick Hands", desc: "Blast recharges 15% faster", icon: "quick", maxStacks: 2 },
  boots: { id: "boots", name: "Swift Boots", desc: "+8% move speed", icon: "boots", maxStacks: 2 },
  heavy: { id: "heavy", name: "Heavy Rounds", desc: "+20% damage, bigger shots, slower", icon: "heavy", maxStacks: 2 },
  seeker: { id: "seeker", name: "Seeker Rounds", desc: "Shots curve toward Shadows", icon: "seeker", maxStacks: 2 },
  storm: { id: "storm", name: "Storm Rounds", desc: "30% chance to chain lightning", icon: "storm", maxStacks: 2 },
  sidestep: { id: "sidestep", name: "Sidestep", desc: "+8% dodge chance", icon: "sidestep", maxStacks: 2 },
  adrenaline: { id: "adrenaline", name: "Adrenaline", desc: "Dash recharges 20% faster", icon: "adrenaline", maxStacks: 2 },
  fortune: { id: "fortune", name: "Fortune", desc: "Better Trader + boss luck", icon: "fortune", maxStacks: 2 },
};

export const UPGRADE_IDS = Object.keys(UPGRADES) as UpgradeId[];

/* ------------------------------------------------------------------ */
/* Permanent progression                                               */
/* ------------------------------------------------------------------ */

export type GearSlot = "weapon" | "armor" | "trinket";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type WeaponFamily = "standard" | "twin" | "rapid" | "heavy" | "needle" | "spark" | "buster" | "scatter" | "orbital" | "homing" | "beam";

/**
 * Player-facing ATTACK STYLE names per family. The Friend itself is the
 * source of every attack — these are powers, relics and techniques, never
 * firearms. (Family ids are engine-stable; only display names changed.)
 */
export const ATTACK_STYLE_NAMES: Record<WeaponFamily, string> = {
  standard: "Friend Bolt",
  twin: "Twin Spark",
  rapid: "Rapid Sparks",
  heavy: "Heavy Pulse",
  needle: "Shadow Lance",
  spark: "Friend Arc",
  buster: "Shadowbane Pulse",
  scatter: "Star Burst",
  orbital: "Orbiting Charms",
  homing: "Seeking Sparks",
  beam: "Friend Beam",
};

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: Rarity;
  desc: string;
  /** Flat stat deltas applied to derived Friend stats. */
  dmg?: number;
  rate?: number; // +attack speed fraction, e.g. 0.1 = +10%
  hp?: number;
  crit?: number; // +crit chance fraction
  critDmg?: number; // +crit multiplier
  projectiles?: number;
  pierce?: number;
  regen?: number;
  armor?: number; // flat damage reduction per hit
  moveSpeed?: number; // fraction, e.g. 0.1 = +10% move speed
  magnet?: number; // +pickup radius, world units
  cdr?: number; // blast cooldown reduction fraction
  dodge?: number; // chance to fully avoid a hit
  bossDmg?: number; // +damage fraction vs bosses
  compDmg?: number; // +companion damage fraction
  thorns?: number; // reflect fraction of melee damage
  knockback?: number; // extra knockback on hits
  bounce?: number; // +bounce count (ricochet builds)
  echo?: boolean; // every 5th volley repeats (Echo Duet)
  volatile?: number; // kill explosion chance 0-1 (Volatile Cell/Caster)
  price?: number; // shop price in SimRF (undefined = not sold / starter)
  family?: WeaponFamily; // weapon behavior + visuals
  /** Projectile tint so upgrades are visible in combat. */
  tint?: string;
}

export const GEAR: GearItem[] = [
  { id: "w0", name: "Buddy Spark", slot: "weapon", rarity: "Common", desc: "Your Friend's own spark. One steady bolt from the heart.", tint: "#7db83e", family: "standard" },
  { id: "w1", name: "Friend Bolt", slot: "weapon", rarity: "Uncommon", desc: "+4 damage.", dmg: 4, tint: "#7ee787", family: "standard", price: 60 },
  { id: "w2", name: "Rare Bolt", slot: "weapon", rarity: "Rare", desc: "+8 damage, +5% crit.", dmg: 8, crit: 0.05, tint: "#79c0ff", family: "standard", price: 130 },
  { id: "w3", name: "Twin Spark", slot: "weapon", rarity: "Epic", desc: "+12 damage, +1 projectile.", dmg: 12, projectiles: 1, tint: "#d2a8ff", family: "twin", price: 210 },
  { id: "w4", name: "Shadowbane Lance", slot: "weapon", rarity: "Legendary", desc: "+18 damage, +10% crit, +1 pierce.", dmg: 18, crit: 0.1, pierce: 1, tint: "#ffb224", family: "buster", price: 330 },
  { id: "w5", name: "Rapid Sparks", slot: "weapon", rarity: "Uncommon", desc: "+18% attack speed, -2 damage.", dmg: -2, rate: 0.18, tint: "#8fd6c2", family: "rapid", price: 90 },
  { id: "w6", name: "Heavy Pulse", slot: "weapon", rarity: "Rare", desc: "+14 damage, slower, big knockback.", dmg: 14, rate: -0.2, knockback: 60, tint: "#c96a2e", family: "heavy", price: 170 },
  { id: "w7", name: "Shadow Lance", slot: "weapon", rarity: "Epic", desc: "+8 damage, +2 pierce.", dmg: 8, pierce: 2, tint: "#9db8dd", family: "needle", price: 260 },
  { id: "w8", name: "Friend Arc", slot: "weapon", rarity: "Epic", desc: "+6 damage, shots chain +2.", dmg: 6, tint: "#e8c53a", family: "spark", price: 250 },
  { id: "w9", name: "Star Burst", slot: "weapon", rarity: "Rare", desc: "5-spark Friend-energy cone, brutal close up.", dmg: 2, tint: "#c96a2e", family: "scatter", price: 180 },
  { id: "w10", name: "Seeking Sparks", slot: "weapon", rarity: "Epic", desc: "Friend sparks gently home in.", dmg: 6, tint: "#7a5fc0", family: "homing", price: 240 },
  { id: "w11", name: "Orbiting Charms", slot: "weapon", rarity: "Epic", desc: "Charms circle you, shredding contact.", dmg: 4, tint: "#3f7fbf", family: "orbital", price: 250 },
  { id: "w12", name: "Friend Beam", slot: "weapon", rarity: "Legendary", desc: "Pulsed beam from the Friend, huge damage.", dmg: 22, rate: -0.25, crit: 0.05, tint: "#fff", family: "beam", price: 340 },
  { id: "a0", name: "Soft Hoodie", slot: "armor", rarity: "Common", desc: "Cozy. Barely armor." },
  { id: "a1", name: "Friend Plate", slot: "armor", rarity: "Uncommon", desc: "+25 max health.", hp: 25, price: 50 },
  { id: "a2", name: "Rare Mail", slot: "armor", rarity: "Rare", desc: "+50 max health, +5% attack speed.", hp: 50, rate: 0.05, price: 120 },
  { id: "a3", name: "Plot Aegis", slot: "armor", rarity: "Epic", desc: "+90 max health, regenerate 0.8/s.", hp: 90, regen: 0.8, price: 200 },
  { id: "a4", name: "Heartguard", slot: "armor", rarity: "Legendary", desc: "+140 max health, regenerate 1.5/s.", hp: 140, regen: 1.5, price: 300 },
  { id: "a5", name: "Scout Weave", slot: "armor", rarity: "Rare", desc: "+15% move speed, +8% dodge, -20 max HP.", hp: -20, moveSpeed: 0.15, dodge: 0.08, price: 150 },
  { id: "a6", name: "Bulwark Plate", slot: "armor", rarity: "Epic", desc: "+70 HP, +3 armor, -8% move speed.", hp: 70, armor: 3, moveSpeed: -0.08, price: 240 },
  { id: "a7", name: "Mirror Mail", slot: "armor", rarity: "Epic", desc: "Reflects 30% melee, +40 HP.", hp: 40, thorns: 0.3, price: 230 },
  { id: "t0", name: "Garden Pebble", slot: "trinket", rarity: "Common", desc: "A lucky rock. Probably." },
  { id: "t1", name: "Lucky Seed", slot: "trinket", rarity: "Uncommon", desc: "+5% crit chance.", crit: 0.05, price: 55 },
  { id: "t2", name: "Sun Crystal", slot: "trinket", rarity: "Rare", desc: "+10% attack speed.", rate: 0.1, price: 110 },
  { id: "t3", name: "Echo Charm", slot: "trinket", rarity: "Epic", desc: "+10% attack speed, +5% crit.", rate: 0.1, crit: 0.05, price: 190 },
  { id: "t4", name: "Heart of the Plot", slot: "trinket", rarity: "Legendary", desc: "+1 projectile, regenerate 1/s.", projectiles: 1, regen: 1, price: 290 },
  { id: "t5", name: "RF Magnet", slot: "trinket", rarity: "Uncommon", desc: "+50 pickup radius.", magnet: 50, price: 80 },
  { id: "t6", name: "Shadow Core", slot: "trinket", rarity: "Rare", desc: "+35% damage to bosses.", bossDmg: 0.35, price: 160 },
  { id: "t7", name: "Friend Totem", slot: "trinket", rarity: "Epic", desc: "Companions +80% damage.", compDmg: 0.8, price: 200 },
  { id: "t8", name: "Overcharger", slot: "trinket", rarity: "Legendary", desc: "Blast recharges 30% faster, +8% attack speed.", cdr: 0.3, rate: 0.08, price: 320 },
  // --- New Friend techniques (visible styles + behaviors) ---
  { id: "w13", name: "Glass Lance", slot: "weapon", rarity: "Rare", desc: "+35% shot speed, +15% damage, -15 max HP. Long fast tracers.", dmg: 3, hp: -15, tint: "#bfe3ff", family: "needle", price: 190 },
  { id: "w14", name: "Echo Duet", slot: "weapon", rarity: "Epic", desc: "Every 5th volley repeats instantly. Twin charms.", dmg: 6, rate: 0.08, echo: true, tint: "#9db8dd", family: "twin", price: 270 },
  { id: "w15", name: "Prism Charm", slot: "weapon", rarity: "Epic", desc: "+1 bounce, +6 damage. Shots split light on first hit.", dmg: 6, bounce: 1, tint: "#c9a8ff", family: "spark", price: 260 },
  { id: "w16", name: "Ricochet Charm", slot: "weapon", rarity: "Rare", desc: "+1 bounce from a pinball charm. Arcing green bolts.", dmg: 4, bounce: 1, tint: "#7ee787", family: "spark", price: 200 },
  { id: "w17", name: "Volatile Pulse", slot: "weapon", rarity: "Legendary", desc: "Kills pop for 60% area (12% chance). Heavy orange aura.", dmg: 10, rate: -0.1, knockback: 30, volatile: 0.12, tint: "#e8823a", family: "buster", price: 330 },
  // --- New armor (tradeoffs, visible rings/plates) ---
  { id: "a8", name: "Berserker Plate", slot: "armor", rarity: "Epic", desc: "+10 damage, -30 max HP. Damage rises as HP falls (relic-like).", dmg: 10, hp: -30, price: 230 },
  { id: "a9", name: "Blink Weave", slot: "armor", rarity: "Rare", desc: "+10% move speed, +20 pickup range. Light scout trim.", moveSpeed: 0.1, magnet: 20, price: 160 },
  { id: "a10", name: "Ember Guard", slot: "armor", rarity: "Rare", desc: "+40 HP, burn shots last +1s. Warm orange rim.", hp: 40, price: 150 },
  { id: "a11", name: "Warden Shell", slot: "armor", rarity: "Legendary", desc: "+110 HP, +2 armor, -5% move speed. Heavy pale plates.", hp: 110, armor: 2, moveSpeed: -0.05, price: 310 },
  { id: "a12", name: "Hunter Scope Mail", slot: "armor", rarity: "Epic", desc: "+30% boss damage, -10% swarm clear (fewer pellets).", bossDmg: 0.3, hp: 20, price: 240 },
  // --- New trinkets (orbit charms, auras, trails) ---
  { id: "t9", name: "Magnet Charm", slot: "trinket", rarity: "Uncommon", desc: "+70 pickup radius. Small orbiting magnet.", magnet: 70, price: 85 },
  { id: "t10", name: "Timepiece", slot: "trinket", rarity: "Epic", desc: "Abilities recharge 20% faster. Clock-like orbit.", cdr: 0.2, price: 230 },
  { id: "t11", name: "Volatile Cell", slot: "trinket", rarity: "Rare", desc: "Kills have a 12% small explosion. Ember spark orbit.", volatile: 0.12, price: 170 },
  { id: "t12", name: "Friend Swarm Totem", slot: "trinket", rarity: "Legendary", desc: "Companions +120% damage, +1 shot shimmer.", compDmg: 1.2, projectiles: 0, price: 300 },
  { id: "t13", name: "Ricochet Charm", slot: "trinket", rarity: "Rare", desc: "Shots bounce +1 (visual arcs).", bounce: 1, price: 180 },
  { id: "t14", name: "Glass Heart", slot: "trinket", rarity: "Legendary", desc: "+25% damage, -25 max HP. Red glass aura.", dmg: 8, hp: -25, price: 290 },
];

export function gearById(id: string): GearItem {
  const found = GEAR.find(g => g.id === id);
  if (!found) throw new Error(`Unknown gear: ${id}`);
  return found;
}

/** Boss-drop pool by wave tier (ids must exist in GEAR). */
export function bossDropPool(wave: number): string[] {
  if (wave >= 20) return ["w4", "a4", "t4", "w3", "a3", "t3"];
  if (wave >= 10) return ["w3", "a3", "t3", "w2", "a2", "t2"];
  return ["w2", "a2", "t2", "w1", "a1", "t1"];
}

export function bossDropChance(wave: number, lootLuck: number): number {
  return Math.min(0.9, 0.35 + lootLuck * 0.1 + (wave >= 15 ? 0.15 : 0));
}

export interface UpgradeLevelDef {
  id: string;
  name: string;
  desc: string;
  category: "friend" | "defense" | "economy";
  maxLevel: number;
  costs: number[];
}

export const PERMA_UPGRADES: UpgradeLevelDef[] = [
  { id: "dmg", name: "Power Training", desc: "+10% Friend damage per level", category: "friend", maxLevel: 5, costs: [30, 60, 110, 180, 280] },
  { id: "rate", name: "Swift Hands", desc: "+8% attack speed per level", category: "friend", maxLevel: 5, costs: [30, 60, 110, 180, 280] },
  { id: "hp", name: "Hearty Meals", desc: "+20 max health per level", category: "friend", maxLevel: 5, costs: [25, 50, 95, 160, 250] },
  { id: "crit", name: "Lucky Charm", desc: "+3% crit chance per level", category: "friend", maxLevel: 5, costs: [35, 70, 130, 210, 320] },
  { id: "turret", name: "Friend Turret", desc: "Build/upgrade an auto-turret on the plot", category: "defense", maxLevel: 4, costs: [40, 90, 170, 280] },
  { id: "wall", name: "Barricade", desc: "Slows Shadows near the plot heart", category: "defense", maxLevel: 3, costs: [35, 80, 150] },
  { id: "healer", name: "Healing Station", desc: "Periodically restores Friend health", category: "defense", maxLevel: 3, costs: [50, 110, 200] },
  { id: "collector", name: "RF Collector", desc: "+20% simulated RF from Shadows per level", category: "defense", maxLevel: 3, costs: [45, 100, 190] },
  { id: "greed", name: "Greedy Shadows", desc: "+15% simulated RF per level", category: "economy", maxLevel: 5, costs: [30, 65, 120, 200, 300] },
  { id: "loot", name: "Loot Luck", desc: "+10% boss gear-drop chance per level", category: "economy", maxLevel: 3, costs: [60, 130, 240] },
  // --- Content-unlocking base progression (possibility, not just numbers) ---
  { id: "altar", name: "Ability Altar", desc: "Unlocks Dash/Barrier → Nova/Strike → Phase/Freeze/Overdrive → Gravity/Chain into runs", category: "friend", maxLevel: 4, costs: [60, 130, 220, 340] },
  { id: "workshop", name: "Workshop", desc: "Unlocks Rare+ weapon tiers and new families in Trader/bosses", category: "economy", maxLevel: 3, costs: [70, 150, 260] },
  { id: "beacon", name: "Trader Beacon", desc: "Better Trader rarity, cheaper rerolls, +stock at Lv3", category: "economy", maxLevel: 3, costs: [55, 120, 230] },
  { id: "archive", name: "Shadow Archive", desc: "Study Shadows: +4% boss/elite damage per level, unlocks bestiary hints", category: "friend", maxLevel: 2, costs: [80, 170] },
  { id: "medbay", name: "Med Station", desc: "+15% healing between maps per level, cheaper mid-run heal", category: "defense", maxLevel: 3, costs: [45, 100, 180] },
  { id: "shrine", name: "Luck Shrine", desc: "Small controlled rarity bonus for Trader + boss drops", category: "economy", maxLevel: 3, costs: [50, 110, 200] },
  { id: "frost", name: "Frost Spire", desc: "Build/upgrade a chilling tower on the plot", category: "defense", maxLevel: 3, costs: [70, 150, 260] },
  { id: "generator", name: "Solar Generator", desc: "Generates passive SimRF (+15/min per tier) for your base", category: "economy", maxLevel: 3, costs: [50, 110, 200] },
  { id: "training", name: "Training Posts", desc: "Stronger level-up choices; unlocks ability ranks", category: "friend", maxLevel: 3, costs: [55, 120, 210] },
  { id: "vault", name: "Root Vault", desc: "+production storage for idle RF", category: "economy", maxLevel: 3, costs: [40, 90, 170] },
  { id: "kennel", name: "Wisp Kennel", desc: "Unlocks Wisp Call + companion power", category: "friend", maxLevel: 2, costs: [90, 200] },
  { id: "bulwark", name: "Bulwark Research", desc: "Unlocks Bulwark/Mend into the run pool", category: "friend", maxLevel: 2, costs: [75, 160] },
  { id: "traps", name: "Trapworks", desc: "Unlocks Snare/Spike into the run pool", category: "defense", maxLevel: 2, costs: [65, 150] },
  { id: "overcharge", name: "Overcharge Rig", desc: "Unlocks Overcharge/Wisp into the run pool", category: "defense", maxLevel: 2, costs: [85, 190] },
  { id: "plots", name: "Plot Expansion", desc: "+building room; unlocks expeditions", category: "economy", maxLevel: 3, costs: [80, 170, 300] },
];

/** Abilities available in runs given permanent unlocks (Blast always). */
export function abilitiesForAltar(
  altar: number,
  extra?: { bulwark?: number; traps?: number; overcharge?: number; kennel?: number; workshop?: number; shrine?: number },
): AbilityId[] {
  const out: AbilityId[] = ["ab-blast"];
  if (altar >= 1) out.push("ab-dash", "ab-barrier");
  if (altar >= 2) out.push("ab-nova", "ab-strike", "ab-whirlwind");
  if (altar >= 3) out.push("ab-phase", "ab-freeze", "ab-overdrive", "ab-piercing");
  if (altar >= 4) out.push("ab-gravity", "ab-chain", "ab-shielddome", "ab-mortar");
  if ((extra?.bulwark ?? 0) >= 1) out.push("ab-bulwark", "ab-reflect");
  if ((extra?.bulwark ?? 0) >= 2) out.push("ab-mend");
  if ((extra?.traps ?? 0) >= 1) out.push("ab-snare", "ab-spike");
  if ((extra?.traps ?? 0) >= 2) out.push("ab-stunwave");
  if ((extra?.overcharge ?? 0) >= 1) out.push("ab-overcharge");
  if ((extra?.kennel ?? 0) >= 1 || (extra?.overcharge ?? 0) >= 2) out.push("ab-wisp", "ab-leap");
  if ((extra?.workshop ?? 0) >= 1) out.push("ab-blade");
  return [...new Set(out)];
}

/** Idle SimRF production rate in SimRF/minute. */
export function idleProductionRate(buildings: Record<string, number>): number {
  const collector = buildings.collector ?? 0;
  const generator = buildings.generator ?? 0;
  return collector * 10 + generator * 15;
}

/** Idle SimRF storage capacity before capping. */
export function idleStorageCap(buildings: Record<string, number>): number {
  const vault = buildings.vault ?? 0;
  return 150 + vault * 200;
}

export interface MilestoneDef {
  id: string;
  name: string;
  desc: string;
  category: "settlement" | "defense" | "mastery";
  rewardSimRf: number;
}

export const MILESTONES: MilestoneDef[] = [
  { id: "m-land", name: "Homestead Settled", desc: "Select a home land plot for your Rare Friend.", category: "settlement", rewardSimRf: 30 },
  { id: "m-turret", name: "First Defense", desc: "Construct a Friend Turret on your plot.", category: "defense", rewardSimRf: 40 },
  { id: "m-collector", name: "Resource Engine", desc: "Build an RF Collector to harvest from Frenemies.", category: "settlement", rewardSimRf: 40 },
  { id: "m-defend-1", name: "First Stand", desc: "Successfully survive Wave 1 defense.", category: "defense", rewardSimRf: 35 },
  { id: "m-brute", name: "Giant Felled", desc: "Defeat The Brute on Wave 5.", category: "mastery", rewardSimRf: 60 },
  { id: "m-trader", name: "Trade Partner", desc: "Complete your first purchase from the Rare Trader.", category: "settlement", rewardSimRf: 50 },
  { id: "m-altar", name: "Altar of Power", desc: "Build the Ability Altar to unlock active abilities.", category: "settlement", rewardSimRf: 60 },
  { id: "m-frost", name: "Chilling Perimeter", desc: "Construct a Frost Spire to slow intruders.", category: "defense", rewardSimRf: 60 },
  { id: "m-vault", name: "Secure Treasury", desc: "Construct a Root Vault to expand idle storage.", category: "settlement", rewardSimRf: 50 },
  { id: "m-swarm", name: "Swarm Vanquished", desc: "Defeat The Swarmkeeper on Wave 10.", category: "mastery", rewardSimRf: 80 },
  { id: "m-tier2", name: "Developing Village", desc: "Upgrade any 3 structures to Tier 2+.", category: "settlement", rewardSimRf: 90 },
  { id: "m-hunter", name: "Apex Predator", desc: "Defeat The Hunter on Wave 15.", category: "mastery", rewardSimRf: 100 },
  { id: "m-expedition", name: "World Explorer", desc: "Discover and enter 3 distinct areas.", category: "settlement", rewardSimRf: 100 },
  { id: "m-warden", name: "Fortress Breached", desc: "Defeat The Warden on Wave 20.", category: "mastery", rewardSimRf: 150 },
  { id: "m-tier4", name: "Masterwork Citadel", desc: "Reach Tier 4 on your Turret or Altar.", category: "settlement", rewardSimRf: 200 },
];

export const RARITY_COLORS: Record<Rarity, string> = {
  Common: "#9aa4b2",
  Uncommon: "#7ee787",
  Rare: "#79c0ff",
  Epic: "#d2a8ff",
  Legendary: "#ffb224",
};

/* ------------------------------------------------------------------ */
/* Derived stat computation                                            */
/* ------------------------------------------------------------------ */

export interface PermanentState {
  dmg: number; rate: number; hp: number; crit: number;
  turret: number; wall: number; healer: number; collector: number;
  greed: number; loot: number;
  altar?: number; workshop?: number; beacon?: number; archive?: number;
  medbay?: number; shrine?: number;
  frost?: number; training?: number; vault?: number; kennel?: number;
  bulwark?: number; traps?: number; overcharge?: number; plots?: number;
}

export interface DerivedStats {
  dmg: number;
  interval: number; // seconds between volleys
  maxHp: number;
  critC: number;
  critM: number;
  range: number;
  regen: number;
  projectiles: number;
  pierce: number;
  bounce: number;
  echo: boolean;
  volatile: number; // kill explosion chance 0-1
  rfMult: number;
  armor: number;
  moveSpeed: number; // fraction modifier, 0 = base
  magnet: number; // extra pickup radius, world units
  cdr: number; // blast cooldown reduction fraction
  abilityCdr: number; // active-ability cooldown reduction fraction (Timepiece)
  dodge: number; // chance to avoid a hit
  bossDmg: number; // bonus damage fraction vs bosses
  compDmg: number; // companion damage bonus fraction
  thorns: number; // reflected melee fraction
  knockback: number; // extra knockback
  family: WeaponFamily;
}

export function computeDerived(perma: PermanentState, gear: GearItem[]): DerivedStats {
  let dmg = 12 * (1 + perma.dmg * 0.1);
  let interval = 0.9 / (1 + perma.rate * 0.08);
  let maxHp = 100 + perma.hp * 20;
  let critC = 0.05 + perma.crit * 0.03;
  let critM = 2;
  let regen = 0;
  let projectiles = 1;
  let pierce = 0;
  let bounce = 0;
  let echo = false;
  let volatile = 0;
  let armor = 0;
  let moveSpeed = 0;
  let magnet = 0;
  let cdr = 0;
  let abilityCdr = 0;
  let dodge = 0;
  let bossDmg = 0;
  let compDmg = 0;
  let thorns = 0;
  let knockback = 0;
  let family: WeaponFamily = "standard";
  for (const g of gear) {
    if (g.dmg) dmg += g.dmg;
    if (g.rate) interval /= 1 + g.rate;
    if (g.hp) maxHp += g.hp;
    if (g.crit) critC += g.crit;
    if (g.critDmg) critM += g.critDmg;
    if (g.regen) regen += g.regen;
    if (g.projectiles) projectiles += g.projectiles;
    if (g.pierce) pierce += g.pierce;
    if (g.bounce) bounce += g.bounce;
    if (g.echo) echo = true;
    if (g.volatile) volatile += g.volatile;
    if (g.armor) armor += g.armor;
    if (g.moveSpeed) moveSpeed += g.moveSpeed;
    if (g.magnet) magnet += g.magnet;
    if (g.cdr) { cdr += g.cdr; abilityCdr += g.cdr * 0.66; }
    if (g.dodge) dodge += g.dodge;
    if (g.bossDmg) bossDmg += g.bossDmg;
    if (g.compDmg) compDmg += g.compDmg;
    if (g.thorns) thorns += g.thorns;
    if (g.knockback) knockback += g.knockback;
    if (g.slot === "weapon" && g.family) family = g.family;
  }
  // Archive: small tactical edge vs elites/bosses.
  const archive = perma.archive ?? 0;
  if (archive > 0) bossDmg += archive * 0.04;
  return {
    dmg: Math.round(dmg * 10) / 10,
    interval: Math.max(0.22, Math.round(interval * 100) / 100),
    maxHp: Math.round(maxHp),
    critC: Math.min(0.6, Math.round(critC * 100) / 100),
    critM: Math.round(critM * 100) / 100,
    range: 172, // world units (engine FRIEND_RANGE)
    regen: Math.round(regen * 10) / 10,
    projectiles,
    pierce,
    bounce,
    echo,
    volatile: Math.min(0.5, Math.round(volatile * 100) / 100),
    rfMult: Math.round((1 + perma.collector * 0.2 + perma.greed * 0.15) * 100) / 100,
    armor: Math.round(armor * 10) / 10,
    moveSpeed: Math.round(moveSpeed * 100) / 100,
    magnet: Math.round(magnet),
    cdr: Math.min(0.5, Math.round(cdr * 100) / 100),
    abilityCdr: Math.min(0.4, Math.round(abilityCdr * 100) / 100),
    dodge: Math.min(0.4, Math.round(dodge * 100) / 100),
    bossDmg: Math.round(bossDmg * 100) / 100,
    compDmg: Math.round(compDmg * 100) / 100,
    thorns: Math.min(0.8, Math.round(thorns * 100) / 100),
    knockback: Math.round(knockback),
    family,
  };
}

/** Deterministic PRNG so runs are reproducible in tests. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BLAST_COOLDOWN = 25;
export const BLAST_DMG_MULT = 6;
export const BLAST_RADIUS = 220;
export const HEAL_AMOUNT = 40;
export function healCost(uses: number, medbay = 0): number {
  const base = 5 + uses * 5;
  return Math.max(2, Math.round(base * (1 - Math.min(0.45, medbay * 0.15))));
}
export const REROLL_COST = 5;

/* ------------------------------------------------------------------ */
/* Maps (every 10 waves)                                               */
/* ------------------------------------------------------------------ */

export interface MapDef {
  preset: string;
  name: string;
  blurb: string;
  /** Extra elite chance on this map. */
  eliteBonus: number;
  /** RF multiplier on this map. */
  rfMult: number;
  /** Ember vents (telegraphed hazard) on this map. */
  vents: boolean;
}

export const MAPS: MapDef[] = [
  { preset: "01-garden-oval-complete", name: "Sun Garden", blurb: "Open paths. Learn to move.", eliteBonus: 0, rfMult: 1, vents: false },
  { preset: "02-circuit-courtyard-complete", name: "Copper Court", blurb: "Tight lanes. Ranged Shadows thrive.", eliteBonus: 0.03, rfMult: 1.15, vents: false },
  { preset: "03-crystal-mesa-complete", name: "Ember Mesa", blurb: "Chokepoints and ember vents. Keep moving.", eliteBonus: 0.06, rfMult: 1.3, vents: true },
  { preset: "05-tidal-islands-complete", name: "Reed Tides", blurb: "Broken ground. Swarms pour through.", eliteBonus: 0.09, rfMult: 1.45, vents: true },
  { preset: "04-rooftop-terrace-complete", name: "Sky Terrace", blurb: "High perches for shielded Shadows.", eliteBonus: 0.12, rfMult: 1.6, vents: true },
  { preset: "06-orbital-hex-complete", name: "Star Hex", blurb: "The deep plot. Everything hunts.", eliteBonus: 0.15, rfMult: 1.8, vents: true },
];

export function mapForWave(wave: number): number {
  return Math.min(MAPS.length - 1, Math.floor((wave - 1) / 5));
}

/* ------------------------------------------------------------------ */
/* Consumables (Trader, run-only)                                      */
/* ------------------------------------------------------------------ */

export interface ConsumableDef {
  id: string;
  name: string;
  desc: string;
  price: number;
}

export const CONSUMABLES: ConsumableDef[] = [
  { id: "c-heal", name: "Full Heal", desc: "Restore 60% max HP now.", price: 25 },
  { id: "c-ward", name: "Emergency Shield", desc: "40 damage shield for this run.", price: 30 },
  { id: "c-tonic", name: "Power Tonic", desc: "+30% damage for 30s.", price: 20 },
  { id: "c-token", name: "Lucky Token", desc: "+50% drops next wave.", price: 15 },
  { id: "c-magnet", name: "Magnet Burst", desc: "Pulls all battlefield pickups to you.", price: 18 },
  { id: "c-fury", name: "Rare Fury", desc: "+40% damage + fire rate for 12s, fiery aura.", price: 35 },
];

/* ------------------------------------------------------------------ */
/* Run-only relics: powerful build-defining modifiers (6-10 total)     */
/* ------------------------------------------------------------------ */

export interface RelicDef {
  id: string;
  name: string;
  desc: string;
}

export const RELICS: RelicDef[] = [
  { id: "re-mirror", name: "Shadow Mirror", desc: "Every 8th volley duplicates (twin ghost shot)." },
  { id: "re-band", name: "Friendship Band", desc: "Mini Friends deal +50% damage." },
  { id: "re-glass", name: "Glass Heart", desc: "+40% damage, -25% max HP." },
  { id: "re-time", name: "Time Core", desc: "Abilities recharge 35% faster after elite kills (10s)." },
  { id: "re-echo", name: "Echo Core", desc: "Every 5th shot repeats." },
  { id: "re-prism", name: "Prism Shard", desc: "Projectiles split +1 bounce after first hit." },
  { id: "re-vol", name: "Volatile Cell", desc: "Kills have a 15% small explosion." },
  { id: "re-berserk", name: "Berserker Plate", desc: "Damage rises up to +30% as HP falls." },
];

export function relicById(id: string): RelicDef {
  const found = RELICS.find(r => r.id === id);
  if (!found) throw new Error(`Unknown relic: ${id}`);
  return found;
}

/* ------------------------------------------------------------------ */
/* Pickups                                                             */
/* ------------------------------------------------------------------ */

export type PickupKind = "rf" | "heart" | "haste" | "power" | "ward";

export const PICKUP_W: Record<PickupKind, number> = { rf: 0.3, heart: 0.22, haste: 0.18, power: 0.18, ward: 0.12 };

/* ------------------------------------------------------------------ */
/* Trader                                                              */
/* ------------------------------------------------------------------ */

export interface StockItem {
  kind: "gear" | "consumable" | "ability" | "relic";
  id: string;
  price: number;
  locked?: boolean;
}

/** Ability module stock: grants a temporary run ability (see engine). */
export const ABILITY_STOCK: { id: AbilityId; price: number }[] = [
  { id: "ab-dash", price: 60 },
  { id: "ab-barrier", price: 70 },
  { id: "ab-nova", price: 110 },
  { id: "ab-strike", price: 120 },
  { id: "ab-phase", price: 130 },
  { id: "ab-freeze", price: 125 },
  { id: "ab-overdrive", price: 140 },
  { id: "ab-gravity", price: 170 },
  { id: "ab-chain", price: 165 },
  { id: "ab-bulwark", price: 75 },
  { id: "ab-mend", price: 120 },
  { id: "ab-snare", price: 110 },
  { id: "ab-wisp", price: 175 },
  { id: "ab-overcharge", price: 180 },
  { id: "ab-spike", price: 95 },
  { id: "ab-piercing", price: 135 },
  { id: "ab-mortar", price: 175 },
  { id: "ab-whirlwind", price: 140 },
  { id: "ab-blade", price: 85 },
  { id: "ab-reflect", price: 125 },
  { id: "ab-shielddome", price: 190 },
  { id: "ab-leap", price: 115 },
  { id: "ab-stunwave", price: 170 },
];

const RARITY_ORDER: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

/** Rarity odds shift toward better gear as blocks progress. */
function rarityRoll(rng: () => number, block: number): Rarity {
  const t = Math.min(1, block * 0.18);
  const r = rng();
  if (r < 0.02 + t * 0.08) return "Legendary";
  if (r < 0.10 + t * 0.22) return "Epic";
  if (r < 0.30 + t * 0.30) return "Rare";
  if (r < 0.65) return "Uncommon";
  return "Common";
}

export interface TraderMods {
  beacon?: number;
  shrine?: number;
  workshop?: number;
  altar?: number;
  bulwark?: number;
  traps?: number;
  overcharge?: number;
  kennel?: number;
  ownedAbilities?: AbilityId[];
  ownedRelics?: string[];
}

export function traderStock(
  rng: () => number, block: number, owned: string[], mods: TraderMods = {},
): StockItem[] {
  const priceScale = 1 + block * 0.3;
  const beacon = mods.beacon ?? 0;
  const shrine = mods.shrine ?? 0;
  const workshop = mods.workshop ?? 0;
  const effBlock = block + beacon * 0.7 + shrine * 0.4;
  const pick = (slot: GearSlot): StockItem | null => {
    const rarity = rarityRoll(rng, effBlock);
    // Workshop gates the newest families/tiers into the shop pool.
    let pool = GEAR.filter(g => g.slot === slot && g.price !== undefined && !owned.includes(g.id)
      && RARITY_ORDER.indexOf(g.rarity) <= RARITY_ORDER.indexOf(rarity) + 1);
    if (workshop < 1) pool = pool.filter(g => !["w13", "w14", "w15", "w16", "w17", "a11", "t12", "t14"].includes(g.id));
    if (workshop < 2) pool = pool.filter(g => !["w14", "w17", "a11"].includes(g.id));
    const list = pool.length > 0 ? pool : GEAR.filter(g => g.slot === slot && g.price !== undefined && !owned.includes(g.id));
    if (list.length === 0) return null;
    const item = list[Math.floor(rng() * list.length)];
    const discount = beacon > 0 ? 1 - Math.min(0.15, beacon * 0.05) : 1;
    return { kind: "gear", id: item.id, price: Math.max(5, Math.round((item.price ?? 50) * priceScale * discount)) };
  };
  const stock: StockItem[] = [];
  for (const slot of ["weapon", "armor", "trinket"] as GearSlot[]) {
    const item = pick(slot);
    if (item) stock.push(item);
  }
  // Beacon Lv3 adds an extra gear slot so repeat visits stay fresh.
  if (beacon >= 3) {
    const extra = pick(rng() < 0.5 ? "weapon" : "trinket");
    if (extra && stock.length < 5) stock.push(extra);
  }
  const con = CONSUMABLES[Math.floor(rng() * CONSUMABLES.length)];
  stock.push({ kind: "consumable", id: con.id, price: Math.round(con.price * priceScale) });
  // Ability module: unlocks a run ability if the base allows it.
  const altarPool = abilitiesForAltar(mods.altar ?? 4, {
    bulwark: mods.bulwark ?? 0, traps: mods.traps ?? 0,
    overcharge: mods.overcharge ?? 0, kennel: mods.kennel ?? 0,
    workshop: mods.workshop ?? 0,
  }).filter(
    a => a !== "ab-blast" && !(mods.ownedAbilities ?? []).includes(a),
  );
  if (altarPool.length > 0 && rng() < 0.75) {
    const avail = ABILITY_STOCK.filter(a => altarPool.includes(a.id));
    if (avail.length > 0) {
      const pick2 = avail[Math.floor(rng() * avail.length)];
      stock.push({ kind: "ability", id: pick2.id, price: Math.round(pick2.price * priceScale) });
    }
  }
  // Relic: rare build-defining modifier (never filler).
  const ownedRel = new Set(mods.ownedRelics ?? []);
  const relicPool = RELICS.filter(r => !ownedRel.has(r.id));
  if (relicPool.length > 0 && rng() < 0.3 + block * 0.05) {
    const r = relicPool[Math.floor(rng() * relicPool.length)];
    stock.push({ kind: "relic", id: r.id, price: Math.round((90 + block * 22) * priceScale) });
  }
  return stock;
}

export function rerollCost(rerolls: number): number {
  return [5, 10, 20][Math.min(2, rerolls)];
}

export const SELL_FRACTION = 0.4;

/** Fallback shop value by rarity for boss-drop-only gear (no listed price). */
export function baseValue(rarity: Rarity): number {
  return rarity === "Legendary" ? 180 : rarity === "Epic" ? 110 : rarity === "Rare" ? 60 : rarity === "Uncommon" ? 30 : 15;
}

export function sellValue(item: GearItem): number {
  return Math.max(1, Math.round((item.price ?? baseValue(item.rarity)) * SELL_FRACTION));
}

/* ------------------------------------------------------------------ */
/* Elites                                                              */
/* ------------------------------------------------------------------ */

export type EliteMod = "frenzied" | "armored" | "giant";

export function eliteModFor(rng: () => number): EliteMod {
  const r = rng();
  if (r < 0.4) return "frenzied";
  if (r < 0.75) return "armored";
  return "giant";
}

/* ------------------------------------------------------------------ */
/* Run upgrade pool additions (build tags for identity)                */
/* ------------------------------------------------------------------ */

export type BuildTag = "projectile" | "burn" | "tank" | "companion" | "crit" | "utility";

export const UPGRADE_TAGS: Record<UpgradeId | "snack", BuildTag[]> = {
  power: ["projectile", "crit"], rapid: ["projectile", "crit"], multishot: ["projectile"],
  pierce: ["projectile"], ricochet: ["projectile"], explosive: ["burn"],
  burn: ["burn"], freeze: ["utility"], crit: ["crit"], vitality: ["tank"],
  regen: ["tank"], minifriend: ["companion"], snack: ["utility"],
  ironskin: ["tank"], buddy: ["companion"], deadeye: ["crit"],
  keen: ["utility"], quick: ["utility"], boots: ["utility"],
  heavy: ["projectile"], seeker: ["projectile"], storm: ["burn", "crit"],
  sidestep: ["tank"], adrenaline: ["utility"], fortune: ["utility"],
};

/* ------------------------------------------------------------------ */
/* Home plots: choose where your Rare Friend lives (visual-first choice)*/
/* ------------------------------------------------------------------ */

export interface PlotDef {
  id: string;
  name: string;
  desc: string;
  preset: string;
  /** Tiny balanced tendency, shown up front. Never a trap choice. */
  tendency: string;
  bonus: { kind: "pickup" | "regen" | "rf" | "xp"; amount: number };
}

/** Plot ids match model VALID_PLOTS so choice persists through sanitize. */
export const PLOTS: PlotDef[] = [
  { id: "garden-oval", name: "Sun Meadow", desc: "Open grass, pond and old trees. Room to maneuver.", preset: "01-garden-oval-complete", tendency: "+pickup range (open ground)", bonus: { kind: "pickup", amount: 12 } },
  { id: "circuit-courtyard", name: "Copper Grove", desc: "Tight lanes under copper boughs. Ambush country.", preset: "02-circuit-courtyard-complete", tendency: "+slow regen (shade rest)", bonus: { kind: "regen", amount: 0.3 } },
  { id: "crystal-mesa", name: "Ember Hollow", desc: "Warm vents and chokepoints. Dangerous but rich.", preset: "03-crystal-mesa-complete", tendency: "+RF from Shadows", bonus: { kind: "rf", amount: 0.08 } },
  { id: "tidal-islands", name: "Reed Tidepools", desc: "Broken pools and mudflats. Swarms love it here.", preset: "05-tidal-islands-complete", tendency: "+XP from Shadows", bonus: { kind: "xp", amount: 0.1 } },
];

export function plotById(id: string): PlotDef {
  return PLOTS.find(p => p.id === id) ?? PLOTS[0];
}

/* ------------------------------------------------------------------ */
/* Base structures: buildable settlement (tiers are visible in-world)  */
/* ------------------------------------------------------------------ */

export type StructureCategory = "defense" | "production" | "support" | "economy" | "research" | "special";

export interface StructureDef {
  id: string;
  name: string;
  desc: string;
  category: StructureCategory;
  maxTier: number;
  /** Build/upgrade costs in SimRF per tier (index 0 = build). */
  costs: number[];
  /** Combat anchor this structure uses (null = passive/base-only). */
  anchor: "turret" | "frost" | "healer" | "collector" | null;
  /** Structure HP per tier in combat (0 = indestructible passive). */
  hp: number[];
}

export const STRUCTURES: StructureDef[] = [
  { id: "turret", name: "Friend Turret", desc: "Auto-turret that fires with you.", category: "defense", maxTier: 4, costs: [40, 90, 170, 280], anchor: "turret", hp: [60, 110, 170, 250] },
  { id: "frost", name: "Frost Spire", desc: "Chills nearby Shadows, slowing their push.", category: "defense", maxTier: 3, costs: [70, 150, 260], anchor: "frost", hp: [70, 130, 200] },
  { id: "wall", name: "Bramble Wall", desc: "Slows Shadows near the plot heart.", category: "defense", maxTier: 3, costs: [35, 80, 150], anchor: null, hp: [120, 220, 340] },
  { id: "collector", name: "RF Collector", desc: "Gathers RF over time. Collect it!", category: "production", maxTier: 4, costs: [45, 100, 190, 300], anchor: "collector", hp: [50, 90, 140, 200] },
  { id: "workshop", name: "Tinker Workshop", desc: "Unlocks Rare+ gear tiers in Trader/bosses.", category: "production", maxTier: 3, costs: [70, 150, 260], anchor: null, hp: [0, 0, 0] },
  { id: "healer", name: "Healing Spring", desc: "Restores Friend health periodically.", category: "support", maxTier: 3, costs: [50, 110, 200], anchor: "healer", hp: [60, 110, 170] },
  { id: "altar", name: "Ability Altar", desc: "Unlocks Dash/Barrier → Nova/Strike → Phase/Freeze/Overdrive → Gravity/Chain.", category: "support", maxTier: 4, costs: [60, 130, 220, 340], anchor: null, hp: [0, 0, 0, 0] },
  { id: "training", name: "Training Posts", desc: "Stronger level-up choices; ability ranks unlock.", category: "support", maxTier: 3, costs: [55, 120, 210], anchor: null, hp: [0, 0, 0] },
  { id: "beacon", name: "Trader Beacon", desc: "Better rarity, cheaper rerolls, +stock at T3.", category: "economy", maxTier: 3, costs: [55, 120, 230], anchor: null, hp: [0, 0, 0] },
  { id: "vault", name: "Root Vault", desc: "+storage for produced RF; safer savings.", category: "economy", maxTier: 3, costs: [40, 90, 170], anchor: null, hp: [0, 0, 0] },
  { id: "archive", name: "Shadow Archive", desc: "+boss/elite damage; unlocks Codex hints.", category: "research", maxTier: 3, costs: [80, 170, 280], anchor: null, hp: [0, 0, 0] },
  { id: "kennel", name: "Wisp Kennel", desc: "Unlocks companion structures + Wisp ability.", category: "research", maxTier: 2, costs: [90, 200], anchor: null, hp: [0, 0] },
  { id: "shrine", name: "Luck Shrine", desc: "Rarity bonus for Trader + boss drops.", category: "special", maxTier: 3, costs: [50, 110, 200], anchor: null, hp: [0, 0, 0] },
  { id: "medbay", name: "Med Station", desc: "+healing between maps; cheaper mid-run heal.", category: "support", maxTier: 3, costs: [45, 100, 180], anchor: null, hp: [0, 0, 0] },
];

export function structureById(id: string): StructureDef {
  const found = STRUCTURES.find(s => s.id === id);
  if (!found) throw new Error(`Unknown structure: ${id}`);
  return found;
}

/**
 * HOME CORE — the Friend's house and the invasion's central objective.
 * Always present (never built, never permanently destroyed): if its HP hits
 * zero the invasion is lost with reduced rewards, then it is repaired.
 */
export const HOME_CORE = {
  id: "homecore",
  name: "Home Core",
  desc: "Your Friend's house. If it falls, the invasion is lost — defend it!",
} as const;

/** Player-facing label for structure ids (engine announcements, repair UI). */
export function structLabel(id: string): string {
  if (id === HOME_CORE.id) return HOME_CORE.name;
  try {
    return structureById(id).name;
  } catch {
    return id;
  }
}

/** Home Core HP scales with the Friend's toughness so it stays relevant. */
export function homeCoreHp(playerMaxHp: number): number {
  return Math.round(220 + Math.max(0, playerMaxHp) * 1.5);
}

/** Base Level = total structure tiers (drives milestones + expeditions). */
export function baseLevelOf(buildings: Record<string, number>): number {
  return Object.values(buildings).reduce((n, t) => n + Math.max(0, Math.min(9, t | 0)), 0);
}

/** Production: collector RF per minute by tier (session-time, capped). */
export function collectorRate(tier: number): number {
  return [0, 6, 12, 20, 30][Math.min(4, Math.max(0, tier))];
}
/** Storage cap for uncollected production by vault tier. */
export function vaultCap(vaultTier: number): number {
  return [60, 120, 220, 360][Math.min(3, Math.max(0, vaultTier))];
}

/* ------------------------------------------------------------------ */
/* Encounter Director: authored templates, not spam                    */
/* ------------------------------------------------------------------ */

export type EncounterId =
  | "patrol" | "assault" | "siege" | "ambush" | "commander" | "burrow"
  | "elite" | "snipers" | "swarm" | "raid" | "breach" | "holdout" | "boss";

export interface EncounterDef {
  id: EncounterId;
  name: string;
  desc: string;
  /** Max simultaneous enemies for this encounter (ceiling, not target). */
  ceiling: number;
  /** Enemies prefer structures over the Friend. */
  structureRaid: boolean;
  /** Spawn from one gate (breach/ambush focus). */
  gateFocus: boolean;
  /** Seconds of quiet before this encounter (breathing room). */
  calmBefore: number;
}

export const ENCOUNTERS: Record<EncounterId, EncounterDef> = {
  patrol: { id: "patrol", name: "Patrol", desc: "Small balanced squad on the paths.", ceiling: 8, structureRaid: false, gateFocus: false, calmBefore: 2 },
  assault: { id: "assault", name: "Assault", desc: "Focused push toward your Friend.", ceiling: 12, structureRaid: false, gateFocus: false, calmBefore: 1 },
  siege: { id: "siege", name: "Siege", desc: "Structure-breakers screened by guards. Protect the base!", ceiling: 10, structureRaid: true, gateFocus: false, calmBefore: 3 },
  ambush: { id: "ambush", name: "Ambush", desc: "They come from one side. Reposition!", ceiling: 10, structureRaid: false, gateFocus: true, calmBefore: 3 },
  commander: { id: "commander", name: "Commander Push", desc: "A Commander leads a coordinated squad.", ceiling: 11, structureRaid: false, gateFocus: false, calmBefore: 2 },
  burrow: { id: "burrow", name: "Burrow Attack", desc: "Telegraphed diggers bypass the walls.", ceiling: 9, structureRaid: false, gateFocus: false, calmBefore: 2 },
  elite: { id: "elite", name: "Elite Hunt", desc: "A dangerous elite with a small escort.", ceiling: 7, structureRaid: false, gateFocus: false, calmBefore: 3 },
  snipers: { id: "snipers", name: "Sniper Pressure", desc: "Few but lethal ranged units. Keep moving.", ceiling: 7, structureRaid: false, gateFocus: false, calmBefore: 2 },
  swarm: { id: "swarm", name: "Swarm", desc: "The tide pours through. Area damage shines.", ceiling: 22, structureRaid: false, gateFocus: false, calmBefore: 2 },
  raid: { id: "raid", name: "Resource Raid", desc: "Thieves run for the Collector!", ceiling: 9, structureRaid: true, gateFocus: false, calmBefore: 3 },
  breach: { id: "breach", name: "Breach", desc: "Everything hits one section of the plot.", ceiling: 12, structureRaid: false, gateFocus: true, calmBefore: 3 },
  holdout: { id: "holdout", name: "Holdout", desc: "Hold the plot heart until it passes.", ceiling: 10, structureRaid: false, gateFocus: false, calmBefore: 4 },
  boss: { id: "boss", name: "Boss Assault", desc: "The big one, with timed support.", ceiling: 14, structureRaid: false, gateFocus: false, calmBefore: 4 },
};

/** Deterministic encounter pick per (wave, map): authored variety, honest names. */
export function planEncounter(wave: number, mapIdx: number, type: WaveType): EncounterId {
  if (type === "boss") return "boss";
  if (type === "elite") return "elite";
  if (type === "swarm") return "swarm";
  if (type === "surge") return wave % 2 ? "breach" : "assault";
  if (type === "heavy") return wave % 3 === 0 ? "siege" : "assault";
  if (type === "ranged") return wave % 3 === 1 ? "snipers" : "assault";
  if (type === "rush") return wave % 2 ? "ambush" : "patrol";
  // standard waves: rotate authored templates by wave+map.
  const pool: EncounterId[] = ["patrol", "assault", "ambush", "holdout"];
  if (wave >= 9) pool.push("raid", "siege");
  if (wave >= 12) pool.push("burrow");
  if (wave >= 15) pool.push("commander", "breach");
  const h = ((wave * 2654435761 + mapIdx * 40503 + 0x9e37) >>> 0) % pool.length;
  return pool[h];
}

/* ------------------------------------------------------------------ */
/* Abilities II: six more genuinely distinct tools (16 total)          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Quests, Codex, milestones, expeditions, item belt                   */
/* ------------------------------------------------------------------ */

export interface QuestDef {
  id: string;
  name: string;
  desc: string;
  /** SimRF reward on completion. */
  reward: number;
}

export const QUESTS: QuestDef[] = [
  { id: "q-plot", name: "Claim Home", desc: "Choose your home plot.", reward: 20 },
  { id: "q-turret", name: "First Nails", desc: "Build your first turret.", reward: 25 },
  { id: "q-defend1", name: "Hold the Line", desc: "Clear wave 3.", reward: 30 },
  { id: "q-boss1", name: "Big Shadow Down", desc: "Defeat your first boss.", reward: 60 },
  { id: "q-commander", name: "Cut the Head", desc: "Defeat a Commander.", reward: 50 },
  { id: "q-collect", name: "First Harvest", desc: "Collect produced RF from the Collector.", reward: 25 },
  { id: "q-ability", name: "New Trick", desc: "Unlock a run ability.", reward: 30 },
  { id: "q-expedition", name: "Far Fields", desc: "Complete an expedition map.", reward: 70 },
  { id: "q-miniboss", name: "Elite Breaker", desc: "Defeat an elite invasion leader.", reward: 55 },
  { id: "q-flawless", name: "Untouched Walls", desc: "Clear a siege wave with no structure damage.", reward: 80 },
  { id: "q-altar2", name: "Altar Rising", desc: "Raise the Ability Altar to tier 2.", reward: 60 },
  { id: "q-base8", name: "Hamlet", desc: "Reach Base Level 8.", reward: 90 },
];

export function questById(id: string): QuestDef {
  const found = QUESTS.find(q => q.id === id);
  if (!found) throw new Error(`Unknown quest: ${id}`);
  return found;
}

export interface CodexEntry {
  id: string;
  kind: "enemy" | "boss" | "ability" | "gear" | "structure" | "plot";
  name: string;
  hint: string;
}

export const CODEX_ENEMIES: CodexEntry[] = [
  { id: "shadow", kind: "enemy", name: "Shadow", hint: "The basic corrupted Friend. Moves at you." },
  { id: "swift", kind: "enemy", name: "Swift", hint: "Fast skirmisher. Leads rushes." },
  { id: "tank", kind: "enemy", name: "Tank", hint: "Slow wall. Needs focus fire." },
  { id: "ranged", kind: "enemy", name: "Ranged", hint: "Shoots from afar. Close in." },
  { id: "swarm", kind: "enemy", name: "Swarm", hint: "Weak alone, deadly in tides." },
  { id: "charger", kind: "enemy", name: "Charger", hint: "Telegraphed dash. Sidestep, then punish." },
  { id: "split", kind: "enemy", name: "Splitter", hint: "Breaks into splitlings. Kill apart." },
  { id: "shield", kind: "enemy", name: "Shield Bearer", hint: "Front plate first, body second." },
  { id: "support", kind: "enemy", name: "Support", hint: "Heals allies. Kill first." },
  { id: "summoner", kind: "enemy", name: "Summoner", hint: "Calls minions. Interrupt by pressure." },
  { id: "bomber", kind: "enemy", name: "Bomber", hint: "Volatile pack. Run from the beep." },
  { id: "sniper", kind: "enemy", name: "Sniper", hint: "Long lock-on line. Break line of sight." },
  { id: "orbiter", kind: "enemy", name: "Orbiter", hint: "Circles wide. Meet it with arcs." },
  { id: "blinker", kind: "enemy", name: "Blinker", hint: "Teleports. Watch the fade." },
  { id: "leaper", kind: "enemy", name: "Leaper", hint: "Marked landing. Move off the ring." },
  { id: "mage", kind: "enemy", name: "Mage", hint: "Paints danger zones. Don't stand in fire." },
  { id: "burrower", kind: "enemy", name: "Burrower", hint: "Digs to you. Leave the dust ring." },
  { id: "commander", kind: "enemy", name: "Commander", hint: "Buffs allies. Assassinate it." },
  { id: "drainer", kind: "enemy", name: "Drainer", hint: "Tether slows you. Break range." },
  { id: "saboteur", kind: "enemy", name: "Saboteur", hint: "Runs for your turret. Intercept!" },
  { id: "thief", kind: "enemy", name: "Thief", hint: "Steals from the Collector and flees." },
  { id: "artillery", kind: "enemy", name: "Artillery", hint: "Bombards structures from afar." },
  { id: "necromancer", kind: "enemy", name: "Necromancer", hint: "Revives the fallen. Focus it down." },
  { id: "traplayer", kind: "enemy", name: "Trap Layer", hint: "Leaves slow mines. Sweep wide." },
  { id: "siege", kind: "enemy", name: "Siege Brute", hint: "Walks through walls. Kite it." },
];

export interface SettlementTier {
  baseLevel: number;
  name: string;
  desc: string;
}

export const SETTLEMENT_TIERS: SettlementTier[] = [
  { baseLevel: 0, name: "Campsite", desc: "A Friend and a dream." },
  { baseLevel: 4, name: "Homestead", desc: "First defenses online." },
  { baseLevel: 8, name: "Hamlet", desc: "Production humming. Expeditions open." },
  { baseLevel: 14, name: "Village", desc: "Advanced structures unlock." },
  { baseLevel: 22, name: "Stronghold", desc: "Late maps and siege bosses." },
  { baseLevel: 32, name: "Sanctuary", desc: "A living Rare Friends settlement." },
];

export function settlementTierFor(baseLevel: number): SettlementTier {
  let cur = SETTLEMENT_TIERS[0];
  for (const m of SETTLEMENT_TIERS) if (baseLevel >= m.baseLevel) cur = m;
  return cur;
}

export interface ExpeditionDef {
  mapIdx: number;
  name: string;
  desc: string;
  reqBase: number;
  rfBonus: number;
  lootBonus: number;
}

export const EXPEDITIONS: ExpeditionDef[] = [
  { mapIdx: 0, name: "Home Defense", desc: "Defend the home plot. No bonus.", reqBase: 0, rfBonus: 0, lootBonus: 0 },
  { mapIdx: 1, name: "Copper Foray", desc: "Tight lanes, +15% RF.", reqBase: 0, rfBonus: 0.15, lootBonus: 0 },
  { mapIdx: 2, name: "Ember Raid", desc: "Vents and chokepoints, +30% RF.", reqBase: 4, rfBonus: 0.3, lootBonus: 0.05 },
  { mapIdx: 3, name: "Tide Run", desc: "Swarms and mud, +45% RF.", reqBase: 8, rfBonus: 0.45, lootBonus: 0.1 },
  { mapIdx: 4, name: "Terrace Climb", desc: "Shielded heights, +60% RF.", reqBase: 14, rfBonus: 0.6, lootBonus: 0.15 },
  { mapIdx: 5, name: "Star Descent", desc: "Everything hunts, +80% RF.", reqBase: 22, rfBonus: 0.8, lootBonus: 0.2 },
];

export function expeditionFor(mapIdx: number): ExpeditionDef {
  return EXPEDITIONS.find(e => e.mapIdx === mapIdx) ?? EXPEDITIONS[0];
}

/** Item belt hotkeys: conflict-free set near WASD (1-3 stay level-up keys). */
export const ITEM_HOTKEYS = ["Z", "X", "C", "V"] as const;
/** Belt order: first four owned consumables in this stable order. */
export const BELT_ORDER = ["heal", "ward", "tonic", "token", "magnet", "fury"] as const;

/* ------------------------------------------------------------------ */
/* Building specializations: tier-3 branch choices (meaningful builds) */
/* ------------------------------------------------------------------ */

export interface StructureSpec {
  id: string;
  structureId: string;
  name: string;
  desc: string;
  icon: string;
}

export const STRUCTURE_SPECS: StructureSpec[] = [
  { id: "turret-rapid", structureId: "turret", name: "Rapid Seedling", desc: "Turret fires 35% faster, smaller seeds.", icon: "rapid" },
  { id: "turret-heavy", structureId: "turret", name: "Heavy Pod", desc: "Slow huge impact + knockback.", icon: "heavy" },
  { id: "turret-arc", structureId: "turret", name: "Arc Bloom", desc: "Shots chain to 2 nearby Shadows.", icon: "storm" },
  { id: "collector-prod", structureId: "collector", name: "Rich Soil", desc: "+60% idle RF rate.", icon: "prod" },
  { id: "collector-fort", structureId: "collector", name: "Walled Garden", desc: "-20% rate, shields nearby structures (+40 HP).", icon: "defense" },
  { id: "kennel-guard", structureId: "kennel", name: "Guardian Den", desc: "Tanky wisp defender, taunts Shadows.", icon: "ironskin" },
  { id: "kennel-ranger", structureId: "kennel", name: "Ranger Roost", desc: "Ranged wisp, rapid sparks.", icon: "rapid" },
  { id: "frost-wide", structureId: "frost", name: "Wide Frost", desc: "+60% slow radius.", icon: "freeze" },
  { id: "frost-deep", structureId: "frost", name: "Deep Chill", desc: "Stronger slow, smaller radius.", icon: "freeze" },
  { id: "healer-burst", structureId: "healer", name: "Burst Spring", desc: "Bigger heals, longer cooldown.", icon: "vitality" },
  { id: "healer-regen", structureId: "healer", name: "Trickle Spring", desc: "Constant small regen aura.", icon: "regen" },
];

export function specsFor(structureId: string): StructureSpec[] {
  return STRUCTURE_SPECS.filter(s => s.structureId === structureId);
}

/* ------------------------------------------------------------------ */
/* Structure synergies: a few readable adjacency bonuses               */
/* ------------------------------------------------------------------ */

export interface SynergyDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export const SYNERGIES: SynergyDef[] = [
  { id: "syn-workshop-turret", name: "Tuned Seeds", desc: "Workshop + Turret: +15% turret fire rate.", icon: "upgrade" },
  { id: "syn-healer-kennel", name: "Pack Care", desc: "Healer + Kennel: defenders regenerate.", icon: "support" },
  { id: "syn-collector-vault", name: "Safe Harvest", desc: "Collector + Vault: +40% storage cap.", icon: "storage" },
  { id: "syn-wall-turret", name: "Covered Line", desc: "Wall + Turret: turret +30 HP.", icon: "defense" },
];

export function activeSynergies(buildings: Record<string, number>): SynergyDef[] {
  const has = (id: string) => (buildings[id] ?? 0) > 0;
  const out: SynergyDef[] = [];
  if (has("workshop") && has("turret")) out.push(SYNERGIES[0]);
  if (has("healer") && has("kennel")) out.push(SYNERGIES[1]);
  if (has("collector") && has("vault")) out.push(SYNERGIES[2]);
  if (has("wall") && has("turret")) out.push(SYNERGIES[3]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Idle progression: rates, caps, automation tiers                     */
/* ------------------------------------------------------------------ */

/** Training Yard: XP trickle per minute by tier (session idle). */
export function trainingRate(tier: number): number {
  return [0, 2, 5, 10][Math.min(3, Math.max(0, tier))];
}

/** Automation: vault auto-collects at tier 2+, repair bot at workshop 2+. */
export function autoCollectTier(vaultTier: number): boolean {
  return vaultTier >= 2;
}
export function autoRepairTier(workshopTier: number): boolean {
  return workshopTier >= 2;
}
