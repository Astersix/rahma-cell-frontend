import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from '../pages/HomePage.page'
import LoginPage from '../pages/LoginPage.page'
import AdminDashboard from '../pages/admin/AdminDashboard.page'
import ProductsPage from '../pages/admin/AdminProducts.page'
import OrdersPage from '../pages/admin/AdminOrders.page'
import RegisterPage from '../pages/RegisterPage.page'
import ProtectedRoute from './ProtectedRoute'
import DevAdminLogin from '../pages/DevAdminLogin.page'

const AppRouter = () => {
	return (
		<Routes>
			{/* Default redirect to /Homepage */}
			<Route path="/" element={<Navigate to="/Homepage" replace />} />

			{/* Public routes */}
			<Route path="/Homepage" element={<HomePage />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />

			{/* Admin routes */}
			<Route
				path="/admin/dashboard"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<AdminDashboard />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/admin/products"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<ProductsPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/admin/orders"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<OrdersPage />
					</ProtectedRoute>
				}
			/>

			{/* Dev-only routes - remove before production */}
			<Route path="/dev/login-admin" element={<DevAdminLogin />} />

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/Homepage" replace />} />
		</Routes>
	)
}

export default AppRouter

