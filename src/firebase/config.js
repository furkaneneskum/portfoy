import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const trim = (value) => (typeof value === "string" ? value.trim() : value);

const firebaseConfig = {
  apiKey: trim(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: trim(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: trim(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: trim(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: trim(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: trim(import.meta.env.VITE_FIREBASE_APP_ID),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

function createFirestore() {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestore();
export const storage = getStorage(app);

export async function resetFirestoreConnection() {
  try {
    await disableNetwork(db);
  } catch {
    // Ag zaten acik olabilir.
  }
  await enableNetwork(db);
}

resetFirestoreConnection().catch((error) => {
  console.warn("Firestore baglantisi baslatilamadi:", error);
});

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export const firebaseProjectId = firebaseConfig.projectId;
export const firebaseApiKey = firebaseConfig.apiKey;

export async function checkFirestoreHealth() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase .env bilgileri eksik.");
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}` +
    `/databases/(default)/documents/projects?pageSize=1&key=${firebaseApiKey}`;

  const response = await fetch(url);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || response.statusText;
    throw new Error(message);
  }

  await resetFirestoreConnection();
  return true;
}
