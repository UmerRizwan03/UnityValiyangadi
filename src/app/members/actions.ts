
'use server';

import { deleteMember as deleteMemberFromDb, getMember } from '@/services/firestore';
import { revalidatePath } from 'next/cache';
import { getAuthState } from '@/lib/auth';
import { submitChangeRequest } from '@/services/requests';

type ActionResponse = {
    success: boolean;
    message: string;
    error?: string | null;
}

export async function deleteMemberAction(id: string): Promise<ActionResponse> {
    try {
        const { user } = await getAuthState();
        if (!user) {
            throw new Error('You are not authorized to perform this action.');
        }

        const { member } = await getMember(id);
        if (!member) {
             throw new Error('Member not found.');
        }
        
        if (user.role === 'admin') {
            await deleteMemberFromDb(id);
            revalidatePath('/');
            revalidatePath('/members');
            return { success: true, message: `${member.name} has been deleted.` };
        } else {
            await submitChangeRequest({
                type: 'delete',
                requestedByUid: user.uid,
                requestedByName: user.name ?? 'Unknown',
                memberId: id,
                memberName: member.name
            });
            revalidatePath('/admin');
            return { success: true, message: 'Your request to delete this member has been submitted for approval.' };
        }

    } catch (e) {
        console.error("Failed to process delete request:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { success: false, message: 'Action Failed', error: errorMessage };
    }
}
