import { initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { decodeBase64Json } from "@/lib/decodeBase64Json";

type ClientFirebaseConfig = FirebaseOptions & {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function parseClientConfig(): ClientFirebaseConfig | null {
  const decoded = decodeBase64Json<ClientFirebaseConfig>(
    process.env.NEXT_PUBLIC_FIREBASE_CONFIG_BASE64
  );
  if (!decoded) return null;

  const required = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ] as const;

  const missing = required.filter((key) => !decoded[key]);
  if (missing.length) {
    console.error(
      `[Firebase] Decoded config is missing: ${missing.join(", ")}`
    );
    return null;
  }

  return decoded;
}

const parsed = parseClientConfig();
export const isFirebaseConfigured = parsed !== null;

if (!isFirebaseConfigured && typeof window !== "undefined") {
  console.error(
    "[Firebase] Missing NEXT_PUBLIC_FIREBASE_CONFIG_BASE64. " +
      "Encode your firebaseConfig JSON as base64 and put it in `.env.local`."
  );
}

const firebaseConfig: FirebaseOptions = parsed ?? {
  apiKey: "missing",
  authDomain: "missing.firebaseapp.com",
  projectId: "missing",
  storageBucket: "missing.appspot.com",
  messagingSenderId: "0",
  appId: "1:0:web:0",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export { app };
