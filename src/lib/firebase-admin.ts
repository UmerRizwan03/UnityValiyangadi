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
    // In a deployed App Hosting environment, process.env.SERVICE_ACCOUNT_JSON will not be set.
    // In that case, we fall back to applicationDefault(), which is the standard for Google Cloud.
    if (process.env.SERVICE_ACCOUNT_JSON) {
      // This path is for local development.
      const serviceAccount: ServiceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
      return initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // This path is for the deployed Firebase App Hosting environment.
      return initializeApp({
        credential: applicationDefault(),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (e) {
    console.error("Error initializing Firebase Admin SDK:", e);
    // Return null if initialization fails to prevent crashes.
    return null;
  }
}
