
'use server';

import { getAuth } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminApp } from '@/lib/firebase-admin';
import { getUserByUsername, getUserByUid } from '@/services/firestore';
import { sendWhatsAppNotification } from '@/services/notifications';

export async function getEmailForUsername(username: string): Promise<{ success: boolean; email?: string; error?: string }> {
  try {
    const { user, error } = await getUserByUsername(username);
    if (error) {
      throw new Error(error);
    }
    if (!user) {
      return { success: false, error: 'Username not found.' };
    }
    return { success: true, email: user.email };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Creates a session cookie from a Firebase ID token.
 * This function is called from a client component after a user signs in.
 */
export async function createSessionCookieAction(idToken: string): Promise<{ success: boolean; error?: string }> {
  const adminApp = getAdminApp();
  if (!adminApp) {
    return { success: false, error: 'Server authentication is not configured.' };
  }

  try {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const auth = getAuth(adminApp);
    const decodedToken = await auth.verifyIdToken(idToken);

    const { user, error } = await getUserByUid(decodedToken.uid);

    if (error) {
      console.error("Failed to fetch user during session creation:", error);
      return { success: false, error: "Failed to verify user data. Please try again." };
    }
    
    // If the role in Firestore is different from the token, the token is stale.
    // Update the claims and force the user to re-login to get a fresh token.
    if (user && user.role && decodedToken.role !== user.role) {
       await auth.setCustomUserClaims(decodedToken.uid, { role: user.role });
       return { 
         success: false, 
         error: 'Your permissions have been updated. Please sign in again.' 
       };
    }
    
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    cookies().set('session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    
    // Send WhatsApp notification on successful login
    if (user) {
      try {
          await sendWhatsAppNotification(`Unity Valiyangadi Alert: User '${user.username}' just logged in.`);
      } catch(e) {
          // Fail silently if notification fails
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return { success: false, error: 'Failed to create session.' };
  }
}

/**
 * Signs the user out by clearing the session cookie.
 */
export async function signOutAction() {
  cookies().delete('session');
  redirect('/login');
}
