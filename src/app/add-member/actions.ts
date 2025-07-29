
'use server';

import { addMember as addMemberToDb, updateMember as updateMemberInDb, type NewMemberData } from '@/services/firestore';
import { uploadProfilePicture, uploadRequestAttachment } from '@/services/storage';
import { memberFormSchema } from './schema';
import { revalidatePath } from 'next/cache';
import { getAuthState } from '@/lib/auth';
import { submitChangeRequest } from '@/services/requests';

type MemberActionResponse = {
  success: boolean;
  message: string;
  error?: string | null;
};

async function getAuthenticatedUser() {
  const { user, isLoggedIn } = await getAuthState();
  if (!isLoggedIn || !user) {
    throw new Error('You must be logged in to perform this action.');
  }
  return user;
}

const parseFormData = (formData: FormData) => {
    return {
        name: formData.get('name'),
        gender: formData.get('gender'),
        parents: formData.getAll('parents').filter(p => p),
        otherParentName: formData.get('otherParentName'),
        spouseName: formData.get('spouseName'),
        bloodType: formData.get('bloodType'),
        dateOfBirth: formData.get('dateOfBirth'),
        isDeceased: formData.get('isDeceased') === 'true',
        dateOfDeath: formData.get('dateOfDeath'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        birthPlace: formData.get('birthPlace'),
        occupation: formData.get('occupation'),
        relationship: formData.get('relationship'),
        photo: formData.get('photo'),
    };
}


export async function addMemberAction(formData: FormData): Promise<MemberActionResponse> {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (e: any) {
    return { success: false, message: 'Authorization Error', error: e.message };
  }

  const rawData = parseFormData(formData);
  const validatedFields = memberFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
      return {
          success: false,
          message: "Validation Failed",
          error: "Invalid form data. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
      }
  }
  
  const { photo, isDeceased, ...memberPayload } = validatedFields.data;
  
  try {
    if (user.role === 'admin') {
      const memberData: NewMemberData = {
          ...memberPayload,
          parents: memberPayload.parents || [],
          dateOfDeath: memberPayload.dateOfDeath || null,
      };
      const newMemberId = await addMemberToDb(memberData);

      if (photo instanceof File && photo.size > 0) {
        const photoUrl = await uploadProfilePicture(photo, newMemberId);
        await updateMemberInDb(newMemberId, { photoUrl });
      }
      revalidatePath('/members');
      revalidatePath('/');
      return { success: true, message: `${memberData.name} has been added to the family tree.` };
    } else {
        const submissionData: Partial<NewMemberData & {photoUrl?: string}> = { ...validatedFields.data };
        if (submissionData.photo instanceof File && submissionData.photo.size > 0) {
            // For non-admins, upload attachment for review
            const tempPhotoUrl = await uploadRequestAttachment(submissionData.photo, `req_${Date.now()}`);
            submissionData.photoUrl = tempPhotoUrl;
        }
        delete submissionData.photo;

        await submitChangeRequest({
            type: 'add',
            requestedByUid: user.uid,
            requestedByName: user.username ?? 'Unknown',
            data: submissionData,
            memberName: submissionData.name
        });

        revalidatePath('/admin');
        return { success: true, message: 'Your request to add a new member has been submitted for approval.' };
    }
  } catch(e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      return { success: false, message: "Action Failed", error: errorMessage };
  }
}

export async function updateMemberAction(id: string, formData: FormData): Promise<MemberActionResponse> {
    let user;
    try {
        user = await getAuthenticatedUser();
    } catch (e: any) {
        return { success: false, message: 'Authorization Error', error: e.message };
    }

    const rawData = parseFormData(formData);
    const validatedFields = memberFormSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            message: "Validation Failed",
            error: "Invalid form data. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
        }
    }
    
    const { photo, isDeceased, ...memberPayload } = validatedFields.data;

    try {
        if (user.role === 'admin') {
            const updatePayload: Partial<NewMemberData> = {
                ...memberPayload,
                parents: memberPayload.parents || [],
                dateOfDeath: memberPayload.dateOfDeath || null,
            };

            if (photo instanceof File && photo.size > 0) {
                const photoUrl = await uploadProfilePicture(photo, id);
                updatePayload.photoUrl = photoUrl;
            }
            
            await updateMemberInDb(id, updatePayload);
            revalidatePath('/');
            revalidatePath('/members');
            revalidatePath(`/members/${id}/edit`);
            return { success: true, message: `${updatePayload.name} has been successfully updated.` };
        } else {
            const submissionData: Partial<NewMemberData & {photoUrl?: string}> = { ...validatedFields.data };
            if (submissionData.photo instanceof File && submissionData.photo.size > 0) {
                const tempPhotoUrl = await uploadRequestAttachment(submissionData.photo, `req_${id}_${Date.now()}`);
                submissionData.photoUrl = tempPhotoUrl;
            }
            delete submissionData.photo;
            
            // Member submitting an edit request
            await submitChangeRequest({
                type: 'edit',
                requestedByUid: user.uid,
                requestedByName: user.username ?? 'Unknown',
                memberId: id,
                memberName: validatedFields.data.name,
                data: submissionData,
            });
            revalidatePath('/admin');
            return { success: true, message: 'Your edit request has been submitted for approval.' };
        }
    } catch(e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return { success: false, message: "Action Failed", error: errorMessage };
    }
}
