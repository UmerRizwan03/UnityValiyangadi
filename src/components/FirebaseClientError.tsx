
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

export default function FirebaseClientError() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Firebase Client Configuration Error</AlertTitle>
        <AlertDescription>
          <p>The application's client-side can't connect to Firebase because the necessary configuration is missing.</p>
          <p className="mt-2">Please ensure you have a <code>.env.local</code> file in your project's root directory with the variables from your Firebase project's web app configuration. You can find these in your Firebase project settings.</p>
          <pre className="mt-4 p-4 bg-muted rounded-md text-xs font-mono overflow-x-auto">
{`NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...`}
          </pre>
          <p className="mt-3">After adding these variables, you must restart your development server for the changes to take effect.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
