import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from '../pages/customer/HomePage.page'
import LoginPage from '../pages/LoginPage.page'
import AdminDashboard from '../pages/admin/AdminDashboard.page'
import ProductsPage from '../pages/admin/AdminProducts.page'
import OrdersPage from '../pages/admin/AdminOrders.page'
import RegisterPage from '../pages/RegisterPage.page'
import ProtectedRoute from './ProtectedRoute'
import LandingPage from '../pages/LandingPage.page'
import PublicRoute from './PublicRoute'

const AppRouter = () => {
	return (
		<Routes>
			{/* Default redirect to /landing */}
			<Route path="/" element={<Navigate to="/landing" replace />} />

			{/* Public routes (authenticated users are redirected to their home) */}
			<Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
			<Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
			<Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

			{/* Customer routes */}
			<Route
				path="/homepage"
				element={
					<ProtectedRoute allowedRoles={['customer']}>
						<HomePage />
					</ProtectedRoute>
				}
			/>

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

			{/* Fallback */}
			<Route path="*" element={<Navigate to="/landing" replace />} />
		</Routes>
	)
}

export default AppRouter

