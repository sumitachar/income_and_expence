"use client"
import { useEffect, useState } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/context/AuthContext';
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { AuthRoute } from '../auth/AuthRoute';

interface SummaryData {
  totalEstimatedIncome: number;
  totalDepositIncome: number;
  totalExpenses: number;
  netBalance: number;
  recentTransactions: {
    type: 'income' | 'expense';
    name: string;
    amount: number;
    date: Date;
  }[];
}

export default function DashboardSummary() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>({
    totalEstimatedIncome: 0,
    totalDepositIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    recentTransactions: [],
  });

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        
        // Fetch all incomes (both admin and regular users can see all)
        const incomesQuery = query(collection(db, 'incomes'));
        const incomesSnapshot = await getDocs(incomesQuery);
        let totalEstimated = 0;
        let totalDeposit = 0;
        const incomeTransactions: SummaryData['recentTransactions'] = [];

        incomesSnapshot.forEach((doc) => {
          const data = doc.data();
          totalEstimated += data.estimatedAmount || 0;
          totalDeposit += data.depositAmount || 0;
          incomeTransactions.push({
            type: 'income',
            name: data.name,
            amount: data.depositAmount,
            date: new Date(data.date.seconds * 1000),
          });
        });

        // Fetch all expenses (both admin and regular users can see all)
        const expensesQuery = query(collection(db, 'expenses'));
        const expensesSnapshot = await getDocs(expensesQuery);
        let totalExpenses = 0;
        const expenseTransactions: SummaryData['recentTransactions'] = [];

        expensesSnapshot.forEach((doc) => {
          const data = doc.data();
          totalExpenses += data.debitedAmount || 0;
          expenseTransactions.push({
            type: 'expense',
            name: data.purposeName,
            amount: data.debitedAmount,
            date: new Date(data.date.seconds * 1000),
          });
        });

        // Combine and sort recent transactions
        const allTransactions = [...incomeTransactions, ...expenseTransactions]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);

        setSummary({
          totalEstimatedIncome: totalEstimated,
          totalDepositIncome: totalDeposit,
          totalExpenses: totalExpenses,
          netBalance: totalDeposit - totalExpenses,
          recentTransactions: allTransactions,
        });
      } catch (error) {
        console.error('Error fetching summary data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <AuthRoute>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Estimated Income */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Estimated Income (ধার্য মূল্য)</p>
                <p className="text-2xl font-bold">₹{summary.totalEstimatedIncome.toFixed(2)}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <ArrowUpIcon className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Deposit Income */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Deposit Income (জমা মুল্য)</p>
                <p className="text-2xl font-bold">₹{summary.totalDepositIncome.toFixed(2)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ArrowUpIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold">₹{summary.totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Net Balance</p>
                <p className={`text-2xl font-bold ${
                  summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{summary.netBalance.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          {summary.recentTransactions.length === 0 ? (
            <p className="text-gray-500">No recent transactions</p>
          ) : (
            <div className="space-y-4">
              {summary.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthRoute>
  );
}