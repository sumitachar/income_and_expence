import { AuthRoute } from '@/components/auth/AuthRoute';
import ExpenseList from '@/components/dashboard/ExpenseList';

export default function ExpenseListPage() {
  return (
    <AuthRoute>
      <ExpenseList />
    </AuthRoute>
  );
}