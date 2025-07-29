'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { User } from '@/lib/types';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

interface AuthContextType {
  authState: AuthState;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialAuthState,
}: {
  children: ReactNode;
  initialAuthState: AuthState;
}) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // You might want to fetch the full user data from Firestore here
        // based on firebaseUser.uid, similar to how getAuthState does it.
        // For now, let's just set a basic user object.
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          username: firebaseUser.displayName || 'N/A', // Or fetch from claims/firestore
          role: (await firebaseUser.getIdTokenResult()).claims.role as User['role'] || 'member', // Get role from claims
          createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
          updatedAt: new Date(),
          // Add other user properties as needed
        };
        setAuthState({ isLoggedIn: true, user });
      } else {
        setAuthState({ isLoggedIn: false, user: null });
      }
      setIsLoading(false);
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AuthContext.Provider value={{ authState, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};