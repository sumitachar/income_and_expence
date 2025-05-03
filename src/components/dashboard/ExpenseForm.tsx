"use client"
import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'

export default function ExpenseForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    purposeName: '',
    debitedAmount: '',
    spentName: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await addDoc(collection(db, 'expenses'), {
        ...formData,
        debitedAmount: parseFloat(formData.debitedAmount),
        date: serverTimestamp(),
        userId: user?.uid,
        createdBy: user?.email,
      })
      setSuccess(true)
      setFormData({
        purposeName: '',
        debitedAmount: '',
        spentName: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding expense:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Record New Expense</h2>
          <p className="text-gray-600">Track your business expenditures</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Expense recorded successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
            খরচ উদ্দেশ্য (Expense Purpose) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="purposeName"
              value={formData.purposeName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="What was this expense for?"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
            মুল্য (Amount) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">₹</span>
              </div>
              <input
                type="number"
                name="debitedAmount"
                value={formData.debitedAmount}
                onChange={handleChange}
                required
                className="block w-full pl-7 pr-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
            যার দ্বারা ব্যয় করা হয়েছে (Spent By) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="spentName"
              value={formData.spentName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Who authorized this expense?"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Record Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}