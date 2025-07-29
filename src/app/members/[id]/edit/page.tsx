
import AddMemberForm from '@/app/add-member/SmartForm';
import { getMember, getMembers } from '@/services/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { getAuthState } from '@/lib/auth';
import NotAuthorized from '@/components/NotAuthorized';
import FirestoreError from '@/components/FirestoreError';

export default async function EditMemberPage({ params }: { params: { id: string }}) {
  const { user, isLoggedIn } = await getAuthState();

  if (!isLoggedIn) {
    return <NotAuthorized message="You must be logged in to suggest changes." />;
  }

  const { member, error } = await getMember(params.id);

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <FirestoreError error={error} />
      </div>
    )
  }

  const { members } = await getMembers();

  if (!member) {
    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-16">
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Member Not Found</AlertTitle>
                <AlertDescription>
                    The member you are trying to edit does not exist. Please return to the{' '}
                    <Link href="/members" className="font-semibold underline">
                    members list
                    </Link>.
                </AlertDescription>
            </Alert>
        </div>
    )
  }

  const title = user?.role === 'admin' ? 'Edit Member' : 'Request to Edit Member';
  const description = user?.role === 'admin' 
    ? `Update the details for ${member.name}.`
    : `Submit an edit request for ${member.name}. Your request will be reviewed by an administrator.`;

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
      <AddMemberForm members={members} initialData={member} memberId={member.id} currentUser={user} />
    </div>
  );
}
