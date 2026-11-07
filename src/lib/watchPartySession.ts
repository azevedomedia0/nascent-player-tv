/**
 * Watch-party session handed from the lobby into App while playback runs.
 * hostToken must live only in a ref — never React state, never localStorage.
 */

export type WatchPartyPlaybackState = "playing" | "paused";

export interface WatchPartySession {
  roomId: string;
  userId: string;
  isHost: boolean;
  displayName: string;
  movieId: string;
}

export interface WatchPartyStartPayload extends WatchPartySession {
  /** Server-issued host token — App must store in memory only. */
  hostToken: string | null;
}

export interface WatchPartyRemoteSync {
  currentTime: number;
  playbackState: WatchPartyPlaybackState;
  /** Monotonic-ish signal so the player re-applies when the host moves. */
  syncKey: number;
}
