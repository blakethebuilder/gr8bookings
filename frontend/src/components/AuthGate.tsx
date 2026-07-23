import { Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth, type Staff } from '../lib/auth'

interface AuthGateProps {
  allowedRoles: Staff['role'][]
}

export default function AuthGate({ allowedRoles }: AuthGateProps) {
  const { staff, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-gr8-red" size={32} />
      </div>
    )
  }

  if (!staff) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(staff.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="card-dark text-center max-w-sm">
          <p className="text-gr8-red font-bold text-lg mb-2">Access Denied</p>
          <p className="text-gray-500 text-sm">
            You don't have permission to view this page. Your role: <span className="text-white font-medium">{staff.role}</span>
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
