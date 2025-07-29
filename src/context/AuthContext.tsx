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
  if (!auth) return;

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? 'no-email@unknown.com',
        username: firebaseUser.displayName || 'N/A',
        role: (await firebaseUser.getIdTokenResult()).claims.role as User['role'] || 'member',
        phoneNumber: firebaseUser.phoneNumber ?? '', // ✅ Provide fallback if null
      };
      setAuthState({ isLoggedIn: true, user });
    } else {
      setAuthState({ isLoggedIn: false, user: null });
    }
    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);

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