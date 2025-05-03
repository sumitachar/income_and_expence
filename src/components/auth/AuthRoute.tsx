'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';

interface AuthRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function AuthRoute({ 
  children, 
  adminOnly = false 
}: AuthRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const isSpecialAdmin = user.email === 'sumitachar89@gmail.com';
      const hasAccess = !adminOnly || isAdmin || isSpecialAdmin;
      
      if (!hasAccess) {
        router.push(user ? '/unauthorized' : '/login');
      }
    }
  }, [user, loading, isAdmin, router, adminOnly]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  // Check if user has access (either not adminOnly, or isAdmin, or is special admin)
  const isSpecialAdmin = user?.email === 'sumitachar89@gmail.com';
  const hasAccess = user && (!adminOnly || isAdmin || isSpecialAdmin);

  if (!hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}