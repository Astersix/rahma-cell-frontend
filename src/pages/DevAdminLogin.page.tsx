import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

/**
 * Dev-only helper page to quickly assume admin role and jump to dashboard.
 * Remove this file and its route before deploying to production.
 */
const DevAdminLogin = () => {
  const { loginAsAdmin } = useAuthStore()

  useEffect(() => {
    loginAsAdmin()
  }, [loginAsAdmin])

  return <Navigate to="/admin/dashboard" replace />
}

export default DevAdminLogin
