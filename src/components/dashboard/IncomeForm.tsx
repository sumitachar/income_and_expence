"use client"
import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'

export default function IncomeForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    estimatedAmount: '',
    depositAmount: '',
    address: '',
    collectorName: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await addDoc(collection(db, 'incomes'), {
        ...formData,
        estimatedAmount: parseFloat(formData.estimatedAmount),
        depositAmount: parseFloat(formData.depositAmount),
        date: serverTimestamp(),
        userId: user?.uid,
        createdBy: user?.email,
      })
      setSuccess(true)
      setFormData({
        name: '',
        estimatedAmount: '',
        depositAmount: '',
        address: '',
        collectorName: '',
      })
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error adding income:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto p-4 sm:p-6 max-w-4xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            নতুন চাঁদা যোগ করুন (Add New Income)
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Fill in the details below to record new income
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center text-sm sm:text-base">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Income added successfully!
          </div>
        )}

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              নাম (Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Income source name"
            />
          </div>

          {/* Amount Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Estimated Amount */}
            <div className="space-y-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700">
                ধার্য মূল্য (Estimated Amount) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm sm:text-base">₹</span>
                </div>
                <input
                  type="number"
                  name="estimatedAmount"
                  value={formData.estimatedAmount}
                  onChange={handleChange}
                  required
                  className="block w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1">
              <label className="block text-sm sm:text-base font-medium text-gray-700">
                জমা মুল্য (Deposit Amount) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm sm:text-base">₹</span>
                </div>
                <input
                  type="number"
                  name="depositAmount"
                  value={formData.depositAmount}
                  onChange={handleChange}
                  required
                  className="block w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              ঠিকানা (Address)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Full address"
            />
          </div>

          {/* Collector Name Field */}
          <div className="space-y-1">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              আদায়কারীর নাম (Collector&apos;s Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="collectorName"
              value={formData.collectorName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Who collected this income?"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 sm:pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-2 sm:py-3 px-4 sm:px-6 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Submit Income'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}