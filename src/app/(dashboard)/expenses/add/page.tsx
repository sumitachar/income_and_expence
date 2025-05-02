import AuthRoute from '@/components/auth/AuthRoute';
import ExpenseForm from '@/components/dashboard/ExpenseForm';

export default function ExpenseAddPage() {
  return (
    <AuthRoute>
      <ExpenseForm />
    </AuthRoute>
  );
}