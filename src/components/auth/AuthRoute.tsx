"use client"
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

interface AuthRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const AuthRoute = ({ children, adminOnly = false }: AuthRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && adminOnly && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router, adminOnly]);

  if (loading || !user || (adminOnly && !isAdmin)) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};