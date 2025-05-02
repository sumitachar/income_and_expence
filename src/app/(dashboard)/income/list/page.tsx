import { AuthRoute } from '@/components/auth/AuthRoute';
import IncomeList from '@/components/dashboard/IncomeList';

export default function IncomeListPage() {
  return (
    <AuthRoute>
      <IncomeList />
    </AuthRoute>
  );
}