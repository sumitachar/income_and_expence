'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, getIdTokenResult } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/firebase/services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        let isAdmin = false;
        try {
          // Add retry logic for network issues
          const idTokenResult = await withRetry(() => getIdTokenResult(user), 3);
          isAdmin = !!idTokenResult.claims.admin;
        } catch (error) {
          console.error('Auth error:', error);
          // Fallback to cached token if available
          try {
            const token = await user.getIdToken();
            isAdmin = token ? parseAdminFromToken(token) : false;
          } catch {
            isAdmin = false;
          }
        }

        setState({
          user,
          loading: false,
          isAdmin
        });
      } else {
        setState({
          user: null,
          loading: false,
          isAdmin: false
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper function with retry logic
async function withRetry<T>(fn: () => Promise<T>, retries: number): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
    return withRetry(fn, retries - 1);
  }
}

// Fallback token parser
function parseAdminFromToken(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !!payload.claims?.admin;
  } catch {
    return false;
  }
}

export const useAuth = () => useContext(AuthContext);