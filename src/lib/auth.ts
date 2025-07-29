
'use server';

import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import type { User } from './types';
import { getAdminApp } from './firebase-admin';
import { getUserByUid } from '@/services/firestore';

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

/**
 * Gets the authentication state of the current user from the session cookie.
 * This is a server-side function.
 */
export async function getAuthState(): Promise<AuthState> {
  const adminApp = getAdminApp();
  if (!adminApp) {
    return { isLoggedIn: false, user: null };
  }
  
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    return { isLoggedIn: false, user: null };
  }

  try {
    const decodedToken = await getAuth(adminApp).verifySessionCookie(sessionCookie.value, true);
    
    // Fetch the full user profile from Firestore
    const { user, error } = await getUserByUid(decodedToken.uid);

    if (error || !user) {
        console.error('Failed to fetch user from Firestore:', error);
        // If Firestore lookup fails, treat as logged out
        return { isLoggedIn: false, user: null };
    }

    return { isLoggedIn: true, user };
  } catch (error) {
    // Session cookie is invalid or expired.
    return { isLoggedIn: false, user: null };
  }
}
