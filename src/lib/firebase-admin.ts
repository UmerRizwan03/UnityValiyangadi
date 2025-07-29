import { initializeApp, getApps, App, cert, applicationDefault, ServiceAccount } from 'firebase-admin/app';

// This function is designed to work in multiple environments:
// 1. Local Development: It uses the SERVICE_ACCOUNT_JSON environment variable from your .env.local file.
// 2. Firebase App Hosting (Cloud): It uses applicationDefault(), which automatically finds the correct
//    service account credentials in the cloud environment.
export function getAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // Check if SERVICE_ACCOUNT_JSON is available (both local and Vercel env vars)
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
    if (serviceAccountJson) {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);
      return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Missing service account on Vercel is a fatal error
      console.error("SERVICE_ACCOUNT_JSON not set in environment.");
      return null;
    }
  } catch (e) {
    console.error("Error initializing Firebase Admin SDK:", e);
    return null;
  }
}
