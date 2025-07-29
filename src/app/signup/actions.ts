
'use server';

import { getAuth } from 'firebase-admin/auth';
import { getAdminApp } from '@/lib/firebase-admin';
import { createUser, getUserByEmail, getUserByUsername, getUserByUid } from '@/services/firestore';
import type { User } from '@/lib/types';

export async function checkUserExistsAction(idToken: string): Promise<{ exists: boolean; error?: string }> {
  const adminApp = getAdminApp();
  if (!adminApp) {
    return { exists: false, error: 'Server authentication is not configured.' };
  }
  try {
    const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
    const { user, error } = await getUserByUid(decodedToken.uid);

    if (error) {
      // Propagate any real database errors
      throw new Error(error);
    }
    
    // User exists if the firestore document was found (user object is not null)
    return { exists: !!user };

  } catch (error: any) {
    console.error('Error checking user existence:', error);
    const message = error.message || 'Failed to verify user token.';
    return { exists: false, error: message };
  }
}

export async function completeSignupAction(data: {
  idToken: string;
  username: string;
  email: string;
  password?: string;
}): Promise<{ success: boolean; error?: string }> {
  const adminApp = getAdminApp();
  if (!adminApp) {
    return { success: false, error: 'Server authentication is not configured.' };
  }

  try {
    // Check for existing username or email in Firestore
    const { user: existingUsername } = await getUserByUsername(data.username);
    if (existingUsername) {
      return { success: false, error: 'This username is already taken. Please choose another.' };
    }
    const { user: existingEmail } = await getUserByEmail(data.email);
    if (existingEmail) {
      return { success: false, error: 'This email address is already in use.' };
    }

    // Verify the phone auth token to get the user's UID and phone number
    const decodedToken = await getAuth(adminApp).verifyIdToken(data.idToken);
    const uid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    if (!uid || !phoneNumber) {
      return { success: false, error: 'Invalid phone authentication token.' };
    }
    
    // Update the existing Firebase Auth user with email and password
    await getAuth(adminApp).updateUser(uid, {
        email: data.email,
        password: data.password,
        displayName: data.username
    });

    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
    const role = phoneNumber === adminPhoneNumber ? 'admin' : 'member';

    // Set custom claims. This is CRITICAL for security rules to work.
    await getAuth(adminApp).setCustomUserClaims(uid, { role });
    
    // Create the user profile in Firestore
    const newUser: User = {
        uid,
        username: data.username,
        email: data.email,
        phoneNumber,
        role
    };
    await createUser(uid, newUser);

    return { success: true };
  } catch (error: any) {
    console.error('Error completing signup:', error);
    let message = 'An unknown error occurred during signup.';
    if (error.code === 'auth/email-already-exists') {
        message = 'This email address is already associated with another account.';
    } else if (error.code === 'auth/invalid-password') {
        message = 'The password must be at least 6 characters long.';
    } else {
        message = error.message || message;
    }
    return { success: false, error: message };
  }
}
