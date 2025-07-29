
'use server';

import { addMember, deleteMember, updateMember} from '@/services/firestore';
import { getRequest, updateRequestStatus } from '@/services/requests';
import { getAuthState } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { NewMemberData } from '@/lib/types';
import { moveRequestAttachmentToProfilePicture } from '@/services/storage';

type AdminActionResponse = {
    success: boolean;
    message: string;
    error?: string;
};

async function checkAdmin() {
    const { user } = await getAuthState();
    if (user?.role !== 'admin') {
        throw new Error('You are not authorized to perform this action.');
    }
    return user;
}

export async function approveRequestAction(requestId: string): Promise<AdminActionResponse> {
    try {
        await checkAdmin();
        const { request } = await getRequest(requestId);
        
        if (!request || request.status !== 'pending') {
            return { success: false, message: "Request not found or already handled.", error: "Request not found or already handled." };
        }

        switch (request.type) {
            case 'add':
                if (request.data) {
                    const payload = request.data;
                     const memberData: NewMemberData = {
                        name: payload.name ?? 'Unnamed Member',
                        gender: payload.gender ?? 'Other',
                        relationship: payload.relationship ?? 'Unknown',
                        parents: payload.parents || [],
                        dateOfDeath: payload.dateOfDeath || null,
                        dateOfBirth: payload.dateOfBirth || null,
                        spouseName: payload.spouseName ?? null,
                        otherParentName: payload.otherParentName ?? null,
                        bloodType: payload.bloodType ?? null,
                        mobile: payload.mobile ?? null,
                        email: payload.email ?? null,
                        birthPlace: payload.birthPlace ?? null,
                        occupation: payload.occupation ?? null,
                        photoUrl: payload.photoUrl, // optional
                    };

                    
                    // Add member without photoUrl first to get an ID
                    const { photoUrl, ...dataWithoutPhoto } = memberData;
                    const newMemberId = await addMember(dataWithoutPhoto);

                    // If there was a photo in the request, move it to its final destination
                    if (photoUrl) {
                        const finalPhotoUrl = await moveRequestAttachmentToProfilePicture(photoUrl, newMemberId);
                        // Update the new member with the final URL
                        await updateMember(newMemberId, { photoUrl: finalPhotoUrl });
                    }
                }
                break;
            case 'edit':
                if (request.memberId && request.data) {
                     const payload = request.data;
                     const updatePayload: Partial<NewMemberData> = {
                        ...payload,
                        parents: payload.parents || [],
                        dateOfDeath: payload.dateOfDeath || null,
                    };
                    await updateMember(request.memberId, updatePayload);
                }
                break;
            case 'delete':
                if (request.memberId) {
                    await deleteMember(request.memberId);
                }
                break;
        }

        await updateRequestStatus(requestId, 'approved');
        revalidatePath('/admin');
        revalidatePath('/members');
        revalidatePath('/');
        return { success: true, message: `Request for ${request.memberName} has been approved.` };

    } catch (e: any) {
        console.error("Approval Error:", e);
        return { success: false, message: "Approval failed.", error: e.message };
    }
}

export async function rejectRequestAction(requestId: string): Promise<AdminActionResponse> {
     try {
        await checkAdmin();
        const { request } = await getRequest(requestId);
        
        if (!request || request.status !== 'pending') {
            return { success: false, message: "Request not found or already handled.", error: "Request not found or already handled." };
        }
        
        await updateRequestStatus(requestId, 'rejected');
        revalidatePath('/admin');
        return { success: true, message: `Request for ${request.memberName} has been rejected.` };

    } catch (e: any) {
        console.error("Rejection Error:", e);
        return { success: false, message: "Rejection failed.", error: e.message };
    }
}
