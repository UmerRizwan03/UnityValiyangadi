
'use client';

import { getMembers } from '@/services/firestore';
import { AlertTriangle, User } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MemberDirectory from '@/components/MemberDirectory';
import { getAuthState } from '@/lib/auth';
import FirestoreError from '@/components/FirestoreError';
import type { Member } from '@/lib/types';
import { useEffect, useState } from 'react';
import type { AuthState } from '@/lib/auth';
import LeavesEffect from '@/components/layout/LeavesEffect';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>({ isLoggedIn: false, user: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { members: fetchedMembers, error: membersError } = await getMembers();
      const authStateResult = await getAuthState();

      setMembers(fetchedMembers);
      setError(membersError);
      setAuthState(authStateResult);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen relative bg-transparent overflow-hidden">
      <LeavesEffect />
      <div className="container mx-auto px-4 py-12 sm:py-16 relative z-10">
        {error ? (
          <FirestoreError error={error} />
        ) : loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
                  Family Members
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  A directory of our cherished family.
                </p>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Members Found</AlertTitle>
              <AlertDescription>
                It looks like your database is empty. You can start by adding a new member.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <MemberDirectory members={members} authState={authState} />
        )}
      </div>
    </div>
  );
}
