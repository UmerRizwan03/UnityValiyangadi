
import AddMemberForm from './SmartForm';
import { getMembers } from '@/services/firestore';
import { getAuthState } from '@/lib/auth';
import NotAuthorized from '@/components/NotAuthorized';

export default async function AddMemberPage() {
  const { user, isLoggedIn } = await getAuthState();

  if (!isLoggedIn) {
    return <NotAuthorized message="You must be logged in to suggest changes." />;
  }

  const { members } = await getMembers();

  const title = user?.role === 'admin' ? 'Add a New Member' : 'Request to Add a Member';
  const description = user?.role === 'admin'
    ? 'Fill out the form below to add a new family member to the tree.'
    : 'Fill out the form below to submit a request to add a new family member. Your request will be reviewed by an administrator.';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
          {title}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          {description}
        </p>
      </div>
      <AddMemberForm members={members} currentUser={user} />
    </div>
  );
}
