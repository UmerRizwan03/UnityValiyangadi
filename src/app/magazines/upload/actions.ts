
'use server';

import { addMagazine, updateMagazine } from '@/services/firestore';
import { uploadMagazinePdf } from '@/services/storage';
import { magazineFormSchema } from './schema';
import { revalidatePath } from 'next/cache';
import { getAuthState } from '@/lib/auth';
import type { Magazine } from '@/lib/types';

type MagazineActionResponse = {
  success: boolean;
  message: string;
  error?: string | null;
};

async function checkAdmin() {
    const { user } = await getAuthState();
    if (user?.role !== 'admin') {
        throw new Error('You are not authorized to perform this action.');
    }
    return user;
}


export async function uploadMagazineAction(formData: FormData): Promise<MagazineActionResponse> {
  try {
    await checkAdmin();
  } catch (e: any) {
    return { success: false, message: 'Authorization Error', error: e.message };
  }

  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    coverUrl: formData.get('coverUrl'),
    publishDate: formData.get('publishDate'),
    pages: formData.get('pages'),
    pdf: formData.get('pdf'),
  };

  const validatedFields = magazineFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
      return {
          success: false,
          message: "Validation Failed",
          error: "Invalid form data. " + JSON.stringify(validatedFields.error.flatten().fieldErrors),
      }
  }
  
  const { pdf, ...magazinePayload } = validatedFields.data;
  
  if (!pdf) {
    return { success: false, message: 'Validation Failed', error: 'PDF file is required.' };
  }

  try {
    // 1. Create a placeholder magazine entry to get an ID.
    const tempMagazineData: Omit<Magazine, 'id'> = {
        ...magazinePayload,
        pages: Number(magazinePayload.pages),
        pdfUrl: '', // temporary
    };
    const newMagazineId = await addMagazine(tempMagazineData);

    // 2. Upload the PDF with the new ID
    const pdfUrl = await uploadMagazinePdf(pdf, newMagazineId);
    
    // 3. Update the magazine entry with the final PDF URL
    await updateMagazine(newMagazineId, { pdfUrl: pdfUrl });

    revalidatePath('/magazines');
    
    return { success: true, message: `"${magazinePayload.title}" has been uploaded successfully.` };
  } catch(e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      return { success: false, message: "Upload Failed", error: errorMessage };
  }
}
