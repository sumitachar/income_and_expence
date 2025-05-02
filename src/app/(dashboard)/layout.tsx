"use client"
import { AuthRoute } from '@/components/auth/AuthRoute';
import DashboardSidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = useAuth();

  return (
    <AuthRoute>
      <div className="flex h-screen bg-gray-100">
        <DashboardSidebar isAdmin={isAdmin} />
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </AuthRoute>
  );
}