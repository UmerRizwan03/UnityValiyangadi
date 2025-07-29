
'use server';

import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { Member, GetMembersResponse, NewMemberData, User, Magazine } from '@/lib/types';
import { getAdminApp } from '@/lib/firebase-admin';
import { uploadRequestAttachment } from './storage';
import { sendWhatsAppNotification } from './notifications';

// Helper function to get the Firestore instance
function getDb() {
    const app = getAdminApp();
    if (!app) return null;
    return getFirestore(app);
}

// Helper function to generate gender-specific SVG placeholders
const getGenderPlaceholder = (gender: Member['gender'] = 'Other'): string => {
  const maleSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#e0e7ff" /><g transform="translate(0 5)"><circle cx="50" cy="35" r="15" fill="#a5b4fc" /><path d="M 25 90 C 25 70, 75 70, 75 90 Z" fill="#a5b4fc" /></g></svg>`;
  const femaleSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#fce7f3" /><g transform="translate(0 5)"><circle cx="50" cy="35" r="15" fill="#f9a8d4" /><path d="M 20 90 C 20 60, 80 60, 80 90 Z" fill="#f9a8d4" /></g></svg>`;
  const otherSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f3f4f6" /><g transform="translate(0 5)"><circle cx="50" cy="35" r="15" fill="#d1d5db" /><path d="M 30 90 C 30 75, 70 75, 70 90 Z" fill="#d1d5db" /></g></svg>`;

  let svg: string;
  switch (gender) {
    case 'Male':
      svg = maleSvg;
      break;
    case 'Female':
      svg = femaleSvg;
      break;
    default:
      svg = otherSvg;
  }
  // Use base64 encoding on the server for robustness
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// ==================================================================
// Magazine Functions
// ==================================================================

export async function addMagazine(magazineData: Omit<Magazine, 'id'>): Promise<string> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured. Cannot add magazine.");
    }
    const magazinesCol = db.collection('magazines');
    const docRef = await magazinesCol.add(magazineData);
    return docRef.id;
}

export async function updateMagazine(id: string, magazineData: Partial<Omit<Magazine, 'id'>>): Promise<void> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured. Cannot update magazine.");
    }
    const magazineDocRef = db.collection("magazines").doc(id);
    await magazineDocRef.update(magazineData);
}

export async function getMagazines(): Promise<{ magazines: Magazine[], error: string | null }> {
    const db = getDb();
    if (!db) {
        return { magazines: [], error: "Database connection not available." };
    }

    try {
        const magazinesCol = db.collection('magazines');
        const q = magazinesCol.orderBy("publishDate", "desc");
        const magazineSnapshot = await q.get();

        if (magazineSnapshot.empty) {
            return { magazines: [], error: null };
        }

        const magazineList = magazineSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data
            } as Magazine;
        });

        return { magazines: magazineList, error: null };
    } catch (error) {
        console.error("Error fetching magazines from Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { magazines: [], error: errorMessage };
    }
}

export async function getMagazine(id: string): Promise<{ magazine: Magazine | null, error: string | null }> {
    const db = getDb();
    if (!db) {
        return { magazine: null, error: "Database connection not available." };
    }

    try {
        const docRef = db.collection('magazines').doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { magazine: { id: docSnap.id, ...docSnap.data() } as Magazine, error: null };
        } else {
            return { magazine: null, error: "Magazine not found." };
        }
    } catch (error) {
        console.error("Error fetching magazine from Firestore:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { magazine: null, error: errorMessage };
    }
}


// ==================================================================
// Member Functions
// ==================================================================

export async function getMembers(): Promise<GetMembersResponse> {
  const db = getDb();
  if (!db) {
    return { members: [], error: "Database connection not available." };
  }

  try {
    const membersCol = db.collection('members');
    const q = membersCol.orderBy("name");
    const memberSnapshot = await q.get();
    
    if (memberSnapshot.empty) {
      return { members: [], error: null };
    }

    const memberList = memberSnapshot.docs.map(doc => {
      const data = doc.data() as Partial<Omit<Member, 'id'>>; // Use Partial for safety
      return {
        id: doc.id,
        name: data.name || 'Unnamed Member',
        photoUrl: data.photoUrl || getGenderPlaceholder(data.gender),
        gender: data.gender || 'Other',
        parents: data.parents || [],
        spouseName: data.spouseName || null,
        otherParentName: data.otherParentName || null,
        bloodType: data.bloodType || null,
        dateOfBirth: data.dateOfBirth || null,
        dateOfDeath: data.dateOfDeath || null,
        mobile: data.mobile || null,
        email: data.email || null,
        birthPlace: data.birthPlace || null,
        occupation: data.occupation || null,
        relationship: data.relationship || 'Unknown',
      } as Member;
    });

    return { members: memberList, error: null };
  } catch (error) {
    console.error("Error fetching members from Firestore:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { members: [], error: errorMessage };
  }
}

export async function getMember(id: string): Promise<{ member: Member | null, error: string | null}> {
    const db = getDb();
    if (!db) {
        return { member: null, error: "Database connection not available. The application may be running in a limited mode." };
    }
    
    try {
        const memberDocRef = db.collection("members").doc(id);
        const memberSnapshot = await memberDocRef.get();

        if (!memberSnapshot.exists) {
            return { member: null, error: null };
        }
        
        const data = memberSnapshot.data() as Partial<Omit<Member, 'id'>>; // Use Partial for safety
        const member: Member = {
            id: memberSnapshot.id,
            name: data.name || 'Unnamed Member',
            photoUrl: data.photoUrl || getGenderPlaceholder(data.gender),
            gender: data.gender || 'Other',
            parents: data.parents || [],
            spouseName: data.spouseName || null,
            otherParentName: data.otherParentName || null,
            bloodType: data.bloodType || null,
            dateOfBirth: data.dateOfBirth || null,
            dateOfDeath: data.dateOfDeath || null,
            mobile: data.mobile || null,
            email: data.email || null,
            birthPlace: data.birthPlace || null,
            occupation: data.occupation || null,
            relationship: data.relationship || 'Unknown',
        };
        
        return { member, error: null };
    } catch(e) {
        console.error("Error fetching member:", e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return { member: null, error: errorMessage };
    }
}

export async function addMember(member: NewMemberData): Promise<string> {
  const db = getDb();
  if (!db) {
    throw new Error("Database not configured. Cannot add member.");
  }
  const membersCol = db.collection('members');
  const docRef = await membersCol.add({
    ...member,
    photoUrl: member.photoUrl || getGenderPlaceholder(member.gender),
  });
  return docRef.id;
}

export async function updateMember(id: string, memberData: Partial<NewMemberData>): Promise<void> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured. Cannot update member.");
    }
    const memberDocRef = db.collection("members").doc(id);
    await memberDocRef.update(memberData);
}

export async function deleteMember(id: string): Promise<void> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured. Cannot delete member.");
    }
    const memberDocRef = db.collection("members").doc(id);
    await memberDocRef.delete();
}

export async function addMemberWithId(member: Member): Promise<void> {
    const db = getDb();
    if (!db) {
        throw new Error("Database not configured. Cannot seed data.");
    }
    const memberDocRef = db.collection("members").doc(member.id);
    await memberDocRef.set({ ...member });
}

// ==================================================================
// User Functions
// ==================================================================

const USERS_COLLECTION = 'users';

export async function createUser(uid: string, data: User): Promise<void> {
  const db = getDb();
  if (!db) throw new Error("Database not configured.");
  await db.collection(USERS_COLLECTION).doc(uid).set(data);
}

async function getUserBy(field: 'username' | 'email', value: string): Promise<{ user: User | null; error: string | null }> {
  const db = getDb();
  if (!db) return { user: null, error: "Database not configured." };

  try {
    const snapshot = await db.collection(USERS_COLLECTION).where(field, '==', value).limit(1).get();
    if (snapshot.empty) {
      return { user: null, error: null };
    }
    const user = snapshot.docs[0].data() as User;
    return { user, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error fetching user.';
    return { user: null, error };
  }
}

export async function getUserByUsername(username: string) {
    return getUserBy('username', username);
}

export async function getUserByEmail(email: string) {
    return getUserBy('email', email);
}

export async function getUserByUid(uid: string): Promise<{ user: User | null; error: string | null }> {
    const db = getDb();
    if (!db) return { user: null, error: "Database not configured." };
    try {
        const doc = await db.collection(USERS_COLLECTION).doc(uid).get();
        if (!doc.exists) {
            return { user: null, error: null };
        }
        return { user: doc.data() as User, error: null };
    } catch(e) {
        const error = e instanceof Error ? e.message : 'Unknown error fetching user by UID.';
        return { user: null, error };
    }
}

export async function listUsers(): Promise<{ users: User[]; error: string | null }> {
  const db = getDb();
  if (!db) return { users: [], error: "Database not configured." };
  try {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    const users = snapshot.docs.map(doc => doc.data() as User);
    return { users, error: null };
  } catch(e) {
    const error = e instanceof Error ? e.message : 'Unknown error listing users.';
    return { users: [], error };
  }
}
