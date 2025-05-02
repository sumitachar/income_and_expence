import { getAuth, User } from 'firebase/auth';

export const verifySession = async (token?: string): Promise<boolean> => {
  if (!token) return false;
  
  try {
    const auth = getAuth();
    // Implement actual token verification
    return true;
  } catch (error) {
    return false;
  }
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void
): (() => void) => {
  const auth = getAuth();
  return auth.onAuthStateChanged(callback);
};