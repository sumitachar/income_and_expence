'use client';
import AuthRoute from '@/components/auth/AuthRoute';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth(); // 👈 get isAdmin

  return (
    <AuthRoute>
      <div className="flex min-h-screen">
        <DashboardSidebar isAdmin={isAdmin} /> {/* 👈 pass isAdmin */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </AuthRoute>
  );
}
