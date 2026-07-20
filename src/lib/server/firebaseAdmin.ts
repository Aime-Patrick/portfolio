import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { decodeBase64Json } from "@/lib/decodeBase64Json";

let app: App | undefined;

type AdminServiceAccount = ServiceAccount & {
  project_id?: string;
  client_email?: string;
  private_key?: string;
};

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const fromBase64 = decodeBase64Json<AdminServiceAccount>(
    process.env.FIREBASE_ADMIN_CONFIG_BASE64
  );

  if (fromBase64?.project_id && fromBase64.client_email && fromBase64.private_key) {
    app = initializeApp({
      credential: cert({
        projectId: fromBase64.project_id,
        clientEmail: fromBase64.client_email,
        privateKey: fromBase64.private_key.replace(/\\n/g, "\n"),
      }),
      projectId: fromBase64.project_id,
    });
    return app;
  }

  // Legacy fallback: separate env vars
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (projectId && clientEmail && privateKey) {
    app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
    return app;
  }

  if (projectId) {
    app = initializeApp({ projectId });
    return app;
  }

  throw new Error(
    "Firebase Admin is not configured. Set FIREBASE_ADMIN_CONFIG_BASE64 (service account JSON as base64)."
  );
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function verifyAdminToken(authHeader: string | null | undefined) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization bearer token");
  }
  const token = authHeader.slice("Bearer ".length).trim();
  return getAdminAuth().verifyIdToken(token);
}
