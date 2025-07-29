
import { getAuthState } from '@/lib/auth';
import NotAuthorized from '@/components/NotAuthorized';
import { getPendingRequests } from '@/services/requests';
import AdminDashboardClient from './AdminDashboardClient';
import { listUsers } from '@/services/firestore';
import FirestoreError from '@/components/FirestoreError';

export default async function AdminDashboardPage() {
  const { user, isLoggedIn } = await getAuthState();

  if (!isLoggedIn) {
    return <NotAuthorized reason="login" message="You must be logged in as an administrator to view this page." />;
  }

  if (user.role !== 'admin') {
    return <NotAuthorized reason="permission" />;
  }

  // Fetch both pending requests and registered users
  const { requests, error: requestsError } = await getPendingRequests();
  const { users, error: usersError } = await listUsers();

  const error = requestsError || usersError;

  return (
    <div className="container mx-auto px-4 py-12 sm:py-16">
       <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
                Admin Dashboard
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Manage member-submitted change requests and registered users.
            </p>
        </div>

        {error ? (
             <FirestoreError error={error} />
        ) : (
            <AdminDashboardClient initialRequests={requests} users={users} />
        )}
    </div>
  );
}
