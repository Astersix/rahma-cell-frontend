import { Routes, Route, Navigate } from 'react-router-dom'

import HomePage from '../pages/customer/HomePage.page'
import ProductDetailPage from '../pages/customer/ProductDetail.page'
import ProductCartPage from '../pages/customer/ProductCart.page'
import ProductCheckoutPage from '../pages/customer/ProductCheckout.page'
import LoginPage from '../pages/LoginPage.page'
import AdminDashboard from '../pages/admin/AdminDashboard.page'
import ProductsPage from '../pages/admin/AdminProducts.page'
import AdminAddProductPage from '../pages/admin/AdminAddProduct.page'
import AdminUpdateProductPage from '../pages/admin/AdminUpdateProduct.page'
import AdminProductDetailPage from '../pages/admin/AdminProductDetail.page'
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

			<Route
				path="/product/:id"
				element={
					<ProtectedRoute allowedRoles={['customer']}>
						<ProductDetailPage />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/cart"
				element={
					<ProtectedRoute allowedRoles={['customer']}>
						<ProductCartPage />
					</ProtectedRoute>
				}
			/>

			<Route
				path="/checkout"
				element={
					<ProtectedRoute allowedRoles={['customer']}>
						<ProductCheckoutPage />
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
				path="/admin/products/new"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<AdminAddProductPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/admin/products/:id"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<AdminProductDetailPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/admin/products/:id/edit"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<AdminUpdateProductPage />
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

