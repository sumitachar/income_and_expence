"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/config/firebase'
import { useState, useEffect } from 'react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface SidebarProps {
  isAdmin: boolean
}

export default function DashboardSidebar({ isAdmin }: SidebarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-3 right-3 z-50 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg hover:scale-105 transition"
      >
        {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40' : 'relative'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0 md:relative
          w-64 h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white 
          shadow-xl transition-transform duration-300 ease-in-out flex flex-col
        `}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">লোকনাথ পুজো 2025</h1>
        </div>

        <nav className="flex-grow overflow-y-auto mt-4 px-4 space-y-4">
          <div>
            <p className="text-slate-400 uppercase text-xs font-semibold mb-2">Main</p>
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
              onClick={() => isMobile && setIsOpen(false)}
            >
              আয় ব্যায়ের হিসেব (Dashboard)
            </Link>
          </div>

          <div>
            <p className="text-slate-400 uppercase text-xs font-semibold mb-2">আয় (Income)</p>
            <Link
              href="/income/add"
              className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
              onClick={() => isMobile && setIsOpen(false)}
            >
              নতুন আয় 
            </Link>
            <Link
              href="/income/list"
              className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
              onClick={() => isMobile && setIsOpen(false)}
            >
              সমস্ত আয়ের তথ্য
            </Link>
          </div>

          <div>
            <p className="text-slate-400 uppercase text-xs font-semibold mb-2">খরচ (Expenses)</p>
            <Link
              href="/expenses/add"
              className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
              onClick={() => isMobile && setIsOpen(false)}
            >
              নতুন খরচ
            </Link>
            <Link
              href="/expenses/list"
              className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
              onClick={() => isMobile && setIsOpen(false)}
            >
              সমস্ত খরচের তথ্য
            </Link>
          </div>

          {isAdmin && (
            <div>
              <p className="text-slate-400 uppercase text-xs font-semibold mb-2">Admin</p>
              <Link
                href="/admin"
                className="block px-3 py-2 rounded-md hover:bg-indigo-600 transition"
                onClick={() => isMobile && setIsOpen(false)}
              >
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => {
              handleLogout()
              if (isMobile) {
                setIsOpen(false)
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
