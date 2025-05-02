"use client"
import AuthRoute from '@/components/auth/AuthRoute';
import IncomeForm from '@/components/dashboard/IncomeForm';

export default function IncomeAddPage() {
  console.log("IncomeAddPage")
  return (
    <AuthRoute>
      <IncomeForm />
    </AuthRoute>
  );
}