import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '../store/auth.store'

interface ProtectedRouteProps {
	children: ReactNode
	redirectTo?: string // where to send unauthenticated users
	allowedRoles?: UserRole[] // if provided, user role must be one of these
}

const ProtectedRoute = ({ children, redirectTo = '/login', allowedRoles }: ProtectedRouteProps) => {
	const { isAuthenticated, role } = useAuthStore()

	// Must be logged in first
	if (!isAuthenticated) {
		return <Navigate to={redirectTo} replace />
	}

	// If roles are specified, enforce them
	if (allowedRoles && (!role || !allowedRoles.includes(role))) {
		return <Navigate to="/landing" replace />
	}

	return <>{children}</>
}

export default ProtectedRoute

