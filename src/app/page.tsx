
import { getAuthState } from "@/lib/auth";
import { getMembers } from '@/services/firestore';
import HomeClient from "@/components/HomeClient";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function Home() {
    const authState = await getAuthState();
    const { members, error } = await getMembers();

    return (
        <Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <HomeClient authState={authState} members={members} error={error} />
        </Suspense>
    );
}
