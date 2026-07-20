// Script to create an admin user in Firebase Authentication
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
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
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function createAdminUser() {
  try {
    const email = await new Promise((resolve) => {
      rl.question("Enter admin email: ", resolve);
    });

    const password = await new Promise((resolve) => {
      rl.question("Enter admin password (min 6 characters): ", resolve);
    });

    const displayName = await new Promise((resolve) => {
      rl.question("Enter display name (optional): ", resolve);
    });

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    console.log("Admin user created:", userCredential.user.uid);
  } catch (error) {
    console.error("Failed to create admin user:", error.message);
  } finally {
    rl.close();
  }
}

createAdminUser();
