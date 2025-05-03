// In your auth context file
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, getIdTokenResult } from 'firebase/auth';
import { onAuthStateChanged } from '@/lib/firebase/services';

// Define our custom user type that extends Firebase User
interface AppUser extends FirebaseUser {
  isAdmin: boolean;
}

interface AuthContextType {
  user: AppUser | null;
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
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let isAdmin = false;
        const isSpecialAdmin = firebaseUser.email === 'sumitachar89@gmail.com';
        
        if (!isSpecialAdmin) {
          try {
            const idTokenResult = await withRetry(() => getIdTokenResult(firebaseUser), 3);
            isAdmin = !!idTokenResult.claims.admin;
          } catch (error) {
            console.error('Auth error:', error);
            try {
              const token = await firebaseUser.getIdToken();
              isAdmin = token ? parseAdminFromToken(token) : false;
            } catch {
              isAdmin = false;
            }
          }
        } else {
          isAdmin = true;
        }

        // Create our custom user object
        const user: AppUser = {
          ...firebaseUser,
          isAdmin
        };

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