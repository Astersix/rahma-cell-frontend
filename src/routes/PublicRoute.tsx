import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

interface PublicRouteProps {
  children: ReactNode
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) return <>{children}</>

  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (role === 'customer') return <Navigate to="/homepage" replace />

  return <Navigate to="/landing" replace />
}

export default PublicRoute
