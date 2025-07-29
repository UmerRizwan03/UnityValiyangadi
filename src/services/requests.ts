
'use server';

import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { ChangeRequest, NewMemberData } from '@/lib/types';
import { getAdminApp } from '@/lib/firebase-admin';
import { uploadRequestAttachment } from './storage';
import { sendWhatsAppNotification } from './notifications';

// Helper function to get the Firestore instance
function getDb() {
    const app = getAdminApp();
    if (!app) return null;
    return getFirestore(app);
}

type NewRequestData = {
    type: 'add' | 'edit' | 'delete';
    requestedByUid: string;
    requestedByName: string;
    memberId?: string;
    memberName?: string;
    data?: Partial<NewMemberData & { photoUrl?: string }>; // Allow photoUrl to be part of data
}

export async function submitChangeRequest(requestData: NewRequestData): Promise<string> {
  const db = getDb();
  if (!db) {
    throw new Error("Database not configured.");
  }
  
  const requestsCol = db.collection('change_requests');
  const newRequestRef = requestsCol.doc();
  const requestId = newRequestRef.id;

  await newRequestRef.set({
    type: requestData.type,
    requestedByUid: requestData.requestedByUid,
    requestedByName: requestData.requestedByName,
    status: 'pending',
    requestedAt: FieldValue.serverTimestamp(),
    ...(requestData.memberId && { memberId: requestData.memberId }),
    ...(requestData.memberName && { memberName: requestData.memberName }),
    data: requestData.data || {},
  });

  // Send WhatsApp notification
  try {
    const { type, requestedByName, memberName } = requestData;
    const actionText = type.charAt(0).toUpperCase() + type.slice(1);
    const message = `Unity Valiyangadi Alert: ${requestedByName} submitted a request to ${actionText} member: ${memberName}.`;
    await sendWhatsAppNotification(message);
  } catch (e) {
    // Fail silently
  }


  return requestId;
}


export async function getPendingRequests(): Promise<{ requests: ChangeRequest[], error: string | null }> {
    const db = getDb();
    if (!db) {
        return { requests: [], error: "Database not configured." };
    }
    try {
        const snapshot = await db.collection('change_requests').where('status', '==', 'pending').get();

        if (snapshot.empty) {
            return { requests: [], error: null };
        }
        
        const requests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to JSON-serializable string for client components
                requestedAt: (data.requestedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            } as ChangeRequest;
        });

        // Manually sort requests by date descending
        requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

        return { requests, error: null };
    } catch(e: any) {
        console.error("Error fetching requests:", e);
        return { requests: [], error: e.message };
    }
}

export async function getRequest(id: string): Promise<{ request: ChangeRequest | null, error: string | null}> {
    const db = getDb();
    if (!db) {
        return { request: null, error: "Database connection not available." };
    }
    
    try {
        const docRef = db.collection("change_requests").doc(id);
        const snapshot = await docRef.get();

        if (!snapshot.exists) {
            return { request: null, error: 'Request not found' };
        }
        
        const request = { id: snapshot.id, ...snapshot.data() } as ChangeRequest;
        return { request, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { request: null, error: errorMessage };
    }
}

export async function updateRequestStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured.");
    }
    await db.collection('change_requests').doc(id).update({ status });
}
