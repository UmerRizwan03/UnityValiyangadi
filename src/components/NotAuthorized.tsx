
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function NotAuthorized({ message, reason = 'permission' }: { message?: string, reason?: 'login' | 'permission' }) {
  const defaultMessage = reason === 'login'
    ? 'You must be logged in to view this page. It seems your session is invalid or has expired.'
    : 'You do not have the required permissions to view this page.';
  
  const finalMessage = message || defaultMessage;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          {finalMessage} Please{' '}
          <Link href="/login" className="font-semibold underline">
            log in
          </Link>
          {' '}or return to the{' '}
          <Link href="/" className="font-semibold underline">
            homepage
          </Link>
          .
        </AlertDescription>
      </Alert>
    </div>
  );
}
