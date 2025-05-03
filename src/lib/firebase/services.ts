import { getAuth, User, getIdToken } from 'firebase/auth';

export const verifySession = async (token?: string): Promise<boolean> => {
  if (!token) return false;
  
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) return false;
    
    // Get the current user's ID token
    const currentToken = await getIdToken(currentUser);
    
    // Compare with the provided token
    return currentToken === token;
  } catch (error: unknown) {
    console.error('Session verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getAuth();
  return auth.onAuthStateChanged(callback);
};