// games/friends-vs-frenemies/lib/balance.ts
var ENEMY_OBJECTIVE = {
  shadow: "friend",
  swift: "friend",
  tank: "friend",
  ranged: "friend",
  swarm: "friend",
  boss: "any",
  charger: "friend",
  split: "friend",
  shield: "friend",
  support: "friend",
  summoner: "friend",
  splitling: "friend",
  bomber: "friend",
  sniper: "friend",
  orbiter: "friend",
  blinker: "friend",
  leaper: "friend",
  mage: "friend",
  burrower: "any",
  commander: "friend",
  drainer: "friend",
  saboteur: "structure",
  thief: "production",
  artillery: "structure",
  necromancer: "friend",
  traplayer: "friend",
  siege: "structure",
  cryo: "friend",
  corrupter: "friend",
  elitehunter: "friend",
  minibrute: "any",
  minimage: "any",
  minisiege: "structure"
};
var ENEMIES = {
  shadow: { hp: 30, dmg: 8, speed: 55, xp: 6, rf: 1, radius: 16, range: 0, tint: "#2a2140", scale: 1 },
  swift: { hp: 18, dmg: 6, speed: 98, xp: 7, rf: 1, radius: 13, range: 0, tint: "#3a2a55", scale: 0.85 },
  tank: { hp: 95, dmg: 14, speed: 32, xp: 14, rf: 2, radius: 22, range: 0, tint: "#1c1830", scale: 1.35 },
  ranged: { hp: 26, dmg: 7, speed: 48, xp: 12, rf: 2, radius: 15, range: 210, tint: "#40254a", scale: 1 },
  swarm: { hp: 10, dmg: 4, speed: 78, xp: 3, rf: 0, radius: 10, range: 0, tint: "#33244d", scale: 0.65 }
};
var BODY_R = {
  shadow: 8,
  swift: 6,
  tank: 11,
  ranged: 7,
  swarm: 5,
  boss: 20,
  charger: 8,
  split: 9,
  shield: 9,
  support: 7,
  summoner: 9,
  splitling: 5,
  bomber: 8,
  sniper: 7,
  orbiter: 8,
  blinker: 7,
  leaper: 9,
  mage: 7,
  burrower: 8,
  commander: 10,
  drainer: 7,
  saboteur: 7,
  thief: 6,
  artillery: 9,
  necromancer: 8,
  traplayer: 7,
  siege: 12,
  cryo: 8,
  corrupter: 9,
  elitehunter: 9,
  minibrute: 14,
  minimage: 13,
  minisiege: 16
};
var FRIEND_BODY = 8;
var NEW_ENEMIES = {
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
  minisiege: { hp: 240, dmg: 26, speed: 20, xp: 40, rf: 10, radius: 21, range: 0, tint: "#4a1e1e", scale: 1.45 }
};
var BUDGET_COST = {
  shadow: 1,
  swift: 1,
  swarm: 1,
  splitling: 1,
  ranged: 2,
  charger: 2,
  split: 2,
  shield: 3,
  support: 3,
  tank: 3,
  summoner: 4,
  boss: 99,
  bomber: 2,
  sniper: 3,
  orbiter: 2,
  blinker: 2,
  leaper: 3,
  mage: 3,
  burrower: 3,
  commander: 4,
  drainer: 3,
  saboteur: 3,
  thief: 2,
  artillery: 4,
  necromancer: 4,
  traplayer: 3,
  siege: 5,
  cryo: 3,
  corrupter: 3,
  elitehunter: 4,
  minibrute: 8,
  minimage: 8,
  minisiege: 10
};
function planWave(wave, mapIdx) {
  if (wave % 5 === 0) return { type: "boss", label: "BOSS ASSAULT", budget: 0, surge: false };
  const budget = Math.round(5 + wave * 1.6 + mapIdx * 4);
  const r = (wave * 2654435761 + mapIdx * 40503 >>> 0) % 100 / 100;
  if (wave % 5 === 3) {
    if (r < 0.4) return { type: "surge", label: "SHADOW SURGE", budget: Math.round(budget * 1.5), surge: true };
    return { type: "elite", label: "ELITE HUNT", budget, surge: false };
  }
  const kinds = unlockedKinds(wave, mapIdx);
  const has = (...ks) => ks.some((k) => kinds.includes(k));
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
function unlockedKinds(wave, mapIdx) {
  const kinds = ["shadow", "swift"];
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
  if (wave >= 12 || mapIdx >= 2) kinds.push("mage");
  if (wave >= 14 || mapIdx >= 3) kinds.push("burrower", "drainer");
  if (wave >= 17 || mapIdx >= 4) kinds.push("commander");
  if (wave >= 9 || mapIdx >= 1) kinds.push("saboteur");
  if (wave >= 11 || mapIdx >= 2) kinds.push("thief", "traplayer");
  if (wave >= 15 || mapIdx >= 3) kinds.push("artillery", "necromancer");
  if (wave >= 19 || mapIdx >= 4) kinds.push("siege");
  if (wave >= 7 && wave % 5 !== 0) kinds.push("minibrute");
  if (wave >= 12 && wave % 5 !== 0) kinds.push("minimage");
  if (wave >= 17 && wave % 5 !== 0) kinds.push("minisiege");
  return [...new Set(kinds)];
}
var TEMPLATE_MIN_SHARE = {
  ranged: 0.45,
  heavy: 0.4,
  swarm: 0.5,
  rush: 0.5,
  elite: 0
};
var TEMPLATE_KINDS = {
  ranged: ["ranged", "sniper", "mage", "support", "cryo", "minimage"],
  heavy: ["tank", "shield", "commander", "siege", "minibrute", "minisiege"],
  swarm: ["swarm", "splitling", "split"],
  rush: ["swift", "charger", "leaper", "orbiter", "elitehunter"],
  elite: []
};
function templateShare(queue, kinds, cost) {
  let total = 0, part = 0;
  for (const q of queue) {
    const c = cost[q.kind] ?? 1;
    total += c;
    if (kinds.includes(q.kind)) part += c;
  }
  return total > 0 ? part / total : 0;
}
function validateWaveComposition(type, queue) {
  if (type === "ranged" || type === "heavy" || type === "swarm" || type === "rush") {
    const fam = type;
    const share = templateShare(queue, TEMPLATE_KINDS[fam], BUDGET_COST);
    return { ok: share >= TEMPLATE_MIN_SHARE[fam], share, need: TEMPLATE_MIN_SHARE[fam] };
  }
  if (type === "elite") {
    const elites = queue.filter((q) => q.forceElite).length;
    return { ok: elites >= 2, share: elites, need: 2 };
  }
  return { ok: true, share: 1, need: 0 };
}
var EARLY_WAVES = {
  1: [["shadow", 4], ["swift", 2]],
  2: [["shadow", 3], ["swarm", 5], ["swift", 1]],
  3: [["shadow", 3], ["ranged", 2], ["swarm", 3]],
  4: [["shield", 1], ["charger", 2], ["ranged", 1], ["shadow", 3]]
};
function bossPatternFor(wave) {
  const patterns = ["brute", "swarmkeeper", "hunter", "artillerist", "warden", "blink", "siegebreaker"];
  const tier = wave / 5;
  return patterns[(tier - 1) % patterns.length] ?? "brute";
}
function waveHpMult(wave) {
  const n2 = wave - 1;
  return 1 + n2 * 0.18 + n2 * n2 * 8e-3;
}
function waveDmgMult(wave) {
  return 1 + (wave - 1) * 0.06;
}
function waveSpeedMult(wave) {
  return Math.min(1.45, 1 + (wave - 1) * 0.02);
}
function waveComp(wave) {
  if (wave % 5 === 0) return bossWaveComp(wave);
  const budget = Math.min(34, 4 + wave * 2);
  const comp = [{ archetype: "shadow", count: Math.ceil(budget * 0.45) }];
  if (wave >= 2) comp.push({ archetype: "swarm", count: Math.ceil(budget * 0.2) });
  if (wave >= 3) comp.push({ archetype: "swift", count: Math.ceil(budget * 0.2) });
  if (wave >= 6) comp.push({ archetype: "tank", count: Math.max(1, Math.ceil(budget * 0.12)) });
  if (wave >= 7) comp.push({ archetype: "ranged", count: Math.max(1, Math.ceil(budget * 0.12)) });
  if (wave >= 9) comp.push({ archetype: "shadow", count: Math.ceil(budget * 0.15) });
  return comp;
}
function bossWaveComp(wave) {
  const tier = wave / 5;
  return [
    { archetype: "shadow", count: 3 + tier * 2 },
    { archetype: "swift", count: 2 + tier },
    ...wave >= 10 ? [{ archetype: "tank", count: 1 + Math.floor(tier / 2) }] : []
  ];
}
function bossSpec(wave) {
  const tier = wave / 5;
  const pattern = bossPatternFor(wave);
  const modifiers = [];
  if (wave >= 10) modifiers.push("Summoner");
  if (wave >= 15) modifiers.push("Regenerating");
  if (wave >= 20) modifiers.push("Fast");
  if (wave >= 25) modifiers.push("Armored");
  const n2 = wave - 1;
  const hpMult = 1 + n2 * 0.15 + n2 * n2 * 4e-3;
  const base = {
    hp: Math.round((220 + tier * 160) * hpMult),
    dmg: Math.round((16 + tier * 4) * waveDmgMult(wave)),
    speed: 34,
    xp: 60 + tier * 30,
    rf: 25 + wave * 2,
    modifiers
  };
  if (pattern === "brute") {
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
    modifiers.push("Siege");
    return { ...base, hp: Math.round(base.hp * 1.5), dmg: Math.round(base.dmg * 1.1), speed: 22, pattern, name: "THE SIEGEBREAKER" };
  }
  modifiers.push("Summoner");
  return { ...base, hp: Math.round(base.hp * 0.8), dmg: Math.round(base.dmg * 0.8), speed: 30, pattern, name: "THE SWARMKEEPER" };
}
function eliteChance(wave) {
  if (wave < 8) return 0;
  return Math.min(0.22, 0.05 + (wave - 8) * 0.015);
}
function xpForLevel(level) {
  return Math.round(8 + level * 6 + level * level * 1.2);
}
var ABILITIES = {
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
  "ab-stunwave": { id: "ab-stunwave", name: "EMP Shockwave", desc: "Paralyze all nearby Frenemies for 3.5s with an electric pulse.", cd: 24, role: "control", rarity: "Epic", key: "E" }
};
var ABILITY_MAX_RANK = 3;
var MAX_ACTIVE_ABILITIES = 3;
var ABILITY_HOTKEYS = ["Space", "Q", "E"];
var UPGRADES = {
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
  fortune: { id: "fortune", name: "Fortune", desc: "Better Trader + boss luck", icon: "fortune", maxStacks: 2 }
};
var UPGRADE_IDS = Object.keys(UPGRADES);
var ATTACK_STYLE_NAMES = {
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
  beam: "Friend Beam"
};
var GEAR = [
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
  { id: "t14", name: "Glass Heart", slot: "trinket", rarity: "Legendary", desc: "+25% damage, -25 max HP. Red glass aura.", dmg: 8, hp: -25, price: 290 }
];
function gearById(id) {
  const found = GEAR.find((g) => g.id === id);
  if (!found) throw new Error(`Unknown gear: ${id}`);
  return found;
}
function bossDropPool(wave) {
  if (wave >= 20) return ["w4", "a4", "t4", "w3", "a3", "t3"];
  if (wave >= 10) return ["w3", "a3", "t3", "w2", "a2", "t2"];
  return ["w2", "a2", "t2", "w1", "a1", "t1"];
}
function bossDropChance(wave, lootLuck) {
  return Math.min(0.9, 0.35 + lootLuck * 0.1 + (wave >= 15 ? 0.15 : 0));
}
var PERMA_UPGRADES = [
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
  { id: "altar", name: "Ability Altar", desc: "Unlocks Dash/Barrier \u2192 Nova/Strike \u2192 Phase/Freeze/Overdrive \u2192 Gravity/Chain into runs", category: "friend", maxLevel: 4, costs: [60, 130, 220, 340] },
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
  { id: "plots", name: "Plot Expansion", desc: "+building room; unlocks expeditions", category: "economy", maxLevel: 3, costs: [80, 170, 300] }
];
function abilitiesForAltar(altar, extra) {
  const out = ["ab-blast"];
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
function idleProductionRate(buildings) {
  const collector = buildings.collector ?? 0;
  const generator = buildings.generator ?? 0;
  return collector * 10 + generator * 15;
}
function idleStorageCap(buildings) {
  const vault = buildings.vault ?? 0;
  return 150 + vault * 200;
}
var MILESTONES = [
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
  { id: "m-tier4", name: "Masterwork Citadel", desc: "Reach Tier 4 on your Turret or Altar.", category: "settlement", rewardSimRf: 200 }
];
var RARITY_COLORS = {
  Common: "#9aa4b2",
  Uncommon: "#7ee787",
  Rare: "#79c0ff",
  Epic: "#d2a8ff",
  Legendary: "#ffb224"
};
function computeDerived(perma, gear) {
  let dmg = 12 * (1 + perma.dmg * 0.1);
  let interval2 = 0.9 / (1 + perma.rate * 0.08);
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
  let family = "standard";
  for (const g of gear) {
    if (g.dmg) dmg += g.dmg;
    if (g.rate) interval2 /= 1 + g.rate;
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
    if (g.cdr) {
      cdr += g.cdr;
      abilityCdr += g.cdr * 0.66;
    }
    if (g.dodge) dodge += g.dodge;
    if (g.bossDmg) bossDmg += g.bossDmg;
    if (g.compDmg) compDmg += g.compDmg;
    if (g.thorns) thorns += g.thorns;
    if (g.knockback) knockback += g.knockback;
    if (g.slot === "weapon" && g.family) family = g.family;
  }
  const archive = perma.archive ?? 0;
  if (archive > 0) bossDmg += archive * 0.04;
  return {
    dmg: Math.round(dmg * 10) / 10,
    interval: Math.max(0.22, Math.round(interval2 * 100) / 100),
    maxHp: Math.round(maxHp),
    critC: Math.min(0.6, Math.round(critC * 100) / 100),
    critM: Math.round(critM * 100) / 100,
    range: 172,
    // world units (engine FRIEND_RANGE)
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
    family
  };
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var BLAST_COOLDOWN = 25;
var BLAST_DMG_MULT = 6;
var BLAST_RADIUS = 220;
var HEAL_AMOUNT = 40;
function healCost(uses, medbay = 0) {
  const base = 5 + uses * 5;
  return Math.max(2, Math.round(base * (1 - Math.min(0.45, medbay * 0.15))));
}
var REROLL_COST = 5;
var MAPS = [
  { preset: "01-garden-oval-complete", name: "Sun Garden", blurb: "Open paths. Learn to move.", eliteBonus: 0, rfMult: 1, vents: false },
  { preset: "02-circuit-courtyard-complete", name: "Copper Court", blurb: "Tight lanes. Ranged Shadows thrive.", eliteBonus: 0.03, rfMult: 1.15, vents: false },
  { preset: "03-crystal-mesa-complete", name: "Ember Mesa", blurb: "Chokepoints and ember vents. Keep moving.", eliteBonus: 0.06, rfMult: 1.3, vents: true },
  { preset: "05-tidal-islands-complete", name: "Reed Tides", blurb: "Broken ground. Swarms pour through.", eliteBonus: 0.09, rfMult: 1.45, vents: true },
  { preset: "04-rooftop-terrace-complete", name: "Sky Terrace", blurb: "High perches for shielded Shadows.", eliteBonus: 0.12, rfMult: 1.6, vents: true },
  { preset: "06-orbital-hex-complete", name: "Star Hex", blurb: "The deep plot. Everything hunts.", eliteBonus: 0.15, rfMult: 1.8, vents: true }
];
function mapForWave(wave) {
  return Math.min(MAPS.length - 1, Math.floor((wave - 1) / 5));
}
var CONSUMABLES = [
  { id: "c-heal", name: "Full Heal", desc: "Restore 60% max HP now.", price: 25 },
  { id: "c-ward", name: "Emergency Shield", desc: "40 damage shield for this run.", price: 30 },
  { id: "c-tonic", name: "Power Tonic", desc: "+30% damage for 30s.", price: 20 },
  { id: "c-token", name: "Lucky Token", desc: "+50% drops next wave.", price: 15 },
  { id: "c-magnet", name: "Magnet Burst", desc: "Pulls all battlefield pickups to you.", price: 18 },
  { id: "c-fury", name: "Rare Fury", desc: "+40% damage + fire rate for 12s, fiery aura.", price: 35 }
];
var RELICS = [
  { id: "re-mirror", name: "Shadow Mirror", desc: "Every 8th volley duplicates (twin ghost shot)." },
  { id: "re-band", name: "Friendship Band", desc: "Mini Friends deal +50% damage." },
  { id: "re-glass", name: "Glass Heart", desc: "+40% damage, -25% max HP." },
  { id: "re-time", name: "Time Core", desc: "Abilities recharge 35% faster after elite kills (10s)." },
  { id: "re-echo", name: "Echo Core", desc: "Every 5th shot repeats." },
  { id: "re-prism", name: "Prism Shard", desc: "Projectiles split +1 bounce after first hit." },
  { id: "re-vol", name: "Volatile Cell", desc: "Kills have a 15% small explosion." },
  { id: "re-berserk", name: "Berserker Plate", desc: "Damage rises up to +30% as HP falls." }
];
function relicById(id) {
  const found = RELICS.find((r) => r.id === id);
  if (!found) throw new Error(`Unknown relic: ${id}`);
  return found;
}
var PICKUP_W = { rf: 0.3, heart: 0.22, haste: 0.18, power: 0.18, ward: 0.12 };
var ABILITY_STOCK = [
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
  { id: "ab-stunwave", price: 170 }
];
var RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
function rarityRoll(rng, block) {
  const t = Math.min(1, block * 0.18);
  const r = rng();
  if (r < 0.02 + t * 0.08) return "Legendary";
  if (r < 0.1 + t * 0.22) return "Epic";
  if (r < 0.3 + t * 0.3) return "Rare";
  if (r < 0.65) return "Uncommon";
  return "Common";
}
function traderStock(rng, block, owned, mods = {}) {
  const priceScale = 1 + block * 0.3;
  const beacon = mods.beacon ?? 0;
  const shrine = mods.shrine ?? 0;
  const workshop = mods.workshop ?? 0;
  const effBlock = block + beacon * 0.7 + shrine * 0.4;
  const pick = (slot) => {
    const rarity = rarityRoll(rng, effBlock);
    let pool = GEAR.filter((g) => g.slot === slot && g.price !== void 0 && !owned.includes(g.id) && RARITY_ORDER.indexOf(g.rarity) <= RARITY_ORDER.indexOf(rarity) + 1);
    if (workshop < 1) pool = pool.filter((g) => !["w13", "w14", "w15", "w16", "w17", "a11", "t12", "t14"].includes(g.id));
    if (workshop < 2) pool = pool.filter((g) => !["w14", "w17", "a11"].includes(g.id));
    const list = pool.length > 0 ? pool : GEAR.filter((g) => g.slot === slot && g.price !== void 0 && !owned.includes(g.id));
    if (list.length === 0) return null;
    const item = list[Math.floor(rng() * list.length)];
    const discount = beacon > 0 ? 1 - Math.min(0.15, beacon * 0.05) : 1;
    return { kind: "gear", id: item.id, price: Math.max(5, Math.round((item.price ?? 50) * priceScale * discount)) };
  };
  const stock = [];
  for (const slot of ["weapon", "armor", "trinket"]) {
    const item = pick(slot);
    if (item) stock.push(item);
  }
  if (beacon >= 3) {
    const extra = pick(rng() < 0.5 ? "weapon" : "trinket");
    if (extra && stock.length < 5) stock.push(extra);
  }
  const con = CONSUMABLES[Math.floor(rng() * CONSUMABLES.length)];
  stock.push({ kind: "consumable", id: con.id, price: Math.round(con.price * priceScale) });
  const altarPool = abilitiesForAltar(mods.altar ?? 4, {
    bulwark: mods.bulwark ?? 0,
    traps: mods.traps ?? 0,
    overcharge: mods.overcharge ?? 0,
    kennel: mods.kennel ?? 0,
    workshop: mods.workshop ?? 0
  }).filter(
    (a) => a !== "ab-blast" && !(mods.ownedAbilities ?? []).includes(a)
  );
  if (altarPool.length > 0 && rng() < 0.75) {
    const avail = ABILITY_STOCK.filter((a) => altarPool.includes(a.id));
    if (avail.length > 0) {
      const pick2 = avail[Math.floor(rng() * avail.length)];
      stock.push({ kind: "ability", id: pick2.id, price: Math.round(pick2.price * priceScale) });
    }
  }
  const ownedRel = new Set(mods.ownedRelics ?? []);
  const relicPool = RELICS.filter((r) => !ownedRel.has(r.id));
  if (relicPool.length > 0 && rng() < 0.3 + block * 0.05) {
    const r = relicPool[Math.floor(rng() * relicPool.length)];
    stock.push({ kind: "relic", id: r.id, price: Math.round((90 + block * 22) * priceScale) });
  }
  return stock;
}
function rerollCost(rerolls) {
  return [5, 10, 20][Math.min(2, rerolls)];
}
var SELL_FRACTION = 0.4;
function baseValue(rarity) {
  return rarity === "Legendary" ? 180 : rarity === "Epic" ? 110 : rarity === "Rare" ? 60 : rarity === "Uncommon" ? 30 : 15;
}
function sellValue(item) {
  return Math.max(1, Math.round((item.price ?? baseValue(item.rarity)) * SELL_FRACTION));
}
function eliteModFor(rng) {
  const r = rng();
  if (r < 0.4) return "frenzied";
  if (r < 0.75) return "armored";
  return "giant";
}
var UPGRADE_TAGS = {
  power: ["projectile", "crit"],
  rapid: ["projectile", "crit"],
  multishot: ["projectile"],
  pierce: ["projectile"],
  ricochet: ["projectile"],
  explosive: ["burn"],
  burn: ["burn"],
  freeze: ["utility"],
  crit: ["crit"],
  vitality: ["tank"],
  regen: ["tank"],
  minifriend: ["companion"],
  snack: ["utility"],
  ironskin: ["tank"],
  buddy: ["companion"],
  deadeye: ["crit"],
  keen: ["utility"],
  quick: ["utility"],
  boots: ["utility"],
  heavy: ["projectile"],
  seeker: ["projectile"],
  storm: ["burn", "crit"],
  sidestep: ["tank"],
  adrenaline: ["utility"],
  fortune: ["utility"]
};
var PLOTS = [
  { id: "garden-oval", name: "Sun Meadow", desc: "Open grass, pond and old trees. Room to maneuver.", preset: "01-garden-oval-complete", tendency: "+pickup range (open ground)", bonus: { kind: "pickup", amount: 12 } },
  { id: "circuit-courtyard", name: "Copper Grove", desc: "Tight lanes under copper boughs. Ambush country.", preset: "02-circuit-courtyard-complete", tendency: "+slow regen (shade rest)", bonus: { kind: "regen", amount: 0.3 } },
  { id: "crystal-mesa", name: "Ember Hollow", desc: "Warm vents and chokepoints. Dangerous but rich.", preset: "03-crystal-mesa-complete", tendency: "+RF from Shadows", bonus: { kind: "rf", amount: 0.08 } },
  { id: "tidal-islands", name: "Reed Tidepools", desc: "Broken pools and mudflats. Swarms love it here.", preset: "05-tidal-islands-complete", tendency: "+XP from Shadows", bonus: { kind: "xp", amount: 0.1 } }
];
function plotById(id) {
  return PLOTS.find((p) => p.id === id) ?? PLOTS[0];
}
var STRUCTURES = [
  { id: "turret", name: "Friend Turret", desc: "Auto-turret that fires with you.", category: "defense", maxTier: 4, costs: [40, 90, 170, 280], anchor: "turret", hp: [60, 110, 170, 250] },
  { id: "frost", name: "Frost Spire", desc: "Chills nearby Shadows, slowing their push.", category: "defense", maxTier: 3, costs: [70, 150, 260], anchor: "frost", hp: [70, 130, 200] },
  { id: "wall", name: "Bramble Wall", desc: "Slows Shadows near the plot heart.", category: "defense", maxTier: 3, costs: [35, 80, 150], anchor: null, hp: [120, 220, 340] },
  { id: "collector", name: "RF Collector", desc: "Gathers RF over time. Collect it!", category: "production", maxTier: 4, costs: [45, 100, 190, 300], anchor: "collector", hp: [50, 90, 140, 200] },
  { id: "workshop", name: "Tinker Workshop", desc: "Unlocks Rare+ gear tiers in Trader/bosses.", category: "production", maxTier: 3, costs: [70, 150, 260], anchor: null, hp: [0, 0, 0] },
  { id: "healer", name: "Healing Spring", desc: "Restores Friend health periodically.", category: "support", maxTier: 3, costs: [50, 110, 200], anchor: "healer", hp: [60, 110, 170] },
  { id: "altar", name: "Ability Altar", desc: "Unlocks Dash/Barrier \u2192 Nova/Strike \u2192 Phase/Freeze/Overdrive \u2192 Gravity/Chain.", category: "support", maxTier: 4, costs: [60, 130, 220, 340], anchor: null, hp: [0, 0, 0, 0] },
  { id: "training", name: "Training Posts", desc: "Stronger level-up choices; ability ranks unlock.", category: "support", maxTier: 3, costs: [55, 120, 210], anchor: null, hp: [0, 0, 0] },
  { id: "beacon", name: "Trader Beacon", desc: "Better rarity, cheaper rerolls, +stock at T3.", category: "economy", maxTier: 3, costs: [55, 120, 230], anchor: null, hp: [0, 0, 0] },
  { id: "vault", name: "Root Vault", desc: "+storage for produced RF; safer savings.", category: "economy", maxTier: 3, costs: [40, 90, 170], anchor: null, hp: [0, 0, 0] },
  { id: "archive", name: "Shadow Archive", desc: "+boss/elite damage; unlocks Codex hints.", category: "research", maxTier: 3, costs: [80, 170, 280], anchor: null, hp: [0, 0, 0] },
  { id: "kennel", name: "Wisp Kennel", desc: "Unlocks companion structures + Wisp ability.", category: "research", maxTier: 2, costs: [90, 200], anchor: null, hp: [0, 0] },
  { id: "shrine", name: "Luck Shrine", desc: "Rarity bonus for Trader + boss drops.", category: "special", maxTier: 3, costs: [50, 110, 200], anchor: null, hp: [0, 0, 0] },
  { id: "medbay", name: "Med Station", desc: "+healing between maps; cheaper mid-run heal.", category: "support", maxTier: 3, costs: [45, 100, 180], anchor: null, hp: [0, 0, 0] }
];
function structureById(id) {
  const found = STRUCTURES.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown structure: ${id}`);
  return found;
}
var HOME_CORE = {
  id: "homecore",
  name: "Home Core",
  desc: "Your Friend's house. If it falls, the invasion is lost \u2014 defend it!"
};
function structLabel(id) {
  if (id === HOME_CORE.id) return HOME_CORE.name;
  try {
    return structureById(id).name;
  } catch {
    return id;
  }
}
function homeCoreHp(playerMaxHp) {
  return Math.round(220 + Math.max(0, playerMaxHp) * 1.5);
}
function baseLevelOf(buildings) {
  return Object.values(buildings).reduce((n2, t) => n2 + Math.max(0, Math.min(9, t | 0)), 0);
}
function collectorRate(tier) {
  return [0, 6, 12, 20, 30][Math.min(4, Math.max(0, tier))];
}
function vaultCap(vaultTier) {
  return [60, 120, 220, 360][Math.min(3, Math.max(0, vaultTier))];
}
var ENCOUNTERS = {
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
  boss: { id: "boss", name: "Boss Assault", desc: "The big one, with timed support.", ceiling: 14, structureRaid: false, gateFocus: false, calmBefore: 4 }
};
function planEncounter(wave, mapIdx, type) {
  if (type === "boss") return "boss";
  if (type === "elite") return "elite";
  if (type === "swarm") return "swarm";
  if (type === "surge") return wave % 2 ? "breach" : "assault";
  if (type === "heavy") return wave % 3 === 0 ? "siege" : "assault";
  if (type === "ranged") return wave % 3 === 1 ? "snipers" : "assault";
  if (type === "rush") return wave % 2 ? "ambush" : "patrol";
  const pool = ["patrol", "assault", "ambush", "holdout"];
  if (wave >= 9) pool.push("raid", "siege");
  if (wave >= 12) pool.push("burrow");
  if (wave >= 15) pool.push("commander", "breach");
  const h = (wave * 2654435761 + mapIdx * 40503 + 40503 >>> 0) % pool.length;
  return pool[h];
}
var QUESTS = [
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
  { id: "q-base8", name: "Hamlet", desc: "Reach Base Level 8.", reward: 90 }
];
function questById(id) {
  const found = QUESTS.find((q) => q.id === id);
  if (!found) throw new Error(`Unknown quest: ${id}`);
  return found;
}
var CODEX_ENEMIES = [
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
  { id: "siege", kind: "enemy", name: "Siege Brute", hint: "Walks through walls. Kite it." }
];
var SETTLEMENT_TIERS = [
  { baseLevel: 0, name: "Campsite", desc: "A Friend and a dream." },
  { baseLevel: 4, name: "Homestead", desc: "First defenses online." },
  { baseLevel: 8, name: "Hamlet", desc: "Production humming. Expeditions open." },
  { baseLevel: 14, name: "Village", desc: "Advanced structures unlock." },
  { baseLevel: 22, name: "Stronghold", desc: "Late maps and siege bosses." },
  { baseLevel: 32, name: "Sanctuary", desc: "A living Rare Friends settlement." }
];
function settlementTierFor(baseLevel) {
  let cur = SETTLEMENT_TIERS[0];
  for (const m of SETTLEMENT_TIERS) if (baseLevel >= m.baseLevel) cur = m;
  return cur;
}
var EXPEDITIONS = [
  { mapIdx: 0, name: "Home Defense", desc: "Defend the home plot. No bonus.", reqBase: 0, rfBonus: 0, lootBonus: 0 },
  { mapIdx: 1, name: "Copper Foray", desc: "Tight lanes, +15% RF.", reqBase: 0, rfBonus: 0.15, lootBonus: 0 },
  { mapIdx: 2, name: "Ember Raid", desc: "Vents and chokepoints, +30% RF.", reqBase: 4, rfBonus: 0.3, lootBonus: 0.05 },
  { mapIdx: 3, name: "Tide Run", desc: "Swarms and mud, +45% RF.", reqBase: 8, rfBonus: 0.45, lootBonus: 0.1 },
  { mapIdx: 4, name: "Terrace Climb", desc: "Shielded heights, +60% RF.", reqBase: 14, rfBonus: 0.6, lootBonus: 0.15 },
  { mapIdx: 5, name: "Star Descent", desc: "Everything hunts, +80% RF.", reqBase: 22, rfBonus: 0.8, lootBonus: 0.2 }
];
function expeditionFor(mapIdx) {
  return EXPEDITIONS.find((e) => e.mapIdx === mapIdx) ?? EXPEDITIONS[0];
}
var ITEM_HOTKEYS = ["Z", "X", "C", "V"];
var BELT_ORDER = ["heal", "ward", "tonic", "token", "magnet", "fury"];
var STRUCTURE_SPECS = [
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
  { id: "healer-regen", structureId: "healer", name: "Trickle Spring", desc: "Constant small regen aura.", icon: "regen" }
];
function specsFor(structureId) {
  return STRUCTURE_SPECS.filter((s) => s.structureId === structureId);
}
var SYNERGIES = [
  { id: "syn-workshop-turret", name: "Tuned Seeds", desc: "Workshop + Turret: +15% turret fire rate.", icon: "upgrade" },
  { id: "syn-healer-kennel", name: "Pack Care", desc: "Healer + Kennel: defenders regenerate.", icon: "support" },
  { id: "syn-collector-vault", name: "Safe Harvest", desc: "Collector + Vault: +40% storage cap.", icon: "storage" },
  { id: "syn-wall-turret", name: "Covered Line", desc: "Wall + Turret: turret +30 HP.", icon: "defense" }
];
function activeSynergies(buildings) {
  const has = (id) => (buildings[id] ?? 0) > 0;
  const out = [];
  if (has("workshop") && has("turret")) out.push(SYNERGIES[0]);
  if (has("healer") && has("kennel")) out.push(SYNERGIES[1]);
  if (has("collector") && has("vault")) out.push(SYNERGIES[2]);
  if (has("wall") && has("turret")) out.push(SYNERGIES[3]);
  return out;
}
function trainingRate(tier) {
  return [0, 2, 5, 10][Math.min(3, Math.max(0, tier))];
}
function autoCollectTier(vaultTier) {
  return vaultTier >= 2;
}
function autoRepairTier(workshopTier) {
  return workshopTier >= 2;
}

// node_modules/@rarefriends/friendsdk/dist/friend-worlds.json
var friend_worlds_default = {
  version: 1,
  collection: "Rare Friends / Isometric Worlds",
  source: {
    livingMap: "src/friend-world.ts",
    projection: "src/friend-worlds.json#style.projection",
    characterRule: "Use canonical on-chain Generations sprites through the SDK sprite reader. Preserve integer pixel edges and the white outline."
  },
  style: {
    projection: {
      a: 0.8660254038,
      b: 0.28
    },
    ground: {
      width: 576,
      height: 384,
      chunkSize: 48
    },
    viewport: {
      width: 1600,
      height: 1200,
      centerX: 800,
      centerY: 690,
      scale: 1.5
    },
    palette: {
      ink: "#000000",
      paper: "#FFFFFF",
      signal: "#CCFF00"
    },
    spriteSize: 80,
    background: "transparent",
    previewBackground: "#090B09",
    grid: {
      cell: 24,
      strokeWidth: 0.55,
      opacity: 0.18
    },
    edgeStrokeWidth: 1.5,
    loadingRules: {
      void: "Subtract this chunk from the top and floor texture. Show only a subtle dotted guide if needed.",
      wireframe: "Subtract the chunk; show an open green isometric outline with sparse node corners, no fill.",
      floating: "Subtract the chunk; draw a separate white/dither unfinished tile lifted by lift screen pixels with a slim green guide.",
      occlusion: "Mask all floor paths and texture to the actual loaded surface. Do not leave upright actors or props anchored over a missing chunk."
    },
    characterPixelScale: 5,
    characterSourceResolution: [
      16,
      16
    ]
  },
  worlds: [
    {
      family: "garden-oval",
      name: "Garden Commons",
      setting: "Botanical garden",
      shape: "Organic oval",
      summary: "A soft island with a pond, pixel trees and an open gathering route.",
      geometry: {
        polygons: [
          [
            [
              72,
              48
            ],
            [
              144,
              16
            ],
            [
              240,
              0
            ],
            [
              384,
              8
            ],
            [
              480,
              48
            ],
            [
              544,
              104
            ],
            [
              576,
              176
            ],
            [
              560,
              248
            ],
            [
              512,
              312
            ],
            [
              432,
              360
            ],
            [
              304,
              384
            ],
            [
              176,
              376
            ],
            [
              80,
              336
            ],
            [
              24,
              272
            ],
            [
              0,
              192
            ],
            [
              16,
              112
            ]
          ]
        ],
        holes: [],
        depth: 18
      },
      props: [
        {
          type: "tree",
          x: 144,
          y: 90,
          scale: 1.05
        },
        {
          type: "tree",
          x: 452,
          y: 110,
          scale: 1.12
        },
        {
          type: "flower",
          x: 95,
          y: 130,
          scale: 0.8
        },
        {
          type: "flower",
          x: 180,
          y: 100,
          scale: 0.9
        },
        {
          type: "flower",
          x: 351,
          y: 335,
          scale: 0.9
        },
        {
          type: "flower",
          x: 248,
          y: 337,
          scale: 0.8
        },
        {
          type: "bench",
          x: 340,
          y: 58,
          scale: 0.9
        },
        {
          type: "reeds",
          x: 126,
          y: 282,
          scale: 0.85
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 120,
          y: 212
        },
        {
          sprite: 1,
          x: 240,
          y: 94
        },
        {
          sprite: 2,
          x: 344,
          y: 168
        },
        {
          sprite: 3,
          x: 453,
          y: 207
        },
        {
          sprite: 4,
          x: 260,
          y: 294
        },
        {
          sprite: 5,
          x: 380,
          y: 290
        }
      ],
      paths: [
        {
          points: [
            [
              64,
              184
            ],
            [
              184,
              184
            ],
            [
              184,
              144
            ],
            [
              320,
              144
            ],
            [
              320,
              232
            ],
            [
              464,
              232
            ]
          ],
          width: 22
        }
      ],
      patches: [
        {
          x: 89,
          y: 52,
          w: 112,
          h: 64,
          pattern: "dither"
        },
        {
          x: 410,
          y: 54,
          w: 104,
          h: 70,
          pattern: "dither"
        },
        {
          x: 70,
          y: 258,
          w: 128,
          h: 64,
          pattern: "water"
        },
        {
          x: 226,
          y: 310,
          w: 180,
          h: 42,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 176,
          y: 164,
          kind: "currency"
        },
        {
          x: 292,
          y: 152,
          kind: "currency"
        },
        {
          x: 402,
          y: 235,
          kind: "currency"
        },
        {
          x: 162,
          y: 247,
          kind: "currency"
        }
      ],
      id: "01-garden-oval-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "garden-oval",
      name: "Garden Commons / Loading",
      setting: "Botanical garden",
      shape: "Organic oval",
      summary: "A soft island with a pond, pixel trees and an open gathering route. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              72,
              48
            ],
            [
              144,
              16
            ],
            [
              240,
              0
            ],
            [
              384,
              8
            ],
            [
              480,
              48
            ],
            [
              544,
              104
            ],
            [
              576,
              176
            ],
            [
              560,
              248
            ],
            [
              512,
              312
            ],
            [
              432,
              360
            ],
            [
              304,
              384
            ],
            [
              176,
              376
            ],
            [
              80,
              336
            ],
            [
              24,
              272
            ],
            [
              0,
              192
            ],
            [
              16,
              112
            ]
          ]
        ],
        holes: [],
        depth: 18
      },
      props: [
        {
          type: "tree",
          x: 144,
          y: 90,
          scale: 1.05
        },
        {
          type: "tree",
          x: 452,
          y: 110,
          scale: 1.12
        },
        {
          type: "flower",
          x: 95,
          y: 130,
          scale: 0.8
        },
        {
          type: "flower",
          x: 180,
          y: 100,
          scale: 0.9
        },
        {
          type: "flower",
          x: 351,
          y: 335,
          scale: 0.9
        },
        {
          type: "flower",
          x: 248,
          y: 337,
          scale: 0.8
        },
        {
          type: "bench",
          x: 340,
          y: 58,
          scale: 0.9
        },
        {
          type: "reeds",
          x: 126,
          y: 282,
          scale: 0.85
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 120,
          y: 212
        },
        {
          sprite: 1,
          x: 240,
          y: 94
        },
        {
          sprite: 2,
          x: 344,
          y: 168
        },
        {
          sprite: 3,
          x: 453,
          y: 207
        },
        {
          sprite: 4,
          x: 260,
          y: 294
        },
        {
          sprite: 5,
          x: 380,
          y: 290
        }
      ],
      paths: [
        {
          points: [
            [
              64,
              184
            ],
            [
              184,
              184
            ],
            [
              184,
              144
            ],
            [
              320,
              144
            ],
            [
              320,
              232
            ],
            [
              464,
              232
            ]
          ],
          width: 22
        }
      ],
      patches: [
        {
          x: 89,
          y: 52,
          w: 112,
          h: 64,
          pattern: "dither"
        },
        {
          x: 410,
          y: 54,
          w: 104,
          h: 70,
          pattern: "dither"
        },
        {
          x: 70,
          y: 258,
          w: 128,
          h: 64,
          pattern: "water"
        },
        {
          x: 226,
          y: 310,
          w: 180,
          h: 42,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 176,
          y: 164,
          kind: "currency"
        },
        {
          x: 292,
          y: 152,
          kind: "currency"
        },
        {
          x: 402,
          y: 235,
          kind: "currency"
        },
        {
          x: 162,
          y: 247,
          kind: "currency"
        }
      ],
      id: "01-garden-oval-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 432,
          y: 240,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 240,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 240,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 30
        },
        {
          x: 432,
          y: 288,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 288,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 384,
          y: 336,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 22
        },
        {
          x: 432,
          y: 336,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        }
      ]
    },
    {
      family: "circuit-courtyard",
      name: "Circuit Courtyard",
      setting: "Industrial circuit workshop",
      shape: "Courtyard ring",
      summary: "A compact workshop wrapped around an open square, with terminals, tanks and circuit traces.",
      geometry: {
        polygons: [
          [
            [
              48,
              0
            ],
            [
              528,
              0
            ],
            [
              576,
              48
            ],
            [
              576,
              336
            ],
            [
              528,
              384
            ],
            [
              48,
              384
            ],
            [
              0,
              336
            ],
            [
              0,
              48
            ]
          ]
        ],
        holes: [
          [
            [
              192,
              120
            ],
            [
              384,
              120
            ],
            [
              384,
              264
            ],
            [
              192,
              264
            ]
          ]
        ],
        depth: 24
      },
      props: [
        {
          type: "tank",
          x: 95,
          y: 74,
          scale: 1.1
        },
        {
          type: "pipe",
          x: 158,
          y: 68,
          scale: 0.95
        },
        {
          type: "terminal",
          x: 426,
          y: 72,
          scale: 1.05
        },
        {
          type: "crate",
          x: 518,
          y: 133,
          scale: 0.95
        },
        {
          type: "tank",
          x: 88,
          y: 286,
          scale: 0.8
        },
        {
          type: "terminal",
          x: 448,
          y: 314,
          scale: 0.9
        },
        {
          type: "pipe",
          x: 285,
          y: 340,
          scale: 0.9
        },
        {
          type: "crate",
          x: 132,
          y: 344,
          scale: 0.8
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 200,
          y: 60
        },
        {
          sprite: 2,
          x: 346,
          y: 75
        },
        {
          sprite: 4,
          x: 490,
          y: 210
        },
        {
          sprite: 6,
          x: 394,
          y: 324
        },
        {
          sprite: 1,
          x: 187,
          y: 318
        },
        {
          sprite: 3,
          x: 92,
          y: 183
        }
      ],
      paths: [
        {
          points: [
            [
              48,
              144
            ],
            [
              48,
              216
            ],
            [
              144,
              216
            ],
            [
              144,
              312
            ],
            [
              360,
              312
            ],
            [
              360,
              344
            ],
            [
              528,
              344
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              168,
              48
            ],
            [
              264,
              48
            ],
            [
              264,
              96
            ],
            [
              480,
              96
            ],
            [
              480,
              160
            ]
          ],
          width: 10
        }
      ],
      patches: [
        {
          x: 54,
          y: 30,
          w: 110,
          h: 56,
          pattern: "dense"
        },
        {
          x: 400,
          y: 32,
          w: 140,
          h: 76,
          pattern: "grid"
        },
        {
          x: 40,
          y: 268,
          w: 110,
          h: 94,
          pattern: "dither"
        },
        {
          x: 412,
          y: 278,
          w: 132,
          h: 62,
          pattern: "grid"
        }
      ],
      signals: [
        {
          x: 280,
          y: 76,
          kind: "node"
        },
        {
          x: 539,
          y: 208,
          kind: "node"
        },
        {
          x: 322,
          y: 322,
          kind: "currency"
        },
        {
          x: 125,
          y: 195,
          kind: "currency"
        }
      ],
      id: "02-circuit-courtyard-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "circuit-courtyard",
      name: "Circuit Courtyard / Loading",
      setting: "Industrial circuit workshop",
      shape: "Courtyard ring",
      summary: "A compact workshop wrapped around an open square, with terminals, tanks and circuit traces. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              48,
              0
            ],
            [
              528,
              0
            ],
            [
              576,
              48
            ],
            [
              576,
              336
            ],
            [
              528,
              384
            ],
            [
              48,
              384
            ],
            [
              0,
              336
            ],
            [
              0,
              48
            ]
          ]
        ],
        holes: [
          [
            [
              192,
              120
            ],
            [
              384,
              120
            ],
            [
              384,
              264
            ],
            [
              192,
              264
            ]
          ]
        ],
        depth: 24
      },
      props: [
        {
          type: "tank",
          x: 95,
          y: 74,
          scale: 1.1
        },
        {
          type: "pipe",
          x: 158,
          y: 68,
          scale: 0.95
        },
        {
          type: "terminal",
          x: 426,
          y: 72,
          scale: 1.05
        },
        {
          type: "tank",
          x: 88,
          y: 286,
          scale: 0.8
        },
        {
          type: "terminal",
          x: 448,
          y: 314,
          scale: 0.9
        },
        {
          type: "pipe",
          x: 285,
          y: 340,
          scale: 0.9
        },
        {
          type: "crate",
          x: 132,
          y: 344,
          scale: 0.8
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 200,
          y: 60
        },
        {
          sprite: 2,
          x: 346,
          y: 75
        },
        {
          sprite: 4,
          x: 490,
          y: 210
        },
        {
          sprite: 6,
          x: 394,
          y: 324
        },
        {
          sprite: 1,
          x: 187,
          y: 318
        },
        {
          sprite: 3,
          x: 92,
          y: 183
        }
      ],
      paths: [
        {
          points: [
            [
              48,
              144
            ],
            [
              48,
              216
            ],
            [
              144,
              216
            ],
            [
              144,
              312
            ],
            [
              360,
              312
            ],
            [
              360,
              344
            ],
            [
              528,
              344
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              168,
              48
            ],
            [
              264,
              48
            ],
            [
              264,
              96
            ],
            [
              480,
              96
            ],
            [
              480,
              160
            ]
          ],
          width: 10
        }
      ],
      patches: [
        {
          x: 54,
          y: 30,
          w: 110,
          h: 56,
          pattern: "dense"
        },
        {
          x: 400,
          y: 32,
          w: 140,
          h: 76,
          pattern: "grid"
        },
        {
          x: 40,
          y: 268,
          w: 110,
          h: 94,
          pattern: "dither"
        },
        {
          x: 412,
          y: 278,
          w: 132,
          h: 62,
          pattern: "grid"
        }
      ],
      signals: [
        {
          x: 280,
          y: 76,
          kind: "node"
        },
        {
          x: 539,
          y: 208,
          kind: "node"
        },
        {
          x: 322,
          y: 322,
          kind: "currency"
        },
        {
          x: 125,
          y: 195,
          kind: "currency"
        }
      ],
      id: "02-circuit-courtyard-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 432,
          y: 0,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 0,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 0,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 28
        },
        {
          x: 432,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 48,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 528,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 96,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 24
        },
        {
          x: 528,
          y: 96,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        }
      ]
    },
    {
      family: "crystal-mesa",
      name: "Crystal Steps",
      setting: "Crystal cavern",
      shape: "Stepped mesa",
      summary: "A broad, cut stone plateau with dense crystal clusters and exposed strata.",
      geometry: {
        polygons: [
          [
            [
              64,
              0
            ],
            [
              432,
              0
            ],
            [
              432,
              48
            ],
            [
              512,
              48
            ],
            [
              512,
              112
            ],
            [
              560,
              112
            ],
            [
              560,
              288
            ],
            [
              496,
              288
            ],
            [
              496,
              336
            ],
            [
              336,
              336
            ],
            [
              336,
              384
            ],
            [
              96,
              384
            ],
            [
              96,
              336
            ],
            [
              48,
              336
            ],
            [
              48,
              272
            ],
            [
              0,
              272
            ],
            [
              0,
              112
            ],
            [
              64,
              112
            ]
          ]
        ],
        holes: [],
        depth: 30
      },
      props: [
        {
          type: "crystal",
          x: 118,
          y: 70,
          scale: 1.25
        },
        {
          type: "crystal",
          x: 161,
          y: 93,
          scale: 0.75
        },
        {
          type: "crystal",
          x: 445,
          y: 112,
          scale: 1.45
        },
        {
          type: "crystal",
          x: 479,
          y: 148,
          scale: 0.75
        },
        {
          type: "rock",
          x: 313,
          y: 60,
          scale: 0.95
        },
        {
          type: "rock",
          x: 79,
          y: 216,
          scale: 0.95
        },
        {
          type: "crystal",
          x: 184,
          y: 336,
          scale: 1.15
        },
        {
          type: "rock",
          x: 398,
          y: 294,
          scale: 1.05
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 218,
          y: 107
        },
        {
          sprite: 1,
          x: 350,
          y: 146
        },
        {
          sprite: 3,
          x: 450,
          y: 243
        },
        {
          sprite: 4,
          x: 286,
          y: 262
        },
        {
          sprite: 6,
          x: 111,
          y: 165
        },
        {
          sprite: 7,
          x: 297,
          y: 343
        }
      ],
      paths: [
        {
          points: [
            [
              88,
              152
            ],
            [
              200,
              152
            ],
            [
              200,
              212
            ],
            [
              376,
              212
            ],
            [
              376,
              274
            ],
            [
              496,
              274
            ]
          ],
          width: 18
        }
      ],
      patches: [
        {
          x: 82,
          y: 36,
          w: 132,
          h: 102,
          pattern: "dense"
        },
        {
          x: 404,
          y: 74,
          w: 96,
          h: 95,
          pattern: "dither"
        },
        {
          x: 98,
          y: 302,
          w: 232,
          h: 70,
          pattern: "dense"
        },
        {
          x: 40,
          y: 180,
          w: 72,
          h: 84,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 186,
          y: 172,
          kind: "currency"
        },
        {
          x: 317,
          y: 204,
          kind: "currency"
        },
        {
          x: 405,
          y: 250,
          kind: "currency"
        }
      ],
      id: "03-crystal-mesa-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "crystal-mesa",
      name: "Crystal Steps / Loading",
      setting: "Crystal cavern",
      shape: "Stepped mesa",
      summary: "A broad, cut stone plateau with dense crystal clusters and exposed strata. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              64,
              0
            ],
            [
              432,
              0
            ],
            [
              432,
              48
            ],
            [
              512,
              48
            ],
            [
              512,
              112
            ],
            [
              560,
              112
            ],
            [
              560,
              288
            ],
            [
              496,
              288
            ],
            [
              496,
              336
            ],
            [
              336,
              336
            ],
            [
              336,
              384
            ],
            [
              96,
              384
            ],
            [
              96,
              336
            ],
            [
              48,
              336
            ],
            [
              48,
              272
            ],
            [
              0,
              272
            ],
            [
              0,
              112
            ],
            [
              64,
              112
            ]
          ]
        ],
        holes: [],
        depth: 30
      },
      props: [
        {
          type: "crystal",
          x: 118,
          y: 70,
          scale: 1.25
        },
        {
          type: "crystal",
          x: 161,
          y: 93,
          scale: 0.75
        },
        {
          type: "crystal",
          x: 445,
          y: 112,
          scale: 1.45
        },
        {
          type: "crystal",
          x: 479,
          y: 148,
          scale: 0.75
        },
        {
          type: "rock",
          x: 313,
          y: 60,
          scale: 0.95
        },
        {
          type: "crystal",
          x: 184,
          y: 336,
          scale: 1.15
        },
        {
          type: "rock",
          x: 398,
          y: 294,
          scale: 1.05
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 218,
          y: 107
        },
        {
          sprite: 1,
          x: 350,
          y: 146
        },
        {
          sprite: 3,
          x: 450,
          y: 243
        },
        {
          sprite: 4,
          x: 286,
          y: 262
        },
        {
          sprite: 6,
          x: 111,
          y: 165
        },
        {
          sprite: 7,
          x: 297,
          y: 343
        }
      ],
      paths: [
        {
          points: [
            [
              88,
              152
            ],
            [
              200,
              152
            ],
            [
              200,
              212
            ],
            [
              376,
              212
            ],
            [
              376,
              274
            ],
            [
              496,
              274
            ]
          ],
          width: 18
        }
      ],
      patches: [
        {
          x: 82,
          y: 36,
          w: 132,
          h: 102,
          pattern: "dense"
        },
        {
          x: 404,
          y: 74,
          w: 96,
          h: 95,
          pattern: "dither"
        },
        {
          x: 98,
          y: 302,
          w: 232,
          h: 70,
          pattern: "dense"
        },
        {
          x: 40,
          y: 180,
          w: 72,
          h: 84,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 186,
          y: 172,
          kind: "currency"
        },
        {
          x: 317,
          y: 204,
          kind: "currency"
        },
        {
          x: 405,
          y: 250,
          kind: "currency"
        }
      ],
      id: "03-crystal-mesa-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 48,
          y: 192,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 0,
          y: 192,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 48,
          y: 240,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 0,
          y: 240,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 24
        },
        {
          x: 96,
          y: 240,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 96,
          y: 288,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 48,
          y: 288,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 32
        },
        {
          x: 96,
          y: 336,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        }
      ]
    },
    {
      family: "rooftop-terrace",
      name: "Rooftop Hangout",
      setting: "Urban rooftop",
      shape: "L terrace",
      summary: "A city roof with an open terrace, vents and planter boxes around an angular footprint.",
      geometry: {
        polygons: [
          [
            [
              0,
              0
            ],
            [
              576,
              0
            ],
            [
              576,
              144
            ],
            [
              240,
              144
            ],
            [
              240,
              384
            ],
            [
              0,
              384
            ]
          ]
        ],
        holes: [],
        depth: 22
      },
      props: [
        {
          type: "tank",
          x: 78,
          y: 52,
          scale: 1.1
        },
        {
          type: "vent",
          x: 316,
          y: 45,
          scale: 0.95
        },
        {
          type: "antenna",
          x: 510,
          y: 42,
          scale: 0.95
        },
        {
          type: "planter",
          x: 421,
          y: 100,
          scale: 0.95
        },
        {
          type: "planter",
          x: 42,
          y: 166,
          scale: 0.9
        },
        {
          type: "bench",
          x: 172,
          y: 222,
          scale: 0.95
        },
        {
          type: "vent",
          x: 55,
          y: 350,
          scale: 0.9
        },
        {
          type: "planter",
          x: 179,
          y: 350,
          scale: 0.95
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 180,
          y: 71
        },
        {
          sprite: 2,
          x: 315,
          y: 120
        },
        {
          sprite: 4,
          x: 500,
          y: 108
        },
        {
          sprite: 5,
          x: 162,
          y: 151
        },
        {
          sprite: 6,
          x: 25,
          y: 252
        },
        {
          sprite: 7,
          x: 196,
          y: 305
        }
      ],
      paths: [
        {
          points: [
            [
              112,
              32
            ],
            [
              112,
              110
            ],
            [
              544,
              110
            ]
          ],
          width: 16
        },
        {
          points: [
            [
              112,
              110
            ],
            [
              112,
              352
            ]
          ],
          width: 16
        }
      ],
      patches: [
        {
          x: 26,
          y: 24,
          w: 98,
          h: 66,
          pattern: "dense"
        },
        {
          x: 274,
          y: 24,
          w: 86,
          h: 48,
          pattern: "grid"
        },
        {
          x: 162,
          y: 227,
          w: 62,
          h: 74,
          pattern: "dither"
        },
        {
          x: 22,
          y: 286,
          w: 66,
          h: 67,
          pattern: "grid"
        },
        {
          x: 160,
          y: 328,
          w: 66,
          h: 40,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 271,
          y: 110,
          kind: "currency"
        },
        {
          x: 113,
          y: 220,
          kind: "currency"
        },
        {
          x: 112,
          y: 315,
          kind: "currency"
        }
      ],
      id: "04-rooftop-terrace-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "rooftop-terrace",
      name: "Rooftop Hangout / Loading",
      setting: "Urban rooftop",
      shape: "L terrace",
      summary: "A city roof with an open terrace, vents and planter boxes around an angular footprint. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              0,
              0
            ],
            [
              576,
              0
            ],
            [
              576,
              144
            ],
            [
              240,
              144
            ],
            [
              240,
              384
            ],
            [
              0,
              384
            ]
          ]
        ],
        holes: [],
        depth: 22
      },
      props: [
        {
          type: "tank",
          x: 78,
          y: 52,
          scale: 1.1
        },
        {
          type: "vent",
          x: 316,
          y: 45,
          scale: 0.95
        },
        {
          type: "planter",
          x: 421,
          y: 100,
          scale: 0.95
        },
        {
          type: "planter",
          x: 42,
          y: 166,
          scale: 0.9
        },
        {
          type: "bench",
          x: 172,
          y: 222,
          scale: 0.95
        },
        {
          type: "vent",
          x: 55,
          y: 350,
          scale: 0.9
        },
        {
          type: "planter",
          x: 179,
          y: 350,
          scale: 0.95
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 180,
          y: 71
        },
        {
          sprite: 2,
          x: 315,
          y: 120
        },
        {
          sprite: 5,
          x: 162,
          y: 151
        },
        {
          sprite: 6,
          x: 25,
          y: 252
        },
        {
          sprite: 7,
          x: 196,
          y: 305
        }
      ],
      paths: [
        {
          points: [
            [
              112,
              32
            ],
            [
              112,
              110
            ],
            [
              544,
              110
            ]
          ],
          width: 16
        },
        {
          points: [
            [
              112,
              110
            ],
            [
              112,
              352
            ]
          ],
          width: 16
        }
      ],
      patches: [
        {
          x: 26,
          y: 24,
          w: 98,
          h: 66,
          pattern: "dense"
        },
        {
          x: 274,
          y: 24,
          w: 86,
          h: 48,
          pattern: "grid"
        },
        {
          x: 162,
          y: 227,
          w: 62,
          h: 74,
          pattern: "dither"
        },
        {
          x: 22,
          y: 286,
          w: 66,
          h: 67,
          pattern: "grid"
        },
        {
          x: 160,
          y: 328,
          w: 66,
          h: 40,
          pattern: "dither"
        }
      ],
      signals: [
        {
          x: 271,
          y: 110,
          kind: "currency"
        },
        {
          x: 113,
          y: 220,
          kind: "currency"
        },
        {
          x: 112,
          y: 315,
          kind: "currency"
        }
      ],
      id: "04-rooftop-terrace-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 384,
          y: 0,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 432,
          y: 0,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 0,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 32
        },
        {
          x: 528,
          y: 0,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 432,
          y: 48,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 48,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 96,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 24
        },
        {
          x: 528,
          y: 96,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        }
      ]
    },
    {
      family: "tidal-islands",
      name: "Tidal Islands",
      setting: "Archipelago water world",
      shape: "Fractured islands",
      summary: "Three distinct shore platforms with reed beds, wave marks and buoy signals.",
      geometry: {
        polygons: [
          [
            [
              48,
              48
            ],
            [
              144,
              8
            ],
            [
              208,
              24
            ],
            [
              256,
              80
            ],
            [
              248,
              168
            ],
            [
              192,
              216
            ],
            [
              80,
              208
            ],
            [
              16,
              160
            ],
            [
              0,
              96
            ]
          ],
          [
            [
              344,
              32
            ],
            [
              496,
              24
            ],
            [
              552,
              64
            ],
            [
              576,
              136
            ],
            [
              552,
              208
            ],
            [
              456,
              232
            ],
            [
              352,
              200
            ],
            [
              304,
              128
            ]
          ],
          [
            [
              176,
              280
            ],
            [
              248,
              240
            ],
            [
              320,
              264
            ],
            [
              384,
              328
            ],
            [
              352,
              376
            ],
            [
              240,
              384
            ],
            [
              144,
              360
            ],
            [
              112,
              312
            ]
          ]
        ],
        holes: [],
        depth: 20
      },
      props: [
        {
          type: "reeds",
          x: 53,
          y: 116,
          scale: 1.2
        },
        {
          type: "reeds",
          x: 198,
          y: 173,
          scale: 0.95
        },
        {
          type: "buoy",
          x: 181,
          y: 48,
          scale: 0.9
        },
        {
          type: "rock",
          x: 120,
          y: 63,
          scale: 0.85
        },
        {
          type: "reeds",
          x: 501,
          y: 163,
          scale: 1.1
        },
        {
          type: "buoy",
          x: 387,
          y: 75,
          scale: 1
        },
        {
          type: "rock",
          x: 514,
          y: 91,
          scale: 0.8
        },
        {
          type: "reeds",
          x: 178,
          y: 326,
          scale: 0.9
        },
        {
          type: "buoy",
          x: 352,
          y: 342,
          scale: 0.9
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 121,
          y: 145
        },
        {
          sprite: 2,
          x: 206,
          y: 104
        },
        {
          sprite: 4,
          x: 449,
          y: 90
        },
        {
          sprite: 1,
          x: 421,
          y: 176
        },
        {
          sprite: 5,
          x: 228,
          y: 318
        },
        {
          sprite: 7,
          x: 316,
          y: 353
        }
      ],
      paths: [
        {
          points: [
            [
              72,
              154
            ],
            [
              168,
              154
            ],
            [
              168,
              110
            ],
            [
              216,
              110
            ]
          ],
          width: 14
        },
        {
          points: [
            [
              363,
              116
            ],
            [
              458,
              116
            ],
            [
              458,
              179
            ],
            [
              521,
              179
            ]
          ],
          width: 14
        },
        {
          points: [
            [
              202,
              343
            ],
            [
              275,
              343
            ],
            [
              275,
              298
            ]
          ],
          width: 14
        }
      ],
      patches: [
        {
          x: 25,
          y: 82,
          w: 70,
          h: 56,
          pattern: "water"
        },
        {
          x: 133,
          y: 171,
          w: 87,
          h: 30,
          pattern: "dense"
        },
        {
          x: 358,
          y: 152,
          w: 162,
          h: 51,
          pattern: "water"
        },
        {
          x: 372,
          y: 43,
          w: 128,
          h: 38,
          pattern: "water"
        },
        {
          x: 154,
          y: 318,
          w: 172,
          h: 42,
          pattern: "water"
        }
      ],
      signals: [
        {
          x: 150,
          y: 176,
          kind: "currency"
        },
        {
          x: 485,
          y: 174,
          kind: "currency"
        },
        {
          x: 245,
          y: 369,
          kind: "currency"
        }
      ],
      id: "05-tidal-islands-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "tidal-islands",
      name: "Tidal Islands / Loading",
      setting: "Archipelago water world",
      shape: "Fractured islands",
      summary: "Three distinct shore platforms with reed beds, wave marks and buoy signals. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              48,
              48
            ],
            [
              144,
              8
            ],
            [
              208,
              24
            ],
            [
              256,
              80
            ],
            [
              248,
              168
            ],
            [
              192,
              216
            ],
            [
              80,
              208
            ],
            [
              16,
              160
            ],
            [
              0,
              96
            ]
          ],
          [
            [
              344,
              32
            ],
            [
              496,
              24
            ],
            [
              552,
              64
            ],
            [
              576,
              136
            ],
            [
              552,
              208
            ],
            [
              456,
              232
            ],
            [
              352,
              200
            ],
            [
              304,
              128
            ]
          ],
          [
            [
              176,
              280
            ],
            [
              248,
              240
            ],
            [
              320,
              264
            ],
            [
              384,
              328
            ],
            [
              352,
              376
            ],
            [
              240,
              384
            ],
            [
              144,
              360
            ],
            [
              112,
              312
            ]
          ]
        ],
        holes: [],
        depth: 20
      },
      props: [
        {
          type: "reeds",
          x: 53,
          y: 116,
          scale: 1.2
        },
        {
          type: "reeds",
          x: 198,
          y: 173,
          scale: 0.95
        },
        {
          type: "buoy",
          x: 181,
          y: 48,
          scale: 0.9
        },
        {
          type: "rock",
          x: 120,
          y: 63,
          scale: 0.85
        },
        {
          type: "buoy",
          x: 387,
          y: 75,
          scale: 1
        },
        {
          type: "reeds",
          x: 178,
          y: 326,
          scale: 0.9
        },
        {
          type: "buoy",
          x: 352,
          y: 342,
          scale: 0.9
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 121,
          y: 145
        },
        {
          sprite: 2,
          x: 206,
          y: 104
        },
        {
          sprite: 1,
          x: 421,
          y: 176
        },
        {
          sprite: 5,
          x: 228,
          y: 318
        },
        {
          sprite: 7,
          x: 316,
          y: 353
        }
      ],
      paths: [
        {
          points: [
            [
              72,
              154
            ],
            [
              168,
              154
            ],
            [
              168,
              110
            ],
            [
              216,
              110
            ]
          ],
          width: 14
        },
        {
          points: [
            [
              363,
              116
            ],
            [
              458,
              116
            ],
            [
              458,
              179
            ],
            [
              521,
              179
            ]
          ],
          width: 14
        },
        {
          points: [
            [
              202,
              343
            ],
            [
              275,
              343
            ],
            [
              275,
              298
            ]
          ],
          width: 14
        }
      ],
      patches: [
        {
          x: 25,
          y: 82,
          w: 70,
          h: 56,
          pattern: "water"
        },
        {
          x: 133,
          y: 171,
          w: 87,
          h: 30,
          pattern: "dense"
        },
        {
          x: 358,
          y: 152,
          w: 162,
          h: 51,
          pattern: "water"
        },
        {
          x: 372,
          y: 43,
          w: 128,
          h: 38,
          pattern: "water"
        },
        {
          x: 154,
          y: 318,
          w: 172,
          h: 42,
          pattern: "water"
        }
      ],
      signals: [
        {
          x: 150,
          y: 176,
          kind: "currency"
        },
        {
          x: 245,
          y: 369,
          kind: "currency"
        }
      ],
      id: "05-tidal-islands-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 432,
          y: 48,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 48,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 30
        },
        {
          x: 480,
          y: 96,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 528,
          y: 96,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 144,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 144,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 26
        }
      ]
    },
    {
      family: "orbital-hex",
      name: "Orbital Array",
      setting: "Orbital outpost",
      shape: "Hex cluster",
      summary: "Three hexagonal decks with dish antennas, solar panels and spare landing geometry.",
      geometry: {
        polygons: [
          [
            [
              20,
              112
            ],
            [
              80,
              32
            ],
            [
              200,
              32
            ],
            [
              260,
              112
            ],
            [
              200,
              192
            ],
            [
              80,
              192
            ]
          ],
          [
            [
              312,
              112
            ],
            [
              372,
              32
            ],
            [
              492,
              32
            ],
            [
              552,
              112
            ],
            [
              492,
              192
            ],
            [
              372,
              192
            ]
          ],
          [
            [
              166,
              300
            ],
            [
              226,
              220
            ],
            [
              346,
              220
            ],
            [
              406,
              300
            ],
            [
              346,
              380
            ],
            [
              226,
              380
            ]
          ]
        ],
        holes: [],
        depth: 26
      },
      props: [
        {
          type: "dish",
          x: 107,
          y: 67,
          scale: 1.2
        },
        {
          type: "terminal",
          x: 203,
          y: 120,
          scale: 0.8
        },
        {
          type: "solar",
          x: 394,
          y: 72,
          scale: 1.05
        },
        {
          type: "solar",
          x: 453,
          y: 92,
          scale: 1
        },
        {
          type: "antenna",
          x: 491,
          y: 148,
          scale: 1
        },
        {
          type: "crate",
          x: 319,
          y: 237,
          scale: 0.65
        },
        {
          type: "dish",
          x: 234,
          y: 247,
          scale: 0.65
        },
        {
          type: "terminal",
          x: 347,
          y: 310,
          scale: 0.75
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 88,
          y: 143
        },
        {
          sprite: 2,
          x: 224,
          y: 82
        },
        {
          sprite: 4,
          x: 393,
          y: 154
        },
        {
          sprite: 6,
          x: 487,
          y: 75
        },
        {
          sprite: 1,
          x: 215,
          y: 326
        },
        {
          sprite: 7,
          x: 306,
          y: 353
        }
      ],
      paths: [
        {
          points: [
            [
              72,
              128
            ],
            [
              146,
              128
            ],
            [
              146,
              157
            ],
            [
              203,
              157
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              353,
              128
            ],
            [
              419,
              128
            ],
            [
              419,
              162
            ],
            [
              494,
              162
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              215,
              323
            ],
            [
              281,
              323
            ],
            [
              281,
              351
            ],
            [
              348,
              351
            ]
          ],
          width: 10
        }
      ],
      patches: [
        {
          x: 59,
          y: 74,
          w: 105,
          h: 50,
          pattern: "grid"
        },
        {
          x: 360,
          y: 55,
          w: 137,
          h: 56,
          pattern: "dense"
        },
        {
          x: 220,
          y: 275,
          w: 120,
          h: 56,
          pattern: "grid"
        }
      ],
      signals: [
        {
          x: 120,
          y: 146,
          kind: "node"
        },
        {
          x: 455,
          y: 155,
          kind: "node"
        },
        {
          x: 279,
          y: 367,
          kind: "currency"
        }
      ],
      id: "06-orbital-hex-complete",
      variant: "complete",
      missingChunks: []
    },
    {
      family: "orbital-hex",
      name: "Orbital Array / Loading",
      setting: "Orbital outpost",
      shape: "Hex cluster",
      summary: "Three hexagonal decks with dish antennas, solar panels and spare landing geometry. An unfinished outer section reveals missing, wireframe and suspended grid chunks.",
      geometry: {
        polygons: [
          [
            [
              20,
              112
            ],
            [
              80,
              32
            ],
            [
              200,
              32
            ],
            [
              260,
              112
            ],
            [
              200,
              192
            ],
            [
              80,
              192
            ]
          ],
          [
            [
              312,
              112
            ],
            [
              372,
              32
            ],
            [
              492,
              32
            ],
            [
              552,
              112
            ],
            [
              492,
              192
            ],
            [
              372,
              192
            ]
          ],
          [
            [
              166,
              300
            ],
            [
              226,
              220
            ],
            [
              346,
              220
            ],
            [
              406,
              300
            ],
            [
              346,
              380
            ],
            [
              226,
              380
            ]
          ]
        ],
        holes: [],
        depth: 26
      },
      props: [
        {
          type: "dish",
          x: 107,
          y: 67,
          scale: 1.2
        },
        {
          type: "terminal",
          x: 203,
          y: 120,
          scale: 0.8
        },
        {
          type: "solar",
          x: 394,
          y: 72,
          scale: 1.05
        },
        {
          type: "antenna",
          x: 491,
          y: 148,
          scale: 1
        },
        {
          type: "crate",
          x: 319,
          y: 237,
          scale: 0.65
        },
        {
          type: "dish",
          x: 234,
          y: 247,
          scale: 0.65
        },
        {
          type: "terminal",
          x: 347,
          y: 310,
          scale: 0.75
        }
      ],
      actors: [
        {
          sprite: 0,
          x: 88,
          y: 143
        },
        {
          sprite: 2,
          x: 224,
          y: 82
        },
        {
          sprite: 4,
          x: 393,
          y: 154
        },
        {
          sprite: 1,
          x: 215,
          y: 326
        },
        {
          sprite: 7,
          x: 306,
          y: 353
        }
      ],
      paths: [
        {
          points: [
            [
              72,
              128
            ],
            [
              146,
              128
            ],
            [
              146,
              157
            ],
            [
              203,
              157
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              353,
              128
            ],
            [
              419,
              128
            ],
            [
              419,
              162
            ],
            [
              494,
              162
            ]
          ],
          width: 10
        },
        {
          points: [
            [
              215,
              323
            ],
            [
              281,
              323
            ],
            [
              281,
              351
            ],
            [
              348,
              351
            ]
          ],
          width: 10
        }
      ],
      patches: [
        {
          x: 59,
          y: 74,
          w: 105,
          h: 50,
          pattern: "grid"
        },
        {
          x: 360,
          y: 55,
          w: 137,
          h: 56,
          pattern: "dense"
        },
        {
          x: 220,
          y: 275,
          w: 120,
          h: 56,
          pattern: "grid"
        }
      ],
      signals: [
        {
          x: 120,
          y: 146,
          kind: "node"
        },
        {
          x: 455,
          y: 155,
          kind: "node"
        },
        {
          x: 279,
          y: 367,
          kind: "currency"
        }
      ],
      id: "06-orbital-hex-loading",
      variant: "loading",
      missingChunks: [
        {
          x: 384,
          y: 0,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 432,
          y: 0,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 0,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 34
        },
        {
          x: 432,
          y: 48,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 480,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 528,
          y: 48,
          w: 48,
          h: 48,
          stage: "void",
          lift: 0
        },
        {
          x: 480,
          y: 96,
          w: 48,
          h: 48,
          stage: "wireframe",
          lift: 0
        },
        {
          x: 528,
          y: 96,
          w: 48,
          h: 48,
          stage: "floating",
          lift: 25
        }
      ]
    }
  ]
};

// node_modules/@rarefriends/friendsdk/dist/friend-world.js
var CANVAS = Object.freeze({ width: 1600, height: 1200 });
var PALETTE = Object.freeze({ white: "#FFFFFF", black: "#000000", accent: "#CCFF00" });
var GAME_PALETTE = Object.freeze({
  meadow: "#B9D984",
  pond: "#7DB4DB",
  sun: "#F2CE68",
  coral: "#ED927E",
  lilac: "#B3A0D8"
});
var PROJECTION = Object.freeze({ a: 0.8660254038, b: 0.28, scale: 1.5, width: 576, height: 384, cx: 800, cy: 690 });
var PROP_CANVAS = Object.freeze({ width: 240, height: 240, anchorX: 120, anchorY: 180 });
var PROP_TYPES = Object.freeze([
  "tree",
  "flower",
  "bench",
  "planter",
  "terminal",
  "crate",
  "pipe",
  "tank",
  "crystal",
  "rock",
  "vent",
  "antenna",
  "solar",
  "dish",
  "buoy",
  "reeds",
  "bridge",
  "circuit"
]);
var trustedWorlds = /* @__PURE__ */ new WeakSet();
var boundaryCache = /* @__PURE__ */ new WeakMap();
function finite(value, label, min = -1e6, max = 1e6) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new TypeError(`${label} must be a finite number.`);
  if (value < min || value > max)
    throw new RangeError(`${label} must be between ${min} and ${max}.`);
}
function record(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new TypeError(`${label} must be an object.`);
  return value;
}
function text(value, label, max = 500) {
  if (typeof value !== "string" || !value.trim() || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) {
    throw new TypeError(`${label} must be nonempty text of at most ${max} characters.`);
  }
  return value;
}
function array(value, label, max = 128) {
  if (value === void 0)
    return [];
  if (!Array.isArray(value) || value.length > max)
    throw new TypeError(`${label} must be an array with at most ${max} entries.`);
  return value;
}
function choice(value, choices, label) {
  if (typeof value !== "string" || !choices.includes(value))
    throw new TypeError(`Unsupported ${label}: ${String(value)}.`);
  return value;
}
function point(value, label, bounded = true) {
  if (!Array.isArray(value) || value.length !== 2)
    throw new TypeError(`${label} must be [x, y].`);
  finite(value[0], `${label}.x`, bounded ? 0 : -1e6, bounded ? PROJECTION.width : 1e6);
  finite(value[1], `${label}.y`, bounded ? 0 : -1e6, bounded ? PROJECTION.height : 1e6);
  return [value[0], value[1]];
}
function anchor(value, label) {
  const item = record(value, label);
  const [x, y] = point([item.x, item.y], label);
  return { x, y };
}
function rectangle(value, label, relative = false) {
  const item = record(value, label);
  finite(item.x, `${label}.x`, relative ? -576 : 0, 576);
  finite(item.y, `${label}.y`, relative ? -384 : 0, 384);
  finite(item.w, `${label}.w`, 1e-3, 576);
  finite(item.h, `${label}.h`, 1e-3, 384);
  if (!relative && (item.x + item.w > 576 || item.y + item.h > 384))
    throw new RangeError(`${label} extends beyond the world coordinate grid.`);
  return { x: item.x, y: item.y, w: item.w, h: item.h };
}
function deepFreeze(value) {
  if (value && typeof value === "object") {
    for (const child of Object.values(value))
      deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}
function polygonPoints(value, label) {
  const points = array(value, label).map((entry, index) => point(entry, `${label}[${index}]`));
  if (points.length < 3)
    throw new TypeError(`${label} needs at least three vertices.`);
  let twiceArea = 0;
  for (let index = 0; index < points.length; index++) {
    const a = points[index], b = points[(index + 1) % points.length];
    if (a[0] === b[0] && a[1] === b[1])
      throw new TypeError(`${label} contains a zero-length edge.`);
    twiceArea += a[0] * b[1] - b[0] * a[1];
  }
  if (Math.abs(twiceArea) < 1e-3)
    throw new TypeError(`${label} must enclose an area.`);
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const onSegment = (a, b, p) => Math.abs(cross(a, b, p)) < 1e-8 && p[0] >= Math.min(a[0], b[0]) && p[0] <= Math.max(a[0], b[0]) && p[1] >= Math.min(a[1], b[1]) && p[1] <= Math.max(a[1], b[1]);
  for (let i = 0; i < points.length; i++)
    for (let j = i + 1; j < points.length; j++) {
      if (j === i + 1 || i === 0 && j === points.length - 1)
        continue;
      const a = points[i], b = points[(i + 1) % points.length], c = points[j], d = points[(j + 1) % points.length];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0 || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)) {
        throw new TypeError(`${label} must be a simple polygon without crossing edges.`);
      }
    }
  return points;
}
function validateWorld(value) {
  if (value && typeof value === "object" && trustedWorlds.has(value))
    return value;
  const source = record(value, "world"), geometry = record(source.geometry, "geometry");
  const polygons = array(geometry.polygons, "geometry.polygons", 16).map((entry, index) => polygonPoints(entry, `polygons[${index}]`));
  if (!polygons.length)
    throw new TypeError("World geometry needs a polygon.");
  const holes = array(geometry.holes, "geometry.holes", 16).map((entry, index) => polygonPoints(entry, `holes[${index}]`));
  if ([...polygons, ...holes].reduce((sum, loop) => sum + loop.length, 0) > 512)
    throw new RangeError("World geometry supports at most 512 vertices.");
  const depth = geometry.depth ?? 18;
  finite(depth, "geometry.depth", 1, 100);
  const props = array(source.props, "props").map((entry, index) => {
    const item = record(entry, `props[${index}]`);
    const type = choice(item.type, PROP_TYPES, "prop type");
    const scale = item.scale ?? 1;
    finite(scale, "prop.scale", 0.1, 4);
    return {
      ...anchor(item, `props[${index}]`),
      type,
      scale,
      ...item.footprint === void 0 ? {} : { footprint: item.footprint === null ? null : rectangle(item.footprint, "prop.footprint", true) }
    };
  });
  const actors = array(source.actors, "actors").map((entry, index) => {
    const item = record(entry, `actors[${index}]`);
    if (item.sprite !== void 0) {
      finite(item.sprite, "actor.sprite", 0, 255);
      if (!Number.isInteger(item.sprite))
        throw new TypeError("actor.sprite must be an integer index.");
    }
    return { ...anchor(item, `actors[${index}]`), ...item.sprite === void 0 ? {} : { sprite: item.sprite } };
  });
  const signals = array(source.signals, "signals").map((entry, index) => {
    const item = record(entry, `signals[${index}]`);
    return { ...anchor(item, `signals[${index}]`), kind: choice(item.kind, ["currency", "node"], "signal kind") };
  });
  const paths = array(source.paths, "paths", 64).map((entry, index) => {
    const item = record(entry, `paths[${index}]`);
    const points = array(item.points, "path.points").map((entry2, index2) => point(entry2, `path.points[${index2}]`));
    if (points.length < 2)
      throw new TypeError("A path needs at least two points.");
    const width = item.width ?? 20;
    finite(width, "path.width", 1, 96);
    return { points, width };
  });
  const patches = array(source.patches, "patches").map((entry, index) => {
    const item = record(entry, `patches[${index}]`);
    return { ...rectangle(item, `patches[${index}]`), pattern: choice(item.pattern, ["dither", "dense", "grid", "hatch", "water"], "patch pattern") };
  });
  const missingChunks = array(source.missingChunks, "missingChunks", 64).map((entry, index) => {
    const item = record(entry, `missingChunks[${index}]`), rect2 = rectangle(item, `missingChunks[${index}]`);
    if (rect2.w !== 48 || rect2.h !== 48 || rect2.x % 48 !== 0 || rect2.y % 48 !== 0)
      throw new RangeError("Missing chunks must use the 48 \xD7 48 world grid.");
    const stage = choice(item.stage, ["void", "wireframe", "floating"], "chunk stage"), lift = item.lift ?? (stage === "floating" ? 24 : 0);
    finite(lift, "chunk.lift", stage === "floating" ? 1 : 0, stage === "floating" ? 160 : 0);
    return { ...rect2, stage, lift };
  });
  const collision = source.collision === void 0 ? void 0 : record(source.collision, "collision");
  const world = {
    id: text(source.id, "world.id", 100),
    name: text(source.name, "world.name", 120),
    family: text(source.family, "world.family", 100),
    setting: text(source.setting, "world.setting", 120),
    shape: text(source.shape, "world.shape", 120),
    summary: text(source.summary, "world.summary"),
    variant: choice(source.variant, ["complete", "loading"], "world variant"),
    geometry: { polygons, holes, depth },
    props,
    actors,
    signals,
    paths,
    patches,
    missingChunks,
    ...collision ? { collision: { blocked: array(collision.blocked, "collision.blocked").map((entry, index) => rectangle(entry, `collision.blocked[${index}]`)) } } : {}
  };
  if (world.variant === "complete" && missingChunks.length)
    throw new TypeError("A complete world cannot contain missing chunks.");
  if (world.variant === "loading" && !missingChunks.length)
    throw new TypeError("A loading world needs missing chunks.");
  for (const item of [...props, ...actors, ...signals]) {
    if (!containsLoaded(world, [item.x, item.y]))
      throw new RangeError(`World anchor (${item.x}, ${item.y}) is outside loaded ground.`);
  }
  deepFreeze(world);
  trustedWorlds.add(world);
  return world;
}
var n = (value) => Math.round(value * 1e3) / 1e3;
function project(x, y, lift = 0) {
  finite(x, "x");
  finite(y, "y");
  finite(lift, "lift");
  const { a, b, scale, width, height, cx, cy } = PROJECTION;
  return [n(cx + scale * a * (x - y - (width - height) / 2)), n(cy + scale * b * (x + y - (width + height) / 2) - lift)];
}
var rectPoly = ({ x, y, w, h }) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
function inPolygon([x, y], points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}
function containsLoaded(world, point2) {
  return world.geometry.polygons.some((p) => inPolygon(point2, p)) && !(world.geometry.holes || []).some((p) => inPolygon(point2, p)) && !(world.missingChunks || []).some((r) => inPolygon(point2, rectPoly(r)));
}
function materialBoundary(world) {
  const loops = [...world.geometry.polygons, ...world.geometry.holes || [], ...(world.missingChunks || []).map(rectPoly)];
  const edges = loops.flatMap((p) => p.map((a, i) => [a, p[(i + 1) % p.length]]));
  const cross = (a, b) => a[0] * b[1] - a[1] * b[0], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const result = [], seen = /* @__PURE__ */ new Set();
  for (const [a, b] of edges) {
    const v = sub(b, a), vv = v[0] * v[0] + v[1] * v[1], ts = [0, 1];
    if (vv < 1e-8)
      continue;
    for (const [c, d] of edges) {
      const w = sub(d, c), ca = sub(c, a), den = cross(v, w);
      if (Math.abs(den) > 1e-8) {
        const t = cross(ca, w) / den, u = cross(ca, v) / den;
        if (t > 1e-7 && t < 1 - 1e-7 && u >= -1e-7 && u <= 1 + 1e-7)
          ts.push(t);
      } else if (Math.abs(cross(ca, v)) < 1e-7) {
        for (const q of [c, d]) {
          const t = ((q[0] - a[0]) * v[0] + (q[1] - a[1]) * v[1]) / vv;
          if (t > 1e-7 && t < 1 - 1e-7)
            ts.push(t);
        }
      }
    }
    ts.sort((x, y) => x - y);
    for (let i = 1; i < ts.length; i++) {
      if (ts[i] - ts[i - 1] < 1e-7)
        continue;
      let p = [a[0] + v[0] * ts[i - 1], a[1] + v[1] * ts[i - 1]], q = [a[0] + v[0] * ts[i], a[1] + v[1] * ts[i]];
      const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], e = 0.04 / Math.sqrt(vv), normal = [-v[1] * e, v[0] * e];
      const left = containsLoaded(world, [m[0] + normal[0], m[1] + normal[1]]), right = containsLoaded(world, [m[0] - normal[0], m[1] - normal[1]]);
      if (left === right)
        continue;
      if (!left)
        [p, q] = [q, p];
      const key = [p, q].map((k) => k.map(n).join(",")).sort().join("|");
      if (!seen.has(key)) {
        seen.add(key);
        result.push([p, q]);
      }
    }
  }
  return result;
}
var PROP_COLORS = Object.freeze({
  tree: "meadow",
  flower: "coral",
  bench: "sun",
  planter: "coral",
  terminal: "lilac",
  crate: "sun",
  pipe: "pond",
  tank: "pond",
  crystal: "lilac",
  rock: "lilac",
  vent: "coral",
  antenna: "lilac",
  solar: "pond",
  dish: "lilac",
  buoy: "coral",
  reeds: "sun",
  bridge: "sun",
  circuit: "lilac"
});
function unproject(screenX, screenY, lift = 0) {
  finite(screenX, "screenX");
  finite(screenY, "screenY");
  finite(lift, "lift");
  const difference = (screenX - PROJECTION.cx) / (PROJECTION.scale * PROJECTION.a) + (PROJECTION.width - PROJECTION.height) / 2;
  const sum = (screenY + lift - PROJECTION.cy) / (PROJECTION.scale * PROJECTION.b) + (PROJECTION.width + PROJECTION.height) / 2;
  return [(sum + difference) / 2, (sum - difference) / 2];
}
var PROP_FOOTPRINTS = deepFreeze({
  tree: { w: 12, h: 12 },
  flower: null,
  bench: { w: 58, h: 18 },
  planter: { w: 44, h: 30 },
  terminal: { w: 28, h: 26 },
  crate: { w: 31, h: 31 },
  pipe: { w: 60, h: 26 },
  tank: { w: 52, h: 40 },
  crystal: { w: 60, h: 26 },
  rock: { w: 50, h: 32 },
  vent: { w: 47, h: 37 },
  antenna: { w: 30, h: 27 },
  solar: { w: 76, h: 36 },
  dish: { w: 40, h: 33 },
  buoy: { w: 30, h: 20 },
  reeds: null,
  bridge: null,
  circuit: null
});
function boundaryOf(world) {
  let boundary = boundaryCache.get(world);
  if (!boundary) {
    boundary = materialBoundary(world);
    boundaryCache.set(world, boundary);
  }
  return boundary;
}
function distanceToSegment([x, y], a, b) {
  const dx2 = b[0] - a[0], dy2 = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx2 + (y - a[1]) * dy2) / (dx2 * dx2 + dy2 * dy2)));
  return Math.hypot(x - a[0] - t * dx2, y - a[1] - t * dy2);
}
function circleIntersectsRect([x, y], radius, rect2) {
  const nearX = Math.max(rect2.x, Math.min(rect2.x + rect2.w, x));
  const nearY = Math.max(rect2.y, Math.min(rect2.y + rect2.h, y));
  return Math.hypot(x - nearX, y - nearY) <= radius;
}
function isWorldWalkable(world, location, radius = 0) {
  const config = validateWorld(world), position = point(location, "location", false);
  finite(radius, "radius", 0, 48);
  if (!containsLoaded(config, position))
    return false;
  if (radius && boundaryOf(config).some(([a, b]) => distanceToSegment(position, a, b) < radius))
    return false;
  const blocked = [...config.collision?.blocked ?? [], ...config.patches.filter((patch) => patch.pattern === "water")];
  for (const prop of config.props) {
    const size = PROP_FOOTPRINTS[prop.type];
    const scale = prop.scale ?? 1;
    const relative = prop.footprint === void 0 ? size && {
      x: -size.w * 1.4 / PROJECTION.scale / 2,
      y: -size.h * 1.4 / PROJECTION.scale / 2,
      w: size.w * 1.4 / PROJECTION.scale,
      h: size.h * 1.4 / PROJECTION.scale
    } : prop.footprint;
    if (relative)
      blocked.push({ x: prop.x + relative.x * scale, y: prop.y + relative.y * scale, w: relative.w * scale, h: relative.h * scale });
  }
  return !blocked.some((rect2) => circleIntersectsRect(position, radius, rect2));
}
function sortWorldItems(items) {
  for (const item of items) {
    finite(item.x, "item.x");
    finite(item.y, "item.y");
  }
  return [...items].sort((a, b) => a.x + a.y - (b.x + b.y));
}
var WORLD_PRESETS = Object.freeze(friend_worlds_default.worlds.map(validateWorld));
function getWorldPreset(id) {
  const world = WORLD_PRESETS.find((candidate) => candidate.id === id);
  if (!world)
    throw new RangeError(`Unknown world preset: ${id}.`);
  return world;
}

// node_modules/@rarefriends/friendsdk/dist/friend-navigation.js
function createWorldNavigator(world, radius = 7, spacing = 8) {
  if (!Number.isFinite(radius) || radius < 0 || !Number.isFinite(spacing) || spacing < 2 || spacing > 32) {
    throw new RangeError("Navigation needs a nonnegative radius and a grid spacing from 2 to 32.");
  }
  const columns = Math.floor(576 / spacing) + 1;
  const rows = Math.floor(384 / spacing) + 1;
  const count = columns * rows;
  const valid = new Uint8Array(count);
  const location = (index) => [index % columns * spacing, Math.floor(index / columns) * spacing];
  const finite2 = (point2) => point2.every(Number.isFinite);
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (let index = 0; index < count; index++)
    valid[index] = Number(isWorldWalkable(world, location(index), radius));
  function segmentClear(from, to) {
    if (!finite2(from) || !finite2(to))
      return false;
    const length = distance(from, to);
    if (length > 1200)
      return false;
    const steps = Math.max(1, Math.ceil(length / 2));
    for (let index = 0; index <= steps; index++) {
      const t = index / steps;
      if (!isWorldWalkable(world, [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t], radius))
        return false;
    }
    return true;
  }
  function nearby(point2) {
    const centerX = Math.round(point2[0] / spacing), centerY = Math.round(point2[1] / spacing);
    const result = [];
    for (let dy2 = -2; dy2 <= 2; dy2++)
      for (let dx2 = -2; dx2 <= 2; dx2++) {
        const x = centerX + dx2, y = centerY + dy2;
        if (x < 0 || y < 0 || x >= columns || y >= rows)
          continue;
        const index = y * columns + x;
        if (valid[index] && segmentClear(point2, location(index)))
          result.push(index);
      }
    return result;
  }
  function route(from, to) {
    if (!finite2(from) || !finite2(to) || !isWorldWalkable(world, from, radius) || !isWorldWalkable(world, to, radius))
      return null;
    if (segmentClear(from, to))
      return [[to[0], to[1]]];
    const starts = nearby(from), ends = new Set(nearby(to));
    if (!starts.length || !ends.size)
      return null;
    const parents = new Int32Array(count).fill(-1);
    const costs = new Float64Array(count).fill(Infinity);
    const closed = new Uint8Array(count);
    const open = new Set(starts);
    for (const index of starts)
      costs[index] = distance(from, location(index));
    let reached = -1;
    while (open.size) {
      let current = -1, best = Infinity;
      for (const candidate of open) {
        const score = costs[candidate] + distance(location(candidate), to);
        if (score < best) {
          current = candidate;
          best = score;
        }
      }
      if (current < 0)
        break;
      if (ends.has(current)) {
        reached = current;
        break;
      }
      open.delete(current);
      closed[current] = 1;
      const x = current % columns, y = Math.floor(current / columns);
      for (let dy2 = -1; dy2 <= 1; dy2++)
        for (let dx2 = -1; dx2 <= 1; dx2++) {
          if (!dx2 && !dy2 || x + dx2 < 0 || x + dx2 >= columns || y + dy2 < 0 || y + dy2 >= rows)
            continue;
          const neighbor = (y + dy2) * columns + x + dx2;
          if (!valid[neighbor] || closed[neighbor])
            continue;
          const nextCost = costs[current] + spacing * Math.hypot(dx2, dy2);
          if (nextCost >= costs[neighbor] || !segmentClear(location(current), location(neighbor)))
            continue;
          costs[neighbor] = nextCost;
          parents[neighbor] = current;
          open.add(neighbor);
        }
    }
    if (reached < 0)
      return null;
    const path = [[to[0], to[1]]];
    for (let index = reached; index !== -1; index = parents[index])
      path.unshift(location(index));
    const simplified = [];
    let anchor2 = from;
    for (let index = 0; index < path.length; ) {
      let last = path.length - 1;
      while (last > index && !segmentClear(anchor2, path[last]))
        last--;
      simplified.push(path[last]);
      anchor2 = path[last];
      index = last + 1;
    }
    return simplified;
  }
  return { route, segmentClear };
}

// node_modules/@rarefriends/friendsdk/dist/movement.js
var directions = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right"
};
var vectors = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function createWorldMovement(world, spawn, options = {}) {
  const speed = options.speed ?? 170, radius = options.radius ?? 7;
  if (!Number.isFinite(speed) || speed <= 0)
    throw new RangeError("Movement speed must be positive.");
  const navigation = createWorldNavigator(world, radius);
  if (!isWorldWalkable(world, spawn, radius))
    throw new RangeError("Spawn must be walkable.");
  let position = [...spawn], facing = "down", walking = false;
  let route = [];
  const held = /* @__PURE__ */ new Map();
  const state = () => ({
    position: [...position],
    facing,
    walking,
    destination: route.length ? [...route[route.length - 1]] : null
  });
  const stop = () => {
    held.clear();
    route = [];
    walking = false;
  };
  return {
    get state() {
      return state();
    },
    /** Returns whether a key is handled. Clear held keys with stop() on blur/pause. */
    setKey(key, pressed) {
      const normalized = key.length === 1 ? key.toLowerCase() : key;
      const direction = directions[normalized];
      if (!direction)
        return false;
      if (pressed) {
        route = [];
        held.set(normalized, direction);
      } else
        held.delete(normalized);
      return true;
    },
    moveTo(point2) {
      const path = navigation.route(position, point2);
      if (!path)
        return false;
      stop();
      route = path;
      return true;
    },
    stop,
    reset() {
      stop();
      position = [...spawn];
      facing = "down";
    },
    /** Delta is milliseconds; a suspended tab advances by at most 40 ms. */
    update(deltaMs) {
      if (!Number.isFinite(deltaMs) || deltaMs < 0)
        throw new RangeError("Frame delta must be nonnegative.");
      walking = false;
      const [sx, sy] = project(...position);
      let dx2 = 0, dy2 = 0, step2 = Math.min(40, deltaMs) * speed / 1e3;
      const inputs = [...new Set(held.values())];
      if (inputs.length) {
        for (const direction of inputs) {
          dx2 += vectors[direction][0];
          dy2 += vectors[direction][1];
        }
        const magnitude = Math.hypot(dx2, dy2);
        if (magnitude) {
          dx2 /= magnitude;
          dy2 /= magnitude;
          facing = [...inputs].reverse().find((direction) => vectors[direction][0] * dx2 + vectors[direction][1] * dy2 > 0);
        }
      } else if (route.length) {
        while (route.length && Math.hypot(route[0][0] - position[0], route[0][1] - position[1]) < 1e-3)
          position = route.shift();
        if (route.length) {
          const [tx, ty] = project(...route[0]);
          const distance = Math.hypot(tx - sx, ty - sy);
          dx2 = (tx - sx) / distance;
          dy2 = (ty - sy) / distance;
          step2 = Math.min(step2, distance);
          facing = Math.abs(dx2) > Math.abs(dy2) ? dx2 < 0 ? "left" : "right" : dy2 < 0 ? "up" : "down";
        }
      }
      if (step2 > 0 && (dx2 || dy2)) {
        const next = unproject(sx + dx2 * step2, sy + dy2 * step2);
        if (navigation.segmentClear(position, next)) {
          position = next;
          walking = true;
        } else if (route.length)
          stop();
        else if (dx2 && dy2) {
          const slide = [unproject(sx + dx2 * step2, sy), unproject(sx, sy + dy2 * step2)].find((point2) => navigation.segmentClear(position, point2));
          if (slide) {
            position = slide;
            walking = true;
          }
        }
        if (route.length && Math.hypot(route[0][0] - position[0], route[0][1] - position[1]) < 1e-3) {
          position = route.shift();
        }
      }
      return state();
    }
  };
}

// games/friends-vs-frenemies/lib/world-scene.ts
var WORLD_W = 576;
var WORLD_H = 384;
var VIEW = { x: 320, y: 330, width: 960, height: 640 };
function updateCamera(fx, fy, wide = false) {
  const [cx, cy] = project(fx, fy, 0);
  const tx = Math.min(1600 - VIEW.width, Math.max(0, Math.round(cx - VIEW.width / 2)));
  const ty = Math.min(1200 - VIEW.height, Math.max(0, Math.round(cy - VIEW.height / 2)));
  const dx2 = tx - VIEW.x, dy2 = ty - VIEW.y;
  if (Math.hypot(dx2, dy2) < (wide ? 52 : 40)) return;
  const k = wide ? 0.14 : 0.1;
  VIEW.x = Math.round(VIEW.x + dx2 * k);
  VIEW.y = Math.round(VIEW.y + dy2 * k);
  void wide;
}
var PRESET_ID = "01-garden-oval-complete";
var HOME = [288, 214];
function labelRegions(world) {
  const step2 = 12;
  const cols = Math.floor(WORLD_W / step2), rows = Math.floor(WORLD_H / step2);
  const open = [];
  for (let gy = 0; gy < rows; gy++) {
    open.push([]);
    for (let gx = 0; gx < cols; gx++) {
      open[gy].push(isWorldWalkable(world, [gx * step2 + 6, gy * step2 + 6], 9));
    }
  }
  const cell = new Int16Array(cols * rows).fill(-1);
  const seen = open.map((r) => r.map(() => false));
  let nextId = 0;
  let best = { n: 0, cx: HOME[0], cy: HOME[1], id: -1 };
  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!open[gy][gx] || seen[gy][gx]) continue;
      const id = nextId++;
      let sx = 0, sy = 0, n2 = 0;
      const stack = [[gx, gy]];
      seen[gy][gx] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        cell[cy * cols + cx] = id;
        sx += cx;
        sy += cy;
        n2++;
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && open[ny][nx] && !seen[ny][nx]) {
            seen[ny][nx] = true;
            stack.push([nx, ny]);
          }
        }
      }
      if (n2 > best.n) best = { n: n2, cx: Math.round(sx / n2 * step2), cy: Math.round(sy / n2 * step2), id };
    }
  }
  return { grid: { cell, cols, rows, homeId: best.id }, home: [best.cx, best.cy] };
}
function regionAt(regions, x, y) {
  const gx = Math.floor(x / 12), gy = Math.floor(y / 12);
  if (gx < 0 || gy < 0 || gx >= regions.cols || gy >= regions.rows) return -1;
  return regions.cell[gy * regions.cols + gx];
}
function findAnchor(world, gx, gy, clearance = 26) {
  if (isWorldWalkable(world, [gx, gy], 10) && clearanceOk(world, gx, gy, clearance)) return [gx, gy];
  for (let r = 12; r < 160; r += 8) {
    for (let a = 0; a < 12; a++) {
      const x = gx + Math.cos(a / 12 * Math.PI * 2) * r;
      const y = gy + Math.sin(a / 12 * Math.PI * 2) * r;
      if (x < 20 || y < 20 || x > WORLD_W - 20 || y > WORLD_H - 20) continue;
      if (isWorldWalkable(world, [x, y], 10) && clearanceOk(world, x, y, clearance)) return [Math.round(x), Math.round(y)];
    }
  }
  return [gx, gy];
}
function clearanceOk(world, x, y, clearance) {
  for (const p of world.props) {
    if (Math.hypot(p.x - x, p.y - y) < clearance) return false;
  }
  return true;
}
function findEntrances(world, navigator, home, count = 6) {
  const cx = WORLD_W / 2, cy = WORLD_H / 2;
  const cands = [];
  for (let x = 24; x < WORLD_W; x += 24) {
    for (let y = 24; y < WORLD_H; y += 24) {
      if (!isWorldWalkable(world, [x, y], 12)) continue;
      const d = Math.hypot(x - cx, y - cy);
      if (d < 120) continue;
      cands.push({ x, y, ang: Math.atan2(y - cy, x - cx), d });
    }
  }
  cands.sort((a, b) => b.d - a.d);
  const spread = [];
  for (const c of cands) {
    if (spread.length >= count * 4) break;
    if (spread.every((p) => Math.abs(angDiff(p.ang, c.ang)) > 0.5)) spread.push(c);
  }
  const picked = [];
  for (const c of spread) {
    if (picked.length >= count) break;
    if (navigator.route([c.x, c.y], home) === null) continue;
    picked.push(c);
  }
  if (picked.length === 0) return [home];
  return picked.map((p) => [p.x, p.y]);
}
function angDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
var sceneCache = /* @__PURE__ */ new Map();
function sceneKey(levels, presetId, mapIdx) {
  return `${presetId}|${mapIdx}|t${levels.turret}h${levels.healer}c${levels.collector}f${levels.frost ?? 0}`;
}
function cachedScene(levels, presetId, mapIdx) {
  return sceneCache.get(sceneKey(levels, presetId, mapIdx)) ?? null;
}
function prebuildScene(levels, presetId, mapIdx) {
  const key = sceneKey(levels, presetId, mapIdx);
  const hit = sceneCache.get(key);
  if (hit) return hit;
  const scene = buildScene(levels, presetId, mapIdx);
  return scene;
}
function buildScene(levels, presetId = PRESET_ID, mapIdx = 0) {
  const key = sceneKey(levels, presetId, mapIdx);
  const hit = sceneCache.get(key);
  if (hit) return hit;
  const base = getWorldPreset(presetId);
  let baseGeometry = base.geometry;
  let baseBlocked = [...base.collision?.blocked ?? []];
  if (presetId.includes("tidal")) {
    const bridgeA = [[240, 148], [350, 140], [350, 172], [240, 180]];
    const bridgeB = [[180, 200], [250, 200], [250, 260], [180, 260]];
    baseGeometry = {
      ...base.geometry,
      polygons: [...base.geometry.polygons, bridgeA, bridgeB]
    };
  }
  const world = validateWorld({
    ...base,
    geometry: baseGeometry,
    props: [...base.props],
    actors: [],
    collision: { blocked: [...baseBlocked] }
  });
  const turret = findAnchor(world, 448, 306);
  const healer = findAnchor(world, 132, 300);
  const collector = findAnchor(world, 250, 104);
  const frost = findAnchor(world, 360, 120);
  const structBlocked = [];
  if (levels.turret > 0) structBlocked.push(rect(turret, 40, 30));
  if (levels.healer > 0) structBlocked.push(rect(healer, 40, 30));
  if (levels.collector > 0) structBlocked.push(rect(collector, 34, 26));
  if ((levels.frost ?? 0) > 0) structBlocked.push(rect(frost, 34, 26));
  const pass1 = validateWorld({ ...world, props: [...world.props], actors: [], collision: { blocked: [...baseBlocked, ...structBlocked] } });
  const labeled1 = labelRegions(pass1);
  const home1 = labeled1.home;
  const homeId1 = labeled1.grid.homeId;
  let homecore = [...home1];
  let placed = false;
  for (const clearance of [26, 18, 12]) {
    if (placed) break;
    for (let r = 40; r <= 150 && !placed; r += 10) {
      for (let k = 0; k < 12 && !placed; k++) {
        const a = ((4 + (k % 2 === 0 ? k / 2 : -(k + 1) / 2)) % 12 + 12) % 12;
        const ang = a / 12 * Math.PI * 2;
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
  const myBlocked = [...baseBlocked, ...structBlocked];
  myBlocked.push(rect(homecore, 36, 26));
  const finalWorld = validateWorld({ ...world, props: [...world.props], actors: [], collision: { blocked: myBlocked } });
  const navigator = createWorldNavigator(finalWorld, 9, 8);
  const labeled = labelRegions(finalWorld);
  let home = [...labeled1.home];
  if (!isWorldWalkable(finalWorld, home, 9)) {
    home = [...HOME];
    for (let r = 8; r < 200; r += 8) {
      let done = false;
      for (let a = 0; a < 16; a++) {
        const x = home[0] + Math.cos(a / 16 * Math.PI * 2) * r;
        const y = home[1] + Math.sin(a / 16 * Math.PI * 2) * r;
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
  const gates = entrances.filter((g) => isValidSpawn(finalWorld, navigator, g, home));
  const vents = mapVents(finalWorld, mapIdx);
  const mud = mapMud(finalWorld, mapIdx);
  const scene = {
    presetId,
    mapIdx,
    world: finalWorld,
    home,
    anchors: { turret, healer, collector, trader, frost, homecore },
    entrances,
    gates: gates.length > 0 ? gates : [home],
    vents,
    mud,
    navigator,
    regions: labeled.grid
  };
  if (sceneCache.size > 24) sceneCache.clear();
  sceneCache.set(key, scene);
  return scene;
}
function isValidSpawn(world, navigator, [x, y], home) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
  if (x < 16 || y < 16 || x > WORLD_W - 16 || y > WORLD_H - 16) return false;
  if (!isWorldWalkable(world, [x, y], 12)) return false;
  for (const b of world.collision?.blocked ?? []) {
    if (x > b.x - 14 && x < b.x + b.w + 14 && y > b.y - 14 && y < b.y + b.h + 14) return false;
  }
  const route = navigator.route([x, y], home);
  return route !== null && route.length > 0;
}
function mapVents(world, mapIdx) {
  if (mapIdx < 2) return [];
  const guesses = [[180, 190], [400, 200], [290, 290]];
  return guesses.map((g) => findAnchor(world, g[0], g[1], 20));
}
function mapMud(world, mapIdx) {
  if (mapIdx !== 3) return [];
  const guesses = [[150, 250], [420, 250], [290, 120]];
  return guesses.map((g) => {
    const [x, y] = findAnchor(world, g[0], g[1], 34);
    return { x, y, r: 34 };
  });
}
function rect([x, y], w, h) {
  return { x: x - w / 2, y: y - h / 2, w, h };
}
function randomWalkable(world, rng, cx = 288, cy = 200, radius = 150) {
  for (let i = 0; i < 24; i++) {
    const a = rng() * Math.PI * 2;
    const r = 40 + rng() * radius;
    const x = Math.min(WORLD_W - 24, Math.max(24, cx + Math.cos(a) * r));
    const y = Math.min(WORLD_H - 24, Math.max(24, cy + Math.sin(a) * r * 0.7));
    if (isWorldWalkable(world, [x, y], 9)) return [x, y];
  }
  return [cx, cy];
}
function screenToWorld(rect2, clientX, clientY) {
  if (!(rect2.width > 0 && rect2.height > 0)) return null;
  const cx = (clientX - rect2.left) / rect2.width * 960;
  const cy = (clientY - rect2.top) / rect2.height * 640;
  const [wx, wy] = unproject(VIEW.x + cx, VIEW.y + cy);
  if (!Number.isFinite(wx) || !Number.isFinite(wy)) return null;
  return [wx, wy];
}

// games/friends-vs-frenemies/lib/engine.ts
var FRIEND_SPEED = 148;
var FRIEND_RANGE = 178;
var ENEMY_SPEED = {
  shadow: 38,
  swift: 68,
  tank: 24,
  ranged: 33,
  swarm: 56,
  boss: 27,
  charger: 44,
  split: 46,
  shield: 32,
  support: 38,
  summoner: 30,
  splitling: 70,
  bomber: 62,
  sniper: 36,
  orbiter: 70,
  blinker: 48,
  leaper: 46,
  mage: 34,
  burrower: 42,
  commander: 32,
  drainer: 40,
  saboteur: 54,
  thief: 74,
  artillery: 26,
  necromancer: 28,
  traplayer: 44,
  siege: 20,
  cryo: 38,
  corrupter: 46,
  elitehunter: 72,
  minibrute: 30,
  minimage: 30,
  minisiege: 24
};
var BLAST_RADIUS_W = 132;
var BARRICADE_RADIUS = 92;
var MAX_ENEMIES = 90;
function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function friendPos(run) {
  if (run.manual) return [run.mpos[0], run.mpos[1]];
  const p = run.mover.state.position;
  return [p[0], p[1]];
}
function friendFacing(run) {
  if (run.manual) return run.aimMode === "mouse" && run.aimSet ? run.aimFace : run.mfacing;
  return run.mover.state.facing;
}
function setAim(run, wx, wy) {
  const [fx, fy] = friendPos(run);
  run.aimWorld = [wx, wy];
  run.aimSet = true;
  const dx2 = wx - fx, dy2 = wy - fy;
  const sx = dx2 - dy2, sy = (dx2 + dy2) * 0.5;
  const mag = Math.hypot(sx, sy);
  if (mag < 4) return;
  let want;
  if (Math.abs(sx) > Math.abs(sy)) want = sx > 0 ? "right" : "left";
  else want = sy > 0 ? "down" : "up";
  if (want === run.aimFace) return;
  const along = want === "right" ? sx : want === "left" ? -sx : want === "down" ? sy : -sy;
  const across = want === "right" || want === "left" ? Math.abs(sy) : Math.abs(sx);
  if (along > across * 1.35) run.aimFace = want;
}
function continuousAimAngle(fx, fy, wx, wy) {
  return Math.atan2(wy - fy, wx - fx);
}
function aimVector(run) {
  const [fx, fy] = friendPos(run);
  const dx2 = run.aimWorld[0] - fx, dy2 = run.aimWorld[1] - fy;
  const dist = Math.hypot(dx2, dy2);
  if (dist < 1e-6) return { x: 1, y: 0, angle: 0, dist: 0 };
  return { x: dx2 / dist, y: dy2 / dist, angle: Math.atan2(dy2, dx2), dist };
}
function aimDebug(run) {
  const [fx, fy] = friendPos(run);
  const v = aimVector(run);
  return {
    player: [fx, fy],
    cursor: [...run.aimWorld],
    aimVec: { x: v.x, y: v.y },
    aimAngle: v.angle,
    projAngle: run.aimAngle,
    facing: run.aimFace
  };
}
function friendWalking(run) {
  return run.manual ? run.mwalking : run.mover.state.walking;
}
function moveSpeedOf(run) {
  let m = 1 + run.derived.moveSpeed + 0.08 * run.stacks.boots;
  if (run.hasteT > 0) m *= 1.25;
  m *= 1 + Math.min(0.06, run.momentum * 6e-3);
  return Math.max(0.7, m);
}
function pilotTo(run, dest) {
  const [fx, fy] = friendPos(run);
  const dx2 = dest[0] - fx, dy2 = dest[1] - fy;
  const d = Math.hypot(dx2, dy2);
  run.pathReqs++;
  if (d > 230) {
    const mid = [fx + dx2 / d * 200, fy + dy2 / d * 200];
    if (isWorldWalkable(run.scene.world, mid, 7)) return run.mover.moveTo(mid);
    return run.mover.moveTo(dest);
  }
  return run.mover.moveTo(dest);
}
function facingOf(vx, vy, fallback = "down") {
  const sx = vx - vy;
  const sy = (vx + vy) * 0.5;
  if (Math.abs(sx) < 0.01 && Math.abs(sy) < 0.01) return fallback;
  if (Math.abs(sx) > Math.abs(sy)) return sx > 0 ? "right" : "left";
  return sy > 0 ? "down" : "up";
}
function createRun(cfg) {
  const run = {
    seed: cfg.seed,
    rng: mulberry(cfg.seed),
    time: 0,
    scene: cfg.scene,
    mapIdx: cfg.mapIdx,
    mover: createWorldMovement(cfg.scene.world, cfg.scene.home, { speed: FRIEND_SPEED, radius: 9 }),
    home: [...cfg.scene.home],
    mood: "idle",
    aiT: 0,
    strafeT: 2,
    strafeDir: 1,
    stuckT: 0,
    lastPos: [...cfg.scene.home],
    manual: cfg.manual,
    mpos: [...cfg.scene.home],
    mfacing: "down",
    mwalking: false,
    keys: /* @__PURE__ */ new Set(),
    tapDest: null,
    aimMode: "auto",
    aimWorld: [...cfg.scene.home],
    aimSet: false,
    aimFace: "down",
    phase: "combat",
    shop: null,
    shopOpen: false,
    derived: cfg.derived,
    turretLvl: cfg.turretLvl,
    wallLvl: cfg.wallLvl,
    healerLvl: cfg.healerLvl,
    collectorLvl: cfg.collectorLvl,
    lootLuck: cfg.lootLuck,
    weaponTint: cfg.weaponTint,
    reducedMotion: cfg.reducedMotion,
    hp: cfg.derived.maxHp,
    maxHp: cfg.derived.maxHp,
    armor: cfg.derived.armor,
    wave: 0,
    intermission: 0,
    waveType: "standard",
    surgeMult: 1,
    queue: [],
    spawnT: 0,
    lastKillT: 0,
    strayHunt: false,
    enemies: [],
    shots: [],
    bolts: [],
    companions: [],
    floaters: [],
    orbs: [],
    particles: [],
    pickups: [],
    corpses: [],
    vents: cfg.scene.vents.map((v) => ({ x: v[0], y: v[1], phase: "idle", t: 4 + mulberry(cfg.seed + 40503)() * 4 })),
    announce: [],
    xp: 0,
    level: 1,
    xpNext: xpForLevel(1),
    stacks: {
      power: 0,
      rapid: 0,
      multishot: 0,
      pierce: 0,
      ricochet: 0,
      explosive: 0,
      burn: 0,
      freeze: 0,
      crit: 0,
      vitality: 0,
      regen: 0,
      minifriend: 0,
      ironskin: 0,
      buddy: 0,
      deadeye: 0,
      keen: 0,
      quick: 0,
      boots: 0,
      heavy: 0,
      seeker: 0,
      storm: 0,
      sidestep: 0,
      adrenaline: 0,
      fortune: 0
    },
    abilities: ["ab-blast"],
    abilityCd: {},
    altarLevel: cfg.altarLevel ?? 4,
    abilityRank: {},
    unlocks: { bulwark: 0, traps: 0, overcharge: 0, kennel: 0, workshop: 0, ...cfg.unlocks },
    training: cfg.training ?? 0,
    frostLvl: cfg.frostLvl ?? 0,
    medbayLvl: cfg.medbayLvl ?? 0,
    structHp: {},
    structMax: {},
    structOff: {},
    overchargeT: 0,
    bulwarkT: 0,
    bulwarkArmor: 0,
    reflectT: 0,
    domeT: 0,
    traps: [],
    wisps: [],
    encounter: "patrol",
    prepT: 0,
    expRf: cfg.expRf ?? 0,
    expLoot: cfg.expLoot ?? 0,
    plotHpBonus: cfg.plot?.hp ?? 0,
    plotRegen: cfg.plot?.regen ?? 0,
    plotPickup: cfg.plot?.pickup ?? 0,
    plotRf: cfg.plot?.rf ?? 0,
    plotXp: cfg.plot?.xp ?? 0,
    prodTick: 0,
    seenKinds: [],
    structDamageTaken: 0,
    stolenLost: 0,
    stolenBack: 0,
    flawlessWaves: 0,
    waveStructHit: false,
    relics: [],
    relicEchoN: 0,
    relicMirrorN: 0,
    momentum: 0,
    hitstop: 0,
    timeCoreT: 0,
    furyT: 0,
    zones: [],
    shopPre: null,
    shopPreBlock: -1,
    overT: 0,
    shieldT: 0,
    iframes: 0,
    slowMe: 0,
    strikes: [],
    orbTick: 0,
    beamT: 0,
    beamAng: 0,
    evos: [],
    offers: [],
    rerollsUsed: 0,
    frozen: false,
    over: false,
    committed: false,
    kills: 0,
    bosses: 0,
    elitesSlain: 0,
    bankRf: 0,
    earned: 0,
    spent: 0,
    cons: { heal: 0, ward: 0, tonic: 0, token: 0 },
    shieldHp: 0,
    tonicT: 0,
    powerT: 0,
    hasteT: 0,
    luckyWave: -1,
    gearDrops: [],
    fireCd: 0.5,
    turretCd: 1,
    turretAngle: 0,
    healerT: 0,
    blastCd: 0,
    healUses: 0,
    celebrateT: 0,
    shake: 0,
    nextId: 1,
    events: [],
    bossId: null,
    debug: false,
    stuckFixes: 0,
    spawnRejects: 0,
    stepMs: 0,
    pathReqs: 0,
    routeCache: /* @__PURE__ */ new Map(),
    stuckRoute: 0,
    stuckWatch: 0,
    aimAngle: 0,
    muzzleT: 0,
    tapMark: null
  };
  resetStructHp(run);
  startWave(run, 1);
  return run;
}
function resetStructHp(run) {
  const tiers = {
    turret: run.turretLvl,
    wall: run.wallLvl,
    healer: run.healerLvl,
    collector: run.collectorLvl,
    frost: run.frostLvl
  };
  run.structHp = {};
  run.structMax = {};
  for (const [id, tier] of Object.entries(tiers)) {
    if (tier <= 0) continue;
    try {
      const def = structureById(id);
      const hp = def.hp[Math.min(def.maxTier, tier) - 1] ?? 100;
      if (hp > 0) {
        run.structHp[id] = hp;
        run.structMax[id] = hp;
      }
    } catch {
    }
  }
  const coreHp = homeCoreHp(run.maxHp);
  run.structHp[HOME_CORE.id] = coreHp;
  run.structMax[HOME_CORE.id] = coreHp;
  run.structOff = {};
}
function damageStructure(run, id, dmg) {
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
function slamHitsCore(run, x, y, r, dmg) {
  if (!(run.structHp[HOME_CORE.id] > 0)) return;
  const a = run.scene.anchors[HOME_CORE.id];
  if (!a) return;
  if (Math.hypot(a[0] - x, a[1] - y) < r + 20) {
    damageStructure(run, HOME_CORE.id, dmg);
    burst(run, a[0], a[1], "#d95f4b", 8);
    floater(run, a[0], a[1] - 30, "HOME HIT!", "#d93a3a", true);
  }
}
function repairCost(run, id) {
  const max = run.structMax[id] ?? 0;
  const cur = run.structHp[id] ?? 0;
  if (max <= 0 || cur >= max) return 0;
  return Math.ceil(4 + (max - cur) / max * 22);
}
function repairStructure(run, id) {
  const cost = repairCost(run, id);
  if (cost <= 0 || run.bankRf < cost) return false;
  run.bankRf -= cost;
  run.spent += cost;
  run.structHp[id] = run.structMax[id];
  return true;
}
function gateLabel(home, gate) {
  const dx2 = gate[0] - home[0], dy2 = gate[1] - home[1];
  const deg = Math.atan2(dy2, dx2) * 180 / Math.PI;
  if (deg >= -112.5 && deg < -67.5) return "NORTH GATE";
  if (deg >= -67.5 && deg < -22.5) return "NE TRAIL";
  if (deg >= -22.5 && deg < 22.5) return "EAST PATH";
  if (deg >= 22.5 && deg < 67.5) return "SE TRAIL";
  if (deg >= 67.5 && deg < 112.5) return "SOUTH GATE";
  if (deg >= 112.5 && deg < 157.5) return "SW TRAIL";
  if (deg >= -157.5 && deg < -112.5) return "NW TRAIL";
  return "WEST PATH";
}
function pendingGates(run) {
  const counts = /* @__PURE__ */ new Map();
  for (const q of run.queue) {
    if (q.gate === void 0) continue;
    counts.set(q.gate, (counts.get(q.gate) ?? 0) + 1);
  }
  const out = [];
  for (const [gate, count] of counts) {
    const g = run.scene.gates[gate % Math.max(1, run.scene.gates.length)];
    if (!g) continue;
    out.push({ gate, label: gateLabel(run.home, g), count });
  }
  out.sort((a, b) => b.count - a.count);
  return out.slice(0, 4);
}
function structureTarget(run, objective, includeCore = false) {
  const want = objective === "production" ? ["collector"] : includeCore ? ["turret", "frost", "healer", "collector", "wall", HOME_CORE.id] : ["turret", "frost", "healer", "collector", "wall"];
  let best = null;
  let bestD = Infinity;
  const [fx, fy] = friendPos(run);
  for (const id of want) {
    if (!(run.structHp[id] > 0)) continue;
    const a = run.scene.anchors[id];
    if (!a) continue;
    const d = Math.hypot(a[0] - fx, a[1] - fy);
    if (d < bestD) {
      bestD = d;
      best = { id, x: a[0], y: a[1] };
    }
  }
  return best;
}
function enterMap(run, scene, mapIdx) {
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
  run.vents = scene.vents.map((v) => ({ x: v[0], y: v[1], phase: "idle", t: 5 }));
  run.hp = Math.min(run.maxHp, run.hp + run.maxHp * (0.3 + run.medbayLvl * 0.15));
  syncCompanions(run);
}
function validatedSpawn(run, gateIdx) {
  const world = run.scene.world;
  const gates = run.scene.gates.length > 0 ? run.scene.gates : run.scene.entrances;
  const gi = gateIdx !== void 0 ? gateIdx % gates.length : Math.floor(run.rng() * gates.length);
  const [gx, gy] = gates[gi] ?? run.home;
  const homeId = run.scene.regions.homeId;
  for (let i = 0; i < 6; i++) {
    const x = Math.min(WORLD_W - 16, Math.max(16, gx + (run.rng() - 0.5) * 44));
    const y = Math.min(WORLD_H - 16, Math.max(16, gy + (run.rng() - 0.5) * 36));
    if (!isWorldWalkable(world, [x, y], 12)) {
      run.spawnRejects++;
      continue;
    }
    let blocked = false;
    for (const b of world.collision?.blocked ?? []) {
      if (x > b.x - 14 && x < b.x + b.w + 14 && y > b.y - 14 && y < b.y + b.h + 14) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      run.spawnRejects++;
      continue;
    }
    if (regionAt(run.scene.regions, x, y) !== homeId) {
      run.spawnRejects++;
      continue;
    }
    return [x, y];
  }
  return [gx, gy];
}
function pickKind(run, allowed, type, mapIdx) {
  const noMinis = { minibrute: 0, minimage: 0, minisiege: 0 };
  const weights = type === "swarm" ? { swarm: 5, splitling: 2, shadow: 2, swift: 1, ...noMinis } : type === "heavy" ? { tank: 4, shield: 3, commander: 2, shadow: 2, charger: 1, ...noMinis } : type === "ranged" ? { ranged: 4, sniper: 2, mage: 2, cryo: 2, support: 2, shadow: 1.2, swift: 0.8, ...noMinis } : type === "rush" ? { swift: 4, charger: 3, leaper: 2, orbiter: 1.5, swarm: 1, ...noMinis } : type === "elite" ? { shadow: 3, tank: 2, swift: 2, ranged: 1, commander: 1, elitehunter: 1.5, ...noMinis } : { shadow: 4, swift: 2, swarm: 2, tank: 1, ranged: 1, charger: 1, split: 1, shield: 1, support: 0.7, summoner: 0.6, mage: 0.5, burrower: 0.5, drainer: 0.5, commander: 0.4, saboteur: 0.5, thief: 0.4, traplayer: 0.4, artillery: 0.35, necromancer: 0.3, siege: 0.3, cryo: 0.5, corrupter: 0.4, elitehunter: 0.4, ...noMinis };
  const pressure = mapIdx === 0 ? { swift: 1.5, swarm: 1.5 } : mapIdx === 1 ? { tank: 1.6, ranged: 1.6, charger: 1.5 } : mapIdx === 2 ? { bomber: 2, leaper: 2, charger: 1.3 } : mapIdx === 3 ? { orbiter: 2, support: 1.8, swarm: 1.4 } : mapIdx === 4 ? { sniper: 2, shield: 1.8, ranged: 1.5 } : { summoner: 1.6, blinker: 1.8, swift: 1.3 };
  let total = 0;
  for (const k of allowed) total += (weights[k] ?? 0.5) * (pressure[k] ?? 1);
  let r = run.rng() * total;
  for (const k of allowed) {
    r -= (weights[k] ?? 0.5) * (pressure[k] ?? 1);
    if (r <= 0) return k;
  }
  return allowed[0] ?? "shadow";
}
function startWave(run, wave) {
  run.wave = wave;
  run.queue = [];
  run.surgeMult = 1;
  run.waveStructHit = false;
  const plan = planWave(wave, run.mapIdx);
  run.waveType = plan.type;
  const encId = planEncounter(wave, run.mapIdx, plan.type);
  run.encounter = encId;
  const enc = ENCOUNTERS[encId];
  let t = wave <= 2 ? 1.4 : 0.6;
  if (plan.type === "boss") {
    const pattern = bossPatternFor(wave);
    const spec = bossSpec(wave);
    run.events.push({ t: "bosswarn", wave, pattern, name: spec.name });
    announce(run, `${spec.name} APPROACHES`, pattern === "siegebreaker" ? "It marches on your structures. Repair and kite!" : `Wave ${wave} \u2014 hold the plot!`);
    t = Math.max(2.2, enc.calmBefore);
    run.queue.push({ kind: "boss", delay: t });
    t += 1.2;
    const adds = 2 + Math.floor(wave / 10);
    for (let i = 0; i < adds; i++) {
      run.queue.push({ kind: i % 2 ? "swift" : "shadow", delay: t });
      t += 1.4;
    }
    if (pattern === "siegebreaker") {
      const allowed = unlockedKinds(wave, run.mapIdx);
      const escort = ["siege", "saboteur", "shield"];
      for (let i = 0; i < 3; i++) {
        const k = escort[i];
        if (allowed.includes(k)) run.queue.push({ kind: k, delay: t + i * 1.2 });
      }
    }
  } else {
    const early = EARLY_WAVES[wave];
    if (early && run.mapIdx === 0) {
      run.waveType = "standard";
      const names = {
        1: ["WAVE 1", "Movement lesson: Basics + Swifts."],
        2: ["SWARM + SWIFT", "Spacing lesson: hold the line."],
        3: ["RANGED PAIR", "Positioning lesson: two shooters."],
        4: ["SHIELD + CHARGERS", "Priority lesson: crack the guard."]
      };
      const [label, sub] = names[wave] ?? [`WAVE ${wave}`, "Shadows are entering the plot!"];
      announce(run, label, wave === 1 ? "Shadows are entering the plot!" : sub);
      const gates2 = run.scene.gates;
      const gcount2 = Math.max(1, gates2.length);
      let cursor2 = Math.floor(run.rng() * gcount2);
      let t2 = wave <= 2 ? 1.1 : 0.5;
      for (const [kind, count] of early) {
        for (let i = 0; i < count; i++) {
          cursor2 = (cursor2 + 1) % gcount2;
          run.queue.push({ kind, delay: Math.round(t2 / 0.8) * 0.8, gate: cursor2 });
          t2 += kind === "swarm" ? 0.35 : 0.75;
        }
        t2 += 0.4;
      }
      run.spawnT = 0;
      run.events.push({ t: "wave", wave });
      return;
    }
    const encName = enc.id === "assault" && plan.label ? plan.label : enc.name.toUpperCase();
    announce(run, encName, `${enc.desc}${plan.label && enc.id === "assault" ? "" : ` \xB7 Wave ${wave}`}`);
    if (plan.surge) run.surgeMult = 1.3;
    const allowed = unlockedKinds(wave, run.mapIdx);
    let budget = plan.budget;
    t = Math.max(t, enc.calmBefore * 0.6);
    if (wave <= 10) budget = Math.round(budget * (wave <= 4 ? 0.75 : 0.88));
    const interval2 = Math.max(0.3, 0.95 - wave * 0.03) + (wave <= 2 ? 0.25 : 0);
    const gates = run.scene.gates;
    const gcount = Math.max(1, gates.length);
    const farGate = (() => {
      let bi = 0, bd = -1;
      gates.forEach((g, i) => {
        const d = Math.hypot(g[0] - run.home[0], g[1] - run.home[1]);
        if (d > bd) {
          bd = d;
          bi = i;
        }
      });
      return bi;
    })();
    let cursor = Math.floor(run.rng() * gcount);
    const nextGate = () => cursor = (cursor + 1) % gcount;
    const oppositeGate = () => (cursor + Math.floor(gcount / 2)) % gcount;
    let guard = 400;
    let elitesForced = plan.type === "elite" ? 2 + Math.floor(run.rng() * 2) : 0;
    while (budget > 0 && guard-- > 0) {
      const kind = pickKind(run, allowed, plan.type, run.mapIdx);
      const cost = BUDGET_COST[kind] ?? 1;
      if (cost > budget && kind !== "shadow" && kind !== "swarm") {
        budget -= 1;
        run.queue.push({ kind: plan.type === "swarm" ? "swarm" : "shadow", delay: t, gate: nextGate() });
        t += interval2 * 0.7;
        continue;
      }
      budget -= Math.min(budget, cost);
      const forceElite = elitesForced > 0 && kind !== "swarm";
      if (forceElite) elitesForced--;
      if (kind === "swarm") {
        const clump = 3 + Math.floor(run.rng() * 3);
        const g = plan.type === "swarm" ? farGate : nextGate();
        for (let i = 0; i < clump; i++) run.queue.push({ kind: "swarm", delay: t + i * 0.12, gate: g });
        t += interval2 * 1.4;
      } else {
        let g = nextGate();
        if (plan.type === "heavy") g = oppositeGate();
        else if (plan.type === "ranged" && (kind === "ranged" || kind === "support" || kind === "summoner")) g = farGate;
        else if (plan.type === "rush" && (kind === "swift" || kind === "charger")) {
        } else if (plan.type === "surge" || plan.type === "elite") g = nextGate();
        run.queue.push({ kind, delay: t, gate: g, forceElite: forceElite || void 0 });
        if ((kind === "support" || kind === "summoner") && run.rng() < 0.4 && budget >= 3) {
          budget -= 3;
          const guardKind = run.rng() < 0.5 ? "tank" : "shield";
          if (allowed.includes(guardKind)) run.queue.push({ kind: guardKind, delay: t + 0.4, gate: g });
        }
        t += interval2 * (0.7 + run.rng() * 0.6);
      }
    }
    for (const q of run.queue) {
      if (q.kind === "boss") continue;
      q.delay = Math.round(q.delay / 0.8) * 0.8;
    }
    if (enc.structureRaid) {
      const raiders = enc.id === "raid" ? ["thief", "saboteur"] : ["saboteur", "siege", "artillery"];
      for (const k of raiders) {
        if (allowed.includes(k) && !run.queue.some((q) => q.kind === k)) {
          run.queue.push({ kind: k, delay: Math.max(...run.queue.map((q) => q.delay), 1) + 0.8 });
        }
      }
    }
    if (enc.id === "commander" && allowed.includes("commander") && !run.queue.some((q) => q.kind === "commander")) {
      run.queue.push({ kind: "commander", delay: Math.max(...run.queue.map((q) => q.delay), 1) + 1.2, forceElite: true });
    }
    if (enc.id === "burrow" && allowed.includes("burrower") && !run.queue.some((q) => q.kind === "burrower")) {
      for (let i = 0; i < 2; i++) run.queue.push({ kind: "burrower", delay: 1 + i * 1.4 });
    }
    if ((wave % 5 === 3 || wave % 5 === 4) && wave > 4 && run.rng() < 0.35) {
      const elites = run.queue.filter((q) => q.forceElite).length;
      if (elites === 0 && allowed.length > 0) {
        const at = Math.max(...run.queue.map((q) => q.delay), 1) + 0.8;
        const pick = allowed.includes("tank") ? "tank" : allowed[0];
        run.queue.push({ kind: pick ?? "shadow", delay: at, gate: 0, forceElite: true });
        announce(run, "ELITE INVASION", "A named Shadow leads the pack!");
      }
    }
    if (wave % 5 !== 0) {
      const minis = [
        { kind: "minibrute", wave: 7, name: "GRISTLE, MAW OF THE HORDE", odds: 0.3 },
        { kind: "minimage", wave: 12, name: "VESPER, THE PALE CHOIR", odds: 0.25 },
        { kind: "minisiege", wave: 17, name: "RAMPART, THE WALL-EATER", odds: 0.25 }
      ];
      for (const m of minis) {
        if (wave >= m.wave && allowed.includes(m.kind) && !run.queue.some((q) => q.kind === m.kind || q.kind === "boss") && run.rng() < m.odds) {
          run.queue.push({ kind: m.kind, delay: Math.max(...run.queue.map((q) => q.delay), 1) + 1.6, forceElite: true });
          const esc = m.kind === "minimage" ? ["swarm", "swarm"] : m.kind === "minisiege" ? ["shield", "saboteur"] : ["swift", "swift"];
          for (const k of esc) {
            if (allowed.includes(k)) run.queue.push({ kind: k, delay: Math.max(...run.queue.map((q) => q.delay), 1) + 0.6 });
          }
          announce(run, `MINI-BOSS: ${m.name}`, "Bring it down for a bonus cache!");
          break;
        }
      }
    }
    if (enc.gateFocus && run.scene.gates.length > 0) {
      const focus = Math.floor(run.rng() * run.scene.gates.length);
      for (const q of run.queue) q.gate = focus;
    }
    if (run.queue.length > enc.ceiling) {
      const scored = run.queue.map((q, i) => ({
        q,
        i,
        keep: q.kind === "boss" || q.forceElite === true ? 1 : 0,
        c: BUDGET_COST[q.kind] ?? 1
      }));
      scored.sort((a, b) => a.keep - b.keep || a.c - b.c);
      const over = run.queue.length - enc.ceiling;
      const drop = new Set(scored.filter((s) => s.keep === 0).slice(0, over).map((s) => s.i));
      if (drop.size > 0) run.queue = run.queue.filter((_, i) => !drop.has(i));
    }
    ensureTemplateHonesty(run, plan.type, allowed);
  }
  run.spawnT = 0;
  run.events.push({ t: "wave", wave });
}
function ensureTemplateHonesty(run, type, allowed) {
  if (type !== "ranged" && type !== "heavy" && type !== "swarm" && type !== "rush") return;
  const fam = type;
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
    const cand = kinds.find((k) => allowed.includes(k));
    if (!cand) break;
    const idx = run.queue.findIndex((q) => q.kind !== "boss" && !kinds.includes(q.kind));
    if (idx < 0) break;
    const old = run.queue[idx].kind;
    run.queue[idx].kind = cand;
    total += (BUDGET_COST[cand] ?? 1) - (BUDGET_COST[old] ?? 1);
    part += BUDGET_COST[cand] ?? 1;
  }
}
function announce(run, text2, sub = "") {
  run.announce.push({ text: text2, sub, ttl: 2.8, max: 2.8 });
  if (run.announce.length > 3) run.announce.shift();
}
function nextWave(run) {
  if (run.intermission > 0 && !run.over) run.intermission = 0.01;
}
function baseSpec(kind) {
  if (kind in NEW_ENEMIES) {
    const s2 = NEW_ENEMIES[kind];
    return { hp: s2.hp, dmg: s2.dmg, xp: s2.xp, rf: s2.rf, radius: s2.radius, range: s2.range };
  }
  const s = ENEMIES[kind];
  return { hp: s.hp, dmg: s.dmg, xp: s.xp, rf: s.rf, radius: s.radius, range: s.range };
}
function spawnEnemy(run, kind, gate, forceElite) {
  const [x, y] = validatedSpawn(run, gate);
  const id = run.nextId++;
  const map = MAPS[run.mapIdx] ?? MAPS[0];
  const eliteRoll = forceElite === true || run.rng() < eliteChance(run.wave) + map.eliteBonus + (run.waveType === "elite" ? 0.12 : 0);
  const grace = run.wave <= 2 ? 0.7 : 1;
  const mk = (hp, dmg, xp, rf, radius, range, elite2, eliteMod2) => {
    let speed = (ENEMY_SPEED[kind] ?? 36) * waveSpeedMult(run.wave) * (0.9 + run.rng() * 0.2);
    let body = BODY_R[kind] ?? 8;
    let ehp = hp, edmg = dmg, exml = 1;
    if (elite2 && eliteMod2 === "frenzied") {
      speed *= 1.3;
      exml = 1;
    }
    if (elite2 && eliteMod2 === "armored") {
      ehp = Math.round(hp * 1.6);
    }
    if (elite2 && eliteMod2 === "giant") {
      ehp = hp * 2;
      edmg = Math.round(dmg * 1.4);
      body *= 1.3;
    }
    return {
      id,
      kind,
      x,
      y,
      hp: Math.round(ehp * waveHpMult(run.wave) * (elite2 && !eliteMod2 ? 2.5 : 1)),
      maxHp: Math.round(ehp * waveHpMult(run.wave) * (elite2 && !eliteMod2 ? 2.5 : 1)),
      dmg: Math.max(1, Math.round(edmg * waveDmgMult(run.wave) * (elite2 ? 1.5 : 1) * grace)),
      speed,
      xp: elite2 ? xp * 3 : xp,
      rf: elite2 ? rf * (eliteMod2 === "frenzied" ? 3 : 4) : rf,
      radius,
      body,
      stopDist: range > 0 ? range : 0,
      slowT: 0,
      slowF: 1,
      burnT: 0,
      burnDps: 0,
      shieldHp: 0,
      shieldMax: 0,
      elite: elite2,
      eliteMod: eliteMod2,
      mods: [],
      pattern: null,
      bossName: "",
      phase: 0,
      wardT: 0,
      wardDown: 0,
      blinkT: 0,
      addT: 0,
      atkCd: 0.5 + run.rng() * 0.5,
      shootCd: 1 + run.rng(),
      burstT: 4,
      summonT: 9,
      slamT: 0,
      slamX: 0,
      slamY: 0,
      slamCd: 5,
      chargeState: "roam",
      chargeT: 0,
      chargeDx: 0,
      chargeDy: 0,
      chargeCd: 2 + run.rng() * 2,
      fuseT: 0,
      aimT: 0,
      aimDx: 0,
      aimDy: 0,
      orbitDir: run.rng() < 0.5 ? -1 : 1,
      orbitT: 0,
      skipT: 3 + run.rng() * 3,
      skipPhase: 0,
      leapState: "roam",
      leapT: 0,
      leapX: 0,
      leapY: 0,
      burrowState: "roam",
      burrowT: 2 + run.rng() * 2,
      burrowX: 0,
      burrowY: 0,
      mageCd: 2 + run.rng() * 2,
      drainT: 0,
      objective: ENEMY_OBJECTIVE[kind] ?? "friend",
      structCd: 1 + run.rng(),
      stolen: 0,
      mineT: 3,
      reviveT: 6,
      bombardT: 2,
      fleeing: false,
      flash: 0,
      walkPhase: run.rng() * 6,
      lungeT: 0,
      spawnT: 0.8,
      facing: "down",
      px: x,
      py: y,
      waypoints: [],
      repathT: run.rng() * 0.8,
      goalX: x,
      goalY: y,
      stuckT: 0,
      lastX: x,
      lastY: y,
      stuckFails: 0
    };
  };
  if (kind === "boss") {
    const spec = bossSpec(run.wave);
    const pattern = bossPatternFor(run.wave);
    const e2 = mk(spec.hp, spec.dmg, spec.xp, spec.rf, 26, 0, false, null);
    e2.hp = spec.hp;
    e2.maxHp = spec.hp;
    e2.speed = spec.speed;
    e2.mods = spec.modifiers;
    e2.pattern = pattern;
    e2.bossName = spec.name;
    e2.body = BODY_R.boss;
    if (pattern === "warden") e2.wardT = 8;
    if (pattern === "blink") e2.blinkT = 3;
    run.enemies.push(e2);
    run.bossId = id;
    return;
  }
  const base = baseSpec(kind);
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
function dmgMult(run) {
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
function interval(run) {
  let iv = run.derived.interval * Math.pow(0.83, run.stacks.rapid);
  if (run.stacks.rapid >= 3) iv *= 0.75;
  iv *= 1 + 0.1 * run.stacks.heavy;
  if (run.overT > 0) iv *= 0.65;
  if (run.furyT > 0) iv *= 0.8;
  iv *= 1 - Math.min(0.08, run.momentum * 8e-3);
  return Math.max(0.12, iv);
}
function projectileCount(run) {
  const fam = run.derived.family === "twin" ? 1 : 0;
  return run.derived.projectiles + run.stacks.multishot + (run.stacks.multishot >= 3 ? 1 : 0) + fam + (isBarrage(run) ? 1 : 0);
}
function pierceCount(run) {
  if (run.stacks.pierce >= 2) return 99;
  const prism = run.relics.includes("re-prism") ? 1 : 0;
  return run.derived.pierce + run.stacks.pierce + prism + (run.derived.family === "needle" ? 1 : 0);
}
function bounceCount(run) {
  const prism = run.relics.includes("re-prism") ? 1 : 0;
  return run.derived.bounce + run.stacks.ricochet + prism + (run.derived.family === "spark" ? 2 : 0) + (isPinball(run) ? 2 : 0);
}
function volatileChance(run) {
  return Math.min(0.5, run.derived.volatile + (run.relics.includes("re-vol") ? 0.15 : 0));
}
function abilityCdScale(run) {
  return 1 - Math.min(0.4, run.derived.abilityCdr + (run.timeCoreT > 0 ? 0.35 : 0));
}
function dashCooldown(run) {
  return 6 * (1 - 0.2 * run.stacks.adrenaline);
}
function luckBonus(run) {
  return run.lootLuck + 0.5 * run.stacks.fortune;
}
function critChance(run) {
  return Math.min(0.85, run.derived.critC + 0.12 * run.stacks.crit + (run.stacks.power >= 3 ? 0.1 : 0));
}
function critMult(run) {
  return run.derived.critM + 0.5 * run.stacks.deadeye + (run.stacks.crit >= 2 ? 1 : 0);
}
function regenRate(run) {
  return run.derived.regen + 1.2 * run.stacks.regen + run.plotRegen;
}
function rfGainMult(run) {
  const map = MAPS[run.mapIdx] ?? MAPS[0];
  return run.derived.rfMult * map.rfMult * (1 + 0.05 * run.stacks.keen) * (1 + run.plotRf + run.expRf) * run.surgeMult;
}
function bankAdd(run, amount) {
  const v = Math.max(0, Math.round(amount));
  run.bankRf += v;
  run.earned += v;
}
function bankSpend(run, amount) {
  const v = Math.max(0, Math.round(amount));
  if (run.bankRf < v) return false;
  run.bankRf -= v;
  run.spent += v;
  return true;
}
function hurtFriend(run, raw) {
  if (run.over) return 0;
  if (run.iframes > 0) return 0;
  if (run.rng() < Math.min(0.5, run.derived.dodge + 0.08 * run.stacks.sidestep)) {
    const [dx2, dy2] = friendPos(run);
    floater(run, dx2, dy2 - 26, "MISS", "#6b6558");
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
function nearestEnemy(run, x, y, range, priority = false) {
  let best = null;
  let bestD = range * range;
  let bestPri = false;
  for (const e of run.enemies) {
    if (e.spawnT > 0.4) continue;
    const dx2 = e.x - x, dy2 = e.y - y;
    const d = dx2 * dx2 + dy2 * dy2;
    const pri = priority && (e.kind === "support" || e.kind === "summoner" || e.kind === "commander" || e.kind === "saboteur" || e.kind === "drainer" || e.kind === "necromancer" || e.kind === "artillery" || e.kind === "thief");
    if (pri && !bestPri) {
      if (d < range * 1.35 * (range * 1.35)) {
        best = e;
        bestD = d;
        bestPri = true;
      }
      continue;
    }
    if (bestPri && !pri) continue;
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }
  return best;
}
function heavyFamily(run) {
  return run.derived.family === "heavy" || run.derived.family === "buster";
}
function fireVolley(run, fromX, fromY, target, dmgScale, color, size) {
  const baseAng = Math.atan2(target.y - fromY, target.x - fromX);
  fireVolleyAng(run, fromX, fromY, baseAng, target, dmgScale, color, size);
}
function fireMouse(run, fx, fy, ang) {
  const fam = run.derived.family;
  const tint = run.weaponTint;
  if (fam === "beam") {
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
        x: sox,
        y: soy,
        px: sox,
        py: soy,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        dmg: Math.round(run.derived.dmg * dmgMult(run) * 0.55 * (crit ? critMult(run) : 1) * 10) / 10,
        pierce: 0,
        bounce: 0,
        explosive: 0,
        explosiveR: 0,
        burnDps: run.stacks.burn > 0 ? run.derived.dmg * 0.4 : 0,
        burnDur: 2,
        slowF: 1,
        slowDur: 0,
        freeze: false,
        crit,
        life: 0.55,
        color: tint,
        size: 4,
        hitIds: [],
        homing: 0
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
function fireVolleyAng(run, fromX, fromY, baseAng, target, dmgScale, color, size) {
  run.aimAngle = baseAng;
  run.muzzleT = 0.09;
  const ox = fromX + Math.cos(baseAng) * 14, oy = fromY + Math.sin(baseAng) * 14;
  const n2 = projectileCount(run);
  const doubleShot = run.stacks.rapid >= 3 && run.rng() < 0.15;
  const volleys = doubleShot ? 2 : 1;
  const heavy = heavyFamily(run);
  const bossBonus = target && target.kind === "boss" ? 1 + run.derived.bossDmg : 1;
  for (let v = 0; v < volleys; v++) {
    for (let i = 0; i < n2; i++) {
      const spread = n2 === 1 ? 0 : (i - (n2 - 1) / 2) * 0.16;
      const ang = baseAng + spread + (v > 0 ? 0.05 : 0);
      const speed = run.derived.family === "rapid" ? 440 : heavy ? 330 : 390;
      const crit = run.rng() < critChance(run);
      let dmg = run.derived.dmg * dmgMult(run) * dmgScale * bossBonus * (crit ? critMult(run) : 1);
      dmg = Math.round(dmg * 10) / 10;
      const burnStacks = run.stacks.burn;
      const freezeStacks = run.stacks.freeze;
      const expStacks = run.stacks.explosive;
      const twinOff = run.derived.family === "twin" ? i % 2 === 0 ? 6 : -6 : 0;
      const px0 = ox + Math.cos(baseAng + Math.PI / 2) * twinOff;
      const py0 = oy + Math.sin(baseAng + Math.PI / 2) * twinOff;
      run.shots.push({
        x: px0,
        y: py0,
        px: px0,
        py: py0,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        dmg,
        pierce: pierceCount(run),
        bounce: bounceCount(run),
        explosive: expStacks === 0 ? 0 : expStacks === 1 ? 0.5 : 0.8,
        explosiveR: expStacks === 0 ? 0 : expStacks === 1 ? 46 : 60,
        burnDps: burnStacks === 0 ? 0 : dmg * (0.4 + 0.3 * burnStacks),
        burnDur: burnStacks === 0 ? 0 : 3,
        slowF: freezeStacks === 0 ? 1 : 0.6,
        slowDur: freezeStacks === 0 ? 0 : 1.5,
        freeze: freezeStacks >= 2,
        crit,
        life: 1.4,
        color,
        size: crit ? size + 1 : size,
        hitIds: []
      });
    }
  }
  burst(run, ox, oy, color, heavy ? 6 : 3);
  if (run.derived.echo || run.relics.includes("re-echo")) {
    run.relicEchoN++;
    if (run.relicEchoN % 5 === 0) {
      for (let i = 0; i < Math.min(n2, 3); i++) {
        const ang = baseAng + (i - Math.min(n2, 3) / 2) * 0.12;
        run.shots.push({
          x: ox,
          y: oy,
          px: ox,
          py: oy,
          vx: Math.cos(ang) * 390,
          vy: Math.sin(ang) * 390,
          dmg: Math.round(run.derived.dmg * dmgMult(run) * dmgScale * 10) / 10,
          pierce: pierceCount(run),
          bounce: bounceCount(run),
          explosive: 0,
          explosiveR: 0,
          burnDps: 0,
          burnDur: 0,
          slowF: 1,
          slowDur: 0,
          freeze: false,
          crit: false,
          life: 1.1,
          color: "#c9a8ff",
          size,
          hitIds: []
        });
      }
    }
  }
  if (run.relics.includes("re-mirror")) {
    run.relicMirrorN++;
    if (run.relicMirrorN % 8 === 0) {
      run.shots.push({
        x: ox,
        y: oy,
        px: ox,
        py: oy,
        vx: Math.cos(baseAng + 0.2) * 390,
        vy: Math.sin(baseAng + 0.2) * 390,
        dmg: Math.round(run.derived.dmg * dmgMult(run) * dmgScale * 10) / 10,
        pierce: pierceCount(run),
        bounce: bounceCount(run),
        explosive: 0,
        explosiveR: 0,
        burnDps: 0,
        burnDur: 0,
        slowF: 1,
        slowDur: 0,
        freeze: false,
        crit: false,
        life: 1.1,
        color: "#7a5fc0",
        size,
        hitIds: []
      });
    }
  }
}
function burst(run, x, y, color, count) {
  if (run.reducedMotion || run.particles.length > 220) return;
  for (let i = 0; i < count; i++) {
    const a = run.rng() * Math.PI * 2;
    const s = 25 + run.rng() * 70;
    run.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, ttl: 0.35 + run.rng() * 0.2, color, size: 2 + run.rng() * 2 });
  }
}
function floater(run, x, y, text2, color, big = false) {
  if (run.floaters.length > 18) run.floaters.shift();
  run.floaters.push({ x, y, text: text2, color, ttl: big ? 1.1 : 0.7, big });
}
function damageEnemy(run, e, dmg, crit) {
  const vuln = e.chargeState === "vuln" ? 1.5 : 1;
  let remaining = dmg * vuln;
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
function dropPickup(run, x, y, elite, boss) {
  const r = run.rng();
  const chance = boss ? 1 : elite ? 0.18 : 0.06;
  if (r > chance) return;
  let kind = "rf";
  const w = run.rng();
  let acc = 0;
  for (const k of Object.keys(PICKUP_W)) {
    acc += PICKUP_W[k];
    if (w <= acc) {
      kind = k;
      break;
    }
  }
  if (boss) kind = run.rng() < 0.5 ? "heart" : "rf";
  if (run.pickups.length > 24) run.pickups.shift();
  run.pickups.push({ kind, x, y, vx: (run.rng() - 0.5) * 40, vy: -30, ttl: 25 });
}
function killEnemy(run, e) {
  run.kills++;
  if (e.elite) run.elitesSlain++;
  run.lastKillT = run.time;
  run.xp += Math.round(e.xp * (1 + run.plotXp) * run.surgeMult);
  const seenId = e.kind === "boss" ? `boss:${e.pattern ?? "brute"}` : e.kind;
  if (!run.seenKinds.includes(seenId)) {
    run.seenKinds.push(seenId);
    run.events.push({ t: "codex", id: e.kind === "boss" ? e.pattern ?? "brute" : e.kind, kind: e.kind === "boss" ? "boss" : "enemy" });
  }
  if (e.kind === "minibrute" || e.kind === "minimage" || e.kind === "minisiege") {
    const bonus = 15 + run.wave * 2;
    bankAdd(run, bonus);
    floater(run, e.x, e.y - 40, `CACHE +${bonus}`, "#8a5a00", true);
    run.pickups.push({ kind: "heart", x: e.x - 14, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.pickups.push({ kind: "rf", x: e.x + 14, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.events.push({ t: "elite" });
    announce(run, "MINI-BOSS DOWN!", "The plot breathes again.");
  }
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
  run.momentum = Math.min(10, run.momentum + (e.elite || e.kind === "boss" ? 3 : 1));
  if (!run.reducedMotion && (e.kind === "boss" || e.elite)) run.hitstop = Math.max(run.hitstop, 0.04);
  if (run.rng() < volatileChance(run)) explode(run, e.x, e.y, 55, run.derived.dmg * dmgMult(run) * 0.8);
  if (e.elite && run.relics.includes("re-time")) run.timeCoreT = 10;
  if (run.corpses.length > 24) run.corpses.shift();
  run.corpses.push({ x: e.x, y: e.y, kind: e.kind, ttl: 0.5, scale: e.kind === "boss" ? 8 : 4.4 });
  dropPickup(run, e.x, e.y, e.elite, e.kind === "boss");
  if (e.kind === "split" && run.enemies.length < MAX_ENEMIES - 2) {
    for (let i = 0; i < 2; i++) {
      const base = baseSpec("splitling");
      const sx = e.x + (i === 0 ? -4 : 4), sy = e.y + (i === 0 ? -3 : 3);
      run.enemies.push({
        id: run.nextId++,
        kind: "splitling",
        x: sx,
        y: sy,
        hp: Math.round(base.hp * waveHpMult(run.wave)),
        maxHp: Math.round(base.hp * waveHpMult(run.wave)),
        dmg: Math.round(base.dmg * waveDmgMult(run.wave)),
        speed: ENEMY_SPEED.splitling * waveSpeedMult(run.wave),
        xp: base.xp,
        rf: base.rf,
        radius: base.radius,
        body: BODY_R.splitling,
        stopDist: 0,
        slowT: 0,
        slowF: 1,
        burnT: 0,
        burnDps: 0,
        shieldHp: 0,
        shieldMax: 0,
        elite: false,
        eliteMod: null,
        mods: [],
        pattern: null,
        bossName: "",
        phase: 0,
        wardT: 0,
        wardDown: 0,
        blinkT: 0,
        addT: 0,
        atkCd: 0.6,
        shootCd: 99,
        burstT: 99,
        summonT: 99,
        slamT: 0,
        slamX: 0,
        slamY: 0,
        slamCd: 99,
        chargeState: "roam",
        chargeT: 0,
        chargeDx: 0,
        chargeDy: 0,
        chargeCd: 99,
        fuseT: 0,
        aimT: 0,
        aimDx: 0,
        aimDy: 0,
        orbitDir: 1,
        orbitT: 0,
        skipT: 4,
        skipPhase: 0,
        leapState: "roam",
        leapT: 0,
        leapX: 0,
        leapY: 0,
        burrowState: "roam",
        burrowT: 3,
        burrowX: 0,
        burrowY: 0,
        mageCd: 3,
        drainT: 0,
        objective: "friend",
        structCd: 1,
        stolen: 0,
        mineT: 3,
        reviveT: 6,
        bombardT: 2,
        fleeing: false,
        flash: 0,
        walkPhase: run.rng() * 6,
        lungeT: 0,
        spawnT: 0.4,
        facing: "down",
        px: e.x,
        py: e.y,
        waypoints: [],
        repathT: 0,
        goalX: e.x,
        goalY: e.y,
        stuckT: 0,
        lastX: e.x,
        lastY: e.y,
        stuckFails: 0
      });
    }
    floater(run, e.x, e.y - 22, "SPLIT!", "#33415e", true);
  }
  if (e.kind === "boss") {
    run.bosses++;
    run.bossId = null;
    run.celebrateT = 1.6;
    const adds = run.enemies.filter((o) => o !== e && o.kind !== "boss" && !o.elite);
    for (const o of adds) {
      burst(run, o.x, o.y, "#8a5a00", 8);
      run.kills++;
      run.xp += o.xp;
      bankAdd(run, Math.round(o.rf * rfGainMult(run)) + run.wave);
    }
    run.enemies = run.enemies.filter((o) => o === e || o.kind === "boss" || o.elite);
    run.pickups.push({ kind: "heart", x: e.x - 20, y: e.y, vx: 0, vy: -40, ttl: 25 });
    run.pickups.push({ kind: "rf", x: e.x + 20, y: e.y, vx: 0, vy: -40, ttl: 25 });
    if (run.stacks.burn >= 3) {
      for (const o of run.enemies) {
        if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 100) {
          o.burnT = 3;
          o.burnDps = Math.max(o.burnDps, run.derived.dmg * 1.2);
        }
      }
    }
    run.events.push({ t: "bossdown", wave: run.wave });
    announce(run, "SHADOW BOSS DEFEATED!", "The plot holds\u2026 for now.");
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
function checkLevel(run) {
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
function availableUpgrades(run) {
  return UPGRADE_IDS.filter((id) => run.stacks[id] < UPGRADES[id].maxStacks);
}
function abilitySlots(run) {
  return run.abilities.slice(0, MAX_ACTIVE_ABILITIES);
}
function makeOffers(run) {
  const avail = availableUpgrades(run);
  const picks = [];
  const pool = [...avail];
  while (picks.length < 3 && pool.length > 0) {
    const i = Math.floor(run.rng() * pool.length);
    picks.push(pool.splice(i, 1)[0]);
  }
  const offers = picks.map((id) => toOffer(run, id));
  const ownedAb = new Set(run.abilities);
  const poolAb = abilitiesForAltar(run.altarLevel, run.unlocks);
  const unowned = poolAb.filter((a) => a !== "ab-blast" && !ownedAb.has(a));
  const rankable = poolAb.filter((a) => a !== "ab-blast" && ownedAb.has(a) && (run.abilityRank[a] ?? 1) < ABILITY_MAX_RANK);
  const abOdds = Math.min(0.65, (run.level <= 4 ? 0.5 : 0.35) + run.training * 0.05);
  const abPool = [...unowned, ...rankable];
  if (abPool.length > 0 && offers.length > 0 && run.rng() < abOdds) {
    const aid = abPool[Math.floor(run.rng() * abPool.length)];
    const def = ABILITIES[aid];
    const rk = run.abilityRank[aid] ?? 1;
    const isRank = ownedAb.has(aid);
    offers[offers.length - 1] = {
      id: aid,
      name: isRank ? `${def.name} RANK ${rk + 1} [${def.key}]` : `${def.name} [${def.key}]`,
      desc: isRank ? `Rank up: bigger, wider, longer. (ability \xB7 ${def.role})` : `${def.desc} (ability \xB7 ${def.role} \xB7 ${def.rarity})`,
      icon: "\u2605",
      evolved: isRank,
      stacks: isRank ? rk : 0,
      maxStacks: ABILITY_MAX_RANK
    };
  }
  while (offers.length < 3) {
    offers.push({ id: "snack", name: "Snack Break", desc: "Heal 40 HP and stash +10 RF (simulated)", icon: "S", evolved: false, stacks: 0, maxStacks: 99 });
  }
  return offers;
}
function toOffer(run, id) {
  const def = UPGRADES[id];
  const stacks = run.stacks[id];
  const evolved = stacks + 1 >= def.maxStacks && !!def.evolvedName;
  return {
    id,
    name: evolved && def.evolvedName ? def.evolvedName : def.name,
    desc: evolved && def.evolvedDesc ? def.evolvedDesc : def.desc,
    icon: def.icon,
    evolved,
    stacks,
    maxStacks: def.maxStacks
  };
}
function applyUpgrade(run, id) {
  const [fx, fy] = friendPos(run);
  if (id === "snack") {
    run.hp = Math.min(run.maxHp, run.hp + 40);
    bankAdd(run, 10);
    floater(run, fx, fy - 30, "+40 HP  +10", "#2f6b2f", true);
  } else if (id.startsWith("ab-")) {
    const aid = id;
    if (!run.abilities.includes(aid)) {
      run.abilities.push(aid);
      run.abilityRank[aid] = 1;
      while (run.abilities.length > MAX_ACTIVE_ABILITIES) {
        const idx = run.abilities.findIndex((a) => a !== "ab-blast");
        if (idx < 0) break;
        const [dropped] = run.abilities.splice(idx, 1);
        delete run.abilityRank[dropped];
        announce(run, `${ABILITIES[aid].name.toUpperCase()} SWAPPED IN`, `${ABILITIES[dropped]?.name ?? dropped} rotated out (loadout: Blast + 2).`);
      }
      const def = ABILITIES[aid];
      announce(run, def.name.toUpperCase() + " UNLOCKED!", `${def.desc} Press ${def.key}.`);
      floater(run, fx, fy - 36, def.name + "!", "#8a5a00", true);
    } else {
      const rk = Math.min(ABILITY_MAX_RANK, (run.abilityRank[aid] ?? 1) + 1);
      run.abilityRank[aid] = rk;
      const def = ABILITIES[aid];
      announce(run, `${def.name.toUpperCase()} RANK ${rk}!`, "Bigger, wider, longer.");
      floater(run, fx, fy - 36, `${def.name} ${rk}!`, "#8a5a00", true);
      run.events.push({ t: "evolved", name: `${def.name} ${rk}` });
    }
  } else {
    const uid = id;
    const def = UPGRADES[uid];
    if (!def) {
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
function checkGearEvos(run) {
  const fam = run.derived.family;
  const has = (name) => !run.evos.includes(name);
  const grant = (name, sub) => {
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
function isBarrage(run) {
  return run.evos.includes("FRIEND BARRAGE");
}
function isPinball(run) {
  return run.evos.includes("PINBALL");
}
function isThunder(run) {
  return run.evos.includes("THUNDERHEAD");
}
function isLance(run) {
  return run.evos.includes("VOID LANCE");
}
function syncCompanions(run) {
  const [fx, fy] = friendPos(run);
  const want = run.stacks.minifriend >= 3 ? 2 : run.stacks.minifriend >= 1 ? 1 : 0;
  const power = (run.stacks.minifriend >= 2 && want === 1 ? 1.5 : 1) * (1 + run.derived.compDmg + 0.4 * run.stacks.buddy);
  while (run.companions.length < want) {
    run.companions.push({ angle: run.rng() * Math.PI * 2, cd: 0.5, power, x: fx + 30, y: fy + 20 });
  }
  run.companions.length = want;
  for (const c of run.companions) c.power = power;
}
function reroll(run) {
  if (run.bankRf < REROLL_COST || run.rerollsUsed >= 1) return false;
  if (!bankSpend(run, REROLL_COST)) return false;
  run.rerollsUsed++;
  run.offers = makeOffers(run);
  return true;
}
function blast(run) {
  const cd = BLAST_COOLDOWN * (1 - run.derived.cdr - 0.15 * run.stacks.quick);
  if (run.blastCd > 0 || run.over || run.frozen || run.shopOpen) return false;
  run.blastCd = Math.max(8, cd);
  const [fx, fy] = friendPos(run);
  const dmg = run.derived.dmg * dmgMult(run) * BLAST_DMG_MULT;
  for (const e of run.enemies) {
    const dx2 = e.x - fx, dy2 = e.y - fy;
    const d = Math.hypot(dx2, dy2);
    if (d < BLAST_RADIUS_W + e.body) {
      damageEnemy(run, e, dmg, true);
      const push = (e.kind === "boss" ? 24 : 130) + run.derived.knockback;
      const n2 = Math.max(1, d);
      const nx = e.x + dx2 / n2 * push, ny = e.y + dy2 / n2 * push;
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
function heal(run) {
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
function useConsumable(run, id) {
  if (run.over || run.frozen || run.shopOpen) return false;
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
      const dx2 = fx - p.x, dy2 = fy - p.y;
      const d = Math.max(1, Math.hypot(dx2, dy2));
      p.vx = dx2 / d * 320;
      p.vy = dy2 / d * 320;
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
function traderBlockFor(wave) {
  return Math.max(0, Math.floor(wave / 5) - 1);
}
function precomputeShop(run, owned, mods = {}) {
  const block = traderBlockFor(run.wave);
  const stock = traderStock(run.rng, block, owned, {
    ...mods,
    ownedAbilities: [...run.abilities],
    ownedRelics: [...run.relics]
  });
  run.shopPre = stock;
  run.shopPreBlock = block;
  return stock;
}
function genStock(run, owned, mods = {}) {
  const block = traderBlockFor(run.wave);
  if (run.shopPre && run.shopPreBlock === block) {
    const out = run.shopPre;
    run.shopPre = null;
    return out;
  }
  return traderStock(run.rng, block, owned, {
    ...mods,
    ownedAbilities: [...run.abilities],
    ownedRelics: [...run.relics]
  });
}
function summarize(run) {
  return {
    timeSurvived: Math.round(run.time),
    wave: run.wave,
    mapIdx: run.mapIdx,
    kills: run.kills,
    bosses: run.bosses,
    rfEarned: run.earned,
    rfSpent: run.spent,
    gearDrops: [...run.gearDrops]
  };
}
var KEYMAP = {
  w: [-1, -1],
  s: [1, 1],
  a: [-1, 1],
  d: [1, -1],
  arrowup: [-1, -1],
  arrowdown: [1, 1],
  arrowleft: [-1, 1],
  arrowright: [1, -1]
};
function manualStep(run, dt) {
  let dx2 = 0, dy2 = 0;
  for (const k of run.keys) {
    const v = KEYMAP[k];
    if (v) {
      dx2 += v[0];
      dy2 += v[1];
    }
  }
  const mag = Math.hypot(dx2, dy2);
  if (mag > 0) {
    dx2 /= mag;
    dy2 /= mag;
    run.tapDest = null;
  } else if (run.tapDest) {
    const tx = run.tapDest[0] - run.mpos[0], ty = run.tapDest[1] - run.mpos[1];
    const d = Math.hypot(tx, ty);
    if (d < 8) {
      run.tapDest = null;
    } else {
      dx2 = tx / d;
      dy2 = ty / d;
    }
  }
  if (dx2 === 0 && dy2 === 0) {
    run.mwalking = false;
    return;
  }
  const stepLen = FRIEND_SPEED * moveSpeedOf(run) * (run.slowMe > 0 ? 0.55 : 1) * dt;
  const nx = run.mpos[0] + dx2 * stepLen, ny = run.mpos[1] + dy2 * stepLen;
  const nav = run.scene.navigator;
  const from = [run.mpos[0], run.mpos[1]];
  if (nav.segmentClear(from, [nx, ny])) {
    run.mpos = [nx, ny];
    run.mwalking = true;
  } else {
    const sx = [nx, run.mpos[1]];
    const sy = [run.mpos[0], ny];
    if (Math.abs(dx2) > 0.01 && nav.segmentClear(from, sx)) {
      run.mpos = sx;
      run.mwalking = true;
    } else if (Math.abs(dy2) > 0.01 && nav.segmentClear(from, sy)) {
      run.mpos = sy;
      run.mwalking = true;
    } else {
      run.mwalking = false;
      run.tapDest = null;
    }
  }
  run.mpos = [
    Math.min(WORLD_W - 14, Math.max(14, run.mpos[0])),
    Math.min(WORLD_H - 14, Math.max(14, run.mpos[1]))
  ];
  run.mfacing = facingOf(dx2, dy2, run.mfacing);
}
function friendAI(run, dt) {
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
  if (!run.over && !run.frozen && run.phase === "combat") {
    const hurtFrac = run.hp / Math.max(1, run.maxHp);
    const ready = (id) => run.abilities.includes(id) && (run.abilityCd[id] ?? 0) <= 0;
    if (hurtFrac < 0.55 && (ready("ab-barrier") || ready("ab-bulwark") || ready("ab-mend"))) {
      if (ready("ab-barrier")) useAbility(run, "ab-barrier");
      else if (ready("ab-mend") && hurtFrac < 0.5) useAbility(run, "ab-mend");
      else if (ready("ab-bulwark")) useAbility(run, "ab-bulwark");
    }
    if (hurtFrac < 0.35 && (run.cons.heal ?? 0) > 0) useConsumable(run, "heal");
    const raid = run.enemies.find((e) => e.hp > 0 && e.spawnT <= 0 && (e.kind === "saboteur" || e.kind === "thief" || e.kind === "siege") && Math.hypot(e.x - run.home[0], e.y - run.home[1]) < 150);
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
  const pickup = nearestPickup(run, fx, fy);
  if (pickup && threatD > 60 && run.aiT <= 0) {
    run.aiT = 1.2;
    pilotTo(run, [pickup.x, pickup.y]);
    return;
  }
  if (danger && run.aiT <= 0) {
    run.aiT = 0.7;
    run.mood = "kite";
    const dx2 = fx - danger[0], dy2 = fy - danger[1];
    const n2 = Math.max(1, Math.hypot(dx2, dy2));
    const px = -dy2 / n2, py = dx2 / n2;
    run.pathReqs++;
    run.mover.moveTo([
      Math.min(WORLD_W - 24, Math.max(24, fx + px * 70)),
      Math.min(WORLD_H - 24, Math.max(24, fy + py * 70))
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
  if (run.strayHunt) {
    run.mood = "seek";
    if (run.aiT <= 0) {
      run.aiT = 0.5;
      pilotTo(run, [threat.x, threat.y]);
    }
    return;
  }
  const threatReach = threat ? threat.body + FRIEND_BODY + 6 : 30;
  const crowdAt = threat && threat.kind === "boss" ? 100 : 52;
  if (threatD < crowdAt) {
    run.mood = "retreat";
    if (run.aiT <= 0) {
      run.aiT = 0.9;
      const dx2 = fx - threat.x, dy2 = fy - threat.y;
      const n2 = Math.max(1, Math.hypot(dx2, dy2));
      const dist = threat.kind === "boss" ? 135 : 95;
      const dest = [
        Math.min(WORLD_W - 24, Math.max(24, fx + dx2 / n2 * dist)),
        Math.min(WORLD_H - 24, Math.max(24, fy + dy2 / n2 * dist))
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
    const dx2 = threat.x - fx, dy2 = threat.y - fy;
    const n2 = Math.max(1, Math.hypot(dx2, dy2));
    const px = -dy2 / n2 * run.strafeDir, py = dx2 / n2 * run.strafeDir;
    const orbit = Math.max(55, threatReach + 26);
    const dest = [
      Math.min(WORLD_W - 24, Math.max(24, fx + px * orbit)),
      Math.min(WORLD_H - 24, Math.max(24, fy + py * orbit))
    ];
    run.pathReqs++;
    run.mover.moveTo(dest);
  }
}
function ventDanger(run, fx, fy) {
  for (const v of run.vents) {
    if (v.phase === "tele" && Math.hypot(fx - v.x, fy - v.y) < 34) return [v.x, v.y];
  }
  return null;
}
function mageZoneDanger(run, fx, fy) {
  for (const z of run.zones) {
    if (z.kind === "mage" && Math.hypot(fx - z.x, fy - z.y) < z.r) return [z.x, z.y];
  }
  return null;
}
function chargerDanger(run, fx, fy) {
  for (const e of run.enemies) {
    if (e.kind === "charger" && e.chargeState === "tele" || e.kind === "boss" && e.slamT > 0) {
      const px = e.kind === "boss" ? e.slamX : e.x + e.chargeDx * 40;
      const py = e.kind === "boss" ? e.slamY : e.y + e.chargeDy * 40;
      if (Math.hypot(fx - px, fy - py) < 60) return [px, py];
    }
  }
  return null;
}
function nearestPickup(run, fx, fy) {
  let best = null;
  let bestD = 130 * 130;
  for (const p of run.pickups) {
    const dx2 = p.x - fx, dy2 = p.y - fy;
    const d = dx2 * dx2 + dy2 * dy2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}
function stepRun(run, dt) {
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
function step(run, dt) {
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
      if (!run.waveStructHit && run.wave >= 5 && Object.keys(run.structMax).length > 0) {
        run.flawlessWaves++;
        floater(run, hx, hy - 52, "FLAWLESS!", "#8a5a00", true);
      }
    }
    run.intermission -= dt;
    if (run.intermission <= 0) {
      if (run.wave % 5 === 0) openTrader(run);
      else startWave(run, run.wave + 1);
    }
  }
  run.strayHunt = !run.over && run.enemies.length > 0 && run.enemies.length <= 2 && !run.enemies.some((e) => e.kind === "boss") && run.time - run.lastKillT > 12;
  if (run.manual) {
    manualStep(run, dt);
  } else {
    friendAI(run, dt);
    run.mover.update(dt * 1e3 * (run.slowMe > 0 ? 0.55 : 1));
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
  for (const k of Object.keys(run.structOff)) {
    run.structOff[k] -= dt;
    if (run.structOff[k] <= 0) delete run.structOff[k];
  }
  if (run.overchargeT > 0) run.overchargeT -= dt;
  if (run.reflectT > 0) run.reflectT -= dt;
  if (run.domeT > 0) run.domeT -= dt;
  if (run.bulwarkT > 0) {
    run.bulwarkT -= dt;
    if (run.bulwarkT <= 0) {
      run.armor = Math.max(0, run.armor - run.bulwarkArmor);
      run.bulwarkArmor = 0;
    }
  }
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
  if (run.turretLvl > 0 && (run.structHp.turret ?? 1) > 0 && (run.structOff.turret ?? 0) <= 0) {
    const [tx, ty] = run.scene.anchors.turret;
    run.turretCd -= dt * (run.overchargeT > 0 ? 2 : 1);
    const target = nearestEnemy(run, tx, ty, 185, false);
    if (target) run.turretAngle = Math.atan2(target.y - ty, target.x - tx);
    if (run.turretCd <= 0 && target) {
      const dmg = (8 + run.turretLvl * 7) * (1 + run.wave * 0.02);
      const speed = 420;
      run.shots.push({
        x: tx,
        y: ty - 8,
        px: tx,
        py: ty - 8,
        vx: Math.cos(run.turretAngle) * speed,
        vy: Math.sin(run.turretAngle) * speed,
        dmg: Math.round(dmg * 10) / 10,
        pierce: run.turretLvl >= 3 ? 2 : 0,
        bounce: 0,
        explosive: 0,
        explosiveR: 0,
        burnDps: 0,
        burnDur: 0,
        slowF: 1,
        slowDur: 0,
        freeze: false,
        crit: false,
        life: 1.1,
        color: "#3f7fbf",
        size: 4,
        hitIds: []
      });
      run.turretCd = Math.max(0.35, 1.1 - run.turretLvl * 0.15);
    }
    if (!target) run.turretCd = Math.min(run.turretCd, 0.15);
  }
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
  if (run.collectorLvl > 0 && (run.structHp.collector ?? 1) > 0) {
    run.prodTick += collectorRate(run.collectorLvl) / 60 * dt;
    if (run.prodTick >= 1) {
      const whole = Math.floor(run.prodTick);
      run.prodTick -= whole;
      bankAdd(run, whole);
    }
  }
  run.companions.forEach((c) => {
    c.cd -= dt;
    c.angle += dt * 1.4;
    const gx = fx + Math.cos(c.angle) * 42;
    const gy = fy + Math.sin(c.angle) * 42 - 6;
    const dx2 = gx - c.x, dy2 = gy - c.y;
    const d = Math.hypot(dx2, dy2);
    if (d > 2) {
      const stepLen = Math.min(d, 150 * dt);
      const nx = c.x + dx2 / d * stepLen, ny = c.y + dy2 / d * stepLen;
      if (run.scene.navigator.segmentClear([c.x, c.y], [nx, ny])) {
        c.x = nx;
        c.y = ny;
      } else {
        c.x = gx;
        c.y = gy;
      }
    }
    if (c.cd <= 0) {
      const target = nearestEnemy(run, c.x, c.y, 150, false);
      if (target) {
        const ang = Math.atan2(target.y - c.y, target.x - c.x);
        const band = run.relics.includes("re-band") ? 1.5 : 1;
        const dmg = Math.round(run.derived.dmg * dmgMult(run) * 0.4 * c.power * band * 10) / 10;
        run.shots.push({
          x: c.x,
          y: c.y,
          px: c.x,
          py: c.y,
          vx: Math.cos(ang) * 400,
          vy: Math.sin(ang) * 400,
          dmg,
          pierce: 0,
          bounce: 0,
          explosive: 0,
          explosiveR: 0,
          burnDps: run.stacks.burn > 0 ? dmg * 0.5 : 0,
          burnDur: 2,
          slowF: 1,
          slowDur: 0,
          freeze: false,
          crit: false,
          life: 1,
          color: "#7a5fc0",
          size: 4,
          hitIds: []
        });
        c.cd = 1.1;
      } else c.cd = 0.15;
    }
  });
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
  const boss = run.enemies.find((e) => e.kind === "boss");
  if (boss && boss.hp < boss.maxHp * 0.25 && run.shopPreBlock !== traderBlockFor(run.wave)) {
    try {
      precomputeShop(run, []);
    } catch {
    }
  }
  if (run.hp <= 0 && !run.over) {
    run.hp = 0;
    run.over = true;
    run.events.push({ t: "gameover", summary: summarize(run) });
  }
  if ((run.structHp[HOME_CORE.id] ?? 1) <= 0 && !run.over) {
    run.over = true;
    announce(run, "HOME CORE DOWN!", "The invasion is lost \u2014 repair and defend again.");
    run.events.push({ t: "gameover", summary: summarize(run) });
  }
}
function openTrader(run) {
  run.phase = "shop";
  run.intermission = 0;
  const block = Math.max(0, Math.floor(run.wave / 5) - 1);
  const owned = [];
  run.shop = { block, stock: [], rerolls: 0, wave: run.wave };
  void owned;
  run.events.push({ t: "trader", block });
  announce(run, "TRADER ARRIVED", "Spend RF\xB7sim, then continue the defense.");
  if (!run.manual) {
    run.pathReqs++;
    run.mover.moveTo(run.scene.anchors.trader);
  } else run.tapDest = [...run.scene.anchors.trader];
}
function closeTrader(run) {
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
function beginWave(run, wave) {
  run.queue = [];
  run.enemies = [];
  run.shots = [];
  run.bolts = [];
  run.bossId = null;
  run.intermission = 0;
  run.phase = "combat";
  run.routeCache.clear();
  startWave(run, wave);
}
function prepInfo(wave, mapIdx) {
  const plan = planWave(wave, mapIdx);
  const encounter = plan.type === "boss" ? "boss" : planEncounter(wave, mapIdx, plan.type);
  const kinds = plan.type === "boss" ? ["boss"] : [...new Set(unlockedKinds(wave, mapIdx))].slice(0, 6);
  const boss = plan.type === "boss" ? bossSpec(wave).name : null;
  const def = ENCOUNTERS[encounter];
  return { wave, encounter, name: plan.type === "boss" ? boss ?? "BOSS" : def.name, desc: def.desc, kinds, boss };
}
function beginPrep(run, wave) {
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
function stepPrep(run, dt) {
  if (run.phase !== "prep") return false;
  run.prepT += dt;
  return run.prepT > 0.5;
}
function launchWave(run) {
  if (run.phase !== "prep") return;
  run.phase = "combat";
  startWave(run, run.wave);
}
function reanchorMover(run) {
  const [x, y] = run.mpos;
  run.mover = createWorldMovement(run.scene.world, [x, y], { speed: FRIEND_SPEED, radius: 9 });
  run.tapDest = null;
}
function adoptMoverPos(run) {
  const p = run.mover.state.position;
  run.mpos = [p[0], p[1]];
  run.mfacing = run.mover.state.facing;
  run.mover.stop();
  run.tapDest = null;
  run.keys.clear();
}
function applyLoadout(run, derived, weaponTint) {
  run.derived = derived;
  run.weaponTint = weaponTint;
  run.maxHp = derived.maxHp + 30 * run.stacks.vitality;
  run.hp = Math.min(run.hp, run.maxHp);
  run.armor = derived.armor + 2 * run.stacks.ironskin;
  syncCompanions(run);
  checkGearEvos(run);
}
function rerollShop(run, owned) {
  if (!run.shop) return false;
  const cost = rerollCost(run.shop.rerolls);
  if (!bankSpend(run, cost)) return false;
  run.shop.rerolls++;
  const block = run.shop.block;
  const wave = run.shop.wave;
  run.shop = { block, wave, stock: traderStock(run.rng, block, owned), rerolls: run.shop.rerolls };
  return true;
}
function debugShop(run) {
  run.wave = 5;
  run.queue = [];
  run.enemies = [];
  openTrader(run);
}
function updateEnemies(run, dt, fx, fy) {
  const wallR = run.wallLvl > 0 ? BARRICADE_RADIUS : 0;
  const list = run.enemies;
  const commanders = list.filter((o) => o.kind === "commander" && o.hp > 0);
  for (const e of list) {
    e.walkPhase += dt * 6;
    if (e.flash > 0) e.flash -= dt;
    if (e.lungeT > 0) e.lungeT -= dt;
    if (e.spawnT > 0) {
      e.spawnT -= dt;
      continue;
    }
    if (e.burnT > 0) {
      e.burnT -= dt;
      e.hp -= e.burnDps * dt;
      if (run.rng() < dt * 8) burst(run, e.x, e.y - 8, "#c96a2e", 1);
    }
    const dx2 = fx - e.x, dy2 = fy - e.y;
    const dist = Math.hypot(dx2, dy2) || 1;
    let speed = e.speed * (run.strayHunt ? 1.8 : 1);
    for (const m of run.scene.mud) {
      if (Math.hypot(e.x - m.x, e.y - m.y) < m.r) {
        speed *= 0.6;
        break;
      }
    }
    for (const o of commanders) {
      if (o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 110) {
        speed *= 1.25;
        break;
      }
    }
    if (e.slowT > 0) {
      e.slowT -= dt;
      speed *= e.slowF;
    }
    if (wallR > 0 && Math.hypot(e.x - run.home[0], e.y - run.home[1]) < wallR + 70) speed *= 0.65;
    if (e.kind === "boss" && e.mods.includes("Regenerating")) {
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.01 * dt);
    }
    if (e.elite && e.eliteMod === "frenzied") e.atkCd -= dt * 0.3;
    if (e.kind === "charger") {
      updateCharger(run, e, dt, fx, fy, dist);
    } else if (e.kind === "boss") {
      updateBoss(run, e, dt, fx, fy, dist, speed);
    } else if (e.kind === "bomber" || e.kind === "sniper" || e.kind === "orbiter" || e.kind === "blinker" || e.kind === "leaper" || e.kind === "mage" || e.kind === "burrower" || e.kind === "commander" || e.kind === "drainer" || e.kind === "saboteur" || e.kind === "thief" || e.kind === "artillery" || e.kind === "necromancer" || e.kind === "traplayer" || e.kind === "siege") {
      updateSpecial(run, e, dt, fx, fy, dist, speed);
    } else {
      updateChaser(run, e, dt, fx, fy, dist, speed);
    }
    if (e.kind === "support") supportPulse(run, e, dt);
  }
  separate(run, list, dt);
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].hp <= 0) {
      const [dead] = list.splice(i, 1);
      killEnemy(run, dead);
      if (run.frozen || run.over) return;
    }
  }
  for (const e of list) watchdog(run, e, dt);
}
function updateSpecial(run, e, dt, fx, fy, dist, speed) {
  if (e.kind === "mage" || e.kind === "burrower" || e.kind === "commander" || e.kind === "drainer") {
    updateTactical(run, e, dt, fx, fy, dist, speed);
    return;
  }
  if (e.kind === "saboteur" || e.kind === "thief" || e.kind === "artillery" || e.kind === "necromancer" || e.kind === "traplayer" || e.kind === "siege" || e.kind === "cryo" || e.kind === "corrupter" || e.kind === "elitehunter" || e.kind === "minimage" || e.kind === "minisiege") {
    updateRaider(run, e, dt, fx, fy, dist, speed);
    return;
  }
  if (e.kind === "minibrute") {
    updateCharger(run, e, dt, fx, fy, dist);
    return;
  }
  const reach = e.body + FRIEND_BODY + 5;
  if (e.kind === "bomber") {
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
        e.hp = 0;
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
    if (dist < 150) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
      e.aimT = 0;
      return;
    }
    if (dist > 320) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
      e.aimT = 0;
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.aimT += dt;
    if (e.aimT < 1.2) {
      if (e.aimT < 0.9) {
        e.aimDx = (fx - e.x) / dist;
        e.aimDy = (fy - e.y) / dist;
      }
      return;
    }
    e.aimT = -2.2;
    const sp = 300;
    run.bolts.push({
      x: e.x,
      y: e.y,
      px: e.x,
      py: e.y,
      vx: e.aimDx * sp,
      vy: e.aimDy * sp,
      dmg: e.dmg,
      life: 2.5
    });
    burst(run, e.x, e.y, "#3f7fbf", 3);
    run.events.push({ t: "eshot" });
    return;
  }
  if (e.kind === "orbiter") {
    e.orbitT -= dt;
    const wantR = 130;
    const ang = Math.atan2(e.y - fy, e.x - fx) + e.orbitDir * speed * dt / Math.max(40, dist);
    const tx = fx + Math.cos(ang) * wantR, ty = fy + Math.sin(ang) * wantR;
    const dx2 = tx - e.x, dy2 = ty - e.y;
    const d = Math.hypot(dx2, dy2);
    if (d > 0.5) {
      const nx = e.x + dx2 / d * speed * dt, ny = e.y + dy2 / d * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    }
    if (e.orbitT <= 0 && dist < wantR + 30) {
      e.orbitT = 3;
      e.atkCd = 0;
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
      if (isWorldWalkable(run.scene.world, [nx, ny], 8) && regionAt(run.scene.regions, nx, ny) === run.scene.regions.homeId && Math.hypot(nx - fx, ny - fy) > 60) {
        burst(run, e.x, e.y, "#7a5fc0", 6);
        e.x = Math.min(WORLD_W - 14, Math.max(14, nx));
        e.y = Math.min(WORLD_H - 14, Math.max(14, ny));
        e.skipPhase = 0.4;
        e.waypoints = [];
        e.repathT = 0;
      }
      return;
    }
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    return;
  }
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
        e.atkCd = 1;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    if (e.chargeCd <= 0 && dist < 200 && dist > 60) {
      e.leapState = "tele";
      e.leapT = 0.6;
      e.leapX = fx;
      e.leapY = fy;
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
      e.chargeDx = e.x;
      e.chargeDy = e.y;
    }
    return;
  }
  e.leapT -= dt;
  {
    const k = Math.max(0, Math.min(1, 1 - e.leapT / 0.35));
    e.px = e.x;
    e.py = e.y;
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
}
function updateTactical(run, e, dt, fx, fy, dist, speed) {
  const reach = e.body + FRIEND_BODY + 5;
  if (e.kind === "mage") {
    if (dist < 130) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
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
        if (e.atkCd <= 0) {
          e.atkCd = 1.1;
          e.lungeT = 0.28;
          meleeHit(run, e, e.dmg, fx, fy);
        }
      }
      if (e.burrowT <= 0) {
        e.burrowState = "down";
        e.burrowT = 0.7;
        e.burrowX = fx;
        e.burrowY = fy;
        burst(run, e.x, e.y, "#8a7a5a", 10);
      }
      return;
    }
    if (e.burrowState === "down") {
      if (e.burrowT <= 0) {
        e.burrowState = "up";
        e.burrowT = 0.5;
        e.x = Math.min(WORLD_W - 14, Math.max(14, e.burrowX));
        e.y = Math.min(WORLD_H - 14, Math.max(14, e.burrowY));
        burst(run, e.x, e.y, "#8a7a5a", 14);
        if (Math.hypot(fx - e.x, fy - e.y) < 40 + FRIEND_BODY) hurtFriend(run, e.dmg);
      }
      return;
    }
    if (e.burrowT <= 0) {
      e.burrowState = "roam";
      e.burrowT = 3 + run.rng() * 2;
    }
    return;
  }
  if (e.kind === "commander") {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    for (const o of run.enemies) {
      if (o === e || o.kind === "boss") continue;
      if (Math.hypot(o.x - e.x, o.y - e.y) < 110) o.lungeT = Math.max(o.lungeT, 0.01);
    }
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, speed * dt);
    } else {
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1.2;
        e.lungeT = 0.28;
        meleeHit(run, e, e.dmg, fx, fy);
      }
    }
    return;
  }
  if (e.kind === "drainer") {
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
function updateRaider(run, e, dt, fx, fy, dist, speed) {
  const seek = (tx, ty, sp) => {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 0.8;
      requestRoute(run, e, [tx, ty]);
    }
    followWaypoints(run, e, sp * dt);
  };
  if (e.kind === "saboteur") {
    const tgt2 = structureTarget(run, "structure");
    if (!tgt2) {
      seek(fx, fy, speed);
    } else {
      const d = Math.hypot(tgt2.x - e.x, tgt2.y - e.y);
      if (d > e.body + 16) seek(tgt2.x, tgt2.y, speed * 1.1);
      else {
        e.facing = facingOf(tgt2.x - e.x, tgt2.y - e.y, e.facing);
        e.structCd -= dt;
        if (e.structCd <= 0) {
          e.structCd = 4;
          damageStructure(run, tgt2.id, e.dmg * 1.5);
          run.structOff[tgt2.id] = Math.max(run.structOff[tgt2.id] ?? 0, 6);
          burst(run, tgt2.x, tgt2.y, "#e8c53a", 10);
          floater(run, tgt2.x, tgt2.y - 24, "SABOTAGED!", "#d93a3a", true);
        }
      }
    }
    return;
  }
  if (e.kind === "thief") {
    const col = run.scene.anchors.collector;
    if (!e.fleeing) {
      const d = Math.hypot(col[0] - e.x, col[1] - e.y);
      if (!(run.structHp.collector > 0)) {
        seek(fx, fy, speed);
      } else if (d > e.body + 14) seek(col[0], col[1], speed * 1.15);
      else {
        e.structCd -= dt;
        if (e.structCd <= 0 && run.bankRf > 0) {
          e.structCd = 1.5;
          const take = Math.min(run.bankRf, 4 + Math.floor(run.wave / 2));
          run.bankRf -= take;
          e.stolen += take;
          run.stolenLost += take;
          run.events.push({ t: "stolen", amount: take });
          burst(run, col[0], col[1], "#7db83e", 6);
          if (e.stolen >= 12) e.fleeing = true;
        }
      }
      if (dist < 40) {
        e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      }
    } else {
      const gates = run.scene.gates;
      const g = gates.length > 0 ? gates[e.id % gates.length] : run.home;
      const d = Math.hypot(g[0] - e.x, g[1] - e.y);
      if (d < 24) {
        e.hp = 0;
        floater(run, e.x, e.y - 20, "ESCAPED!", "#d93a3a", true);
        return;
      }
      seek(g[0], g[1], speed * 1.25);
    }
    return;
  }
  if (e.kind === "artillery") {
    const tgt2 = structureTarget(run, "structure");
    const ax = tgt2 ? tgt2.x : fx, ay = tgt2 ? tgt2.y : fy;
    const d = Math.hypot(ax - e.x, ay - e.y);
    if (d > 260) {
      seek(ax, ay, speed);
      return;
    }
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
    e.reviveT -= dt;
    if (e.reviveT <= 0 && run.corpses.length > 0 && run.enemies.length < MAX_ENEMIES - 1) {
      e.reviveT = 9;
      const c = run.corpses.pop();
      if (c) {
        burst(run, c.x, c.y, "#5b3f8c", 12);
        summonMinionKind(run, { x: c.x, y: c.y }, "shadow");
        floater(run, c.x, c.y - 22, "RISE!", "#5b3f8c", true);
      }
    }
    if (dist < 150) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
      return;
    }
    if (dist > 200) {
      seek(fx, fy, speed);
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0) {
      e.shootCd = 2.4;
      const d = Math.max(1, Math.hypot(fx - e.x, fy - e.y));
      const sp = 300;
      run.bolts.push({
        x: e.x,
        y: e.y,
        px: e.x,
        py: e.y,
        vx: (fx - e.x) / d * sp,
        vy: (fy - e.y) / d * sp,
        dmg: e.dmg,
        life: 2.5
      });
      burst(run, e.x, e.y, "#5b3f8c", 3);
      run.events.push({ t: "eshot" });
    }
    return;
  }
  if (e.kind === "traplayer") {
    e.mineT -= dt;
    if (e.mineT <= 0 && run.traps.length < 10) {
      e.mineT = 4.5;
      run.traps.push({ x: e.x, y: e.y, r: 30, ttl: 20, dmg: e.dmg, foe: true, slowF: 0.5 });
      burst(run, e.x, e.y, "#8a7a5a", 4);
    }
    const want = 120;
    if (dist > want + 30) {
      seek(fx, fy, speed);
      return;
    }
    if (dist < want - 30) {
      const nx2 = e.x + (e.x - fx) / dist * speed * dt;
      const ny2 = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx2, ny2])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx2;
        e.y = ny2;
      }
      return;
    }
    const a = Math.atan2(e.y - fy, e.x - fx) + dt * 1.2;
    const nx = fx + Math.cos(a) * want, ny = fy + Math.sin(a) * want;
    e.px = e.x;
    e.py = e.y;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.x = nx;
      e.y = ny;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    return;
  }
  if (e.kind === "cryo") {
    if (dist > 200) {
      seek(fx, fy, speed);
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0 && dist < 260) {
      e.shootCd = 2.2;
      const d = Math.max(1, dist);
      const sp = 280;
      run.bolts.push({
        x: e.x,
        y: e.y,
        px: e.x,
        py: e.y,
        vx: (fx - e.x) / d * sp,
        vy: (fy - e.y) / d * sp,
        dmg: e.dmg,
        life: 2.5,
        chill: true
      });
      burst(run, e.x, e.y, "#9db8dd", 3);
      run.events.push({ t: "eshot" });
    }
    return;
  }
  if (e.kind === "corrupter") {
    for (let i = run.pickups.length - 1; i >= 0; i--) {
      const p = run.pickups[i];
      if (Math.hypot(p.x - e.x, p.y - e.y) < 26) {
        run.pickups.splice(i, 1);
        burst(run, p.x, p.y, "#5b3f8c", 5);
        e.hp = Math.min(e.maxHp, e.hp + 4);
      }
    }
    if (dist > e.body + FRIEND_BODY + 5) {
      seek(fx, fy, speed);
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1.1;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
    return;
  }
  if (e.kind === "elitehunter") {
    let tx = fx, ty = fy;
    let bd = Infinity;
    for (const c of run.companions) {
      const d2 = Math.hypot(c.x - e.x, c.y - e.y);
      if (d2 < bd) {
        bd = d2;
        tx = c.x;
        ty = c.y;
      }
    }
    for (const w of run.wisps) {
      const d2 = Math.hypot(w.x - e.x, w.y - e.y);
      if (d2 < bd) {
        bd = d2;
        tx = w.x;
        ty = w.y;
      }
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
    if (e.atkCd <= 0) {
      e.atkCd = 0.8;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
    return;
  }
  if (e.kind === "minimage") {
    let living = 0;
    for (const o of run.enemies) if (o !== e && o.kind !== "boss") living++;
    e.reviveT -= dt;
    if (e.reviveT <= 0 && living < 4 && run.enemies.length < MAX_ENEMIES - 2) {
      e.reviveT = 7;
      summonMinionKind(run, e, run.rng() < 0.5 ? "swarm" : "shadow");
      burst(run, e.x, e.y, "#c9a8ff", 10);
    }
    if (dist > 210) {
      seek(fx, fy, speed);
      return;
    }
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.shootCd -= dt;
    if (e.shootCd <= 0) {
      e.shootCd = 2;
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
    const tgt2 = structureTarget(run, "structure");
    if (tgt2 && dist > 200) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
        requestRoute(run, e, [tgt2.x, tgt2.y]);
      }
      followWaypoints(run, e, speed * dt);
      return;
    }
    if (dist > e.body + FRIEND_BODY + 5) {
      seek(fx, fy, speed);
      return;
    }
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
  const tgt = structureTarget(run, "structure");
  if (tgt) {
    const d = Math.hypot(tgt.x - e.x, tgt.y - e.y);
    if (d > e.body + 20) {
      seek(tgt.x, tgt.y, speed);
      return;
    }
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
function updateChaser(run, e, dt, fx, fy, dist, speed) {
  const reach = e.stopDist > 0 ? e.stopDist : e.body + FRIEND_BODY + 5;
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 && (e.waypoints.length === 0 || Math.hypot(fx - e.goalX, fy - e.goalY) > 40)) {
      e.repathT = 1.2 + run.rng() * 1;
      let goal = e.stopDist > 0 ? [fx + (e.x - fx) / dist * e.stopDist, fy + (e.y - fy) / dist * e.stopDist] : [fx, fy];
      if (e.stopDist > 0 && !isWorldWalkable(run.scene.world, goal, 6)) goal = [fx, fy];
      requestRoute(run, e, goal, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
    if (e.stopDist > 0 && dist < 70) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    }
  } else if (e.stopDist === 0) {
    e.facing = facingOf(dx(fx, e.x), dy(fy, e.y), e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = e.elite && e.eliteMod === "frenzied" ? 0.7 : 1;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
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
      e.shootCd = Math.max(1.4, (e.kind === "summoner" ? 2.6 : 2.2) - run.wave * 0.03);
      const ang = Math.atan2(fy - e.y, fx - e.x);
      run.bolts.push({
        x: e.x,
        y: e.y,
        px: e.x,
        py: e.y,
        vx: Math.cos(ang) * 150,
        vy: Math.sin(ang) * 150,
        dmg: e.dmg,
        life: 3
      });
      burst(run, e.x, e.y, "#7a5fc0", 2);
      if (e.kind === "summoner") {
        e.summonT -= dt * 10;
        if (e.summonT <= 0 && run.enemies.length < MAX_ENEMIES - 1 && run.enemies.length < 40) {
          e.summonT = 9;
          summonMinion(run, e);
          floater(run, e.x, e.y - 30, "SUMMON", "#7a5fc0", true);
        }
      }
    }
  }
}
function dx(a, b) {
  return a - b;
}
function dy(a, b) {
  return a - b;
}
function meleeHit(run, e, dmg, fx, fy) {
  const lost = hurtFriend(run, dmg);
  burst(run, fx, fy, "#b03a3a", 5);
  if (lost > 0 && run.derived.thorns > 0) {
    damageEnemy(run, e, dmg * run.derived.thorns, false);
  }
}
function laneKey(fx, fy, gx, gy) {
  const q = (v) => Math.round(v / 28);
  return `${q(fx)},${q(fy)}>${q(gx)},${q(gy)}`;
}
function requestRoute(run, e, goal, fallback) {
  run.pathReqs++;
  const dx0 = goal[0] - e.x, dy0 = goal[1] - e.y;
  const d0 = Math.hypot(dx0, dy0);
  if (d0 > 60) {
    const key = laneKey(e.x, e.y, goal[0], goal[1]);
    const hit = run.routeCache.get(key);
    if (hit && hit.length > 0) {
      e.waypoints = [...hit];
      e.goalX = goal[0];
      e.goalY = goal[1];
      return;
    }
  }
  const dx2 = goal[0] - e.x, dy2 = goal[1] - e.y;
  const d = Math.hypot(dx2, dy2);
  if (d > 230) {
    const leg = [e.x + dx2 / d * 200, e.y + dy2 / d * 200];
    if (isWorldWalkable(run.scene.world, leg, 6)) {
      const short = run.scene.navigator.route([e.x, e.y], leg);
      if (short) {
        e.waypoints = short.length > 0 ? short : [leg];
        e.goalX = goal[0];
        e.goalY = goal[1];
        if (run.routeCache.size < 48) run.routeCache.set(laneKey(e.x, e.y, leg[0], leg[1]), [...e.waypoints]);
        return;
      }
    }
    e.waypoints = [goal];
    return;
  }
  const route = run.scene.navigator.route([e.x, e.y], goal);
  if (!route && fallback) {
    const fb = run.scene.navigator.route([e.x, e.y], fallback);
    if (fb) {
      e.waypoints = fb.length > 0 ? fb : [fallback];
      e.goalX = fallback[0];
      e.goalY = fallback[1];
      if (run.routeCache.size < 48) run.routeCache.set(laneKey(e.x, e.y, fallback[0], fallback[1]), [...e.waypoints]);
      return;
    }
  }
  if (!route) {
    e.stuckFails++;
    e.repathT = 0.5;
    if (e.stuckFails >= 3) {
      const spot = validatedSpawn(run);
      e.x = spot[0];
      e.y = spot[1];
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
function followWaypoints(run, e, stepLen) {
  const wp = e.waypoints[0];
  if (!wp) return;
  const wx = wp[0] - e.x, wy = wp[1] - e.y;
  const wd = Math.hypot(wx, wy);
  if (wd < 7) {
    e.waypoints.shift();
    return;
  }
  const nx = e.x + wx / wd * stepLen, ny = e.y + wy / wd * stepLen;
  if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
    e.px = e.x;
    e.py = e.y;
    e.x = nx;
    e.y = ny;
    e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
  } else {
    e.waypoints.shift();
    const sx = -wy / wd, sy = wx / wd;
    const s1x = e.x + sx * stepLen, s1y = e.y + sy * stepLen;
    const s2x = e.x - sx * stepLen, s2y = e.y - sy * stepLen;
    if (run.scene.navigator.segmentClear([e.x, e.y], [s1x, s1y])) {
      e.px = e.x;
      e.py = e.y;
      e.x = s1x;
      e.y = s1y;
    } else if (run.scene.navigator.segmentClear([e.x, e.y], [s2x, s2y])) {
      e.px = e.x;
      e.py = e.y;
      e.x = s2x;
      e.y = s2y;
    }
    e.repathT = Math.min(e.repathT, 0.4);
  }
}
function updateCharger(run, e, dt, fx, fy, dist) {
  if (e.chargeState === "roam") {
    e.chargeCd -= dt;
    const reach = e.body + FRIEND_BODY + 5;
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 && (e.waypoints.length === 0 || Math.hypot(fx - e.goalX, fy - e.goalY) > 48)) {
        e.repathT = 1 + run.rng() * 0.6;
        requestRoute(run, e, [fx, fy]);
      }
      followWaypoints(run, e, e.speed * dt);
    } else {
      e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
      e.atkCd -= dt;
      if (e.atkCd <= 0) {
        e.atkCd = 1;
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
    if (e.chargeT > 0.2) {
      const n2 = Math.max(1, dist);
      e.chargeDx = (fx - e.x) / n2;
      e.chargeDy = (fy - e.y) / n2;
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
      e.px = e.x;
      e.py = e.y;
      e.x = nx;
      e.y = ny;
    } else {
      e.chargeT = 0;
    }
    burst(run, e.x, e.y, "#c96a2e", 1);
    if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
      meleeHit(run, e, Math.round(e.dmg * 1.5), fx, fy);
      e.chargeT = 0;
      e.chargeCd = 4;
      e.chargeState = "roam";
      return;
    }
    if (e.chargeT <= 0) {
      e.chargeState = "vuln";
      e.chargeT = 1.2;
      e.chargeCd = 4;
      floater(run, e.x, e.y - 22, "WIDE OPEN!", "#8a5a00", true);
    }
  } else {
    e.chargeT -= dt;
    if (dist > e.body + FRIEND_BODY + 5) followWaypoints(run, e, e.speed * 0.4 * dt);
    if (e.chargeT <= 0) e.chargeState = "roam";
  }
}
function updateOrbitals(run, dt, fx, fy) {
  if (run.derived.family !== "orbital") return;
  run.orbTick -= dt;
  if (run.orbTick > 0) return;
  run.orbTick = 0.33;
  const count = Math.max(2, projectileCount(run));
  const dmg = run.derived.dmg * dmgMult(run) * 0.8;
  for (let i = 0; i < count; i++) {
    const a = run.time * 2.4 + i * Math.PI * 2 / count;
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
function updateZones(run, dt, fx, fy) {
  for (let i = run.zones.length - 1; i >= 0; i--) {
    const z = run.zones[i];
    z.ttl -= dt;
    if (z.ttl <= 0) {
      run.zones.splice(i, 1);
      continue;
    }
    if (z.kind === "mage") {
      if (Math.hypot(fx - z.x, fy - z.y) < z.r) hurtFriend(run, z.dps * dt);
    } else {
      for (const e of run.enemies) {
        if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + e.body) {
          e.slowT = Math.max(e.slowT, 0.3);
          e.slowF = Math.min(e.slowF || 1, z.slowF);
          if (z.kind === "gravity") {
            const d = Math.max(1, Math.hypot(e.x - z.x, e.y - z.y));
            e.x += (z.x - e.x) / d * 26 * dt;
            e.y += (z.y - e.y) / d * 26 * dt;
          }
        }
      }
    }
  }
}
function updateTraps(run, dt, fx, fy) {
  for (let i = run.traps.length - 1; i >= 0; i--) {
    const tr = run.traps[i];
    tr.ttl -= dt;
    if (tr.ttl <= 0) {
      run.traps.splice(i, 1);
      continue;
    }
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
          e.slowT = Math.max(e.slowT, 1.5);
          e.slowF = Math.min(e.slowF || 1, tr.slowF);
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
function updateWisps(run, dt, fx, fy) {
  void fx;
  void fy;
  for (let i = run.wisps.length - 1; i >= 0; i--) {
    const w = run.wisps[i];
    w.ttl -= dt;
    if (w.ttl <= 0) {
      run.wisps.splice(i, 1);
      continue;
    }
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
          x: w.x,
          y: w.y,
          px: w.x,
          py: w.y,
          vx: Math.cos(ang) * 400,
          vy: Math.sin(ang) * 400,
          dmg,
          pierce: 0,
          bounce: 0,
          explosive: 0,
          explosiveR: 0,
          burnDps: 0,
          burnDur: 0,
          slowF: 1,
          slowDur: 0,
          freeze: false,
          crit: false,
          life: 1,
          color: "#9db8dd",
          size: 4,
          hitIds: []
        });
        w.cd = 0.9;
      } else w.cd = 0.2;
    }
  }
}
function updateStrikes(run, dt) {
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
function abilityCd(run, id) {
  if (id === "ab-blast") return Math.max(0, run.blastCd);
  return Math.max(0, run.abilityCd[id] ?? 0);
}
function abilityCdMax(run, id) {
  const def = ABILITIES[id];
  if (id === "ab-blast") return Math.max(8, BLAST_COOLDOWN * (1 - run.derived.cdr - 0.15 * run.stacks.quick));
  if (id === "ab-dash") return dashCooldown(run) * abilityCdScale(run);
  return def.cd * abilityCdScale(run);
}
function useAbility(run, id) {
  if (run.over || run.frozen || run.shopOpen) return false;
  if (id !== "ab-blast" && !run.abilities.includes(id)) return false;
  if (abilityCd(run, id) > 0) return false;
  const [fx, fy] = friendPos(run);
  if (id === "ab-blast") return blast(run);
  if (id === "ab-dash") {
    let dx2 = 0, dy2 = 0;
    for (const k of run.keys) {
      const v = KEYMAP[k];
      if (v) {
        dx2 += v[0];
        dy2 += v[1];
      }
    }
    if (dx2 === 0 && dy2 === 0 && run.aimMode === "mouse" && run.aimSet) {
      dx2 = run.aimWorld[0] - fx;
      dy2 = run.aimWorld[1] - fy;
    }
    if (dx2 === 0 && dy2 === 0) {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        dx2 = fx - t.x;
        dy2 = fy - t.y;
      } else {
        dx2 = 1;
        dy2 = 0;
      }
    }
    const n2 = Math.max(0.01, Math.hypot(dx2, dy2));
    for (const f of [1, 0.6, 0.3]) {
      const nx = fx + dx2 / n2 * 70 * f, ny = fy + dy2 / n2 * 70 * f;
      if (run.scene.navigator.segmentClear([fx, fy], [nx, ny])) {
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
        const n2 = Math.max(1, d);
        const nx = e.x + ddx / n2 * 90, ny = e.y + ddy / n2 * 90;
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
      tx = run.aimWorld[0];
      ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        tx = t.x;
        ty = t.y;
      }
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
    let dx2 = 0, dy2 = 0;
    if (run.aimMode === "mouse" && run.aimSet) {
      dx2 = run.aimWorld[0] - fx;
      dy2 = run.aimWorld[1] - fy;
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        dx2 = t.x - fx;
        dy2 = t.y - fy;
      } else {
        dx2 = 1;
        dy2 = 0;
      }
    }
    const n2 = Math.max(0.01, Math.hypot(dx2, dy2));
    const nx = fx + dx2 / n2 * 95, ny = fy + dy2 / n2 * 95;
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
    if (run.aimMode === "mouse" && run.aimSet) {
      tx = run.aimWorld[0];
      ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        tx = t.x;
        ty = t.y;
      }
    }
    for (const e of run.enemies) {
      if (e.kind === "boss") continue;
      const d = Math.hypot(e.x - tx, e.y - ty);
      if (d < 150) {
        const n2 = Math.max(1, d);
        const nx = tx + (e.x - tx) / n2 * 46, ny = ty + (e.y - ty) / n2 * 46;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
          e.x = nx;
          e.y = ny;
        }
        e.slowT = Math.max(e.slowT, 2.5);
        e.slowF = Math.min(e.slowF || 1, 0.55);
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
    void tx;
    void ty;
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-freeze") {
    let tx = fx, ty = fy - 60;
    if (run.aimMode === "mouse" && run.aimSet) {
      tx = run.aimWorld[0];
      ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        tx = t.x;
        ty = t.y;
      }
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
    const n2 = rank >= 2 ? 2 : 1;
    for (let i = 0; i < n2 && run.wisps.length < 3; i++) {
      run.wisps.push({ x: fx, y: fy, cd: 0.3, ttl: 25, power: 1 + (rank - 1) * 0.5, angle: run.rng() * Math.PI * 2 });
    }
    floater(run, fx, fy - 30, n2 > 1 ? "WISPS!" : "WISP!", "#9db8dd", true);
    burst(run, fx, fy, "#9db8dd", 14);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "heal" });
    return true;
  }
  if (id === "ab-overcharge") {
    run.overchargeT = 8 + (rank - 1) * 4;
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
    if (run.aimMode === "mouse" && run.aimSet) {
      tx = run.aimWorld[0];
      ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        tx = t.x;
        ty = t.y;
      }
    }
    const n2 = 1 + (rank >= 2 ? 1 : 0) + (rank >= 3 ? 1 : 0);
    for (let i = 0; i < n2 && run.traps.length < 10; i++) {
      run.traps.push({
        x: tx + (run.rng() - 0.5) * 40,
        y: ty + (run.rng() - 0.5) * 30,
        r: 34,
        ttl: 30,
        dmg: run.derived.dmg * dmgMult(run) * (2 + rank),
        foe: false,
        slowF: 0.5
      });
    }
    floater(run, tx, ty - 24, n2 > 1 ? "TRAPS SET!" : "TRAP SET!", "#7db83e", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    return true;
  }
  if (id === "ab-piercing") {
    let ang;
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
        const n2 = Math.max(1, Math.hypot(e.x - fx, e.y - fy));
        const nx = e.x + (e.x - fx) / n2 * 40, ny = e.y + (e.y - fy) / n2 * 40;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
          e.x = nx;
          e.y = ny;
        }
        burst(run, e.x, e.y, run.weaponTint, 3);
      }
    }
    run.beamT = 0.12;
    run.beamAng = ang;
    burst(run, fx + Math.cos(ang) * 20, fy + Math.sin(ang) * 20, "#ffffff", 6);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-mortar") {
    let tx = fx, ty = fy - 100;
    if (run.aimMode === "mouse" && run.aimSet) {
      tx = run.aimWorld[0];
      ty = run.aimWorld[1];
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        tx = t.x;
        ty = t.y;
      }
    }
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
        const n2 = Math.max(1, d);
        const nx = e.x + (e.x - fx) / n2 * 70, ny = e.y + (e.y - fy) / n2 * 70;
        if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
          e.x = nx;
          e.y = ny;
        }
      }
    }
    for (let i = run.bolts.length - 1; i >= 0; i--) {
      const b = run.bolts[i];
      if (Math.hypot(b.x - fx, b.y - fy) < r) {
        burst(run, b.x, b.y, "#9db8dd", 2);
        run.bolts.splice(i, 1);
      }
    }
    burst(run, fx, fy, "#9db8dd", 22);
    run.shake = Math.max(run.shake, 0.3);
    floater(run, fx, fy - 30, "CYCLONE!", "#9db8dd", true);
    run.abilityCd[id] = ABILITIES[id].cd * abilityCdScale(run);
    run.events.push({ t: "blast" });
    return true;
  }
  if (id === "ab-blade") {
    let ang;
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
      const n2 = Math.max(1, d);
      const nx = e.x + (e.x - fx) / n2 * 110, ny = e.y + (e.y - fy) / n2 * 110;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.x = nx;
        e.y = ny;
      }
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
    let dx2 = 0, dy2 = 0;
    if (run.aimMode === "mouse" && run.aimSet) {
      dx2 = run.aimWorld[0] - fx;
      dy2 = run.aimWorld[1] - fy;
    } else {
      const t = nearestEnemy(run, fx, fy, 9999, false);
      if (t) {
        dx2 = t.x - fx;
        dy2 = t.y - fy;
      } else {
        dx2 = 1;
        dy2 = 0;
      }
    }
    const n2 = Math.max(0.01, Math.hypot(dx2, dy2));
    const lx = fx + dx2 / n2 * 150, ly = fy + dy2 / n2 * 150;
    if (run.scene.navigator.segmentClear([fx, fy], [lx, ly])) {
      run.mpos = [Math.min(WORLD_W - 14, Math.max(14, lx)), Math.min(WORLD_H - 14, Math.max(14, ly))];
      reanchorMover(run);
    }
    run.iframes = Math.max(run.iframes, 0.4);
    const [lfx, lfy] = friendPos(run);
    explode(run, lfx, lfy, 70 + (rank - 1) * 20, run.derived.dmg * dmgMult(run) * (2.5 + rank));
    for (const e of run.enemies) {
      if (Math.hypot(e.x - lfx, e.y - lfy) < 80 && e.kind !== "boss") {
        e.slowT = Math.max(e.slowT, 1.5);
        e.slowF = Math.min(e.slowF || 1, 0);
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
        e.slowT = Math.max(e.slowT, 2);
        e.slowF = Math.min(e.slowF || 1, 0.5);
        continue;
      }
      e.slowT = Math.max(e.slowT, dur);
      e.slowF = Math.min(e.slowF || 1, 0);
      const n2 = Math.max(1, Math.hypot(e.x - fx, e.y - fy));
      const nx = e.x + (e.x - fx) / n2 * 50, ny = e.y + (e.y - fy) / n2 * 50;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.x = nx;
        e.y = ny;
      }
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
function updateBoss(run, e, dt, fx, fy, dist, speed) {
  const pattern = e.pattern ?? "brute";
  const reach = e.body + FRIEND_BODY + 6;
  const wantPhase = e.hp > e.maxHp * 0.6 ? 0 : e.hp > e.maxHp * 0.3 ? 1 : 2;
  if (wantPhase > e.phase) {
    e.phase = wantPhase;
    announce(run, `${e.bossName} ENRAGED`, e.phase === 1 ? "It fights harder!" : "Final fury!");
    run.events.push({ t: "elite" });
  }
  e.addT -= dt;
  if (e.addT <= 0 && run.enemies.length < 30) {
    e.addT = 15 - e.phase * 3;
    const kinds = pattern === "artillerist" ? ["ranged", "swift"] : pattern === "warden" ? ["shield", "tank"] : pattern === "swarmkeeper" ? ["swarm", "swarm"] : pattern === "siegebreaker" ? ["siege", "saboteur", "shield"] : ["swift", "shadow"];
    const k = kinds[Math.floor(run.rng() * kinds.length)];
    const base = baseSpec(k);
    run.enemies.push({
      id: run.nextId++,
      kind: k,
      x: e.x + (run.rng() - 0.5) * 80,
      y: e.y + (run.rng() - 0.5) * 60,
      hp: Math.round(base.hp * waveHpMult(run.wave)),
      maxHp: Math.round(base.hp * waveHpMult(run.wave)),
      dmg: Math.round(base.dmg * waveDmgMult(run.wave)),
      speed: (ENEMY_SPEED[k] ?? 36) * waveSpeedMult(run.wave),
      xp: base.xp,
      rf: base.rf,
      radius: base.radius,
      body: BODY_R[k] ?? 8,
      stopDist: base.range > 0 ? 120 : 0,
      slowT: 0,
      slowF: 1,
      burnT: 0,
      burnDps: 0,
      shieldHp: 0,
      shieldMax: 0,
      elite: false,
      eliteMod: null,
      mods: [],
      pattern: null,
      bossName: "",
      phase: 0,
      wardT: 0,
      wardDown: 0,
      blinkT: 0,
      addT: 0,
      atkCd: 0.8,
      shootCd: 1 + run.rng(),
      burstT: 99,
      summonT: 99,
      slamT: 0,
      slamX: 0,
      slamY: 0,
      slamCd: 99,
      chargeState: "roam",
      chargeT: 0,
      chargeDx: 0,
      chargeDy: 0,
      chargeCd: 99,
      fuseT: 0,
      aimT: 0,
      aimDx: 0,
      aimDy: 0,
      orbitDir: 1,
      orbitT: 0,
      skipT: 4,
      skipPhase: 0,
      leapState: "roam",
      leapT: 0,
      leapX: 0,
      leapY: 0,
      burrowState: "roam",
      burrowT: 3,
      burrowX: 0,
      burrowY: 0,
      mageCd: 3,
      drainT: 0,
      objective: "friend",
      structCd: 1,
      stolen: 0,
      mineT: 3,
      reviveT: 6,
      bombardT: 2,
      fleeing: false,
      flash: 0,
      walkPhase: run.rng() * 6,
      lungeT: 0,
      spawnT: 0.6,
      facing: "down",
      px: e.x,
      py: e.y,
      waypoints: [],
      repathT: 0,
      goalX: e.x,
      goalY: e.y,
      stuckT: 0,
      lastX: e.x,
      lastY: e.y,
      stuckFails: 0
    });
  }
  if (pattern === "brute") {
    if (e.phase >= 2 && e.chargeState === "roam") {
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
        e.slamX = fx;
        e.slamY = fy;
      }
    }
    if (dist > reach) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
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
        const n2 = Math.max(1, dist);
        e.chargeDx = (fx - e.x) / n2;
        e.chargeDy = (fy - e.y) / n2;
        e.facing = facingOf(e.chargeDx, e.chargeDy, e.facing);
      }
      if (e.chargeT <= 0) {
        e.chargeState = "dash";
        e.chargeT = 0.4;
      }
    } else if (e.chargeState === "dash") {
      e.chargeT -= dt;
      const nx = e.x + e.chargeDx * 300 * dt;
      const ny = e.y + e.chargeDy * 300 * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
      } else e.chargeT = 0;
      if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
        meleeHit(run, e, Math.round(e.dmg * 1.3), fx, fy);
        e.chargeT = 0;
      }
      if (e.chargeT <= 0) {
        e.chargeState = "roam";
        e.chargeCd = 5;
      }
    }
    e.burstT -= dt;
    if (e.burstT <= 0) {
      e.burstT = 7;
      const n2 = 8;
      for (let i = 0; i < n2; i++) {
        const a = i / n2 * Math.PI * 2 + run.time;
        run.bolts.push({
          x: e.x,
          y: e.y,
          px: e.x,
          py: e.y,
          vx: Math.cos(a) * 110,
          vy: Math.sin(a) * 110,
          dmg: Math.max(1, Math.round(e.dmg * 0.6)),
          life: 3.2
        });
      }
      burst(run, e.x, e.y, "#8a5a00", 10);
    }
  } else {
    if (dist < 120) {
      const nx = e.x + (e.x - fx) / dist * speed * dt;
      const ny = e.y + (e.y - fy) / dist * speed * dt;
      if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
        e.px = e.x;
        e.py = e.y;
        e.x = nx;
        e.y = ny;
        e.facing = facingOf(e.x - e.px, e.y - e.py, e.facing);
      }
    } else if (dist > 200) {
      e.repathT -= dt;
      if (e.repathT <= 0 || e.waypoints.length === 0) {
        e.repathT = 1;
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
        x: e.x,
        y: e.y,
        px: e.x,
        py: e.y,
        vx: Math.cos(ang) * 140,
        vy: Math.sin(ang) * 140,
        dmg: e.dmg,
        life: 3
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
function updateSiegebreaker(run, e, dt, fx, fy, dist, speed) {
  const reach = e.body + FRIEND_BODY + 6;
  const tgt = structureTarget(run, "structure", true);
  e.bombardT -= dt;
  if (e.bombardT <= 0) {
    e.bombardT = 12 - e.phase * 2;
    const ids = Object.keys(run.structHp).filter((id) => id !== HOME_CORE.id && run.structHp[id] > 0);
    if (ids.length > 0) {
      const id = ids[Math.floor(run.rng() * ids.length)];
      run.structOff[id] = Math.max(run.structOff[id] ?? 0, 8);
      burst(
        run,
        run.scene.anchors[id]?.[0] ?? fx,
        run.scene.anchors[id]?.[1] ?? fy,
        "#d93a3a",
        14
      );
      announce(run, `${structLabel(id).toUpperCase()} DISABLED!`, "The Siegebreaker hexes your base!");
      run.events.push({ t: "structhurt", id });
    }
  }
  if (tgt && dist > 220) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1;
      requestRoute(run, e, [tgt.x, tgt.y]);
    }
    followWaypoints(run, e, speed * dt);
    e.facing = facingOf(tgt.x - e.x, tgt.y - e.y, e.facing);
    return;
  }
  if (dist > reach) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1;
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
      e.slamX = fx;
      e.slamY = fy;
    }
  }
}
function updateChargerLike(run, e, dt, fx, fy, dist, speed) {
  if (e.chargeState === "tele") {
    e.chargeT -= dt;
    if (e.chargeT > 0.15) {
      const n2 = Math.max(1, dist);
      e.chargeDx = (fx - e.x) / n2;
      e.chargeDy = (fy - e.y) / n2;
      e.facing = facingOf(e.chargeDx, e.chargeDy, e.facing);
    }
    if (e.chargeT <= 0) {
      e.chargeState = "dash";
      e.chargeT = 0.4;
    }
    return;
  }
  if (e.chargeState === "dash") {
    e.chargeT -= dt;
    const nx = e.x + e.chargeDx * 300 * dt;
    const ny = e.y + e.chargeDy * 300 * dt;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.px = e.x;
      e.py = e.y;
      e.x = nx;
      e.y = ny;
    } else e.chargeT = 0;
    burst(run, e.x, e.y, "#c96a2e", 2);
    if (Math.hypot(fx - e.x, fy - e.y) < e.body + FRIEND_BODY + 3) {
      meleeHit(run, e, Math.round(e.dmg * 1.3), fx, fy);
      e.chargeT = 0;
    }
    if (e.chargeT <= 0) {
      e.chargeState = "vuln";
      e.chargeT = 1;
      e.chargeCd = 5;
    }
    return;
  }
  e.chargeT -= dt;
  if (e.chargeT <= 0) e.chargeState = "roam";
}
function updateArtillerist(run, e, dt, fx, fy, dist) {
  const reach = e.body + FRIEND_BODY + 6;
  if (dist < 170) {
    const nx = e.x + (e.x - fx) / dist * e.speed * dt;
    const ny = e.y + (e.y - fy) / dist * e.speed * dt;
    if (run.scene.navigator.segmentClear([e.x, e.y], [nx, ny])) {
      e.px = e.x;
      e.py = e.y;
      e.x = nx;
      e.y = ny;
    }
  } else if (dist > 300) {
    e.repathT -= dt;
    if (e.repathT <= 0 || e.waypoints.length === 0) {
      e.repathT = 1;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, e.speed * dt);
  }
  e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
  if (e.slamT > 0) {
    e.slamT -= dt;
    e.slamX = fx;
    e.slamY = fy;
    if (e.slamT <= 0) {
      const n2 = 3 + e.phase * 2;
      const base = Math.atan2(e.slamY - e.y, e.slamX - e.x);
      for (let i = 0; i < n2; i++) {
        const a = base + (i - (n2 - 1) / 2) * 0.22;
        run.bolts.push({
          x: e.x,
          y: e.y,
          px: e.x,
          py: e.y,
          vx: Math.cos(a) * 190,
          vy: Math.sin(a) * 190,
          dmg: Math.max(1, Math.round(e.dmg * 0.55)),
          life: 3
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
      e.slamX = fx;
      e.slamY = fy;
    }
  }
  if (dist <= reach) {
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1;
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
function updateWarden(run, e, dt, fx, fy, dist, speed) {
  const reach = e.body + FRIEND_BODY + 6;
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
      e.repathT = 1;
      requestRoute(run, e, [fx, fy]);
    }
    followWaypoints(run, e, speed * dt);
  } else {
    e.facing = facingOf(fx - e.x, fy - e.y, e.facing);
    e.atkCd -= dt;
    if (e.atkCd <= 0) {
      e.atkCd = 1;
      e.lungeT = 0.28;
      meleeHit(run, e, e.dmg, fx, fy);
    }
  }
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
      e.slamX = fx;
      e.slamY = fy;
    }
  }
}
function updateBlink(run, e, dt, fx, fy, dist, speed) {
  const reach = e.body + FRIEND_BODY + 6;
  e.skipT -= dt;
  if (e.blinkT <= 0) {
    e.blinkT = Math.max(2.2, 5 - e.phase * 0.9);
    e.slamT = 1;
    e.slamX = e.x;
    e.slamY = e.y;
    for (let i = 0; i < 8; i++) {
      const a = run.rng() * Math.PI * 2;
      const r = 120 + run.rng() * 80;
      const nx = fx + Math.cos(a) * r, ny = fy + Math.sin(a) * r;
      if (nx < 20 || ny < 20 || nx > WORLD_W - 20 || ny > WORLD_H - 20) continue;
      if (!isWorldWalkable(run.scene.world, [nx, ny], 10)) continue;
      if (regionAt(run.scene.regions, nx, ny) !== run.scene.regions.homeId) continue;
      if (Math.hypot(nx - fx, ny - fy) < 70) continue;
      burst(run, e.x, e.y, "#7a5fc0", 10);
      e.x = nx;
      e.y = ny;
      e.waypoints = [];
      e.repathT = 0;
      burst(run, e.x, e.y, "#7a5fc0", 10);
      break;
    }
    for (let i = -1; i <= 1; i++) {
      const base = Math.atan2(fy - e.y, fx - e.x) + i * 0.18;
      run.bolts.push({
        x: e.x,
        y: e.y,
        px: e.x,
        py: e.y,
        vx: Math.cos(base) * 200,
        vy: Math.sin(base) * 200,
        dmg: Math.max(1, Math.round(e.dmg * 0.5)),
        life: 3
      });
    }
  }
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
function summonMinionKind(run, from, kind) {
  const base = baseSpec(kind);
  const x = from.x + (run.rng() - 0.5) * 60, y = from.y + (run.rng() - 0.5) * 44;
  if (!isValidSpawn(run.scene.world, run.scene.navigator, [x, y], run.home)) return;
  run.enemies.push({
    id: run.nextId++,
    kind,
    x,
    y,
    hp: Math.round(base.hp * waveHpMult(run.wave)),
    maxHp: Math.round(base.hp * waveHpMult(run.wave)),
    dmg: Math.round(base.dmg * waveDmgMult(run.wave)),
    speed: (ENEMY_SPEED[kind] ?? 36) * waveSpeedMult(run.wave),
    xp: base.xp,
    rf: base.rf,
    radius: base.radius,
    body: BODY_R[kind] ?? 8,
    stopDist: base.range > 0 ? 120 : 0,
    slowT: 0,
    slowF: 1,
    burnT: 0,
    burnDps: 0,
    shieldHp: 0,
    shieldMax: 0,
    elite: false,
    eliteMod: null,
    mods: [],
    pattern: null,
    bossName: "",
    phase: 0,
    wardT: 0,
    wardDown: 0,
    blinkT: 0,
    addT: 0,
    atkCd: 0.8,
    shootCd: 1 + run.rng(),
    burstT: 99,
    summonT: 99,
    slamT: 0,
    slamX: 0,
    slamY: 0,
    slamCd: 99,
    chargeState: "roam",
    chargeT: 0,
    chargeDx: 0,
    chargeDy: 0,
    chargeCd: 99,
    fuseT: 0,
    aimT: 0,
    aimDx: 0,
    aimDy: 0,
    orbitDir: 1,
    orbitT: 0,
    skipT: 4,
    skipPhase: 0,
    leapState: "roam",
    leapT: 0,
    leapX: 0,
    leapY: 0,
    burrowState: "roam",
    burrowT: 3,
    burrowX: 0,
    burrowY: 0,
    mageCd: 3,
    drainT: 0,
    objective: "friend",
    structCd: 1,
    stolen: 0,
    mineT: 3,
    reviveT: 6,
    bombardT: 2,
    fleeing: false,
    flash: 0,
    walkPhase: run.rng() * 6,
    lungeT: 0,
    spawnT: 0.5,
    facing: "down",
    px: x,
    py: y,
    waypoints: [],
    repathT: 0,
    goalX: x,
    goalY: y,
    stuckT: 0,
    lastX: x,
    lastY: y,
    stuckFails: 0
  });
}
function summonMinion(run, from) {
  const base = baseSpec("shadow");
  const x = from.x + (run.rng() - 0.5) * 60, y = from.y + (run.rng() - 0.5) * 44;
  if (!isValidSpawn(run.scene.world, run.scene.navigator, [x, y], run.home)) return;
  run.enemies.push({
    id: run.nextId++,
    kind: "shadow",
    x,
    y,
    hp: Math.round(base.hp * waveHpMult(run.wave)),
    maxHp: Math.round(base.hp * waveHpMult(run.wave)),
    dmg: Math.round(base.dmg * waveDmgMult(run.wave)),
    speed: ENEMY_SPEED.shadow * waveSpeedMult(run.wave),
    xp: base.xp,
    rf: base.rf,
    radius: base.radius,
    body: BODY_R.shadow,
    stopDist: 0,
    slowT: 0,
    slowF: 1,
    burnT: 0,
    burnDps: 0,
    shieldHp: 0,
    shieldMax: 0,
    elite: false,
    eliteMod: null,
    mods: [],
    pattern: null,
    bossName: "",
    phase: 0,
    wardT: 0,
    wardDown: 0,
    blinkT: 0,
    addT: 0,
    atkCd: 0.8,
    shootCd: 99,
    burstT: 99,
    summonT: 99,
    slamT: 0,
    slamX: 0,
    slamY: 0,
    slamCd: 99,
    chargeState: "roam",
    chargeT: 0,
    chargeDx: 0,
    chargeDy: 0,
    chargeCd: 99,
    fuseT: 0,
    aimT: 0,
    aimDx: 0,
    aimDy: 0,
    orbitDir: 1,
    orbitT: 0,
    skipT: 4,
    skipPhase: 0,
    leapState: "roam",
    leapT: 0,
    leapX: 0,
    leapY: 0,
    burrowState: "roam",
    burrowT: 3,
    burrowX: 0,
    burrowY: 0,
    mageCd: 3,
    drainT: 0,
    objective: "friend",
    structCd: 1,
    stolen: 0,
    mineT: 3,
    reviveT: 6,
    bombardT: 2,
    fleeing: false,
    flash: 0,
    walkPhase: run.rng() * 6,
    lungeT: 0,
    spawnT: 0.5,
    facing: "down",
    px: x,
    py: y,
    waypoints: [],
    repathT: 0,
    goalX: x,
    goalY: y,
    stuckT: 0,
    lastX: x,
    lastY: y,
    stuckFails: 0
  });
}
var hashCell = /* @__PURE__ */ new Map();
function cellKey(x, y) {
  return `${Math.floor(x / 44)},${Math.floor(y / 44)}`;
}
function separate(run, list, dt) {
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
    if (!arr) {
      arr = [];
      hashCell.set(k, arr);
    }
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
function pushApart(run, a, b, dt) {
  const dx2 = b.x - a.x, dy2 = b.y - a.y;
  const min = (a.body + b.body) * 0.9;
  const d2 = dx2 * dx2 + dy2 * dy2;
  if (d2 > 0.01 && d2 < min * min) {
    const d = Math.sqrt(d2);
    const push = (min - d) / d * 3 * dt;
    const nav = run.scene.navigator;
    const anx = a.x - dx2 * push, any = a.y - dy2 * push;
    if (nav.segmentClear([a.x, a.y], [anx, any])) {
      a.x = anx;
      a.y = any;
    }
    const bnx = b.x + dx2 * push, bny = b.y + dy2 * push;
    if (nav.segmentClear([b.x, b.y], [bnx, bny])) {
      b.x = bnx;
      b.y = bny;
    }
  }
}
function watchdog(run, e, dt) {
  const hasIntent = e.waypoints.length > 0 || e.chargeState === "dash";
  if (!hasIntent || e.spawnT > 0) {
    e.stuckT = 0;
    e.lastX = e.x;
    e.lastY = e.y;
    return;
  }
  e.stuckT += dt;
  if (e.stuckT < 1.2) return;
  const moved = Math.hypot(e.x - e.lastX, e.y - e.lastY);
  e.lastX = e.x;
  e.lastY = e.y;
  e.stuckT = 0;
  if (moved >= 5) {
    e.stuckFails = 0;
    return;
  }
  e.stuckFails++;
  e.repathT = 0;
  e.waypoints = [];
  const [fx, fy] = friendPos(run);
  const dx2 = fx - e.x, dy2 = fy - e.y;
  const n2 = Math.max(1, Math.hypot(dx2, dy2));
  const tryPts = [
    [e.x + dx2 / n2 * 20, e.y + dy2 / n2 * 20],
    [e.x - dy2 / n2 * 24, e.y + dx2 / n2 * 24],
    [e.x + dy2 / n2 * 24, e.y - dx2 / n2 * 24]
  ];
  for (const p of tryPts) {
    if (run.scene.navigator.segmentClear([e.x, e.y], p)) {
      e.waypoints = [p];
      break;
    }
  }
  if (e.stuckFails >= 3) {
    const spot = validatedSpawn(run);
    e.x = spot[0];
    e.y = spot[1];
    e.waypoints = [];
    e.stuckFails = 0;
    run.stuckFixes++;
    run.stuckWatch++;
  }
}
function explode(run, x, y, radius, dmg) {
  burst(run, x, y, "#8a5a00", 10);
  run.shake = Math.max(run.shake, 0.12);
  for (const e of run.enemies) {
    if (e.spawnT > 0.4) continue;
    if (Math.hypot(e.x - x, e.y - y) < radius + e.body) damageEnemy(run, e, dmg, false);
  }
}
function chainLightning(run, x, y, dmg, excludeId) {
  let hits = 0;
  const sorted = [...run.enemies].filter((e) => e.id !== excludeId && e.spawnT <= 0.4).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
  for (const e of sorted) {
    if (hits >= 2) break;
    if (Math.hypot(e.x - x, e.y - y) > 130) break;
    damageEnemy(run, e, dmg, false);
    burst(run, e.x, e.y, "#e8c53a", 3);
    hits++;
  }
  if (hits > 0) burst(run, x, y, "#e8c53a", 4);
}
function segDist(px, py, ax, ay, bx, by) {
  const dx2 = bx - ax, dy2 = by - ay;
  const len2 = dx2 * dx2 + dy2 * dy2;
  if (len2 < 1e-4) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx2 + (py - ay) * dy2) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx2), py - (ay + t * dy2));
}
function updateShots(run, dt) {
  const many = run.enemies.length > 30;
  let grid = null;
  if (many) {
    grid = /* @__PURE__ */ new Map();
    for (const e of run.enemies) {
      if (e.spawnT > 0.4) continue;
      const k = cellKey(e.x, e.y);
      let arr = grid.get(k);
      if (!arr) {
        arr = [];
        grid.set(k, arr);
      }
      arr.push(e);
    }
  }
  for (let i = run.shots.length - 1; i >= 0; i--) {
    const s = run.shots[i];
    s.px = s.x;
    s.py = s.y;
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
          if (s.burnDps > 0) {
            e.burnT = s.burnDur;
            e.burnDps = Math.max(e.burnDps, s.burnDps);
          }
          if (s.slowDur > 0) {
            if (s.freeze) {
              e.slowT = 1;
              e.slowF = 0;
            } else if (e.slowT <= 0) {
              e.slowT = s.slowDur;
              e.slowF = s.slowF;
            }
          }
          if (s.explosive > 0) explode(run, s.x, s.y, s.explosiveR, s.dmg * s.explosive);
          const chainCh = run.stacks.storm > 0 ? 0.3 * run.stacks.storm : 0;
          if (chainCh > 0 && run.rng() < chainCh) chainLightning(run, s.x, s.y, s.dmg * 0.5, e.id);
          if (s.crit && isThunder(run)) chainLightning(run, s.x, s.y, s.dmg * 0.6, e.id);
          s.hitIds.push(e.id);
          if (s.bounce > 0) {
            const next = nearestEnemy(run, s.x, s.y, 150, false);
            if (next && next.id !== e.id) {
              const ang = Math.atan2(next.y - s.y, next.x - s.x);
              const sp = Math.hypot(s.vx, s.vy);
              s.vx = Math.cos(ang) * sp;
              s.vy = Math.sin(ang) * sp;
              s.bounce--;
              s.dmg *= 0.8;
              dead = false;
              break;
            }
            s.bounce = 0;
          }
          if (s.pierce > 0) {
            s.pierce--;
            s.dmg *= 0.9;
          } else dead = true;
          break;
        }
      }
    }
    if (dead) run.shots.splice(i, 1);
  }
  if (run.shots.length > 400) run.shots.splice(0, run.shots.length - 400);
}
function candidatesNear(grid, all, x, y) {
  if (!grid) return all;
  const out = [];
  const cx = Math.floor(x / 44), cy = Math.floor(y / 44);
  for (let gx = cx - 1; gx <= cx + 1; gx++) {
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      const arr = grid.get(`${gx},${gy}`);
      if (arr) out.push(...arr);
    }
  }
  return out;
}
function updateBolts(run, dt, fx, fy) {
  for (let i = run.bolts.length - 1; i >= 0; i--) {
    const b = run.bolts[i];
    b.px = b.x;
    b.py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (run.reflectT > 0 && Math.hypot(b.x - fx, b.y - fy) < 70) {
      burst(run, b.x, b.y, "#9db8dd", 3);
      run.bolts.splice(i, 1);
      continue;
    }
    let dead = b.life <= 0 || b.x < 8 || b.x > WORLD_W - 8 || b.y < 8 || b.y > WORLD_H - 8;
    if (!dead && segDist(fx, fy, b.px, b.py, b.x, b.y) < FRIEND_BODY + 3) {
      hurtFriend(run, b.dmg);
      if (b.chill && !run.over) {
        run.slowMe = 1.2;
      }
      burst(run, fx, fy, "#b03a3a", 4);
      dead = true;
    }
    if (dead) run.bolts.splice(i, 1);
  }
}
function updatePickups(run, dt, fx, fy) {
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
      const dx2 = fx - p.x, dy2 = fy - p.y;
      const d = Math.hypot(dx2, dy2);
      if (d < magnetR) {
        const pull = 320 * dt;
        p.x += dx2 / Math.max(1, d) * pull;
        p.y += dy2 / Math.max(1, d) * pull;
      }
      if (d < FRIEND_BODY + 6) {
        collectPickup(run, p);
        dead = true;
      }
    }
    if (dead) run.pickups.splice(i, 1);
  }
}
function collectPickup(run, p) {
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
function updateVents(run, dt, fx, fy) {
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
function updateFx(run, dt) {
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
function supportPulse(run, e, dt) {
  for (const o of run.enemies) {
    if (o === e || o.hp <= 0) continue;
    if (Math.hypot(o.x - e.x, o.y - e.y) < 90) {
      o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.04 * dt);
      if (o.slowT > 0) o.slowT = Math.max(0, o.slowT - dt * 2);
    }
  }
}

// games/friends-vs-frenemies/lib/model.ts
var SAVE_VERSION = 4;
var SAVE_KEY = "friends-vs-frenemies:v1";
var VALID_PLOTS = [
  "garden-oval",
  "circuit-courtyard",
  "crystal-mesa",
  "rooftop-terrace",
  "tidal-islands",
  "orbital-hex"
];
function defaultProfile() {
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
    quests: []
  };
}
function cleanNumber(value, fallback, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}
function grantQuest(p, id) {
  if (p.quests.includes(id)) return false;
  const q = QUESTS.find((x) => x.id === id);
  if (!q) return false;
  p.quests.push(id);
  p.simRf += q.reward;
  p.lifetimeEarned += q.reward;
  return true;
}
function milestoneCond(p) {
  const tier2 = Object.values(p.buildings).filter((t) => t >= 2).length;
  const tier4 = ["turret", "altar"].some((id) => (p.buildings[id] ?? 0) >= 4);
  const areas = new Set(p.codex.maps.filter((m) => m.startsWith("expedition-")).map((m) => m.split("-")[1])).size + (p.codex.maps.some((m) => !m.startsWith("expedition-")) ? 1 : 0);
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
    "m-tier4": tier4
  };
}
function checkMilestones(p) {
  const cond = milestoneCond(p);
  const fresh = [];
  for (const m of MILESTONES) {
    if (p.quests.includes(m.id) || !cond[m.id]) continue;
    p.quests.push(m.id);
    p.simRf += m.rewardSimRf;
    p.lifetimeEarned += m.rewardSimRf;
    fresh.push(m.id);
  }
  return fresh;
}
function accumulateIdle(lastSeenMs, nowMs, ratePerMin, cap) {
  if (!(ratePerMin > 0) || !(cap > 0)) return 0;
  const dtMs = nowMs - lastSeenMs;
  if (!Number.isFinite(dtMs) || dtMs <= 0) return 0;
  const dtMin = Math.min(dtMs, 8 * 60 * 60 * 1e3) / 6e4;
  return Math.min(cap, Math.floor(dtMin * ratePerMin));
}
function sanitizeProfile(raw) {
  const fresh = defaultProfile();
  if (typeof raw !== "object" || raw === null) return fresh;
  const r = raw;
  const out = {
    ...fresh,
    simRf: cleanNumber(r.simRf, 0, 0, 999999999),
    bestWave: cleanNumber(r.bestWave, 0, 0, 99999),
    totalKills: cleanNumber(r.totalKills, 0, 0, 999999999),
    totalBosses: cleanNumber(r.totalBosses, 0, 0, 999999999),
    runs: cleanNumber(r.runs, 0, 0, 999999999),
    seenIntro: r.seenIntro === true,
    autoMode: r.autoMode === true,
    lifetimeEarned: cleanNumber(r.lifetimeEarned, 0, 0, 999999999999),
    lifetimeSpent: cleanNumber(r.lifetimeSpent, 0, 0, 999999999999),
    traders: cleanNumber(r.traders, 0, 0, 999999999),
    prodBank: cleanNumber(r.prodBank, 0, 0, 1e7),
    lastSeen: cleanNumber(r.lastSeen, Date.now(), 0, 999999999999999)
  };
  if (typeof r.levels === "object" && r.levels !== null) {
    for (const [k, v] of Object.entries(r.levels)) {
      if (/^[a-z]+$/.test(k) && typeof v === "number" && Number.isFinite(v)) {
        out.levels[k] = Math.min(9, Math.max(0, Math.floor(v)));
      }
    }
  }
  out.buildings = {};
  if (typeof r.buildings === "object" && r.buildings !== null) {
    for (const [k, v] of Object.entries(r.buildings)) {
      if (/^[a-z]+$/.test(k) && typeof v === "number" && Number.isFinite(v)) {
        out.buildings[k] = Math.min(9, Math.max(0, Math.floor(v)));
      }
    }
  }
  for (const b of ["turret", "wall", "healer", "collector", "frost", "generator", "vault", "altar", "workshop", "beacon", "archive", "shrine"]) {
    if ((out.levels[b] ?? 0) > (out.buildings[b] ?? 0)) {
      out.buildings[b] = out.levels[b];
    }
  }
  if (typeof r.plotId === "string" && VALID_PLOTS.includes(r.plotId)) {
    out.plotId = r.plotId;
  } else if (r.plotId === "") {
    out.plotId = "";
  } else {
    out.plotId = out.runs > 0 ? "garden-oval" : "";
  }
  const gearIds = ["w0", "a0", "t0"];
  if (typeof r.gear === "object" && r.gear !== null) {
    const g = r.gear;
    if (typeof g.weapon === "string") gearIds[0] = g.weapon;
    if (typeof g.armor === "string") gearIds[1] = g.armor;
    if (typeof g.trinket === "string") gearIds[2] = g.trinket;
  }
  out.gear = { weapon: gearIds[0], armor: gearIds[1], trinket: gearIds[2] };
  if (Array.isArray(r.vault)) {
    out.vault = r.vault.filter((v) => typeof v === "string").slice(0, 200);
  }
  if (typeof r.discovered === "object" && r.discovered !== null) {
    const d = r.discovered;
    for (const key of ["enemies", "gear", "maps"]) {
      if (Array.isArray(d[key])) {
        out.discovered[key] = d[key].filter((v) => typeof v === "string").slice(0, 200);
      }
    }
  }
  const codex = {
    enemies: [],
    gear: [],
    maps: [],
    abilities: ["ab-blast"],
    structures: [],
    plots: [],
    bosses: []
  };
  if (typeof r.codex === "object" && r.codex !== null) {
    const c = r.codex;
    for (const k of ["enemies", "gear", "maps", "abilities", "structures", "plots", "bosses"]) {
      if (Array.isArray(c[k])) {
        codex[k] = c[k].filter((v) => typeof v === "string").slice(0, 200);
      }
    }
  }
  if (!codex.abilities.includes("ab-blast")) codex.abilities.push("ab-blast");
  if (out.plotId && !codex.plots.includes(out.plotId)) codex.plots.push(out.plotId);
  out.codex = codex;
  if (Array.isArray(r.quests)) {
    out.quests = r.quests.filter((v) => typeof v === "string").slice(0, 100);
  }
  return out;
}
function detectBackend() {
  try {
    if (typeof localStorage !== "undefined") {
      const probe = "__fvf_probe__";
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      return {
        get: () => localStorage.getItem(SAVE_KEY),
        set: (value) => localStorage.setItem(SAVE_KEY, value),
        clear: () => localStorage.removeItem(SAVE_KEY),
        persistent: true
      };
    }
  } catch {
  }
  let memory = null;
  return {
    get: () => memory,
    set: (value) => {
      memory = value;
    },
    clear: () => {
      memory = null;
    },
    persistent: false
  };
}
var backend = null;
function storageBackend() {
  if (!backend) backend = detectBackend();
  return backend;
}
function resetBackendForTests() {
  let memory = null;
  backend = {
    get: () => memory,
    set: (value) => {
      memory = value;
    },
    clear: () => {
      memory = null;
    },
    persistent: false
  };
}
function loadProfile() {
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
function saveProfile(profile) {
  try {
    storageBackend().set(JSON.stringify({ ...profile, version: SAVE_VERSION }));
  } catch {
  }
}
function resetProfile() {
  storageBackend().clear();
  const fresh = defaultProfile();
  saveProfile(fresh);
  return fresh;
}

// games/friends-vs-frenemies/lib/sprites.ts
var foeCache = /* @__PURE__ */ new Map();
var foeInflight = /* @__PURE__ */ new Map();
var FRENEMY_IDENTITY = {
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
  minisiege: { family: 6, seed: 241 }
};
function frenemyIdentity(kind, pattern) {
  if (kind === "boss") return FRENEMY_IDENTITY[`boss:${pattern ?? "brute"}`] ?? FRENEMY_IDENTITY["boss:brute"];
  return FRENEMY_IDENTITY[kind] ?? FRENEMY_IDENTITY.shadow;
}
function foeKey(family, seed) {
  return `${family}:${seed}`;
}
var FAMILY_NAMES = [
  "Skeleton",
  "Mask",
  "Family",
  "Cellular",
  "Asymmetry",
  "Hoverer",
  "Colossus",
  "Sparkling",
  "Hollow"
];
function generateFamilyRows(familyId, seed, facing, walkFrame) {
  const fam = Math.max(0, Math.min(8, Math.floor(familyId)));
  const rows = [];
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
        case 0:
          if (cy >= -6 && cy <= -1) on = Math.abs(cx) <= 3.5;
          if (cy >= -5 && cy <= -3 && Math.abs(cx) === 1.5 && facing !== "up") on = false;
          if (cy === 0) on = Math.abs(cx) <= 1.5;
          if (cy >= 1 && cy <= 3) on = Math.abs(cx) <= (cy === 2 ? 3 : 2);
          if (cy >= 4 && cy <= 6) {
            on = Math.abs(cx - (cx > 0 ? legShift : -legShift)) === 2;
          }
          break;
        case 1:
          if (cy >= -7 && cy <= -5) on = Math.abs(cx) <= 4.5 && Math.abs(cx) >= 1;
          if (cy >= -4 && cy <= 0) on = Math.abs(cx) <= 4.2;
          if (cy === -2 && Math.abs(cx) <= 2.5 && facing !== "up") on = false;
          if (cy >= 1 && cy <= 4) on = Math.abs(cx) <= 4 - cy * 0.8;
          if (cy >= 5 && cy <= 6) on = Math.abs(cx) <= 2;
          break;
        case 2:
          if (cy >= -7 && cy <= -4) {
            on = (cx + 3.5) * (cx + 3.5) + (cy + 5.5) * (cy + 5.5) <= 3.5 || (cx - 3.5) * (cx - 3.5) + (cy + 5.5) * (cy + 5.5) <= 3.5;
          }
          if (cx * cx + cy * cy <= 22) on = true;
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 3.5;
          break;
        case 3:
          on = (cx + 2) * (cx + 2) + (cy + 2) * (cy + 2) <= 8 || (cx - 2.5) * (cx - 2.5) + (cy + 1) * (cy + 1) <= 9 || cx * cx + (cy - 3) * (cy - 3) <= 7.5 || (cx + 3) * (cx + 3) + (cy - 2) * (cy - 2) <= 5;
          break;
        case 4:
          if (cx <= -1 && cy >= -7 && cy <= -2) on = Math.abs(cx + 3.5) <= 1.5;
          if ((cx - 0.5) * (cx - 0.5) + cy * cy <= 19) on = true;
          if (cy >= 3 && cy <= 6) on = cx >= -3 && cx <= 2;
          break;
        case 5:
          if (cy >= -6 && cy <= 2) on = Math.abs(cx) <= (cy <= -2 ? 3.5 : 4 - (cy + 2) * 0.6);
          if (cy >= -1 && cy <= 2) on = on || Math.abs(cx) <= 5.5;
          if (cy >= 3 && cy <= 5) on = Math.abs(cx) <= (5 - cy) * 0.8;
          break;
        case 6:
          if (cy >= -6 && cy <= -4) on = Math.abs(cx) <= 4;
          if (cy >= -3 && cy <= 3) on = Math.abs(cx) <= 5.5;
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 4.5 && Math.abs(cx) >= 0.5;
          break;
        case 7:
          if (Math.abs(cx) <= 1 && cy >= -7 && cy <= -4) on = true;
          if (Math.abs(cy + 1) <= 1 && Math.abs(cx) <= 5.5) on = true;
          if (Math.abs(cx) + Math.abs(cy) <= 5) on = true;
          if (cy >= 4 && cy <= 6) on = Math.abs(cx) <= 2.5;
          break;
        case 8:
          if (cy >= -7 && cy <= 1) on = Math.abs(cx) <= (cy <= -3 ? 3.5 : 4.5);
          if (cy >= -4 && cy <= -1 && Math.abs(cx) <= 2 && facing !== "up") on = false;
          if (cy >= 2 && cy <= 6) on = Math.abs(cx) <= 4 - (cy - 4) * 0.4;
          break;
      }
      row += on ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}
var fallbackArts = /* @__PURE__ */ new Map();
function getFamilyFallbackArt(familyId, seed) {
  const key = foeKey(familyId, seed);
  const hit = fallbackArts.get(key);
  if (hit) return hit;
  const clip = (walking) => {
    const out = {};
    const facings = ["down", "up", "left", "right"];
    for (const f of facings) {
      const frames = [];
      for (let i = 0; i < 8; i++) {
        frames.push(generateFamilyRows(familyId, seed, f, walking ? i : 0));
      }
      out[f] = frames;
    }
    return out;
  };
  const clips = {
    idle: clip(false),
    walk: clip(true),
    familyId
  };
  const art = {
    rows: clips.idle.down[0],
    clips,
    familyName: FAMILY_NAMES[familyId] ?? "Rare Friend",
    live: false
  };
  fallbackArts.set(key, art);
  return art;
}
var foeDead = /* @__PURE__ */ new Map();
function getFrenemyArtSync(family, seed) {
  return foeCache.get(foeKey(family, seed)) ?? getFamilyFallbackArt(family, seed);
}
function resetFoeCacheForTests() {
  foeCache.clear();
  foeInflight.clear();
  foeDead.clear();
  fallbackArts.clear();
}

// games/friends-vs-frenemies/lib/render-iso.ts
function toScreen(x, y, lift = 0) {
  return project(x, y, lift);
}
function weaponScreenAngle(fx, fy, aimAngle) {
  const [sx, sy] = toScreen(fx, fy);
  const [bx, by] = toScreen(fx + Math.cos(aimAngle) * 16, fy + Math.sin(aimAngle) * 16);
  return Math.atan2(by - sy, bx - sx);
}
var KIND_FORM = {
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
  minisiege: { s: 6.8, xs: 1.25, ys: 1 }
};
var BOSS_FORM = {
  brute: { s: 8, xs: 1.15, crown: "#8a5a00" },
  hunter: { s: 7.6, xs: 0.95, crown: "#d93a3a" },
  swarmkeeper: { s: 8, xs: 1.05, crown: "#8a5a00" },
  artillerist: { s: 8.2, xs: 1.2, crown: "#c96a2e" },
  warden: { s: 8.4, xs: 1.25, crown: "#6b6558" },
  blink: { s: 7.8, xs: 1, crown: "#7a5fc0" },
  siegebreaker: { s: 8.8, xs: 1.3, crown: "#d93a3a" }
};
export {
  ABILITIES,
  ABILITY_HOTKEYS,
  ABILITY_MAX_RANK,
  ABILITY_STOCK,
  ATTACK_STYLE_NAMES,
  BELT_ORDER,
  BLAST_COOLDOWN,
  BLAST_DMG_MULT,
  BLAST_RADIUS,
  BODY_R,
  BOSS_FORM,
  BUDGET_COST,
  CODEX_ENEMIES,
  CONSUMABLES,
  EARLY_WAVES,
  ENCOUNTERS,
  ENEMIES,
  ENEMY_OBJECTIVE,
  EXPEDITIONS,
  FRENEMY_IDENTITY,
  FRIEND_BODY,
  FRIEND_RANGE,
  FRIEND_SPEED,
  GEAR,
  HEAL_AMOUNT,
  HOME,
  HOME_CORE,
  ITEM_HOTKEYS,
  KIND_FORM,
  MAPS,
  MAX_ACTIVE_ABILITIES,
  MILESTONES,
  NEW_ENEMIES,
  PERMA_UPGRADES,
  PICKUP_W,
  PLOTS,
  PRESET_ID,
  QUESTS,
  RARITY_COLORS,
  RELICS,
  REROLL_COST,
  SAVE_KEY,
  SAVE_VERSION,
  SELL_FRACTION,
  SETTLEMENT_TIERS,
  STRUCTURES,
  STRUCTURE_SPECS,
  SYNERGIES,
  TEMPLATE_KINDS,
  TEMPLATE_MIN_SHARE,
  UPGRADES,
  UPGRADE_IDS,
  UPGRADE_TAGS,
  VALID_PLOTS,
  VIEW,
  WORLD_H,
  WORLD_W,
  abilitiesForAltar,
  abilityCd,
  abilityCdMax,
  abilitySlots,
  accumulateIdle,
  activeSynergies,
  adoptMoverPos,
  aimDebug,
  aimVector,
  announce,
  applyLoadout,
  applyUpgrade,
  autoCollectTier,
  autoRepairTier,
  baseLevelOf,
  baseValue,
  beginPrep,
  beginWave,
  blast,
  bossDropChance,
  bossDropPool,
  bossPatternFor,
  bossSpec,
  buildScene,
  cachedScene,
  checkGearEvos,
  checkMilestones,
  closeTrader,
  collectorRate,
  computeDerived,
  continuousAimAngle,
  createRun,
  damageEnemy,
  damageStructure,
  debugShop,
  defaultProfile,
  eliteChance,
  eliteModFor,
  ensureTemplateHonesty,
  enterMap,
  expeditionFor,
  facingOf,
  findAnchor,
  findEntrances,
  foeKey,
  frenemyIdentity,
  friendFacing,
  friendPos,
  friendWalking,
  gateLabel,
  gearById,
  genStock,
  getFrenemyArtSync,
  getWorldPreset,
  grantQuest,
  heal,
  healCost,
  homeCoreHp,
  hurtFriend,
  idleProductionRate,
  idleStorageCap,
  isValidSpawn,
  isWorldWalkable,
  labelRegions,
  launchWave,
  loadProfile,
  makeOffers,
  mapForWave,
  milestoneCond,
  moveSpeedOf,
  mulberry32,
  nextWave,
  pendingGates,
  planEncounter,
  planWave,
  plotById,
  prebuildScene,
  precomputeShop,
  prepInfo,
  project,
  projectileCount,
  questById,
  randomWalkable,
  reanchorMover,
  regionAt,
  relicById,
  repairCost,
  repairStructure,
  reroll,
  rerollCost,
  rerollShop,
  resetBackendForTests,
  resetFoeCacheForTests,
  resetProfile,
  resetStructHp,
  sanitizeProfile,
  saveProfile,
  screenToWorld,
  segDist,
  sellValue,
  setAim,
  settlementTierFor,
  slamHitsCore,
  sortWorldItems,
  specsFor,
  stepPrep,
  stepRun,
  storageBackend,
  structLabel,
  structureById,
  structureTarget,
  summarize,
  supportPulse,
  templateShare,
  traderBlockFor,
  traderStock,
  trainingRate,
  unlockedKinds,
  unproject,
  updateCamera,
  useAbility,
  useConsumable,
  validateWaveComposition,
  validatedSpawn,
  vaultCap,
  waveComp,
  waveDmgMult,
  waveHpMult,
  waveSpeedMult,
  weaponScreenAngle,
  xpForLevel
};
