/**
 * Encode a Firebase JSON file to base64 for .env.local
 *
 * Usage:
 *   node scripts/encode-firebase-config.mjs path/to/firebase-web.json
 *   node scripts/encode-firebase-config.mjs path/to/serviceAccount.json --admin
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const file = process.argv[2];
const isAdmin = process.argv.includes("--admin");

if (!file) {
  console.error(
    "Usage: node scripts/encode-firebase-config.mjs <config.json> [--admin]"
  );
  process.exit(1);
}

const raw = readFileSync(resolve(file), "utf8");
JSON.parse(raw); // validate
const b64 = Buffer.from(raw.trim(), "utf8").toString("base64");
const key = isAdmin
  ? "FIREBASE_ADMIN_CONFIG_BASE64"
  : "NEXT_PUBLIC_FIREBASE_CONFIG_BASE64";

console.log(`\nAdd this to .env.local:\n\n${key}=${b64}\n`);
