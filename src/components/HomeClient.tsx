
'use client';

import type { Member} from '@/lib/types';
import type { AuthState } from '@/lib/auth';
import FamilyTree from '@/components/FamilyTree';
import FirestoreError from '@/components/FirestoreError';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import LeavesEffect from './layout/LeavesEffect';

// Props interface for HomeClient
interface HomeProps {
  authState: AuthState;
  members: Member[];
  error: string | null;
}

export default function HomeClient({ authState, members, error }: HomeProps) {
  return (
    <>
      <LeavesEffect layer="foreground" />
      {/* Hero Section */}
      <section className="relative h-screen">
        <div
          className="absolute inset-0 z-10 bg-background opacity-0"
        />
        <div className="absolute inset-0 z-0 h-full w-full">
          <Image
            src="/hero_image.jpg"
            alt="Family tree background"
            fill
            className="object-cover"
            priority
            data-ai-hint="family tree nature"
          />
        </div>

        {/* Foreground content: text */}
        <div
          className="absolute inset-0 z-30 flex flex-col justify-center p-8 md:p-16 lg:p-24"
        >
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
            Unity Valiyangadi
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/95 max-w-2xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
            The Valiyangadi Family is bound by generations of love, unity, and shared values. Through every chapter of
            life, we stand together—rooted in tradition and growing in harmony.{' '}
          </p>
          <div className="mt-8 flex justify-start gap-4">
            <Button asChild size="lg">
              <Link href="/members">Explore Members</Link>
            </Button>
            {authState.user?.role === 'admin' && (
              <Button asChild size="lg" variant="secondary">
                <Link href="/add-member">
                  Add a Member <MoveRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Bush image positioned at the bottom, overlapping */}
        <Image
          src="/bush_edge.png"
          alt="Bush edge transition"
          width={1920}
          height={200}
          className="absolute -bottom-10 left-0 w-full h-auto object-contain z-20 pointer-events-none"
          data-ai-hint="bush leaves"
        />
      </section>

      {/* Family Tree Section */}
      <section className="relative py-12 sm:py-16 animated-gradient-background">
        <div className="container mx-auto px-4">
          {error ? <FirestoreError error={error} /> : <FamilyTree members={members} authState={authState} />}
        </div>
      </section>
    </>
  );
}
