/**
 * FRIENDS vs FRENEMIES — canonical Friend artwork without viem.
 *
 * The SDK sprite modules pull viem, which the SDK's own esbuild checker cannot
 * resolve from this project (a stray Yarn PnP manifest at the Windows home
 * folder hijacks module resolution). This module performs the same immutable
 * artwork reads with plain JSON-RPC fetch + local bitmap decoding, so the game
 * still renders the player's REAL on-chain Generations sprite when reachable.
 *
 * Contract references (same pinned deployment the SDK uses):
 * registry 0x246E3E9730A7Eade94c79be0Fd78d210f89AEb8D on Robinhood mainnet.
 * Reads are immutable artwork only — ownership is verified by the SDK runtime.
 */

const RPC_URL = "https://rpc.mainnet.chain.robinhood.com";
const REGISTRY = "0x246E3E9730A7Eade94c79be0Fd78d210f89AEb8D";
const SEL_FAMILY = "0x32bd63d1"; // familyOf(uint256)
const SEL_SEED = "0x82829f74"; // seedOf(uint256)
const SEL_FRAMES = "0xead2ca3c"; // frames(uint8,uint32)

export const FAMILY_NAMES = [
  "Skeleton", "Mask", "Family", "Cellular", "Asymmetry", "Hoverer", "Colossus", "Sparkling", "Hollow",
] as const;

export const SPRITE_FACINGS = ["down", "up", "left", "right"] as const;
export type SpriteFacing = (typeof SPRITE_FACINGS)[number];

export interface FriendClips {
  idle: Record<SpriteFacing, string[][]>;
  walk: Record<SpriteFacing, string[][]>;
  familyId: number;
}

export interface FriendArt {
  rows: readonly string[] | null;
  clips: FriendClips | null;
  familyName: string;
  live: boolean;
}

function pad32(value: bigint): string {
  return value.toString(16).padStart(64, "0");
}

async function ethCall(data: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: REGISTRY, data }, "latest"] }),
    signal,
  });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  const json = (await res.json()) as { result?: string; error?: { message?: string } };
  if (typeof json.result !== "string") throw new Error(json.error?.message ?? "RPC failed");
  return json.result;
}

function word(hex: string, index: number): bigint {
  const body = hex.startsWith("0x") ? hex.slice(2) : hex;
  return BigInt("0x" + body.slice(index * 64, index * 64 + 64));
}

/** Decode a 16x16 one-bit mask, bit 0 = top-left (matches SDK decode). */
export function decodeRows(bitmap: bigint): string[] {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 16; x++) {
      row += bitmap & (1n << BigInt(y * 16 + x)) ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

/**
 * Read canonical artwork for an arbitrary (family, seed) pair via the pure
 * `frames(uint8,uint32)` generator. This NEVER touches any owner's token: it
 * calls the public deterministic art function with curated inputs, so each
 * Frenemy archetype gets a genuinely different OFFICIAL Rare Friend body
 * (distinct family shape language) instead of a recolored player clone.
 * Same 64-frame canonical layout as readFriendArtwork.
 */
export async function readFramesArtwork(familyId: number, seed: number, timeoutMs = 8000): Promise<FriendArt> {
  if (!Number.isInteger(familyId) || familyId < 0 || familyId >= FAMILY_NAMES.length) {
    throw new RangeError("Unknown family");
  }
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError("Seed must fit uint32");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const framesHex = await ethCall(SEL_FRAMES + pad32(BigInt(familyId)) + pad32(BigInt(seed)), ctrl.signal);
    const words = Math.floor((framesHex.startsWith("0x") ? framesHex.length - 2 : framesHex.length) / 64);
    if (words < 64) throw new Error("Short frames");
    const bitmaps: bigint[] = [];
    for (let i = 0; i < 64; i++) bitmaps.push(word(framesHex, i));
    const clip = (offset: number): Record<SpriteFacing, string[][]> => {
      const out = {} as Record<SpriteFacing, string[][]>;
      for (let f = 0; f < 4; f++) {
        const frames: string[][] = [];
        for (let i = 0; i < 8; i++) frames.push(decodeRows(bitmaps[offset + f * 8 + i]));
        out[SPRITE_FACINGS[f]] = frames;
      }
      return out;
    };
    const clips: FriendClips = { idle: clip(0), walk: clip(32), familyId };
    const rows = clips.idle.down[0];
    return { rows, clips, familyName: FAMILY_NAMES[familyId], live: true };
  } finally {
    clearTimeout(timer);
  }
}

export async function readFriendArtwork(friendId: bigint, timeoutMs = 8000): Promise<FriendArt> {
  if (friendId < 1n) throw new RangeError("Bad token id");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const tokenHex = pad32(friendId);
    const [familyHex, seedHex] = await Promise.all([
      ethCall(SEL_FAMILY + tokenHex, ctrl.signal),
      ethCall(SEL_SEED + tokenHex, ctrl.signal),
    ]);
    const familyId = Number(word(familyHex, 0));
    const seed = Number(word(seedHex, 0));
    if (familyId < 0 || familyId >= FAMILY_NAMES.length) throw new Error("Unknown family");
    const framesHex = await ethCall(SEL_FRAMES + pad32(BigInt(familyId)) + pad32(BigInt(seed)), ctrl.signal);
    const words = Math.floor((framesHex.startsWith("0x") ? framesHex.length - 2 : framesHex.length) / 64);
    if (words < 64) throw new Error("Short frames");
    const bitmaps: bigint[] = [];
    for (let i = 0; i < 64; i++) bitmaps.push(word(framesHex, i));
    // Canonical 64-frame layout (matches SDK decodeGenerationSprites):
    // idle = frames[0:32], walk = frames[32:64]; per clip, down 0-7, up 8-15,
    // left 16-23, right 24-31.
    const clip = (offset: number): Record<SpriteFacing, string[][]> => {
      const out = {} as Record<SpriteFacing, string[][]>;
      for (let f = 0; f < 4; f++) {
        const frames: string[][] = [];
        for (let i = 0; i < 8; i++) frames.push(decodeRows(bitmaps[offset + f * 8 + i]));
        out[SPRITE_FACINGS[f]] = frames;
      }
      return out;
    };
    const clips: FriendClips = { idle: clip(0), walk: clip(32), familyId };
    const rows = clips.idle.down[0];
    return { rows, clips, familyName: FAMILY_NAMES[familyId], live: true };
  } finally {
    clearTimeout(timer);
  }
}
