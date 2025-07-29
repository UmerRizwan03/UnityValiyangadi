
'use server';

import { getStorage as getAdminStorage, getDownloadURL } from 'firebase-admin/storage';
import { getAdminApp } from '@/lib/firebase-admin';
import { URL } from 'url';

function getBucket() {
    const app = getAdminApp();
    if (!app) {
        throw new Error("Firebase Admin SDK not initialized. Cannot access storage.");
    }
    return getAdminStorage(app).bucket();
}

async function uploadFile(file: File, filePath: string): Promise<string> {
    const bucket = getBucket();
    if (!bucket) {
        throw new Error("Storage not configured. Cannot upload file.");
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000',
        },
    });

    return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => reject(err));
        blobStream.on('finish', async () => {
            try {
                // Instead of making the file public, get a download URL.
                // This URL includes an access token and works even if the file is private.
                const downloadUrl = await getDownloadURL(blob);
                resolve(downloadUrl);
            } catch (err) {
                reject(err);
            }
        });
        blobStream.end(fileBuffer);
    });
}

export async function uploadProfilePicture(file: File, memberId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `profile_pictures/${memberId}.${fileExtension}`;
  return uploadFile(file, filePath);
}


export async function uploadRequestAttachment(file: File, requestId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const filePath = `request_attachments/${requestId}.${fileExtension}`;
  return uploadFile(file, filePath);
}

export async function uploadMagazinePdf(file: File, magazineId: string): Promise<string> {
    const filePath = `magazines/${magazineId}.pdf`;
    return uploadFile(file, filePath);
}

export async function moveRequestAttachmentToProfilePicture(
    sourceUrl: string,
    newMemberId: string
): Promise<string> {
    const bucket = getBucket();
    if (!bucket) {
        throw new Error("Storage not configured. Cannot move file.");
    }
    
    try {
        const urlParts = new URL(sourceUrl);
        // Extract the path from a Firebase Storage download URL
        const pathSegments = urlParts.pathname.split('/o/');
        if (pathSegments.length < 2) {
            console.error("Invalid source URL for move operation:", sourceUrl);
            // Return original URL if it's not a valid storage URL to prevent breaking the flow
            return sourceUrl;
        }
        
        const sourcePathWithQuery = pathSegments[1];
        const sourcePath = decodeURIComponent(sourcePathWithQuery);


        const fileExtension = sourcePath.split('.').pop() || 'jpg';
        const destinationPath = `profile_pictures/${newMemberId}.${fileExtension}`;

        await bucket.file(sourcePath).move(destinationPath);
        
        const newFile = bucket.file(destinationPath);
        
        // Generate a new download URL for the moved file
        const downloadUrl = await getDownloadURL(newFile);
        return downloadUrl;
    } catch (error) {
        console.error("Error moving file in storage:", error);
        // If move fails, it's better to return the original URL than nothing.
        // The file will remain in the temporary location but will still be accessible.
        return sourceUrl;
    }
}
