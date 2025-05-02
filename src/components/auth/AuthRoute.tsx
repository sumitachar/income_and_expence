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
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (adminOnly && !isAdmin) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, isAdmin, router, adminOnly]);

  if (loading || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Verifying access...</p>
      </div>
    );
  }

  return <>{children}</>;
}