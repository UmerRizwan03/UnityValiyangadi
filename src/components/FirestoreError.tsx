
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function FirestoreError({ error }: { error: string }) {
  if (error.includes('Database connection not available')) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Firebase Admin Configuration Error</AlertTitle>
        <AlertDescription>
          <p>The application's server-side can't connect to Firestore because the Firebase Admin SDK is not configured. This usually means the <code>SERVICE_ACCOUNT_JSON</code> environment variable is missing or incorrect in your deployment environment.</p>
          <p className="mt-2">Please go to your Firebase project settings, under &quot;Service accounts&quot;, generate a new private key, and set its **full JSON content** as the <code>SERVICE_ACCOUNT_JSON</code> environment variable for your deployed app.</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (error.includes('PERMISSION_DENIED')) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Firestore API Disabled or Rules Deny Access</AlertTitle>
        <AlertDescription>
          <p>The request to Firestore was denied. This could be for two reasons:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>The Firestore API for your project is disabled.</li>
            <li>Your Firestore security rules are preventing access.</li>
          </ul>
          <p className="mt-2">Please check your Firebase project settings to ensure the Firestore API is enabled and that your security rules allow read access from the server.</p>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (error.includes('NOT_FOUND') || error.includes('no database')) {
     return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Firestore Database Not Found</AlertTitle>
        <AlertDescription>
          <p>It looks like you've enabled the API, but a Firestore database hasn't been created for this project yet.</p>
          <p className="mt-2">Please go to the Firestore section of your Firebase Console to create a new database.</p>
        </AlertDescription>
      </Alert>
    );
  }

  // Generic fallback error
  return (
     <Alert variant="destructive">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Database Error</AlertTitle>
      <AlertDescription>
        <p>An unexpected error occurred while connecting to the database:</p>
        <p className="font-mono text-xs mt-2">{error}</p>
      </AlertDescription>
    </Alert>
  );
}
