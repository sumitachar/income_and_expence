import AuthRoute from '@/components/auth/AuthRoute';
import DashboardSummary from '@/components/dashboard/Summary';

export default function DashboardPage() {
  return (
    <AuthRoute>
      <DashboardSummary />
    </AuthRoute>
  );
}