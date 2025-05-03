"use client"
import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { collection, query, getDocs, deleteDoc, doc, updateDoc, enableNetwork, disableNetwork } from 'firebase/firestore'
=======
import { collection, query, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
>>>>>>> 531baeb858eaca466fdeb171a0b53c43743c0489
import { db } from '@/config/firebase'
import { useAuth } from '@/context/AuthContext'
import { TrashIcon, PencilIcon, ArrowPathIcon, ChartBarIcon, UsersIcon, CogIcon, CreditCardIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

interface AppUser {
  uid: string
  email: string | null
  isAdmin: boolean
  createdAt: { seconds: number }
  lastLogin?: { seconds: number }
}

export default function AdminPanel() {
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0
  })
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleConnectionChange = () => {
      const status = navigator.onLine
      setIsOnline(status)
      if (status) {
        enableNetwork(db).then(() => {
          toast.success('Connection restored', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
          refreshData()
        })
      } else {
        disableNetwork(db)
        toast.warn('Working offline - data may be outdated', {
          position: "top-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
      }
    }

    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)
    setIsOnline(navigator.onLine)
    
    if (!navigator.onLine) {
      disableNetwork(db)
      toast.warn('Working offline - data may be outdated', {
        position: "top-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }

    return () => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
    }
  }, [])

  useEffect(() => {
    if (!authUser || (authUser.email !== 'sumitachar89@gmail.com' && !authUser.isAdmin)) {
      window.location.href = '/dashboard'
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Verify admin status first
        if (!authUser?.isAdmin && authUser?.email !== 'sumitachar89@gmail.com') {
          throw new Error('Unauthorized access');
        }
    
        // Fetch users
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        
        const usersData: AppUser[] = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          email: doc.data().email,
          isAdmin: doc.data().isAdmin || false,
          createdAt: doc.data().createdAt || { seconds: Date.now() / 1000 },
          lastLogin: doc.data().lastLogin
        }));
    
        setUsers(usersData);
        
        // Calculate active users (last 30 days)
        const activeUsers = usersData.filter(u => {
          const lastLoginSeconds = u.lastLogin?.seconds || 0;
          return lastLoginSeconds > Date.now() / 1000 - 2592000;
        }).length;
    
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          activeUsers
        }));
    
      } catch (err:any) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData()
  }, [authUser, isOnline])

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin privileges?`)) return
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        isAdmin: !currentStatus
      })
      setUsers(users.map(u => u.uid === userId ? { ...u, isAdmin: !currentStatus } : u))
      toast.success(`Admin privileges ${!currentStatus ? 'granted' : 'revoked'}`)
    } catch (error) {
      console.error('Error updating admin status:', error)
      setError('Failed to update admin status')
      toast.error('Failed to update admin status')
    }
  }

  const deleteUser = async (userId: string, userEmail: string | null) => {
    if (!confirm(`Are you sure you want to delete ${userEmail || 'this user'}? This cannot be undone.`)) return
    
    try {
      await deleteDoc(doc(db, 'users', userId))
      const updatedUsers = users.filter(u => u.uid !== userId)
      setUsers(updatedUsers)
      setStats(prev => ({
        ...prev,
        totalUsers: updatedUsers.length,
        activeUsers: updatedUsers.filter(u => u.lastLogin?.seconds && u.lastLogin.seconds > Date.now() / 1000 - 2592000).length
      }))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user')
      toast.error('Failed to delete user')
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setError(null)
    try {
      const usersQuery = query(collection(db, 'users'))
      const usersSnapshot = await getDocs(usersQuery)
      
      const usersData: AppUser[] = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        email: doc.data().email || null,
        isAdmin: doc.data().isAdmin || false,
        createdAt: doc.data().createdAt || { seconds: Date.now() / 1000 },
        lastLogin: doc.data().lastLogin
      }))
      setUsers(usersData)

      if (isOnline) {
        const [incomeSnapshot, expenseSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'incomes'))),
          getDocs(query(collection(db, 'expenses')))
        ])

        const totalIncome = incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data().depositAmount || 0), 0)
        const totalExpenses = expenseSnapshot.docs.reduce((sum, doc) => sum + (doc.data().debitedAmount || 0), 0)
        const activeUsers = usersData.filter(u => u.lastLogin?.seconds && u.lastLogin.seconds > Date.now() / 1000 - 2592000).length

        setStats({
          totalUsers: usersData.length,
          activeUsers,
          totalIncome,
          totalExpenses,
          netProfit: totalIncome - totalExpenses
        })
      }
      toast.success('Data refreshed successfully')
    } catch (err) {
      console.error('Refresh error:', err)
      setError('Failed to refresh data')
      toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const exportUserReport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('User Management Report', 15, 15)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 22)
      doc.text(`Generated by: ${authUser?.email || 'Admin'}`, 15, 27)
      
      autoTable(doc, {
        body: [
          [
            { 
              content: 'System Statistics',
              styles: { 
                fontStyle: 'bold',
                fontSize: 12,
                textColor: [255, 255, 255],
                fillColor: [79, 70, 229]
              } 
            }
          ],
          [
            `Total Users: ${stats.totalUsers}\n` +
            `Active Users: ${stats.activeUsers}\n` +
            `Total Income: ₹${stats.totalIncome.toFixed(2)}\n` +
            `Total Expenses: ₹${stats.totalExpenses.toFixed(2)}\n` +
            `Net Profit: ₹${stats.netProfit.toFixed(2)}`
          ]
        ],
        startY: 35,
        margin: { left: 15, right: 15 },
        styles: {
          cellPadding: 3,
          lineWidth: 0.5
        }
      })
      
      autoTable(doc, {
        head: [['Email', 'Admin', 'Created', 'Last Login']],
        body: users.map(u => [
          u.email || 'No email',
          u.isAdmin ? 'Yes' : 'No',
          new Date(u.createdAt.seconds * 1000).toLocaleDateString(),
          u.lastLogin?.seconds ? new Date(u.lastLogin.seconds * 1000).toLocaleDateString() : 'Never'
        ]),
        startY: 80,
        margin: { left: 15, right: 15 },
        styles: {
          cellPadding: 4,
          fontSize: 10,
          lineWidth: 0.3
        },
        headStyles: {
          fillColor: [249, 250, 251],
          textColor: [107, 114, 128],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center' }
        }
      })
      
      doc.save(`user-report-${new Date().toISOString().slice(0, 10)}.pdf`)
      toast.success('Report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    }
  }

  if (!authUser || (authUser.email !== 'sumitachar89@gmail.com' && !authUser.isAdmin)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Unauthorized access. Redirecting...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <ToastContainer />
      
      {!isOnline && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>You are currently offline. Some data may be outdated.</span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 md:mt-2">Manage system users and view statistics</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-3">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-sm font-medium text-indigo-800">Total Users</h3>
            </div>
            <p className="text-2xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-6 w-6 text-green-600" />
              <h3 className="text-sm font-medium text-green-800">Active Users</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.activeUsers}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">Total Income</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-2">${stats.totalIncome.toFixed(2)}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-6 w-6 text-red-600" />
              <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">${stats.totalExpenses.toFixed(2)}</p>
          </div>

          <div className={`p-4 rounded-lg border ${
            stats.netProfit >= 0 
              ? 'bg-green-50 border-green-100' 
              : 'bg-red-50 border-red-100'
          }`}>
            <div className="flex items-center gap-3">
              <ChartBarIcon className={`h-6 w-6 ${
                stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
              <h3 className={`text-sm font-medium ${
                stats.netProfit >= 0 ? 'text-green-800' : 'text-red-800'
              }`}>Net Profit</h3>
            </div>
            <p className={`text-2xl font-bold mt-2 ${
              stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${stats.netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* User Management */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Refresh</span>
              </button>
              <button
                onClick={exportUserReport}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found in the system
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.email || 'No email'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin?.seconds ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => toggleAdminStatus(user.uid, user.isAdmin)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={user.isAdmin ? 'Revoke admin' : 'Make admin'}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {user.email !== 'sumitachar89@gmail.com' && (
                          <button
                            onClick={() => deleteUser(user.uid, user.email)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Controls */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Controls</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={refreshData}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Recalculate Statistics</span>
            </button>
            <button className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CogIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">System Settings</span>
            </button>
            <button 
              onClick={exportUserReport}
              className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChartBarIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm">Generate Full Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}