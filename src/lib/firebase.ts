
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

// Conditionally initialize Firebase only if the API key is present.
// This prevents the app from crashing if the client-side config is missing.
if (firebaseConfig.apiKey) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Error initializing Firebase. Please check your configuration.", e);
    // In case of any initialization error, ensure all services are null.
    app = null;
    auth = null;
    db = null;
    storage = null;
  }
} else {
  // This warning is helpful for developers to identify a missing configuration.
  if (typeof window !== 'undefined') {
    console.warn("Firebase client configuration is missing. Please set NEXT_PUBLIC_FIREBASE... variables in your .env.local file. Features like login will be disabled.");
  }
}

export { app, db, storage, auth };
