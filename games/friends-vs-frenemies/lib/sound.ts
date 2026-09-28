/** FRIENDS vs FRENEMIES — sound wrapper around the SDK sound kit. */
import { createFriendSoundKit, type FriendSoundKit, type FriendSoundCue } from "@rarefriends/friendsdk/sounds";

export type { FriendSoundCue };

let kit: FriendSoundKit | null = null;
let muted = true;

export function initSound(): void {
  if (!kit) kit = createFriendSoundKit({ muted: true });
}

export function disposeSound(): void {
  kit?.dispose();
  kit = null;
}

export function isMuted(): boolean {
  return muted;
}

/** Must be called from a user gesture at least once before sounds play. */
export function unlockSound(): void {
  void kit?.unlock();
}

export function setMuted(next: boolean): void {
  muted = next;
  kit?.setMuted(next);
}

export function playCue(cue: FriendSoundCue): void {
  if (muted) return;
  try {
    kit?.play(cue);
  } catch {
    // Audio must never break the game.
  }
}

export function stopSound(): void {
  try {
    kit?.stop();
  } catch {
    // ignore
  }
}
