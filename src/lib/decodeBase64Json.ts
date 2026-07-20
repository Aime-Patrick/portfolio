/** Decode a base64-encoded JSON string (browser + Node). */
export function decodeBase64Json<T>(value: string | undefined | null): T | null {
  if (!value?.trim()) return null;
  try {
    const normalized = value.trim().replace(/^["']|["']$/g, "");
    const json =
      typeof atob === "function"
        ? atob(normalized)
        : Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as T;
  } catch (error) {
    console.error("[env] Failed to decode base64 JSON:", error);
    return null;
  }
}
