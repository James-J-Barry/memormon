// ==========================================
// Timer utilities for pack time-gating
// ==========================================

const PACK_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Calculate milliseconds until the next pack is available.
 * Returns 0 if a pack is already available.
 */
export function msUntilNextPack(
  packsAvailable: number,
  lastPackTime: number
): number {
  if (packsAvailable > 0) return 0;

  const nextTime = lastPackTime + PACK_COOLDOWN_MS;
  const remaining = nextTime - Date.now();

  return Math.max(0, remaining);
}

/**
 * Format milliseconds into "HH:MM:SS" string
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
