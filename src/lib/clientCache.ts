/** Tiny session cache so Firebase-backed UI can paint without a flash. */

export function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode — ignore
  }
}

export const CACHE_KEYS = {
  profile: "portfolio:cache:profile:v2",
  settings: "portfolio:cache:settings:v3",
} as const;
