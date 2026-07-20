// Script to initialize site settings in Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config({ path: ".env.local" });
dotenv.config();

function parseClientConfig() {
  const b64 = process.env.NEXT_PUBLIC_FIREBASE_CONFIG_BASE64;
  if (!b64) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_CONFIG_BASE64 in .env.local"
    );
  }
  return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
}

const app = initializeApp(parseClientConfig());
const db = getFirestore(app);
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const defaultSettings = {
  siteTitle: "Aime Patrick Ndagijimana - Portfolio",
  siteDescription: "Software Engineer Portfolio",
  siteKeywords: "software engineer, web development, react, portfolio",
  footerText: "© 2026 Aime Patrick Ndagijimana. All rights reserved.",
  enableChatbot: true,
  primaryColor: "#f44a00",
  secondaryColor: "#121212",
};

async function initSiteSettings() {
  try {
    const email = await new Promise((resolve) => {
      rl.question("Admin email: ", resolve);
    });
    const password = await new Promise((resolve) => {
      rl.question("Admin password: ", resolve);
    });

    await signInWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "settings", "site"), defaultSettings, { merge: true });
    console.log("Site settings initialized.");
  } catch (error) {
    console.error("Failed to init settings:", error.message);
  } finally {
    rl.close();
  }
}

initSiteSettings();
