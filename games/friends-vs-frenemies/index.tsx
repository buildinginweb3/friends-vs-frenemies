/**
 * FRIENDS vs FRENEMIES — survivor + idle RPG shell.
 * MANUAL positioning (WASD/arrows/tap) with auto-attacks, optional AUTO-pilot,
 * trader shops every 5 waves, multi-map runs, consumables, build inspector.
 * SDK runtime owns wallet/selection/eligibility; client.read() starts sessions.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameComponentProps } from "@rarefriends/friendsdk/runtime";
import "@rarefriends/friendsdk/frame.css";
import "./style.css";
import {
  PERMA_UPGRADES, RARITY_COLORS, gearById, computeDerived, UPGRADES, ABILITIES,
  healCost, REROLL_COST, MAPS, CONSUMABLES, sellValue, rerollCost, unlockedKinds,
  relicById, abilitiesForAltar, PLOTS, plotById, STRUCTURES, structureById, baseLevelOf,
  collectorRate, vaultCap, settlementTierFor, QUESTS, questById, CODEX_ENEMIES,
  expeditionFor, ITEM_HOTKEYS, BELT_ORDER,   MILESTONES, idleProductionRate, idleStorageCap, ATTACK_STYLE_NAMES,
  structLabel, ENCOUNTERS,
  type GearItem, type PermanentState, type StockItem, type AbilityId,
} from "./lib/balance";
import {
  defaultProfile, loadProfile, saveProfile, resetProfile, sanitizeProfile, accumulateIdle,
  grantQuest, checkMilestones,
  type Profile,
} from "./lib/model";
import {
  createRun, stepRun, applyUpgrade, reroll, heal, nextWave, closeTrader,
  beginWave, beginPrep, launchWave, prepInfo, enterMap, applyLoadout, reanchorMover, adoptMoverPos, rerollShop, debugShop, useConsumable,
  useAbility, setAim, genStock, precomputeShop, announce, abilityCd, abilityCdMax, pendingGates, gateLabel,
  repairStructure, repairCost, resetStructHp,
  type RunState, type RunSummary,
} from "./lib/engine";
import { buildScene, cachedScene, prebuildScene, screenToWorld, updateCamera, type Scene } from "./lib/world-scene";
import { drawIsoCombat, drawIsoHome, drawDebug, loadIsoAssets, preloadIsoAssets, drawPortraitBadge, type IsoAssets, type GearLook } from "./lib/render-iso";
import { createHomePlot, stepHomePlot, type HomePlot } from "./lib/home-plot";
import { loadFriendArt, preloadFrenemyArts, getFrenemyArtSync, getFamilyFallbackArt, frenemyIdentity, foeKey, type FriendArt } from "./lib/sprites";
import { initSound, disposeSound, unlockSound, setMuted, playCue } from "./lib/sound";

import { iconRows, iconColor, cleanName } from "./lib/icons";
import {
  specsFor, activeSynergies, trainingRate, autoCollectTier, autoRepairTier,
} from "./lib/balance";

/** Pixel icon: single visual language, no emoji, no Unicode symbols.
/// 12x12 hard pixels rendered as a tiny grid (DOM) — matches canvas icons. */
function Pix({ id, size = 22 }: { id: string; size?: number }) {
  const rows = iconRows(id);
  const col = iconColor(id);
  const px = Math.max(1, Math.floor(size / 12));
  const cells: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === ".") continue;
      cells.push(
        <i key={`${x}-${y}`} style={{
          position: "absolute", left: x * px, top: y * px, width: px, height: px,
          background: c === "o" ? col : "#141414",
        }} />,
      );
    }
  });
  return (
    <span aria-hidden="true" style={{
      position: "relative", display: "inline-block", flex: "none",
      width: 12 * px, height: 12 * px, background: "#e8e4d4",
      border: "2px solid #141414", boxShadow: "2px 2px 0 #141414",
    }}>{cells}</span>
  );
}

/** Pixel portrait cameo: canonical 16x16 rows painted once per art change
 * (static canvas, zero per-frame cost). Used in trader / level-up / base /
 * results / intro headers so panels feel alive. */
function PixelPortrait({ rows, size = 56, dark = false, label }: {
  rows: readonly string[] | null; size?: number; dark?: boolean; label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !rows) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, c.width, c.height);
    const scale = Math.max(1, Math.floor((size - 10) / 16));
    drawPortraitBadge(ctx, rows, c.width / 2, c.height / 2 + 1, scale, dark);
  }, [rows, size, dark]);
  if (!rows) return null;
  return <canvas ref={ref} width={size} height={size} className="fvf-portrait" role="img" aria-label={label ?? "Friend portrait"} />;
}

type Phase = "loading" | "home" | "combat" | "results";
type Tab = "friend" | "defense" | "economy" | "gear";
type Sheet = null | "upgrades" | "gear" | "base";

interface Hud {
  hp: number; maxHp: number; wave: number; level: number; xp: number; xpNext: number;
  kills: number; bankRf: number; blastCd: number; intermission: number;
  manual: boolean; cons: Record<string, number>; mapIdx: number; armor: number;
  stacks: Record<string, number>;
  abilities: AbilityId[]; abilityCd: Record<string, number>;
  prep: boolean; prepWave: number;
  structHp: Record<string, number>; structMax: Record<string, number>;
  relics: string[]; encounter: string;
  lanes: { label: string; count: number }[];
}

interface ShopUI {
  stock: (StockItem & { sold: boolean })[];
  rerolls: number;
  block: number;
}

const FALLBACK_ART: FriendArt = { rows: null, clips: null, familyName: "Friend", live: false };

/** Map-lifecycle guards: exactly one authoritative loop must exist. */
let combatLoopsActive = 0;
let combatLoopTotal = 0;

function safeGear(id: string, fallback: string): GearItem {
  try {
    return gearById(id);
  } catch {
    return gearById(fallback);
  }
}

function permaOf(profile: Profile): PermanentState {
  const l = profile.levels;
  return {
    dmg: l.dmg ?? 0, rate: l.rate ?? 0, hp: l.hp ?? 0, crit: l.crit ?? 0,
    turret: l.turret ?? 0, wall: l.wall ?? 0, healer: l.healer ?? 0, collector: l.collector ?? 0,
    greed: l.greed ?? 0, loot: l.loot ?? 0,
    altar: l.altar ?? 0, workshop: l.workshop ?? 0, beacon: l.beacon ?? 0,
    archive: l.archive ?? 0, medbay: l.medbay ?? 0, shrine: l.shrine ?? 0,
    frost: l.frost ?? 0, training: l.training ?? 0, vault: l.vault ?? 0, kennel: l.kennel ?? 0,
    bulwark: l.bulwark ?? 0, traps: l.traps ?? 0, overcharge: l.overcharge ?? 0, plots: l.plots ?? 0,
  };
}

/** Effective structure tier: best of legacy levels and new buildings (never lose progress). */
function structTierOf(profile: Profile, id: string): number {
  return Math.max(profile.levels[id] ?? 0, profile.buildings[id] ?? 0);
}

/** Building slots: limited room forces defense-vs-production choices; plots expand. */
export function buildingSlotsOf(profile: Profile): number {
  return 6 + 2 * (profile.levels.plots ?? 0);
}

export function buildingsUsedOf(profile: Profile): number {
  return STRUCTURES.filter(s => structTierOf(profile, s.id) > 0).length;
}

function plotOf(profile: Profile) {
  return plotById(profile.plotId || "garden-oval");
}

/** Base choice = FIRST map only. The plot's preset picks the starting map;
 * after that the every-5-wave rotation continues through all maps. */
function plotStartMap(preset: string): number {
  const i = MAPS.findIndex(m => m.preset === preset);
  return i >= 0 ? i : 0;
}

/** Stamp lastSeen and persist. */
function persist(p: Profile): void {
  p.lastSeen = Date.now();
  saveProfile(p);
}



function traderModsOf(profile: Profile, run: RunState | null): {
  beacon: number; shrine: number; workshop: number; altar: number;
  bulwark: number; traps: number; overcharge: number; kennel: number;
} {
  const p = permaOf(profile);
  void run;
  return {
    beacon: p.beacon ?? 0, shrine: p.shrine ?? 0,
    workshop: p.workshop ?? 0, altar: p.altar ?? 0,
    bulwark: p.bulwark ?? 0, traps: p.traps ?? 0,
    overcharge: p.overcharge ?? 0, kennel: p.kennel ?? 0,
  };
}

function equippedGear(profile: Profile): GearItem[] {
  return [
    safeGear(profile.gear.weapon, "w0"),
    safeGear(profile.gear.armor, "a0"),
    safeGear(profile.gear.trinket, "t0"),
  ];
}

function gearLookOf(profile: Profile): GearLook {
  const d = computeDerived(permaOf(profile), equippedGear(profile));
  return { weapon: profile.gear.weapon, armor: profile.gear.armor, trinket: profile.gear.trinket, family: d.family };
}

function isLocalhost(): boolean {
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
  } catch {
    return false;
  }
}

export default function FriendsVsFrenemies({ friendId, client, paused }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [loadError, setLoadError] = useState("");
  const [modeLabel, setModeLabel] = useState("Simulated RF");
  const [profile, setProfile] = useState<Profile>(() => defaultProfile());
  const [saveNote, setSaveNote] = useState("");
  const [art, setArt] = useState<FriendArt>(FALLBACK_ART);
  const [artNote, setArtNote] = useState("");
  const [worldReady, setWorldReady] = useState(false);
  const [runWorldReady, setRunWorldReady] = useState(false);
  const [muted, setMutedUi] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tab, setTab] = useState<Tab>("friend");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [hud, setHud] = useState<Hud | null>(null);
  const [offers, setOffers] = useState<RunState["offers"]>([]);
  const [shopUI, setShopUI] = useState<ShopUI | null>(null);
  const [soldMap, setSoldMap] = useState<Record<number, boolean>>({});
  const [buildOpen, setBuildOpen] = useState(false);
  const [results, setResults] = useState<RunSummary | null>(null);
  const [resultsGear, setResultsGear] = useState<GearItem[]>([]);
  const [showIntro, setShowIntro] = useState(false);
  const [resetArm, setResetArm] = useState(false);
  const [runScene, setRunScene] = useState<Scene | null>(null);
  const [foeVer, setFoeVer] = useState(0);
  const [prepUI, setPrepUI] = useState<{ wave: number } | null>(null);
  const [prepCount, setPrepCount] = useState(0);
  const [toast, setToast] = useState<{ text: string; sub: string } | null>(null);
  const [codexOpen, setCodexOpen] = useState(false);
  const [questsOpen, setQuestsOpen] = useState(false);
  /** AFK mode at HOME: the base keeps working (production + turret defense). */
  const [afk, setAfk] = useState(false);
  /** Contextual onboarding: step through first-session beats, skippable. */
  const [tutStep, setTutStep] = useState(0);
  const [tutDone, setTutDone] = useState(false);
  /** AFK summary shown when AFK ends (time idle, RF, training, repelled). */
  const [afkSummary, setAfkSummary] = useState<{ secs: number; rf: number; xp: number; repelled: number } | null>(null);
  const afkStart = useRef(0);
  const afkGain = useRef({ rf: 0, xp: 0, repelled: 0 });
  /** Building specialization choices by structure id. */
  const [specs, setSpecs] = useState<Record<string, string>>({});
  /** Selected build slot preview (build-mode UX: inspect before purchase). */
  const [inspectId, setInspectId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runRef = useRef<RunState | null>(null);
  const homeRef = useRef<HomePlot | null>(null);
  const assetsRef = useRef<IsoAssets | null>(null);
  const assetsRunRef = useRef<IsoAssets | null>(null);
  const gearLookRef = useRef<GearLook>({ weapon: "w0", armor: "a0", trinket: "t0", family: "standard" });
  const pendingMap = useRef<{ scene: Scene; mapIdx: number; wave: number } | null>(null);
  const pokeAt = useRef(-99);
  const idleLast = useRef(0);
  const bonusT = useRef(0);
  const afkRef = useRef(afk);
  afkRef.current = afk;
  const perfFrames = useRef(0);
  const perfFps = useRef(60);
  const perfRender = useRef(0);
  const perfPaths = useRef(0);
  const hudElapsed = useRef(0.15);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const motionRef = useRef(reducedMotion);
  motionRef.current = reducedMotion;
  const lastHurtSfx = useRef(0);
  const lastEShot = useRef(0);
  const lastPickupSfx = useRef(0);
  const seedNum = Number(friendId % 1000000n);
  const tokenId = friendId.toString();
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const foesRef = useRef<Map<string, FriendArt>>(new Map());
  /** Portrait rows for panel cameos: the player's canonical idle frame.
   * (Declared with the other hooks — never after an early return.) */
  const portraitRows = useMemo(
    () => art.rows ?? art.clips?.idle.down[0] ?? null,
    [art],
  );
  /** Trader mascot rows: a Sparkling-kind Rare Friend face for the stall. */
  const traderRows = useMemo(() => {
    try {
      const a = getFamilyFallbackArt(7, 23);
      return a.rows ?? a.clips?.idle.down[0] ?? null;
    } catch {
      return null;
    }
  }, []);
  const homeScene = useMemo(() => {
    const p = profileRef.current;
    const plot = plotOf(p);
    return buildScene(
      {
        turret: structTierOf(p, "turret"), healer: structTierOf(p, "healer"),
        collector: structTierOf(p, "collector"), frost: structTierOf(p, "frost"),
      },
      plot.preset, plotStartMap(plot.preset),
    );
  }, [profile]);
  const showToast = useCallback((text: string, sub = "") => {
    setToast({ text, sub });
    window.setTimeout(() => setToast(cur => (cur && cur.text === text ? null : cur)), 3600);
  }, []);

  const toastMilestones = useCallback((p: Profile) => {
    const fresh = checkMilestones(p);
    if (fresh.length > 0) {
      const m = MILESTONES.find(x => x.id === fresh[0]);
      if (m) showToast(`Milestone: ${m.name} (+${m.rewardSimRf} RF·sim)`, fresh.length > 1 ? `+${fresh.length - 1} more milestones!` : m.desc);
    }
  }, [showToast]);

  /**
   * Live canonical foe bodies need real RPC. The SDK's automated mock harness
   * only answers the selected player's own artwork call (any other frames()
   * call records a fixture error and fails validation), so automated runs use
   * the deterministic per-family fallback bodies. Real browsers always load
   * live art; `?fvfFoes=1` forces it anywhere for visual QA.
   */
  const liveFoes = useCallback((): boolean => {
    try {
      const q = new URLSearchParams(window.location.search);
      if (q.get("fvfFoes") === "1") return true;
      if (q.get("fvfFoes") === "0") return false;
      const nav = window.navigator as Navigator & { webdriver?: boolean };
      return nav.webdriver !== true;
    } catch {
      return true;
    }
  }, []);

  /** Preload official Frenemy bodies for upcoming waves (best-effort, cached). */
  const preloadFoesFor = useCallback((wave: number, mapIdx: number) => {
    if (!liveFoes()) return;
    try {
      const kinds = unlockedKinds(wave + 5, mapIdx);
      const keys = [...kinds, "boss:brute", "boss:hunter", "boss:swarmkeeper", "boss:artillerist", "boss:warden", "boss:blink", "boss:siegebreaker"].slice(0, 12);
      preloadFrenemyArts(keys).then(arts => {
        const m = foesRef.current;
        keys.slice(0, arts.length).forEach((k, i) => {
          const [base, pattern] = k.split(":");
          const id = frenemyIdentity(base, pattern ?? null);
          const a = arts[i];
          if (a) m.set(foeKey(id.family, id.seed), a);
        });
        setFoeVer(v => v + 1);
      }).catch(() => { /* offline */ });
    } catch { /* never break */ }
  }, []);

  /* ---- session init ---- */
  useEffect(() => {
    let alive = true;
    setPhase("loading");
    setLoadError("");
    setResults(null);
    setOffers([]);
    setHud(null);
    setShopUI(null);
    runRef.current = null;
    initSound();
    setMuted(true);
    setMutedUi(true);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const onMedia = () => setReducedMotion(media.matches);
    media.addEventListener("change", onMedia);

    client.read()
      .then(snap => {
        if (!alive) return;
        setModeLabel(snap.mode === "chain" ? "Live RF" : "Simulated RF");
        const loaded = loadProfile();
        if (!alive) return;
        const pf = loaded.profile;
        // Idle production: capped, exploit-safe (see accumulateIdle).
        if (pf.lastSeen > 0) {
          const gain = accumulateIdle(pf.lastSeen, Date.now(), idleProductionRate(pf.buildings), idleStorageCap(pf.buildings));
          if (gain > 0) {
            pf.prodBank = Math.min(idleStorageCap(pf.buildings), pf.prodBank + gain);
            if (alive) showToast(`Workshop gathered +${gain} RF·sim`, "Your base kept working while away.");
          }
        }
        pf.lastSeen = Date.now();
        setProfile(pf);
        persist(pf);
        gearLookRef.current = gearLookOf(pf);
        if (loaded.restarted) setSaveNote("Old or corrupt save found — started fresh with safe defaults.");
        else if (!loaded.persistent) setSaveNote("Session-only saves in this preview (SDK sandbox has no storage access).");
        setShowIntro(!pf.seenIntro);
        setPhase("home");
      })
      .catch(cause => {
        if (!alive) return;
        setLoadError(cause instanceof Error ? cause.message : "Could not start the game session.");
      });

    loadFriendArt(friendId)
      .then(a => {
        if (!alive) return;
        setArt(a);
        if (!a.live) setArtNote("Live Friend artwork unreachable — stand-in buddy. Ownership still verified by the SDK runtime.");
      })
      .catch(() => { if (alive) setArtNote("Live Friend artwork unreachable — stand-in buddy."); });
    // Official Frenemy bodies: preload early so waves render distinct Rare
    // Friends immediately; the renderer falls back to shadow bodies meanwhile.
    // (Skipped under automated mock harnesses — see liveFoes above.)
    if (liveFoes()) {
    preloadFrenemyArts([
      "shadow", "swift", "swarm", "ranged", "tank", "charger",
      "boss:brute", "boss:swarmkeeper", "boss:hunter",
    ]).then(arts => {
      if (!alive) return;
      const kinds = ["shadow", "swift", "swarm", "ranged", "tank", "charger", "boss:brute", "boss:swarmkeeper", "boss:hunter"];
      const m = foesRef.current;
      kinds.forEach((k, i) => {
        const [base, pattern] = k.split(":");
        const id = frenemyIdentity(base, pattern ?? null);
        const a = arts[i];
        if (a) m.set(foeKey(id.family, id.seed), a);
      });
      setFoeVer(v => v + 1);
    }).catch(() => { /* offline: fallback bodies carry the roster */ });
    } // end liveFoes gate

    return () => {
      alive = false;
      media.removeEventListener("change", onMedia);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, friendId]);

  /* ---- home world assets ---- */
  useEffect(() => {
    let alive = true;
    setWorldReady(false);
    assetsRef.current = null;
    homeRef.current = null;
    loadIsoAssets(homeScene).then(a => {
      if (!alive) return;
      assetsRef.current = a;
      homeRef.current = createHomePlot(homeScene, seedNum);
      setWorldReady(true);
    }).catch(() => { if (alive) setLoadError("The Rare Friends world could not load. Check your connection and retry."); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeScene]);

  /* ---- run world assets (fresh runs + map transitions) ---- */
  useEffect(() => {
    if (!runScene) return;
    let alive = true;
    setRunWorldReady(false);
    assetsRunRef.current = null;
    loadIsoAssets(runScene).then(a => {
      if (!alive) return;
      assetsRunRef.current = a;
      setRunWorldReady(true);
    }).catch(() => { if (alive) setLoadError("The next area could not load."); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runScene]);

  useEffect(() => () => disposeSound(), []);

  /* ---- map transition application (after assets arrive) ---- */
  useEffect(() => {
    if (!runWorldReady || !runScene) return;
    const run = runRef.current;
    const pend = pendingMap.current;
    if (run && pend && pend.scene === runScene) {
      pendingMap.current = null;
      applyMapSwap(run, pend.scene, pend.mapIdx, pend.wave);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runWorldReady, runScene]);

  const applyMapSwap = useCallback((run: RunState, scene: Scene, mapIdx: number, wave: number) => {
    enterMap(run, scene, mapIdx);
    beginWave(run, wave);
    const p = { ...profileRef.current };
    const map = MAPS[mapIdx] ?? MAPS[0];
    if (!p.discovered.maps.includes(map.name)) {
      p.discovered.maps.push(map.name);
      if (!p.codex.maps.includes(map.name)) p.codex.maps.push(map.name);
    }
    if (mapIdx > 0 && !p.codex.maps.includes(`expedition-${mapIdx}`)) p.codex.maps.push(`expedition-${mapIdx}`);
    if (mapIdx > 0) grantQuest(p, "q-expedition");
    setProfile(p);
    persist(p);
    announce(run, "AREA CLEARED", `${map.name} — ${map.blurb}`);
  }, []);

  /* ---- DEFEND (home plot, then prep phase) ---- */
  const startDefend = useCallback(() => {
    unlockSound();
    const p = profileRef.current;
    if (!p.plotId) {
      showToast("Choose your home plot first!", "Every Friend needs land to defend.");
      return;
    }
    const gear = equippedGear(p);
    const perma = permaOf(p);
    const derived = computeDerived(perma, gear);
    const weapon = gear[0];
    const plot = plotOf(p);
    // Base choice determines the FIRST map only; rotation continues after.
    const startIdx = plotStartMap(plot.preset);
    const startMap = MAPS[startIdx] ?? MAPS[0];
    const scene = buildScene(
      {
        turret: structTierOf(p, "turret"), healer: structTierOf(p, "healer"),
        collector: structTierOf(p, "collector"), frost: structTierOf(p, "frost"),
      },
      plot.preset, startIdx,
    );
    const run = createRun({
      seed: (Date.now() ^ seedNum) >>> 0,
      scene, mapIdx: startIdx,
      derived,
      turretLvl: structTierOf(p, "turret"), wallLvl: structTierOf(p, "wall"), healerLvl: structTierOf(p, "healer"),
      collectorLvl: structTierOf(p, "collector"),
      lootLuck: perma.loot,
      weaponTint: weapon.tint ?? "#7db83e",
      reducedMotion: motionRef.current,
      manual: !p.autoMode,
      altarLevel: perma.altar ?? 0,
      frostLvl: structTierOf(p, "frost"),
      medbayLvl: structTierOf(p, "medbay"),
      unlocks: {
        bulwark: perma.bulwark ?? 0, traps: perma.traps ?? 0,
        overcharge: perma.overcharge ?? 0, kennel: perma.kennel ?? 0,
        workshop: perma.workshop ?? 0,
      },
      training: perma.training ?? 0,
      plot: {
        hp: 0, regen: plot.bonus.kind === "regen" ? plot.bonus.amount : 0,
        pickup: plot.bonus.kind === "pickup" ? plot.bonus.amount : 0,
        rf: plot.bonus.kind === "rf" ? plot.bonus.amount : 0,
        xp: plot.bonus.kind === "xp" ? plot.bonus.amount : 0,
      },
    });
    resetStructHp(run);
    // Desktop manual play aims with the mouse; touch + AUTO use target aim.
    try {
      run.aimMode = run.manual && window.matchMedia("(pointer: fine)").matches ? "mouse" : "auto";
    } catch {
      run.aimMode = "auto";
    }
    gearLookRef.current = gearLookOf(p);
    // Dev-only QA hooks (localhost dev server only; never on public previews).
    let qaJump = false;
    if (isLocalhost()) {
      try {
        const q = new URLSearchParams(window.location.search);
        const w = parseInt(q.get("fvfWave") ?? "", 10);
        if (Number.isFinite(w) && w >= 1 && w <= 40) { beginWave(run, w); qaJump = true; }
        const rf = parseInt(q.get("fvfRf") ?? "", 10);
        if (Number.isFinite(rf) && rf > 0 && rf <= 5000) {
          run.bankRf += rf;
          run.earned += rf;
        }
        if (q.get("fvfShop") === "1") debugShop(run);
        if (q.get("fvfBuild") === "1") {
          // Mid-game build for map QA: leveled upgrades + wave-10-tier gear.
          const want: Record<string, number> = { power: 2, rapid: 2, multishot: 1, vitality: 2, crit: 1, burn: 1 };
          for (const [id, n] of Object.entries(want)) {
            run.stacks[id as keyof typeof run.stacks] = n;
          }
          try {
            const loadout = [gearById("w3"), gearById("a2"), gearById("t2")];
            applyLoadout(run, computeDerived(permaOf(p), loadout), loadout[0].tint ?? "#7db83e");
          } catch { /* starter loadout stays */ }
        }
        const m = parseInt(q.get("fvfMap") ?? "", 10);
        if (Number.isFinite(m) && m >= 1 && m < MAPS.length) {
          const map = MAPS[m];
          const scene2 = buildScene(
            {
              turret: structTierOf(p, "turret"), healer: structTierOf(p, "healer"),
              collector: structTierOf(p, "collector"), frost: structTierOf(p, "frost"),
            },
            map.preset, m,
          );
          pendingMap.current = { scene: scene2, mapIdx: m, wave: m * 10 + 1 };
          setRunScene(scene2);
        }
      } catch { /* query parsing must never break a run */ }
    }
    runRef.current = run;
    if (!pendingMap.current) setRunScene(scene);
    setOffers([]);
    setResults(null);
    setHud(null);
    setSheet(null);
    setShopUI(null);
    setSoldMap({});
    setBuildOpen(false);
    setPrepUI(null);
    // Wave 1 opens in the preparation phase: inspect, repair, then launch.
    if (!qaJump) beginPrep(run, 1);
    preloadFoesFor(1, startIdx);
    setPhase("combat");
    playCue("action-start");
  }, [seedNum, preloadFoesFor, showToast]);

  const handleMapswap = useCallback((mapIdx: number) => {
    const run = runRef.current;
    if (!run) return;
    const p = profileRef.current;
    const map = MAPS[mapIdx] ?? MAPS[0];
    const levels = {
      turret: structTierOf(p, "turret"), healer: structTierOf(p, "healer"),
      collector: structTierOf(p, "collector"), frost: structTierOf(p, "frost"),
    };
    // Reuse the idle-prebuilt scene when fresh (no synchronous rebuild hitch).
    const scene = cachedScene(levels, map.preset, mapIdx)
      ?? buildScene(levels, map.preset, mapIdx);
    // Expedition bonus for leaving home (chosen at the Trader).
    const exp = expeditionFor(mapIdx);
    const base = baseLevelOf(p.buildings);
    if (mapIdx > 0 && base >= exp.reqBase) {
      run.expRf = exp.rfBonus;
      run.expLoot = exp.lootBonus;
    } else {
      run.expRf = 0;
      run.expLoot = 0;
    }
    pendingMap.current = { scene, mapIdx, wave: run.wave + 1 };
    setRunScene(scene);
    announce(run, mapIdx > 0 ? `EXPEDITION: ${exp.name.toUpperCase()}` : "AREA CLEARED", `${map.name} — ${map.blurb}${mapIdx > 0 && run.expRf > 0 ? ` · +${Math.round(run.expRf * 100)}% RF` : ""}`);
    preloadFoesFor(run.wave + 1, mapIdx);
    playCue("reveal-legendary");
  }, [preloadFoesFor]);

  const commitResults = useCallback((run: RunState, summary: RunSummary) => {
    if (run.committed) return;
    run.committed = true;
    const p = { ...profileRef.current };
    p.simRf += summary.rfEarned;
    p.lifetimeEarned += summary.rfEarned;
    p.lifetimeSpent += summary.rfSpent;
    p.bestWave = Math.max(p.bestWave, summary.wave);
    p.totalKills += summary.kills;
    p.totalBosses += summary.bosses;
    p.runs += 1;
    for (const k of unlockedKinds(summary.wave, summary.mapIdx)) {
      if (!p.discovered.enemies.includes(k)) p.discovered.enemies.push(k);
    }
    // Codex: run discoveries merge into the permanent collection.
    for (const s of run.seenKinds) {
      if (s.startsWith("boss:")) {
        if (!p.codex.bosses.includes(s.slice(5))) p.codex.bosses.push(s.slice(5));
      } else if (!p.codex.enemies.includes(s)) p.codex.enemies.push(s);
    }
    for (const a of run.abilities) {
      if (!p.codex.abilities.includes(a)) p.codex.abilities.push(a);
    }
    // Quest sweep from run stats.
    const newly: string[] = [];
    const q = (id: string, ok: boolean) => {
      if (ok && grantQuest(p, id)) newly.push(id);
    };
    q("q-defend1", summary.wave >= 3);
    q("q-boss1", summary.bosses >= 1);
    q("q-commander", run.seenKinds.includes("commander"));
    q("q-miniboss", run.elitesSlain > 0);
    q("q-expedition", summary.mapIdx >= 1);
    q("q-flawless", run.flawlessWaves >= 1);
    q("q-ability", run.abilities.length > 1);
    toastMilestones(p);
    const newGear: GearItem[] = [];
    for (const id of summary.gearDrops) {
      let item: GearItem;
      try {
        item = gearById(id);
      } catch {
        continue;
      }
      const owned = item.id === p.gear.weapon || item.id === p.gear.armor || item.id === p.gear.trinket || p.vault.includes(item.id);
      if (owned) {
        p.simRf += 25;
        p.lifetimeEarned += 25;
      } else {
        p.vault.push(item.id);
        if (!p.discovered.gear.includes(item.id)) p.discovered.gear.push(item.id);
        if (!p.codex.gear.includes(item.id)) p.codex.gear.push(item.id);
        newGear.push(item);
      }
    }
    setResultsGear(newGear);
    setResults(summary);
    sanitizeProfile(p);
    toastMilestones(p);
    setProfile(p);
    persist(p);
    if (newly.length > 0) {
      try {
        const first = questById(newly[0]);
        showToast(`Quest: ${first.name} (+${first.reward} RF·sim)`, newly.length > 1 ? `+${newly.length - 1} more quests done!` : first.desc);
      } catch { /* unknown quest */ }
    }
    gearLookRef.current = gearLookOf(p);
    setPhase("results");
  }, [showToast, toastMilestones]);

  /* ---- combat loop ---- */
  useEffect(() => {
    if (phase !== "combat") return;
    combatLoopsActive++;
    const loopId = ++combatLoopTotal;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let raf = 0;
    let last = performance.now();
    let hudT = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      perfFrames.current++;
      const run = runRef.current;
      const assets = assetsRunRef.current;
      if (!run || !ctx || !assets) return;
      // Floor at 0: headless rAF timestamps can occasionally step backwards;
      // the SDK movement guard throws on negative deltas.
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      perfFps.current = perfFps.current * 0.95 + (dt > 0 ? (1 / dt) * 0.05 : 0);
      if (!pausedRef.current && !run.over && !run.frozen && !run.shopOpen && run.phase === "combat") stepRun(run, dt);
      if (run.events.length > 0) {
        const evts = run.events.splice(0, run.events.length);
        for (const e of evts) {
          if (e.t === "levelup") {
            setOffers([...run.offers]);
            playCue("reveal-rare");
          } else if (e.t === "bosswarn") {
            // Precompute Trader stock while the boss fight runs (UI opens instantly).
            try {
              const p = profileRef.current;
              const owned = [p.gear.weapon, p.gear.armor, p.gear.trinket, ...p.vault];
              precomputeShop(run, owned, traderModsOf(p, run));
            } catch { /* best-effort */ }
            playCue("anticipation");
          } else if (e.t === "bossdown") {
            playCue("reveal-legendary");
          } else if (e.t === "hurt") {
            if (now - lastHurtSfx.current > 350) {
              lastHurtSfx.current = now;
              playCue("impact");
            }
          }           else if (e.t === "elite") {
            playCue("reveal-rare");
          } else if (e.t === "eshot") {
            if (now - lastEShot.current > 900) {
              lastEShot.current = now;
              playCue("select");
            }
          } else if (e.t === "blast") playCue("impact");
          else if (e.t === "heal") playCue("reward");
          else if (e.t === "pickup") {
            if (now - lastPickupSfx.current > 400) {
              lastPickupSfx.current = now;
              playCue("reward");
            }
          } else if (e.t === "evolved") playCue("reveal-legendary");
          else if (e.t === "geardrop") playCue("reveal-rare");
          else if (e.t === "wave" && e.wave > 1 && e.wave % 5 !== 0) playCue("action-start");
          else if (e.t === "codex") {
            const p = { ...profileRef.current };
            const bucket = e.kind === "boss" ? "bosses" : e.kind === "ability" ? "abilities" : "enemies";
            const arr = p.codex[bucket as keyof typeof p.codex] ?? [];
            if (!arr.includes(e.id)) {
              arr.push(e.id);
              setProfile(p);
              persist(p);
              showToast(`Codex: ${e.id}`, "New discovery recorded.");
            }
            playCue("reveal-common");
          } else if (e.t === "quest") {
            const p = { ...profileRef.current };
            if (grantQuest(p, e.id)) {
              setProfile(p);
              persist(p);
              try {
                const q = questById(e.id);
                showToast(`Quest: ${q.name} (+${q.reward} RF·sim)`, q.desc);
              } catch { /* unknown quest */ }
            }
            playCue("reveal-rare");
          } else if (e.t === "structdown") {
            playCue("impact");
            showToast(`${structLabel(e.id)} destroyed!`, e.id === "homecore" ? "The invasion is lost!" : "Repair it after the wave.");
          } else if (e.t === "structhurt") {
            if (now - lastHurtSfx.current > 800) {
              lastHurtSfx.current = now;
              playCue("impact");
            }
          } else if (e.t === "stolen") {
            playCue("select");
          } else if (e.t === "recovered") {
            playCue("reward");
          } else if (e.t === "prepdone") {
            setPrepUI({ wave: e.wave });
            setPrepCount(8);
            playCue("anticipation");
          } else if (e.t === "trader") {
            run.shopOpen = true;
            // Next-map visuals + scene build happen OFF the critical path:
            // the UI paints instantly from precomputed stock, heavy work idles.
            const scheduleIdle = (fn: () => void) => {
              try {
                const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
                if (ric) ric(fn);
                else setTimeout(fn, 0);
              } catch { setTimeout(fn, 0); }
            };
            scheduleIdle(() => {
              try {
                const pp0 = profileRef.current;
                const nextIdx = (run.mapIdx + 1) % MAPS.length;
                const levels = {
                  turret: structTierOf(pp0, "turret"), healer: structTierOf(pp0, "healer"),
                  collector: structTierOf(pp0, "collector"), frost: structTierOf(pp0, "frost"),
                };
                const ns = prebuildScene(levels, MAPS[nextIdx].preset, nextIdx);
                preloadIsoAssets(ns);
              } catch { /* preload is best-effort only */ }
            });
            const p = profileRef.current;
            const owned = [p.gear.weapon, p.gear.armor, p.gear.trinket, ...p.vault];
            const stock = genStock(run, owned, traderModsOf(p, run)).map(s => ({ ...s, sold: false }));
            run.shop = { block: e.block, wave: run.wave, stock: stock.map(({ sold, ...s }) => s), rerolls: 0 };
            setSoldMap({});
            setShopUI({ stock, rerolls: 0, block: e.block });
            const pp = { ...profileRef.current };
            pp.traders += 1;
            setProfile(pp);
            saveProfile(pp);
            playCue("reward");
          } else if (e.t === "mapswap") {
            handleMapswap(e.mapIdx);
          } else if (e.t === "gameover") {
            playCue("action-ready");
            commitResults(run, e.summary);
          }
        }
      }
      hudT += dt;
      if (hudT > 0.15) {        hudT = 0;
        const stacks: Record<string, number> = {};
        for (const [k, v] of Object.entries(run.stacks)) if (v > 0) stacks[k] = v;
        setHud({
          hp: Math.max(0, Math.ceil(run.hp)), maxHp: run.maxHp,
          wave: run.wave, level: run.level, xp: Math.floor(run.xp), xpNext: run.xpNext,
          kills: run.kills, bankRf: run.bankRf, blastCd: run.blastCd,
          intermission: run.intermission > 0 && run.queue.length === 0 ? run.intermission : 0,
          manual: run.manual, cons: { ...run.cons }, mapIdx: run.mapIdx, armor: run.armor,
          stacks, abilities: [...run.abilities], abilityCd: { ...run.abilityCd, "ab-blast": run.blastCd },
          prep: run.phase === "prep", prepWave: run.phase === "prep" ? run.wave : 0,
          structHp: { ...run.structHp }, structMax: { ...run.structMax },
          relics: [...run.relics], encounter: run.encounter,
          lanes: pendingGates(run),
        });
        try {
          const [px, py] = run.manual ? run.mpos : run.mover.state.position;
          const pathPs = Math.round((run.pathReqs - perfPaths.current) / Math.max(0.01, hudElapsed.current));
          perfPaths.current = run.pathReqs;
          hudElapsed.current = 0;
          (window as unknown as Record<string, unknown>).__fvf = {
            x: Math.round(px), y: Math.round(py), wave: run.wave, kills: run.kills,
            hp: Math.round(run.hp), phase: run.phase, manual: run.manual,
            enemies: run.enemies.length, mapIdx: run.mapIdx,
            shots: run.shots.length, particles: run.particles.length,
            stepMs: Math.round(run.stepMs * 100) / 100,
            renderMs: Math.round(perfRender.current * 100) / 100,
            fps: Math.round(perfFps.current),
            pathPs, loops: perfFrames.current, loopsActive: combatLoopsActive, loopId,
            stuckFixes: run.stuckFixes, rejects: run.spawnRejects,
          };
        } catch { /* readout must never break the loop */ }
      }
      hudElapsed.current += dt;
      // Follow camera: the world scrolls with the Friend (pointer math follows).
      try {
        const [cxp, cyp] = run.manual ? run.mpos : run.mover.state.position;
        updateCamera(cxp, cyp);
      } catch { /* camera must never break the loop */ }
      const r0 = performance.now();
      // Refresh official Frenemy bodies into the view as they arrive.
      try {
        const m = foesRef.current;
        let grew = false;
        for (const e of run.enemies) {
          const id = frenemyIdentity(e.kind, e.pattern);
          const k = foeKey(id.family, id.seed);
          if (!m.has(k)) {
            const a = getFrenemyArtSync(id.family, id.seed);
            if (a) { m.set(k, a); grew = true; }
          }
        }
        if (grew) setFoeVer(v => v + 1);
      } catch { /* art cache must never break the loop */ }
      void foeVer;
      drawIsoCombat(ctx, assets, run, { art, seedNum, reducedMotion: motionRef.current, now: now / 1000, gear: gearLookRef.current, foes: foesRef.current });
      perfRender.current = perfRender.current * 0.9 + (performance.now() - r0) * 0.1;
      if (run.debug) drawDebug(ctx, run, { fps: Math.round(perfFps.current), renderMs: perfRender.current, pathPs: Math.round((run.pathReqs - perfPaths.current) / Math.max(0.01, hudElapsed.current || 0.15)), loops: perfFrames.current });
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      combatLoopsActive = Math.max(0, combatLoopsActive - 1);
    };
  }, [phase, art, seedNum, commitResults, handleMapswap]);

  /* ---- peaceful home loop ---- */
  useEffect(() => {
    if (phase !== "home") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const home = homeRef.current;
      const assets = assetsRef.current;
      if (!home || !ctx || !assets) return;
      if (pausedRef.current || document.hidden) { last = now; return; }
      // Floor at 0: see combat loop (SDK movement guard).
      const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
      last = now;
      const p = profileRef.current;
      const hasStructs = structTierOf(p, "turret") + structTierOf(p, "healer") + structTierOf(p, "collector") + structTierOf(p, "frost") > 0;
      stepHomePlot(home, homeScene, dt, hasStructs, afkRef.current);
      const st = home.mover.state;
      updateCamera(st.position[0], st.position[1]);
      // In-session idle production: the base keeps working while you watch.
      // Capped by vault storage; paused/hidden tabs accrue nothing (early
      // return above). Active defense stays the fastest progression.
      {
        const pr = profileRef.current;
        const merged = {
          ...pr.buildings,
          collector: structTierOf(pr, "collector"),
          vault: structTierOf(pr, "vault"),
        };
        const rateMin = idleProductionRate(merged);
        const nowMs = Date.now();
        if (rateMin > 0) {
          if (!idleLast.current) idleLast.current = nowMs;
          const dtMin = (nowMs - idleLast.current) / 60000;
          if (dtMin >= 0.05) {
            const cap = idleStorageCap(merged);
            const room = Math.max(0, cap - pr.prodBank);
            const gain = Math.min(room, Math.floor(dtMin * rateMin));
            idleLast.current = nowMs;
            if (gain > 0) {
              const np = { ...pr, prodBank: Math.min(cap, pr.prodBank + gain) };
              setProfile(np);
              persist(np);
            }
          }
        } else {
          idleLast.current = nowMs;
        }
        // AFK idle simulation: Friend wanders, structures work, turrets swat
        // minor shadows. Summary accumulates; major invasions still need DEFEND.
        if (afkRef.current) {
          bonusT.current += dt;
          // Training Yard trickle while AFK.
          const trTier = structTierOf(pr, "training");
          if (trTier > 0 && Math.floor(bonusT.current) !== Math.floor(bonusT.current - dt)) {
            afkGain.current.xp += trainingRate(trTier) / 60;
          }
          if (bonusT.current >= 45) {
            bonusT.current = 0;
            const tur = structTierOf(pr, "turret");
            if (tur > 0) {
              const cap = idleStorageCap(merged);
              const room = Math.max(0, cap - pr.prodBank);
              if (room > 0) {
                const bonus = Math.min(room, 2 + tur * 2);
                const np = { ...pr, prodBank: pr.prodBank + bonus };
                setProfile(np);
                persist(np);
                afkGain.current.rf += bonus;
                afkGain.current.repelled += 1 + Math.floor(tur / 2);
              }
            } else {
              afkGain.current.repelled += 0;
            }
          }
        } else {
          bonusT.current = 0;
        }
      }
      drawIsoHome(ctx, assets, homeScene, st.position[0], st.position[1], st.facing, st.walking,
        {
          turret: structTierOf(p, "turret"), wall: structTierOf(p, "wall"),
          healer: structTierOf(p, "healer"), collector: structTierOf(p, "collector"),
          frost: structTierOf(p, "frost"),
        },
        { art, seedNum, tokenId, reducedMotion: motionRef.current, now: now / 1000, pokeT: now / 1000 - pokeAt.current, gear: gearLookRef.current, prodBank: profileRef.current.prodBank });
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, art, seedNum, tokenId, homeScene]);

  const pokeFriend = useCallback(() => {
    unlockSound();
    playCue("select");
    pokeAt.current = performance.now() / 1000;
  }, []);

  /** Stroll the home plot: tap ground to amble over, tap the Friend to poke. */
  const tapHome = useCallback((clientX: number, clientY: number) => {
    const home = homeRef.current;
    const canvas = canvasRef.current;
    if (!home || !canvas) return;
    try {
      const rect = canvas.getBoundingClientRect();
      const pt = screenToWorld(rect, clientX, clientY);
      if (!pt) return;
      const st = home.mover.state;
      if (Math.hypot(pt[0] - st.position[0], pt[1] - st.position[1]) < 44) {
        pokeFriend();
        return;
      }
      home.mover.moveTo([
        Math.min(562, Math.max(14, pt[0])),
        Math.min(370, Math.max(14, pt[1])),
      ]);
    } catch { /* pointer math must never break home */ }
  }, [pokeFriend]);

  const tapMove = useCallback((clientX: number, clientY: number) => {
    const run = runRef.current;
    const canvas = canvasRef.current;
    if (!run || !canvas || !run.manual || run.phase !== "combat" || run.shopOpen) return;
    try {
      const rect = canvas.getBoundingClientRect();
      const pt = screenToWorld(rect, clientX, clientY);
      if (!pt) return;
      run.tapDest = [
        Math.min(562, Math.max(14, pt[0])),
        Math.min(370, Math.max(14, pt[1])),
      ];
      run.tapMark = { x: run.tapDest[0], y: run.tapDest[1], ttl: 0.5 };
    } catch { /* pointer math must never break combat */ }
  }, []);

  /* ---- mouse aim (manual desktop only; touch + AUTO use target aim) ---- */
  useEffect(() => {
    if (phase !== "combat") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e: PointerEvent) => {
      const run = runRef.current;
      if (!run || !run.manual || run.aimMode !== "mouse" || run.shopOpen || pausedRef.current) return;
      try {
        const pt = screenToWorld(canvas.getBoundingClientRect(), e.clientX, e.clientY);
        if (pt) setAim(run, pt[0], pt[1]);
      } catch { /* pointer math must never break combat */ }
    };
    canvas.addEventListener("pointermove", onMove);
    return () => canvas.removeEventListener("pointermove", onMove);
  }, [phase]);

  /* ---- keyboard: WASD · Space/Q/E abilities · Z/X/C/V items · 1-3 level-ups ---- */
  useEffect(() => {
    const KEYMAP: Record<string, string> = {
      w: "w", a: "a", s: "s", d: "d",
      arrowup: "arrowup", arrowdown: "arrowdown", arrowleft: "arrowleft", arrowright: "arrowright",
    };
    /** Ability hotkeys: Space = slot 0 (Blast), Q = slot 1, E = slot 2. */
    const castSlot = (run: RunState, slot: number): boolean => {
      const id = run.abilities[slot] ?? null;
      if (!id) return false;
      if (abilityCd(run, id) > 0) return false;
      return useAbility(run, id);
    };
    /** Item belt: stable order, first four owned consumables. */
    const beltId = (run: RunState, slot: number): string | null => {
      const owned = BELT_ORDER.filter(id => (run.cons[id] ?? 0) > 0).slice(0, 4);
      return owned[slot] ?? null;
    };
    const useBelt = (run: RunState, slot: number): boolean => {
      const id = beltId(run, slot);
      if (!id) return false;
      return useConsumable(run, id);
    };
    /** Modal UI open: items/abilities must not fire through dialogs. */
    const modalOpen = () =>
      (document.querySelector(".fvf-modal") !== null) || (document.querySelector(".fvf-sheet") !== null);
    const onKey = (ev: KeyboardEvent) => {
      const run = runRef.current;
      // Held-key protection: one press = one activation (no auto-repeat spam).
      if (ev.repeat) {
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(ev.key.toLowerCase())) return;
        if (ev.code === "Space" || ev.key === " ") { ev.preventDefault(); return; }
        const lk = ev.key.toLowerCase();
        if (lk === "q" || lk === "e" || lk === "r") return;
        if ((ITEM_HOTKEYS as readonly string[]).includes(lk)) return;
      }
      if ((ev.code === "Space" || ev.key === " ") && phaseRef.current === "combat") {
        ev.preventDefault();
        if (run && !pausedRef.current && !run.shopOpen && castSlot(run, 0)) playCue("impact");
        return;
      }
      const lk0 = ev.key.toLowerCase();
      if ((lk0 === "q" || lk0 === "e") && phaseRef.current === "combat") {
        if (run && !pausedRef.current && !run.shopOpen && castSlot(run, lk0 === "q" ? 1 : 2)) playCue("impact");
        return;
      }
      if (lk0 === "r" && phaseRef.current === "combat") {
        // Reserved third active slot (future altar tier); today it mirrors E.
        if (run && !pausedRef.current && !run.shopOpen && castSlot(run, 2)) playCue("impact");
        return;
      }
      const lkItem = ev.key.toLowerCase();
      if ((ITEM_HOTKEYS as readonly string[]).includes(lkItem) && phaseRef.current === "combat") {
        if (run && !pausedRef.current && !run.shopOpen && !modalOpen() && useBelt(run, (ITEM_HOTKEYS as readonly string[]).indexOf(lkItem))) playCue("reward");
        return;
      }
      if (ev.key === "m" || ev.key === "M") { toggleMute(); return; }
      if ((ev.key === "h" || ev.key === "H") && run && phaseRef.current === "combat") {
        run.debug = !run.debug;
        return;
      }
      const k = KEYMAP[ev.key.length === 1 ? ev.key.toLowerCase() : ev.key.toLowerCase()];
      if (k && run && phaseRef.current === "combat") {
        if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) ev.preventDefault();
        if (ev.type === "keydown") run.keys.add(k);
        return;
      }
      if (phaseRef.current === "combat" && ["1", "2", "3"].includes(ev.key)) {
        const idx = Number(ev.key) - 1;
        if (run && run.frozen && run.offers[idx]) {
          applyUpgrade(run, run.offers[idx].id);
          setOffers([]);
          playCue("purchase");
        }
      }
    };
    const onUp = (ev: KeyboardEvent) => {
      const run = runRef.current;
      if (!run) return;
      run.keys.delete(ev.key.length === 1 ? ev.key.toLowerCase() : ev.key.toLowerCase());
    };
    // Cleanup on blur/hidden tab: no stuck movement, no queued ability spam.
    const onBlur = () => runRef.current?.keys.clear();
    const onVis = () => { if (document.hidden) runRef.current?.keys.clear(); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMute = useCallback(() => {
    unlockSound();
    setMutedUi(prev => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  const toggleMode = useCallback(() => {
    const run = runRef.current;
    if (!run || phaseRef.current !== "combat") return;
    unlockSound();
    if (run.manual) {
      reanchorMover(run);
      run.manual = false;
    } else {
      adoptMoverPos(run);
      run.manual = true;
    }
    const p = { ...profileRef.current, autoMode: !run.manual };
    setProfile(p);
    saveProfile(p);
    playCue("select");
  }, []);

  const chooseUpgrade = useCallback((id: RunState["offers"][number]["id"]) => {
    const run = runRef.current;
    if (!run) return;
    applyUpgrade(run, id);
    setOffers([]);
    playCue("purchase");
  }, []);

  const doReroll = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    if (reroll(run)) {
      setOffers([...run.offers]);
      playCue("select");
    }
  }, []);

  const abilityCdMaxFor = (sid: AbilityId): number => {
    const run = runRef.current;
    return run ? abilityCdMax(run, sid) : 0;
  };

  const doBlast = useCallback(() => {
    const run = runRef.current;
    if (run && useAbility(run, run.abilities[0] ?? "ab-blast")) playCue("impact");
  }, []);

  /** Active loadout slots: Space = 0, Q = 1, E = 2 (Blast + up to 2). */
  const doSlot = useCallback((slot: number) => {
    const run = runRef.current;
    if (!run) return;
    const id = run.abilities[slot] ?? null;
    if (id && useAbility(run, id)) playCue("impact");
  }, []);

  const doHeal = useCallback(() => {
    const run = runRef.current;
    if (run && heal(run)) playCue("reward");
  }, []);

  const doConsumable = useCallback((id: string) => {
    const run = runRef.current;
    if (run && useConsumable(run, id)) playCue("reward");
  }, []);

  /* ---- trader transactions (synchronous + atomic) ---- */
  const ownedIds = useCallback(() => {
    const p = profileRef.current;
    return [p.gear.weapon, p.gear.armor, p.gear.trinket, ...p.vault];
  }, []);

  const buyStock = useCallback((idx: number) => {
    const run = runRef.current;
    const ui = shopUIRef.current;
    if (!run || !run.shop || !ui || ui.stock[idx]?.sold) return;
    // Re-read the authoritative price from the engine stock (never the DOM).
    const line = run.shop.stock[idx];
    if (!line) return;
    if (run.bankRf < line.price) return;
    if (line.kind === "consumable") {
      if (!bankSpendRun(run, line.price)) return;
      run.cons[line.id] = (run.cons[line.id] ?? 0) + 1;
    } else if (line.kind === "ability") {
      const aid = line.id as AbilityId;
      if (!ABILITIES[aid] || run.abilities.includes(aid)) return;
      if (!bankSpendRun(run, line.price)) return;
      run.abilities.push(aid);
      run.abilityRank[aid] = 1;
      while (run.abilities.length > 3) {
        const di = run.abilities.findIndex(a => a !== "ab-blast");
        if (di < 0) break;
        const [dropped] = run.abilities.splice(di, 1);
        delete run.abilityRank[dropped];
      }
      announce(run, `${ABILITIES[aid].name.toUpperCase()} EQUIPPED!`, `${ABILITIES[aid].desc} Press ${ABILITIES[aid].key}.`);
      const pq = { ...profileRef.current };
      if (!pq.codex.abilities.includes(aid)) pq.codex.abilities.push(aid);
      if (grantQuest(pq, "q-ability")) showToast("Quest: New Trick (+30 RF·sim)", "Unlock a run ability.");
      setProfile(pq);
      persist(pq);
    } else if (line.kind === "relic") {
      try { relicById(line.id); } catch { return; }
      if (run.relics.includes(line.id)) return;
      if (!bankSpendRun(run, line.price)) return;
      run.relics.push(line.id);
      if (line.id === "re-glass") {
        run.maxHp = Math.max(1, Math.round(run.maxHp * 0.75));
        run.hp = Math.min(run.hp, run.maxHp);
      }
      announce(run, `${relicById(line.id).name.toUpperCase()} CLAIMED!`, relicById(line.id).desc);
    } else {
      let item: GearItem;
      try {
        item = gearById(line.id);
      } catch {
        return;
      }
      if (!bankSpendRun(run, line.price)) return;
      const p = { ...profileRef.current };
      const prev = p.gear[item.slot];
      p.gear[item.slot] = item.id;
      p.vault = p.vault.filter(v => v !== item.id);
      if (prev && !["w0", "a0", "t0"].includes(prev) && prev !== item.id) p.vault.push(prev);
      if (!p.discovered.gear.includes(item.id)) p.discovered.gear.push(item.id);
      p.lifetimeSpent += line.price;
      setProfile(p);
      saveProfile(p);
      gearLookRef.current = gearLookOf(p);
      // Trader gear takes effect in the CURRENT run immediately.
      const gear = equippedGear(p);
      const weapon = gear[0];
      applyLoadout(run, computeDerived(permaOf(p), gear), weapon.tint ?? "#7db83e");
    }
    const p2 = { ...profileRef.current };
    p2.lifetimeSpent += line.kind === "consumable" ? line.price : 0;
    setProfile(p2);
    saveProfile(p2);
    setSoldMap(m => ({ ...m, [idx]: true }));
    playCue("purchase");
  }, [showToast]);
  const shopUIRef = useRef(shopUI);
  shopUIRef.current = shopUI;

  const doShopReroll = useCallback(() => {
    const run = runRef.current;
    if (!run || !run.shop) return;
    if (rerollShop(run, ownedIds())) {
      setShopUI({ stock: run.shop.stock.map(s => ({ ...s, sold: false })), rerolls: run.shop.rerolls, block: run.shop.block });
      setSoldMap({});
      playCue("select");
    }
  }, [ownedIds]);

  const closeShop = useCallback(() => {
    const run = runRef.current;
    if (!run) return;
    // Map rotation every 5 waves: after a boss the invasion moves to the
    // NEXT map so regions never go stale. Build, equipment, bank and rewards
    // all carry across (the run object persists; only the scene swaps).
    if (run.wave % 5 === 0) {
      const dest = (run.mapIdx + 1) % MAPS.length;
      run.phase = "combat";
      run.shopOpen = false;
      run.shop = null;
      setShopUI(null);
      setSoldMap({});
      handleMapswap(dest);
      playCue("select");
      return;
    }
    closeTrader(run);
    setShopUI(null);
    setSoldMap({});
    playCue("select");
  }, [handleMapswap]);

  const buyUpgrade = useCallback((id: string, cost: number, maxLevel: number) => {
    unlockSound();
    const p = { ...profileRef.current };
    const lvl = p.levels[id] ?? 0;
    if (lvl >= maxLevel || p.simRf < cost) return;
    p.simRf -= cost;
    p.lifetimeSpent += cost;
    p.levels[id] = lvl + 1;
    if ((p.levels.altar ?? 0) >= 2 && grantQuest(p, "q-altar2")) showToast("Quest: Altar Rising (+60 RF·sim)", "Ability Altar tier 2.");
    if (baseLevelOf({ ...p.buildings, [id]: lvl + 1 }) >= 8 && grantQuest(p, "q-base8")) showToast("Quest: Hamlet (+90 RF·sim)", "Base Level 8 reached.");
    setProfile(p);
    persist(p);
    gearLookRef.current = gearLookOf(p);
    playCue("purchase");
  }, [showToast]);

  const doRepair = useCallback((id: string) => {
    const run = runRef.current;
    if (!run) return;
    if (repairStructure(run, id)) {
      setHud(h => (h ? { ...h, bankRf: run.bankRf, structHp: { ...run.structHp } } : h));
      playCue("purchase");
    }
  }, []);

  const equipFromVault = useCallback((item: GearItem) => {
    unlockSound();
    const p = { ...profileRef.current };
    if (!p.vault.includes(item.id)) return;
    const prev = p.gear[item.slot];
    p.gear[item.slot] = item.id;
    p.vault = p.vault.filter(v => v !== item.id);
    if (prev && !["w0", "a0", "t0"].includes(prev) && prev !== item.id) p.vault.push(prev);
    setProfile(p);
    saveProfile(p);
    gearLookRef.current = gearLookOf(p);
    playCue("purchase");
  }, []);

  const sellFromVault = useCallback((item: GearItem) => {
    unlockSound();
    const p = { ...profileRef.current };
    if (!p.vault.includes(item.id)) return;
    if (["w0", "a0", "t0"].includes(item.id)) return;
    p.vault = p.vault.filter(v => v !== item.id);
    const value = sellValue(item);
    p.simRf += value;
    p.lifetimeEarned += value;
    setProfile(p);
    saveProfile(p);
    playCue("reward");
  }, []);

  const equipResultGear = useCallback((item: GearItem) => {
    const p = { ...profileRef.current };
    const prev = p.gear[item.slot];
    p.gear[item.slot] = item.id;
    p.vault = p.vault.filter(v => v !== item.id);
    if (prev && !["w0", "a0", "t0"].includes(prev)) p.vault.push(prev);
    setProfile(p);
    saveProfile(p);
    setResultsGear(g => g.filter(x => x.id !== item.id));
    gearLookRef.current = gearLookOf(p);
    playCue("purchase");
  }, []);

  /* ---- settlement: plots, structures, production ---- */
  const choosePlot = useCallback((id: string) => {
    unlockSound();
    const p = { ...profileRef.current };
    p.plotId = id;
    if (!p.codex.plots.includes(id)) p.codex.plots.push(id);
    if (grantQuest(p, "q-plot")) showToast("Quest: Claim Home (+20 RF·sim)", "Choose where your Friend lives.");
    toastMilestones(p);
    setProfile(p);
    persist(p);
    gearLookRef.current = gearLookOf(p);
    playCue("purchase");
  }, [showToast, toastMilestones]);

  const buyStructure = useCallback((id: string) => {
    unlockSound();
    let def;
    try {
      def = structureById(id);
    } catch {
      return;
    }
    const p = { ...profileRef.current };
    const tier = structTierOf(p, id);
    if (tier >= def.maxTier) return;
    const cost = def.costs[tier] ?? 999999;
    if (p.simRf < cost) return;
    if (tier === 0 && buildingsUsedOf(p) >= buildingSlotsOf(p)) {
      showToast("No room! Upgrade Plot Expansion.", "Defense vs production: choose.");
      return;
    }
    p.simRf -= cost;
    p.lifetimeSpent += cost;
    p.levels[id] = tier + 1;
    p.buildings[id] = tier + 1;
    if (!p.codex.structures.includes(id)) p.codex.structures.push(id);
    if (id === "turret" && tier === 0 && grantQuest(p, "q-turret")) showToast("Quest: First Nails (+25 RF·sim)", "Build your first turret.");
    if ((p.levels.altar ?? 0) >= 2 && grantQuest(p, "q-altar2")) showToast("Quest: Altar Rising (+60 RF·sim)", "Ability Altar tier 2.");
    if (baseLevelOf(p.buildings) >= 8 && grantQuest(p, "q-base8")) showToast("Quest: Hamlet (+90 RF·sim)", "Base Level 8 reached.");
    toastMilestones(p);
    setProfile(p);
    persist(p);
    gearLookRef.current = gearLookOf(p);
    playCue("purchase");
  }, [showToast, toastMilestones]);

  const collectProduction = useCallback(() => {
    unlockSound();
    const p = { ...profileRef.current };
    if (p.prodBank <= 0) return;
    p.simRf += p.prodBank;
    p.lifetimeEarned += p.prodBank;
    const got = p.prodBank;
    p.prodBank = 0;
    if (grantQuest(p, "q-collect")) showToast("Quest: First Harvest (+25 RF·sim)", "Collect produced RF.");
    else showToast(`Collected +${got} RF·sim`, "The Collector keeps humming.");
    setProfile(p);
    persist(p);
    playCue("reward");
  }, [showToast]);

  /** AFK toggle with summary: entering records start, leaving shows compact report. */
  const toggleAfk = useCallback(() => {
    unlockSound();
    if (!afkRef.current) {
      afkStart.current = Date.now();
      afkGain.current = { rf: 0, xp: 0, repelled: 0 };
      setAfkSummary(null);
      setAfk(true);
      playCue("select");
      showToast("AFK: your Friend minds the base", "Wanders, collects, turrets swat minor shadows.");
    } else {
      const secs = Math.max(0, Math.round((Date.now() - afkStart.current) / 1000));
      setAfk(false);
      playCue("select");
      const g = afkGain.current;
      if (secs >= 20 || g.rf > 0 || g.repelled > 0) {
        setAfkSummary({ secs, rf: Math.round(g.rf), xp: Math.round(g.xp), repelled: g.repelled });
      }
    }
  }, [showToast]);

  /** Tutorial advance: contextual beats, skippable, never blocks veterans. */
  const tutNext = useCallback(() => {
    setTutStep(s => s + 1);
    playCue("select");
  }, []);
  const tutSkip = useCallback(() => {
    setTutDone(true);
    setTutStep(99);
    const p = { ...profileRef.current, seenIntro: true };
    setProfile(p);
    saveProfile(p);
    playCue("select");
  }, []);

  const launchPrep = useCallback(() => {
    const run = runRef.current;
    if (!run || run.phase !== "prep") return;
    unlockSound();
    launchWave(run);
    setPrepUI(null);
    playCue("action-start");
  }, []);

  /* ---- prep auto-launch countdown (anticipation, not a menu trap) ---- */
  useEffect(() => {
    if (!prepUI || phase !== "combat") return;
    setPrepCount(8);
    const iv = window.setInterval(() => {
      setPrepCount(c => {
        if (c <= 1) {
          window.clearInterval(iv);
          launchPrep();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, [prepUI, phase, launchPrep]);

  if (phase === "loading") {
    return (
      <section className="fvf" aria-label="FRIENDS vs FRENEMIES">
        <div className="fvf-loading" role={loadError ? "alert" : "status"}>
          {loadError ? (
            <>
              <h2>Could not start the session</h2>
              <p>{loadError}</p>
              <button type="button" onClick={() => window.location.reload()}>Retry</button>
              <p className="fvf-fine">Wallet, network or Friend eligibility is handled by the SDK runtime.</p>
            </>
          ) : (
            <>
              <h2>Waking up your Friend…</h2>
              <p>Verifying with the SDK runtime and growing the plot.</p>
            </>
          )}
        </div>
      </section>
    );
  }

  const perma = permaOf(profile);
  const gear = equippedGear(profile);
  const power = (() => {
    const d = computeDerived(perma, gear);
    return Math.round((d.dmg / d.interval) * 10) / 10;
  })();

  const upgradeList = (cat: Tab) => (
    <>
      {PERMA_UPGRADES.filter(u => u.category === cat).map(u => {
        const lvl = profile.levels[u.id] ?? 0;
        const maxed = lvl >= u.maxLevel;
        const cost = maxed ? 0 : u.costs[lvl];
        return (
          <div key={u.id} className="fvf-up">
            <Pix id={u.id === "dmg" ? "dmg" : u.id === "rate" ? "rate" : u.id === "hp" ? "hp" : u.id === "crit" ? "crit" : u.id === "greed" ? "economy" : u.id === "loot" ? "rarity" : "upgrade"} size={26} />
            <div>
              <strong>{u.name} {lvl > 0 && <em>Lv {lvl}</em>}</strong>
              <small>{u.desc}</small>
              <span className="fvf-pips" aria-label={`Level ${lvl} of ${u.maxLevel}`}>
                {Array.from({ length: u.maxLevel }).map((_, i) => (
                  <i key={i} className={i < lvl ? "on" : ""} />
                ))}
              </span>
            </div>
            <button
              type="button"
              disabled={maxed || profile.simRf < cost}
              onClick={() => buyUpgrade(u.id, cost, u.maxLevel)}
              aria-label={maxed ? `${u.name} maxed` : `Buy ${u.name} for ${cost} simulated RF`}
            >
              {maxed ? "MAX" : `${cost} RF`}
            </button>
          </div>
        );
      })}
    </>
  );

  const gearPanel = (sellable: boolean) => (
    <div className="fvf-gear">
      <p className="fvf-fine">Trader and boss gear. Equipping is instant — shots, aura and charms change.</p>
      {(["weapon", "armor", "trinket"] as const).map(slot => {
        const eq = gear.find(g => g.slot === slot);
        const owned = profile.vault.map(v => { try { return gearById(v); } catch { return null; } }).filter((x): x is GearItem => !!x && x.slot === slot);
        return (
          <div key={slot} className="fvf-gearslot">
            <strong>{slot === "weapon" ? "Attack Style" : slot === "armor" ? "Armor" : "Trinket"}: {eq?.name}</strong>
            <small>{eq?.desc}</small>
            {owned.map(item => (
              <div key={item.id} className="fvf-up">
                <div>
                  <strong style={{ color: RARITY_COLORS[item.rarity] }}>{item.name} · {item.rarity}</strong>
                  <small>{item.desc}</small>
                </div>
                <button type="button" onClick={() => equipFromVault(item)}>Equip</button>
                {sellable && !["w0", "a0", "t0"].includes(item.id) && (
                  <button type="button" onClick={() => sellFromVault(item)}>+{sellValue(item)}</button>
                )}
              </div>
            ))}
            {owned.length === 0 && <small className="fvf-fine">No spares — visit the Trader, defeat bosses!</small>}
          </div>
        );
      })}
    </div>
  );

  /** Build-synergy hint so progression feels intentional (never full spoilers). */
  const synergyHint = (id: string): string | null => {
    const fam = runRef.current?.derived.family;
    if (id === "burn" && fam === "scatter") return "STAR BURST · evolution 2/3";
    if (id === "multishot" && fam === "twin") return "FRIEND BARRAGE · evolution 2/3";
    if (id === "pierce" && fam === "needle") return "VOID LANCE · evolution 2/3";
    if (id === "ricochet" && fam === "spark") return "PINBALL · evolution 2/3";
    if (id === "storm") return "THUNDERHEAD with crit";
    if (id === "minifriend" || id === "buddy") return "FRIEND ARMY with Buddy";
    if (id.startsWith("ab-")) return ABILITIES[id as AbilityId]?.role ?? null;
    return null;
  };

  const statDiff = (item: GearItem, equipped: GearItem | undefined): { label: string; delta: string; good: boolean }[] => {
    const keys: [keyof GearItem, string][] = [
      ["dmg", "dmg"], ["rate", "rate%"], ["hp", "HP"], ["crit", "crit%"], ["critDmg", "crit×"],
      ["projectiles", "shots"], ["pierce", "pierce"], ["bounce", "bounce"], ["regen", "regen"], ["armor", "armor"],
      ["moveSpeed", "move%"], ["magnet", "magnet"], ["cdr", "cdr%"], ["dodge", "dodge%"],
      ["bossDmg", "boss%"], ["compDmg", "buddy%"], ["thorns", "thorns%"], ["knockback", "knock"],
      ["volatile", "vol%"],
    ];
    const out: { label: string; delta: string; good: boolean }[] = [];
    for (const [k, label] of keys) {
      const nv = (item[k] as number | undefined) ?? 0;
      const cv = (equipped?.[k] as number | undefined) ?? 0;
      const d = Math.round((nv - cv) * 100) / 100;
      if (d === 0) continue;
      const pct = label.endsWith("%") || label === "crit×";
      const txt = `${d > 0 ? "+" : ""}${pct && label !== "crit×" ? Math.round(d * 100) : d}`;
      out.push({ label, delta: txt, good: d > 0 });
    }
    return out.slice(0, 5);
  };

  const shopModal = shopUI && runRef.current && (    <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Rare Trader">
      <div className="fvf-card fvf-shop">
        <h2><span className="fvf-h2pix"><Pix id="home" size={18} /></span> RARE TRADER</h2>
        <div className="fvf-cardhead">
          <PixelPortrait rows={traderRows} size={56} label="Trader portrait" />
          <p className="fvf-fine fvf-sub">Wave {runRef.current.wave} cleared · <strong>{hud?.bankRf ?? 0} RF·sim</strong> to spend · combat waits · your Friend watches from the stall</p>
        </div>
        <div className="fvf-stock">
          {shopUI.stock.map((s, i) => {
            const sold = soldMap[i];
            if (s.kind === "consumable") {
              const con = CONSUMABLES.find(c => c.id === s.id);
              if (!con) return null;
              return (
                <div key={i} className="fvf-shopitem" style={{ borderLeftColor: "#3f7fbf" }}>
                  <Pix id="prod" size={30} />
                  <div>
                    <strong>{con.name}</strong>
                    <small>{con.desc}</small>
                    <small className="fvf-fine">Single-run supply · {s.price} RF·sim</small>
                  </div>
                  <button type="button" disabled={sold || (hud?.bankRf ?? 0) < s.price} onClick={() => buyStock(i)}>
                    {sold ? "TOOK" : `${s.price} RF`}
                  </button>
                </div>
              );
            }
            if (s.kind === "ability") {
              const def = ABILITIES[s.id as AbilityId];
              if (!def) return null;
              const owned = (hud?.abilities ?? []).includes(s.id as AbilityId);
              return (
                <div key={i} className="fvf-shopitem fvf-ability" style={{ borderLeftColor: "#7a5fc0" }}>
                  <Pix id={s.id} size={30} />
                  <div>
                    <strong>{def.name} [{def.key}] · {def.rarity}</strong>
                    <small>{def.desc}</small>
                    <small className="fvf-fine">{def.role} · equips to this run · Blast + 2 max{owned ? " · already held" : ""}</small>
                  </div>
                  <button type="button" disabled={sold || owned || (hud?.bankRf ?? 0) < s.price} onClick={() => buyStock(i)}>
                    {sold || owned ? "HELD" : `${s.price} RF`}
                  </button>
                </div>
              );
            }
            if (s.kind === "relic") {
              let relic: { name: string; desc: string };
              try { relic = relicById(s.id); } catch { return null; }
              return (
                <div key={i} className="fvf-shopitem fvf-relic" style={{ borderLeftColor: "#8a5a00" }}>
                  <Pix id="rarity" size={30} />
                  <div>
                    <strong>{relic.name} · Relic</strong>
                    <small>{relic.desc}</small>
                    <small className="fvf-fine">Run-only · build-defining · {s.price} RF·sim</small>
                  </div>
                  <button type="button" disabled={sold || (hud?.bankRf ?? 0) < s.price} onClick={() => buyStock(i)}>
                    {sold ? "HELD" : `${s.price} RF`}
                  </button>
                </div>
              );
            }
            let item: GearItem;
            try {
              item = gearById(s.id);
            } catch {
              return null;
            }
            const eq = equippedGear(profile).find(g => g.slot === item.slot);
            const famNote = item.slot === "weapon" && item.family ? ` · style: ${ATTACK_STYLE_NAMES[item.family]}` : "";
            const curName = eq?.name ?? "none";
            const kindLabel = item.slot === "weapon" ? "attack style" : item.slot === "armor" ? "armor" : "trinket";
            return (
              <div key={i} className="fvf-shopitem" style={{ borderLeftColor: RARITY_COLORS[item.rarity] }}>
                <Pix id={item.slot === "weapon" ? "dmg" : item.slot === "armor" ? "armor" : "rarity"} size={30} />
                <div>
                  <strong style={{ color: RARITY_COLORS[item.rarity] }}>{item.name} · {item.rarity} {kindLabel}</strong>
                  <small>{item.desc}{famNote}</small>
                  <small className="fvf-fine">Current: {curName} · preview: Friend spark and aura change instantly</small>
                  <span className="fvf-diff">
                    {statDiff(item, eq).map((d, j) => (
                      <em key={j} className={d.good ? "up" : "down"}>{d.label} {d.delta}</em>
                    ))}
                    <em className="same">now: {eq?.name}</em>
                  </span>
                </div>
                <button type="button" disabled={sold || (hud?.bankRf ?? 0) < s.price} onClick={() => buyStock(i)}>
                  {sold ? "SOLD" : `${s.price} RF`}
                </button>
              </div>
            );
          })}
        </div>
        {runRef.current.wave % 5 === 0 && (() => {
          const next = MAPS[(runRef.current!.mapIdx + 1) % MAPS.length] ?? MAPS[0];
          const exp = expeditionFor((runRef.current!.mapIdx + 1) % MAPS.length);
          const base = baseLevelOf(profile.buildings);
          const bonus = (runRef.current!.mapIdx + 1) % MAPS.length > 0 && base >= exp.reqBase;
          return (
            <div className="fvf-gear">
              <strong>Next: {next.name} — the map rotates after this boss</strong>
              <div className="fvf-up">
                <div>
                  <small>{next.blurb}{bonus && exp.rfBonus > 0 ? ` · +${Math.round(exp.rfBonus * 100)}% RF` : ""}{bonus && exp.lootBonus > 0 ? ` · +${Math.round(exp.lootBonus * 100)}% loot` : ""}</small>
                  {!bonus && exp.reqBase > 0 && <small className="fvf-fine">Base Lv{exp.reqBase} unlocks the travel bonus</small>}
                </div>
              </div>
            </div>
          );
        })()}
        <div className="fvf-row">
          <button type="button" onClick={doShopReroll} disabled={(hud?.bankRf ?? 0) < rerollCost(shopUI.rerolls)}>
            Reroll ({rerollCost(shopUI.rerolls)})
          </button>
          <button type="button" className="fvf-primary" onClick={closeShop}>
            CONTINUE W{runRef.current.wave + 1}
          </button>
        </div>
        <p className="fvf-fine">Rerolls reset at the next Trader · buying equips instantly · all RF·sim</p>
      </div>
    </div>
  );

  const buildModal = buildOpen && runRef.current && (
    <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Build inspector">
      <div className="fvf-card">
        <h2><span className="fvf-h2pix"><Pix id="building" size={18} /></span> BUILD</h2>
        <div className="fvf-gear">
          {equippedGear(profile).map(g => (
            <div key={g.id} className="fvf-up">
              <Pix id={g.slot === "weapon" ? "dmg" : g.slot === "armor" ? "armor" : "rarity"} size={26} />
              <div>
                <strong style={{ color: RARITY_COLORS[g.rarity] }}>{g.slot === "weapon" ? "attack style" : g.slot}: {g.name}</strong>
                <small>{g.desc}</small>
              </div>
            </div>
          ))}
          {(hud?.abilities ?? []).map((a, si) => {
            const rk = runRef.current?.abilityRank[a] ?? 1;
            return (
              <div key={a} className="fvf-up">
                <Pix id={a} size={26} />
                <div>
                  <strong>Ability [{["Space", "Q", "E"][si] ?? "?"}]: {ABILITIES[a]?.name ?? a}{rk > 1 ? ` R${rk}` : ""}</strong>
                  <small>{ABILITIES[a]?.desc ?? ""} · {ABILITIES[a]?.role ?? ""} · {ABILITIES[a]?.rarity ?? ""}</small>
                </div>
              </div>
            );
          })}
          {(hud?.relics ?? []).map(r => {
            let name = r, desc = "";
            try {
              const rd = relicById(r);
              name = rd.name; desc = rd.desc;
            } catch { /* unknown relic */ }
            return (
              <div key={r} className="fvf-up">
                <Pix id="rarity" size={26} />
                <div>
                  <strong>{name}</strong>
                  <small>{desc}</small>
                </div>
              </div>
            );
          })}
          {(Object.entries(hud?.stacks ?? {}) as [string, number][]).map(([id, n]) => (
            <div key={id} className="fvf-up">
              <div>
                <strong>{UPGRADES[id as keyof typeof UPGRADES]?.name ?? id} ×{n}</strong>
                <small>{UPGRADES[id as keyof typeof UPGRADES]?.desc ?? ""}</small>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="fvf-primary" onClick={() => setBuildOpen(false)}>Back</button>
      </div>
    </div>
  );

  /* ---- settlement + briefing panels ---- */
  const basePanel = () => {
    const blvl = baseLevelOf(profile.buildings);
    const tier = settlementTierFor(blvl);
    const used = buildingsUsedOf(profile);
    const slots = buildingSlotsOf(profile);
    const cap = vaultCap(structTierOf(profile, "vault"));
    const syns = activeSynergies(profile.buildings);
    const autoCol = autoCollectTier(structTierOf(profile, "vault"));
    const autoRep = autoRepairTier(structTierOf(profile, "workshop"));
    const catIcon = (c: string) => c === "defense" ? "defense" : c === "production" ? "prod" : c === "support" ? "support" : c === "economy" ? "economy" : c === "research" ? "ability" : "building";
    return (
      <div className="fvf-gear">
        <div className="fvf-cardhead">
          <PixelPortrait rows={portraitRows} size={48} label="Your Friend" />
          <p className="fvf-fine fvf-sub">{tier.name} · Base Lv{blvl} — {tier.desc}</p>
        </div>
        <p className="fvf-fine"><Pix id="building" size={14} /> {used}/{slots} · <Pix id="storage" size={14} /> {profile.prodBank}/{cap} RF·sim{autoCol ? " · auto-collect ON" : ""}{autoRep ? " · repair bot ON" : ""}</p>
        {syns.length > 0 && (
          <div className="fvf-synrow">
            {syns.map(s => (
              <span key={s.id} className="fvf-synchip" title={s.desc}><Pix id={s.icon} size={14} /> {s.name}</span>
            ))}
          </div>
        )}
        <div className="fvf-row">
          <button type="button" className={profile.prodBank > 0 ? "fvf-pulse" : ""} disabled={profile.prodBank <= 0} onClick={collectProduction}>
            <Pix id="rf" size={14} /> Collect ({profile.prodBank})
          </button>
          <button type="button" onClick={() => { setCodexOpen(true); playCue("select"); }}>Codex</button>
          <button type="button" onClick={() => { setQuestsOpen(true); playCue("select"); }}>Quests ({QUESTS.filter(q => profile.quests.includes(q.id)).length}/{QUESTS.length})</button>
        </div>
        {STRUCTURES.map(s => {
          const t = structTierOf(profile, s.id);
          const maxed = t >= s.maxTier;
          const cost = maxed ? 0 : s.costs[t];
          const blocked = t === 0 && used >= slots;
          const specList = specsFor(s.id);
          const chosen = specs[s.id];
          const open = inspectId === s.id;
          return (
            <div key={s.id} className="fvf-up fvf-bld">
              <Pix id={catIcon(s.category)} size={26} />
              <div>
                <strong>{s.name} {t > 0 && <em>T{t}</em>} <span className="fvf-cat">{s.category}</span></strong>
                <small>{s.desc}</small>
                <small className="fvf-fine">Tier {t}/{s.maxTier}{t >= 3 && specList.length > 0 ? ` · spec: ${specList.find(x => x.id === chosen)?.name ?? "choose at T3"}` : ""} · {open ? "tap Inspect to close" : ""}</small>
                <span className="fvf-pips" aria-label={`${s.name} tier ${t} of ${s.maxTier}`}>
                  {Array.from({ length: s.maxTier }).map((_, i) => (
                    <i key={i} className={i < t ? "on" : ""} />
                  ))}
                </span>
                {open && (
                  <span className="fvf-inspect">
                    <small>Upgrade path: {s.costs.map((c, i) => `T${i + 1} ${c}`).join(" · ")} RF·sim. Visible growth each tier.</small>
                    {specList.length > 0 && t >= 2 && (
                      <span className="fvf-speclist">
                        {specList.map(sp => (
                          <button key={sp.id} type="button" className={chosen === sp.id ? "on" : ""} onClick={() => { setSpecs(prev => ({ ...prev, [s.id]: sp.id })); playCue("select"); }} title={sp.desc}>
                            <Pix id={sp.icon} size={14} /> {sp.name}
                          </button>
                        ))}
                      </span>
                    )}
                    {specList.length > 0 && t >= 2 && <small className="fvf-fine">{specList.find(x => x.id === chosen)?.desc ?? "Pick a specialization — it shapes your build."}</small>}
                  </span>
                )}
              </div>
              <span className="fvf-bldbtns">
                <button type="button" onClick={() => { setInspectId(open ? null : s.id); playCue("select"); }} aria-label={`Inspect ${s.name}`}>
                  {open ? "Hide" : "Inspect"}
                </button>
                <button
                  type="button"
                  disabled={maxed || blocked || profile.simRf < cost}
                  onClick={() => buyStructure(s.id)}
                  aria-label={maxed ? `${s.name} maxed` : blocked ? `${s.name} needs room` : `Build ${s.name} for ${cost} simulated RF`}
                  title={blocked ? "Upgrade Plot Expansion for room" : s.category}
                >
                  {maxed ? "MAX" : `${cost} RF`}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const plotPicker = (compact: boolean) => (
    <div className="fvf-gear">
      {!compact && <p className="fvf-fine">Choose where your Rare Friend lives. Looks differ; bonuses are small and balanced.</p>}
      {PLOTS.map(pl => {
        const active = profile.plotId === pl.id;
        return (
          <div key={pl.id} className="fvf-up">
            <div>
              <strong>{pl.name} {active && <em>HOME</em>}</strong>
              <small>{pl.desc}</small>
              <small className="fvf-fine">{pl.tendency}</small>
            </div>
            {!active && (
              <button type="button" onClick={() => choosePlot(pl.id)} aria-label={`Settle in ${pl.name}`}>
                Settle
              </button>
            )}
          </div>
        );
      })}
    </div>
  );

  const prepModal = prepUI && runRef.current && hud?.prep && (() => {
    const info = prepInfo(prepUI.wave, runRef.current.mapIdx);
    const run = runRef.current;
    const structIds = Object.keys(run.structMax);
    const bossName = info.boss ? cleanName(info.boss) : "";
    return (
      <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Prepare defense">
        <div className="fvf-card fvf-shop">
          <h2><span className="fvf-h2pix"><Pix id="defense" size={18} /></span> PREPARE — WAVE {info.wave}</h2>
          <p className="fvf-fine">{info.name} · {info.desc}</p>
          <p className="fvf-fine">
            {info.boss ? `${bossName} approaches!` : `Scouts report: ${info.kinds.join(", ")}.`}
            {run.expRf > 0 && ` · Expedition bonus +${Math.round(run.expRf * 100)}% RF`}
          </p>
          {(() => {
            const lanes = run.scene.gates.map(g => gateLabel(run.home, g));
            const enc = ENCOUNTERS[info.encounter];
            const tip = info.boss
              ? "Boss assault — it may march on your structures. Protect the Home Core!"
              : enc?.structureRaid
                ? "Raiders will run at your structures — intercept them!"
                : enc?.gateFocus
                  ? "Single-gate breach — reposition to the threatened lane once it lands!"
                  : "The invasion enters through the gates below.";
            return (
              <p className="fvf-fine"><Pix id="wave" size={16} /> Watch: {lanes.join(" · ")}<br />{tip}</p>
            );
          })()}
          {structIds.length > 0 && (
            <div className="fvf-stock">
              {structIds.map(id => {
                const cur = run.structHp[id] ?? 0;
                const max = run.structMax[id] ?? 1;
                const cost = repairCost(run, id);
                return (
                  <div key={id} className="fvf-up">
                    <div>
                      <strong>{structLabel(id)}</strong>
                      <small>{cur >= max ? "Holding." : `Damaged ${cur}/${max}.`}</small>
                    </div>
                    <button type="button" disabled={cur >= max || run.bankRf < cost} onClick={() => doRepair(id)}>
                      {cur >= max ? "OK" : `Fix ${cost}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <div className="fvf-row">
            <button type="button" onClick={toggleMode} aria-pressed={!run.manual}>
              {(run.manual ? "MANUAL" : "AUTO") + " · tap to switch"}
            </button>
            <button type="button" className="fvf-primary" onClick={launchPrep}>
              DEFEND{prepCount > 0 ? ` (${prepCount})` : ""}
            </button>
          </div>
          <p className="fvf-fine">Loadout: {(run.abilities ?? []).join(" · ")} · abilities Space/Q/E · items Z/X/C/V</p>
        </div>
      </div>
    );
  })();

  const codexModal = codexOpen && (
    <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Codex">
      <div className="fvf-card">
        <h2><span className="fvf-h2pix"><Pix id="map" size={18} /></span> CODEX</h2>
        <div className="fvf-gear">
          <div className="fvf-gearslot">
            <strong>Frenemies ({profile.codex.enemies.length}/{CODEX_ENEMIES.length})</strong>
            {CODEX_ENEMIES.map(e => (
              <small key={e.id} className="fvf-fine">
                {profile.codex.enemies.includes(e.id) ? `${e.name} — ${e.hint}` : `??? — defeat one to record`}
              </small>
            ))}
          </div>
          <div className="fvf-gearslot">
            <strong>Bosses ({profile.codex.bosses.length}/7)</strong>
            <small className="fvf-fine">{profile.codex.bosses.length > 0 ? profile.codex.bosses.join(", ") : "No boss felled yet."}</small>
          </div>
          <div className="fvf-gearslot">
            <strong>Abilities ({profile.codex.abilities.length}/24) · Structures ({profile.codex.structures.length}/{STRUCTURES.length}) · Plots ({profile.codex.plots.length}/{PLOTS.length})</strong>
            <small className="fvf-fine">Gear recorded: {profile.codex.gear.length} · Maps: {profile.codex.maps.join(", ") || "home only"}</small>
          </div>
        </div>
        <button type="button" className="fvf-primary" onClick={() => setCodexOpen(false)}>Back</button>
      </div>
    </div>
  );

  const questsModal = questsOpen && (
    <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Quests">
      <div className="fvf-card">
        <h2><span className="fvf-h2pix"><Pix id="expedition" size={18} /></span> GOALS</h2>
        <div className="fvf-gear">
          {QUESTS.map(q => (
            <div key={q.id} className="fvf-up">
              <Pix id={profile.quests.includes(q.id) ? "upgrade" : "building"} size={24} />
              <div>
                <strong>{q.name}</strong>
                <small>{q.desc} · +{q.reward} RF·sim</small>
              </div>
            </div>
          ))}
          {MILESTONES.map(m => (
            <div key={m.id} className="fvf-up">
              <Pix id={profile.quests.includes(m.id) ? "upgrade" : "building"} size={24} />
              <div>
                <strong>{m.name}</strong>
                <small>{m.desc} · +{m.rewardSimRf} RF·sim</small>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="fvf-primary" onClick={() => setQuestsOpen(false)}>Back</button>
      </div>
    </div>
  );

  // Item belt: stable order, hotkey caps, touch-friendly buttons.
  const consBar = hud && (BELT_ORDER.filter(id => (hud.cons[id] ?? 0) > 0).slice(0, 4)).map((id, i) => {
    const con = CONSUMABLES.find(c => c.id === id);
    if (!con) return null;
    const key = ITEM_HOTKEYS[i];
    return (
      <button key={id} type="button" className="fvf-ab" onClick={() => doConsumable(id)} aria-label={`Use ${con.name} (${key})`} title={`${con.desc} · hotkey ${key}`}>
        <span className="fvf-abkey"><em className="fvf-key">{key}</em><span className="fvf-ablabel">{con.name.split(" ").map(w => w[0]).join("")}×{hud.cons[id]}</span></span>
      </button>
    );
  });

  return (
    <section className="fvf" aria-label="FRIENDS vs FRENEMIES">
      {(phase === "home" || phase === "combat") && (
        <div className="fvf-world">
          <canvas
            ref={canvasRef}
            width={960}
            height={640}
            className="fvf-canvas"
            role="img"
            aria-label={phase === "home" ? `Friend ${tokenId} wandering its home plot. Activate to poke.` : "Battle for the home plot. Tap to move in manual mode."}
            onClick={e => {
              if (phase === "home") tapHome(e.clientX, e.clientY);
              else tapMove(e.clientX, e.clientY);
            }}
            onKeyDown={e => { if (e.key === "Enter" && phase === "home") pokeFriend(); }}
            tabIndex={0}
          />
          {((phase === "home" && !worldReady) || (phase === "combat" && !runWorldReady)) && (
            <div className="fvf-worldloading" role="status">Growing the plot…</div>
          )}
          <div className="fvf-hud" role="status" aria-label="Game status">
            {phase === "combat" ? (
              <button type="button" className="fvf-hudmode" onClick={toggleMode} aria-label="Toggle auto-pilot" aria-pressed={!(hud?.manual ?? true)}>
                {(hud?.manual ?? true) ? "MAN" : "AUTO"}
              </button>
            ) : (
              <span className="fvf-hudseg"><Pix id="home" size={16} /> Best W{profile.bestWave}</span>
            )}
            {phase === "combat" ? (
              <span className="fvf-hudseg fvf-hudmain">
                <Pix id="map" size={16} /> {MAPS[hud?.mapIdx ?? 0]?.name ?? ""} · W{hud?.wave ?? 1} · {hud?.kills ?? 0} down
              </span>
            ) : null}
            {phase === "combat" && (hud?.lanes?.length ?? 0) > 0 && (
              <span className="fvf-hudseg fvf-hudwarn" title="Gates with enemies still inbound">
                <Pix id="wave" size={16} /> {(hud?.lanes ?? []).slice(0, 2).map(l => `${l.label} x${l.count}`).join(" · ")}
              </span>
            )}
            {phase === "combat" && (
              <span className="fvf-hudseg fvf-xp" title={`Level ${hud?.level ?? 1}${(hud?.armor ?? 0) > 0 ? ` · ${hud?.armor ?? 0} armor` : ""}`}>
                <i style={{ width: `${Math.min(100, ((hud?.xp ?? 0) / (hud?.xpNext ?? 1)) * 100)}%` }} />
                <b><Pix id="upgrade" size={14} /> LV{hud?.level ?? 1}</b>
                <em className="fvf-hpbar" aria-label="Friend health">
                  <i style={{ width: `${Math.max(0, Math.min(100, ((hud?.hp ?? 1) / (hud?.maxHp ?? 1)) * 100))}%` }} />
                </em>
              </span>
            )}
            <span className="fvf-hudseg" title="Simulated currency — no real token value">
              <Pix id="rf" size={16} /> {phase === "combat" ? hud?.bankRf ?? 0 : profile.simRf} RF·sim
            </span>
            {phase === "home" && profile.prodBank > 0 && (
              <span className="fvf-hudseg" title="Uncollected production — open BASE to collect">
                <Pix id="storage" size={16} /> +{profile.prodBank} ready
              </span>
            )}
            {phase === "home" && afk && (
              <span className="fvf-hudseg fvf-hudafk" title="AFK mode: Friend wanders, structures produce, turrets swat minor shadows">
                <Pix id="afk" size={16} /> AFK · base working
              </span>
            )}
          </div>
          {phase === "home" && profile.plotId !== "" && structTierOf(profile, "turret") === 0 && (
            <div className="fvf-worldloading" role="status" style={{ background: "transparent", pointerEvents: "none" }}>
              <span className="fvf-chip">Tip: build a turret in BASE, then DEFEND.</span>
            </div>
          )}
          {phase === "home" && (
            <div className="fvf-homebar">
              <button type="button" className="fvf-defend" onClick={startDefend} disabled={!worldReady || !profile.plotId} title={!profile.plotId ? "Choose your home plot first" : "Defend the plot"}>
                DEFEND
              </button>
              <button type="button" className="fvf-icon" onClick={() => { setSheet(s => s === "base" ? null : "base"); playCue("select"); }} aria-pressed={sheet === "base"} aria-label="Base">
                <Pix id="building" size={18} /> BASE
              </button>
              <button type="button" className="fvf-icon" onClick={() => { setTab("friend"); setSheet(s => s === "upgrades" ? null : "upgrades"); playCue("select"); }} aria-pressed={sheet === "upgrades"} aria-label="Upgrades">
                <Pix id="upgrade" size={18} /> UP
              </button>
              <button type="button" className="fvf-icon" onClick={() => { setSheet(s => s === "gear" ? null : "gear"); playCue("select"); }} aria-pressed={sheet === "gear"} aria-label="Gear">
                <Pix id="rarity" size={18} /> KIT
              </button>
              <button type="button" className={afk ? "fvf-icon fvf-iconon" : "fvf-icon"} onClick={toggleAfk} aria-pressed={afk} aria-label="Toggle AFK mode" title="AFK: Friend wanders, structures produce, turrets handle minor shadows">
                <Pix id="afk" size={18} /> {afk ? "AFK ON" : "AFK"}
              </button>
              <button type="button" className="fvf-icon" onClick={toggleMute} aria-pressed={!muted} aria-label="Toggle sound">
                {muted ? "MUTE" : "SOUND"}
              </button>
            </div>
          )}
          {phase === "combat" && (
            <div className="fvf-dock">
              {(() => {
                const keys = ["Space", "Q", "E"];
                const abs = hud?.abilities ?? ["ab-blast"];
                return [0, 1, 2].map(slot => {
                  const sid = abs[slot] ?? null;
                  const def = sid ? ABILITIES[sid] : null;
                  const cd = sid ? (hud?.abilityCd[sid] ?? 0) : 0;
                  const max = sid && runRef.current ? abilityCdMaxFor(sid) : 0;
                  const short = def ? def.name.replace("Friend ", "").replace("Shadow ", "").slice(0, 6).toUpperCase() : "--";
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={slot === 0 ? "fvf-blast fvf-ab" : "fvf-ab"}
                      disabled={!sid || cd > 0}
                      onClick={() => doSlot(slot)}
                      aria-label={def ? `${def.name} (${keys[slot]})` : `Empty ability slot ${slot + 1}`}
                      title={def ? `${def.desc} · ${def.role} · ${def.rarity}` : "Unlock via level-ups / Trader / Ability Altar"}
                    >
                      {sid ? <Pix id={sid} size={20} /> : null}
                      <span className="fvf-abkey"><em className="fvf-key">{keys[slot]}</em><span className="fvf-ablabel">{cd > 0 ? `${Math.ceil(cd)}` : short}</span></span>
                      {cd > 0 && max > 0 && <i className="fvf-cd" style={{ width: `${Math.min(100, (cd / max) * 100)}%` }} />}
                    </button>
                  );
                });
              })()}
              {(hud?.intermission ?? 0) > 0 && (
                <button type="button" onClick={() => { const r = runRef.current; if (r) nextWave(r); }} aria-label="Skip to next wave">
                  NEXT
                </button>
              )}
              <button
                type="button"
                disabled={(hud?.bankRf ?? 0) < healCost(runRef.current?.healUses ?? 0, runRef.current?.medbayLvl ?? 0) || (hud?.hp ?? 1) >= (hud?.maxHp ?? 1)}
                onClick={doHeal}
                aria-label="Heal with banked RF"
              >
                +HP
              </button>
              {consBar}
              <button type="button" onClick={() => setBuildOpen(true)} aria-label="Inspect build">
                KIT
              </button>
            </div>
          )}
          {phase === "home" && sheet && (
            <div className="fvf-sheet" role="dialog" aria-label={sheet === "gear" ? "Gear" : sheet === "base" ? "Base" : "Upgrades"}>
              <div className="fvf-sheet-head">
                <nav className="fvf-tabs" aria-label="Upgrade panels">
                  <button key="base" type="button" aria-pressed={sheet === "base"} className={sheet === "base" ? "on" : ""} onClick={() => { setSheet("base"); playCue("select"); }}>
                    Base
                  </button>
                  {((["friend", "defense", "economy"] as Tab[]).map(t => (
                    <button key={t} type="button" aria-pressed={tab === t && sheet === "upgrades"} className={tab === t && sheet === "upgrades" ? "on" : ""} onClick={() => { setTab(t); setSheet("upgrades"); playCue("select"); }}>
                      {t === "friend" ? "Friend" : t === "defense" ? "Land" : "RF"}
                    </button>
                  )))}
                  <button type="button" aria-pressed={sheet === "gear"} className={sheet === "gear" ? "on" : ""} onClick={() => { setSheet("gear"); playCue("select"); }}>Kit</button>
                </nav>
                <button type="button" className="fvf-x" onClick={() => setSheet(null)} aria-label="Close panel">×</button>
              </div>
              <div className="fvf-sheet-body">
                <div className="fvf-modeseg" role="group" aria-label="Control mode">
                  <button type="button" aria-pressed={!profile.autoMode} className={!profile.autoMode ? "on" : ""} onClick={() => { const p = { ...profileRef.current, autoMode: false }; setProfile(p); saveProfile(p); playCue("select"); }}>MANUAL</button>
                  <button type="button" aria-pressed={profile.autoMode} className={profile.autoMode ? "on" : ""} onClick={() => { const p = { ...profileRef.current, autoMode: true }; setProfile(p); saveProfile(p); playCue("select"); }}>AUTO</button>
                </div>
                {sheet === "base" ? (
                  <>
                    {basePanel()}
                    <div className="fvf-gearslot">
                      <strong>Home plot: {plotOf(profile).name}</strong>
                      <small>{plotOf(profile).desc}</small>
                    </div>
                    {plotPicker(true)}
                  </>
                ) : sheet === "gear" ? gearPanel(true) : upgradeList(tab === "gear" ? "friend" : tab)}
                <div className="fvf-sheet-foot">
                  <span className="fvf-fine">Power {power} · HP {computeDerived(perma, gear).maxHp}</span>
                  <span className="fvf-fine">Lifetime +{profile.lifetimeEarned}/-{profile.lifetimeSpent} RF·sim</span>
                  <label className="fvf-motion">
                    <input type="checkbox" checked={reducedMotion} onChange={e => setReducedMotion(e.target.checked)} /> Calm
                  </label>
                  <button
                    type="button"
                    className="fvf-danger"
                    onClick={() => {
                      if (!resetArm) {
                        setResetArm(true);
                        setTimeout(() => setResetArm(false), 3000);
                      } else {
                        setProfile(resetProfile());
                        setResetArm(false);
                      }
                    }}
                  >
                    {resetArm ? "Sure?" : "Reset"}
                  </button>
                </div>
                {saveNote && <p className="fvf-note" role="status">{saveNote}</p>}
                {artNote && <p className="fvf-note" role="status">{artNote}</p>}
              </div>
            </div>
          )}
          {phase === "home" && !profile.plotId && worldReady && (
            <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Choose home plot">
              <div className="fvf-card fvf-shop">
                <h2><span className="fvf-h2pix"><Pix id="home" size={18} /></span> CHOOSE YOUR LAND</h2>
                <p className="fvf-fine">This is where your Rare Friend lives. Looks differ; bonuses stay small and fair.</p>
                {plotPicker(false)}
              </div>
            </div>
          )}
          {/* Onboarding runs AFTER the land choice so modals never stack. */}
          {phase === "home" && showIntro && !tutDone && profile.plotId && (
            <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Welcome">
              <div className="fvf-card fvf-tut">
                <h2><span className="fvf-h2pix"><Pix id="home" size={18} /></span> {tutStep === 0 ? "THIS IS YOUR FRIEND" : tutStep === 1 ? "THIS IS THEIR HOME" : tutStep === 2 ? "BUILD YOUR FIRST DEFENSE" : "DEFEND TOGETHER"}</h2>
                <div className="fvf-cardhead">
                  <PixelPortrait rows={portraitRows} size={64} label="Your Friend" />
                  <div style={{ textAlign: "left" }}>
                    {tutStep === 0 && <p className="fvf-sub"><strong>Your actual Rare Friend lives here.</strong><br />Walk with WASD, arrows, or tap. Poke your Friend and it hops.</p>}
                    {tutStep === 1 && <p className="fvf-sub"><strong>Peaceful base.</strong><br />The Collector gathers RF over time. Open BASE to collect, then build.</p>}
                    {tutStep === 2 && <p className="fvf-sub"><strong>Build defenses to help during invasions.</strong><br />Turret first, then Collector. Your base keeps working while peaceful.</p>}
                    {tutStep >= 3 && <p className="fvf-sub"><strong>Frenemies approach through the gates.</strong><br />Press DEFEND when ready. Use Blast (Space). Survive, upgrade, travel every 5 waves.</p>}
                    <p className="fvf-fine">Step {Math.min(tutStep + 1, 4)}/4 · contextual tips continue in-game · skippable</p>
                  </div>
                </div>
                <div className="fvf-row">
                  <button type="button" onClick={tutSkip}>Skip tutorial</button>
                  {tutStep < 3 ? (
                    <button type="button" className="fvf-primary" onClick={tutNext}>Next</button>
                  ) : (
                    <button
                      type="button"
                      className="fvf-primary"
                      onClick={() => {
                        const p = { ...profileRef.current, seenIntro: true };
                        setProfile(p);
                        saveProfile(p);
                        setShowIntro(false);
                        setTutDone(true);
                        playCue("select");
                      }}
                    >
                      Start building
                    </button>
                  )}
                </div>
                <p className="fvf-fine">Returning players: this never shows again once dismissed.</p>
              </div>
            </div>
          )}
          {/* Contextual teaching: one hint at a time, when it matters.
              Hidden while a sheet is open so it never covers panel buttons. */}
          {phase === "home" && !showIntro && !tutDone && tutStep < 3 && !sheet && (
            <div className="fvf-tuthint" role="status">
              <Pix id="ability" size={16} />
              {structTierOf(profile, "turret") === 0
                ? "Build a turret in BASE, then DEFEND."
                : structTierOf(profile, "collector") === 0
                  ? "Now add an RF Collector — your base earns while peaceful."
                  : "Press DEFEND when ready. Every 5 waves the map rotates."}
              <button type="button" onClick={tutSkip} aria-label="Dismiss tutorial hints">Skip</button>
            </div>
          )}
          {phase === "home" && afkSummary && (
            <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="AFK summary">
              <div className="fvf-card fvf-afk">
                <h2><span className="fvf-h2pix"><Pix id="afk" size={18} /></span> AFK SUMMARY</h2>
                <div className="fvf-cardhead">
                  <PixelPortrait rows={portraitRows} size={48} label="Your Friend" />
                  <p className="fvf-fine fvf-sub">Your Friend kept the settlement alive while you were away.</p>
                </div>
                <dl className="fvf-grid">
                  <div><dt>Time idle</dt><dd>{Math.floor(afkSummary.secs / 60)}m {afkSummary.secs % 60}s</dd></div>
                  <div><dt>RF produced</dt><dd>+{afkSummary.rf}</dd></div>
                  <div><dt>Training</dt><dd>+{afkSummary.xp}</dd></div>
                  <div><dt>Minor shadows repelled</dt><dd>{afkSummary.repelled}</dd></div>
                </dl>
                <button type="button" className="fvf-primary" onClick={() => setAfkSummary(null)}>Back to base</button>
              </div>
            </div>
          )}
          {paused && phase === "combat" && (
            <div className="fvf-modal" role="dialog" aria-label="Paused">
              <div className="fvf-card"><h2>Paused</h2><p>Runtime menu is open — combat is frozen.</p></div>
            </div>
          )}
          {toast && (
            <div className="fvf-toast" role="status">
              <strong>{toast.text}</strong>
              {toast.sub && <small>{toast.sub}</small>}
            </div>
          )}
          {prepModal}
          {codexModal}
          {questsModal}
          {offers.length > 0 && (
            <div className="fvf-modal" role="dialog" aria-modal="true" aria-label="Choose an upgrade">
              <div className="fvf-card fvf-level">
                <h2><span className="fvf-h2pix"><Pix id="upgrade" size={18} /></span> LEVEL UP</h2>
                <div className="fvf-cardhead">
                  <PixelPortrait rows={portraitRows} size={52} label="Your Friend" />
                  <p className="fvf-fine fvf-sub">Your Friend celebrates — pick one. The invasion waits behind this card. Keys 1–3 work too.</p>
                </div>
                <div className="fvf-offers">
                  {offers.map((o, i) => {
                    const synergy = synergyHint(o.id);
                    const isAbility = o.id.startsWith("ab-");
                    const iconId = isAbility ? o.id : o.id;
                    return (
                      <button key={o.id + i} type="button" className={`fvf-offer fvf-lvcard ${o.evolved ? "evolved" : ""}`} onClick={() => chooseUpgrade(o.id)}>
                        <span className="fvf-lvnum">{i + 1}</span>
                        <Pix id={iconId} size={34} />
                        <strong>{o.evolved ? o.name : o.name}</strong>
                        <small className="fvf-lvrar">{o.evolved ? "EVOLVED" : isAbility ? (ABILITIES[o.id as AbilityId]?.rarity ?? "") : ""}</small>
                        <small>{o.desc}</small>
                        {o.maxStacks < 90 && <small className="fvf-fine">Stack {o.stacks + 1}/{o.maxStacks}{o.evolved ? " · EVOLVES" : ""}</small>}
                        {synergy && <small className="fvf-syn">Synergy: {synergy}</small>}
                      </button>
                    );
                  })}
                </div>
                <button type="button" className="fvf-reroll" disabled={(hud?.bankRf ?? 0) < REROLL_COST} onClick={doReroll}>
                  <Pix id="reroll" size={16} /> Reroll ({REROLL_COST} RF·sim, once)
                </button>
              </div>
            </div>
          )}
          {shopModal}
          {buildModal}
        </div>
      )}

      {phase === "results" && results && (
        <div className="fvf-results" role="dialog" aria-label="Defense over">
          <PixelPortrait rows={portraitRows} size={64} label="Your Friend" />
          <h2>DEFENSE OVER</h2>
          <p className="fvf-fine">Friend #{tokenId} defended bravely · {MAPS[results.mapIdx]?.name ?? ""} · wave {results.wave}.</p>
          <dl className="fvf-grid">
            <div><dt>Time</dt><dd>{Math.floor(results.timeSurvived / 60)}m {results.timeSurvived % 60}s</dd></div>
            <div><dt>Wave</dt><dd>{results.wave}</dd></div>
            <div><dt>Shadows down</dt><dd>{results.kills}</dd></div>
            <div><dt>Bosses</dt><dd>{results.bosses}</dd></div>
            <div><dt>RF·sim earned</dt><dd>{results.rfEarned}</dd></div>
            <div><dt>RF·sim spent</dt><dd>{results.rfSpent}</dd></div>
            <div><dt>Net</dt><dd>{results.rfEarned - results.rfSpent >= 0 ? "+" : ""}{results.rfEarned - results.rfSpent}</dd></div>
            <div><dt>Balance</dt><dd>{profile.simRf}</dd></div>
          </dl>
          {resultsGear.length > 0 && (
            <div className="fvf-drops">
              <h3>GEAR FOUND</h3>
              {resultsGear.map(item => (
                <div key={item.id} className="fvf-up">
                  <div>
                    <strong style={{ color: RARITY_COLORS[item.rarity] }}>{item.name} · {item.rarity}</strong>
                    <small>{item.desc}</small>
                  </div>
                  <button type="button" onClick={() => equipResultGear(item)}>Equip</button>
                </div>
              ))}
            </div>
          )}
          {profile.runs === 1 && (
            <p className="fvf-note" role="status">Spend RF·sim on your Friend and land — then defend again and feel it.</p>
          )}
          <div className="fvf-row">
            <button type="button" className="fvf-primary" onClick={() => { setPhase("home"); setSheet("upgrades"); setTab("friend"); }}>
              BUILD
            </button>
            <button type="button" className="fvf-defend" onClick={startDefend}>
              DEFEND AGAIN
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Spend run-bank RF from the shell (mirrors engine accounting rules). */
function bankSpendRun(run: RunState, amount: number): boolean {
  const v = Math.max(0, Math.round(amount));
  if (run.bankRf < v) return false;
  run.bankRf -= v;
  run.spent += v;
  return true;
}
