
import { Button } from '@/components/ui/button';
import { getAuthState } from '@/lib/auth';
import { getMagazines } from '@/services/firestore';
import { Upload, AlertTriangle } from 'lucide-react';
import FirestoreError from '@/components/FirestoreError';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import type { Magazine } from '@/lib/types';
import MagazineList from '@/components/MagazineList';
import LeavesEffect from '@/components/layout/LeavesEffect';

export default async function MagazinesPage() {
  const { user } = await getAuthState();
  const { magazines, error } = await getMagazines();

  return (
    <div className="min-h-screen relative bg-transparent">
      <LeavesEffect />
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
              Family Magazines
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Editions of our family's stories, triumphs, and traditions.
            </p>
          </div>
          {user?.role === 'admin' && (
            <Button asChild variant="outline">
              <Link href="/magazines/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload Magazine
              </Link>
            </Button>
          )}
        </div>

         {error ? (
          <FirestoreError error={error} />
        ) : magazines.length === 0 ? (
          <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Magazines Found</AlertTitle>
              <AlertDescription>
                  No magazines have been uploaded yet. An admin can upload one to get started.
              </AlertDescription>
          </Alert>
        ) : (
          <MagazineList magazines={magazines} />
        )}
      </div>
    </div>
  );
}
