import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from '../pages/HomePage.page'
import LoginPage from '../pages/LoginPage.page'
import AdminDashboard from '../pages/admin/AdminDashboard.page'
import RegisterPage from '../pages/RegisterPage.page'

const AppRouter = () => {
	return (
		<Routes>
			{/* Default redirect to /HomePage */}
			<Route path="/" element={<Navigate to="/HomePage" replace />} />

			{/* Public routes */}
			<Route path="/HomePage" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />

			{/* Admin routes */}
			<Route path="/admin/dashboard" element={<AdminDashboard />} />

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/HomePage" replace />} />
		</Routes>
	)
}

export default AppRouter

