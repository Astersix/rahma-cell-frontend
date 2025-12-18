import { useEffect, useState, useCallback } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { dashboardService, type DashboardStats, type BestSellingProduct, type SalesTrend } from "../../services/dashboard.service"
import { getLowStockProducts, type LowStockItem } from "../../services/product.service"
import ButtonIcon from "../../components/ui/ButtonIcon"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Helper to construct image URL - only prepend API_BASE_URL if it's a relative path
const getImageUrl = (url?: string | null): string | undefined => {
	if (!url) return undefined
	// If URL already has protocol (http:// or https://), return as-is
	if (url.startsWith('http://') || url.startsWith('https://')) return url
	// Otherwise prepend API base URL
	return `${API_BASE_URL}${url}`
}

const StatCard = ({ title, value, delta, sub }: { title: string; value: string; delta: string; sub: string }) => (
	<div className="rounded-md border border-neutral-200 bg-white p-4">
		<div className="text-xs font-medium text-neutral-600">{title}</div>
		<div className="mt-2 text-2xl font-bold text-neutral-900">{value}</div>
		<div className="mt-2 flex items-center gap-2 text-xs">
			<span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-600">{delta}</span>
			<span className="text-neutral-500">{sub}</span>
		</div>
	</div>
)

// const RefreshButton = () => (
// 	<button type="button" className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Refresh">
// 		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
// 			<polyline points="23 4 23 10 17 10" />
// 			<polyline points="1 20 1 14 7 14" />
// 			<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
// 			<path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
// 		</svg>
// 	</button>
// )

const ProductBarChart = ({ data }: { data: any[] }) => {
	if (!data || data.length === 0) {
		return <div className="py-8 text-center text-sm text-neutral-500">Tidak ada data</div>
	}
	
	// Transform data for Recharts with null checks
	const chartData = data.slice(0, 12).filter(item => item && item.productName).map((item, idx) => ({
		name: `${(item.productName || '').slice(0, 10)}`,
		fullName: item.productName || '',
		terjual: Number(item.quantitySelling || item.totalSold || 0),
		idx
	}))
	
	return (
		<ResponsiveContainer width="100%" height={160}>
			<BarChart data={chartData}>
				<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
				<XAxis 
					dataKey="name" 
					tick={{ fontSize: 11, fill: '#737373' }}
					axisLine={{ stroke: '#e5e5e5' }}
				/>
				<YAxis 
					tick={{ fontSize: 11, fill: '#737373' }}
					axisLine={{ stroke: '#e5e5e5' }}
				/>
				<Tooltip 
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<div className="rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
									<p className="text-xs font-medium text-neutral-900">{payload[0].payload.fullName}</p>
									<p className="text-xs text-neutral-600">{payload[0].value} unit terjual</p>
								</div>
							)
						}
						return null
					}}
				/>
				<Bar dataKey="terjual" fill="#ef4444" radius={[4, 4, 0, 0]} />
			</BarChart>
		</ResponsiveContainer>
	)
}

const SalesAreaChart = ({ data }: { data: any[] }) => {
	if (!data || data.length === 0) {
		return <div className="py-8 text-center text-sm text-neutral-500">Tidak ada data</div>
	}
	
	// Transform data for Recharts with null checks
	const chartData = data.filter(item => item && item.date !== undefined).map(item => {
		const dateObj = new Date(item.date)
		const formattedDate = dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
		return {
			date: formattedDate,
			penjualan: Number(item.totalQuantity || item.sales || 0)
		}
	})
	
	return (
		<ResponsiveContainer width="100%" height={180}>
			<AreaChart data={chartData}>
				<defs>
					<linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
						<stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
					</linearGradient>
				</defs>
				<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
				<XAxis 
					dataKey="date" 
					tick={{ fontSize: 10, fill: '#737373' }}
					axisLine={{ stroke: '#e5e5e5' }}
				/>
				<YAxis 
					tick={{ fontSize: 11, fill: '#737373' }}
					axisLine={{ stroke: '#e5e5e5' }}
				/>
				<Tooltip 
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<div className="rounded-md border border-neutral-200 bg-white p-2 shadow-sm">
									<p className="text-xs font-medium text-neutral-900">{payload[0].payload.date}</p>
									<p className="text-xs text-neutral-600">{payload[0].value} unit terjual</p>
								</div>
							)
						}
						return null
					}}
				/>
				<Area 
					type="monotone" 
					dataKey="penjualan" 
					stroke="#ef4444" 
					strokeWidth={2}
					fillOpacity={1} 
					fill="url(#colorSales)" 
				/>
			</AreaChart>
		</ResponsiveContainer>
	)
}

const AdminDashboard = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
	const [loadingLowStock, setLoadingLowStock] = useState(true)
	const [lowStockPage, setLowStockPage] = useState(1)
	const [period, setPeriod] = useState<'daily' | '30days'>('daily')
	const [bestSelling, setBestSelling] = useState<any[]>([])
	const [salesTrend, setSalesTrend] = useState<any[]>([])
	const [loadingCharts, setLoadingCharts] = useState(true)
	const LOW_STOCK_PAGE_SIZE = 10

	const fetchStats = useCallback(async (selectedPeriod: 'daily' | '30days') => {
		try {
			setLoading(true)
			setError(null)
			const data = selectedPeriod === 'daily' 
				? await dashboardService.getAllStats()
				: await dashboardService.getAllStats30Days()
			setStats(data)
		} catch (err) {
			setError('Gagal memuat data dashboard')
		} finally {
			setLoading(false)
		}
	}, [])

	const fetchChartData = useCallback(async (selectedPeriod: 'daily' | '30days') => {
		try {
			setLoadingCharts(true)
			const [bestSellingData, trendData] = await Promise.all([
				selectedPeriod === 'daily'
					? dashboardService.getBestSellingProductDaily()
					: dashboardService.getBestSellingProduct30Days(),
				dashboardService.getSalesTrend30Days()
			])
			console.log('Best Selling Data:', bestSellingData)
			console.log('Trend Data:', trendData)
			console.log('Period:', selectedPeriod)
			setBestSelling(bestSellingData)
			setSalesTrend(trendData)
		} catch (err) {
			console.error('Failed to fetch chart data:', err)
		} finally {
			setLoadingCharts(false)
		}
	}, [])

	const handlePeriodChange = (newPeriod: 'daily' | '30days') => {
		setPeriod(newPeriod)
		fetchStats(newPeriod)
		fetchChartData(newPeriod)
	}

	const handleRefresh = () => {
		fetchStats(period)
		fetchChartData(period)
		fetchLowStock()
	}

	const fetchLowStock = useCallback(async () => {
		try {
			setLoadingLowStock(true)
			const response = await getLowStockProducts(5)
			setLowStockItems(response.data)
		} catch (err) {
			// Silent error handling
		} finally {
			setLoadingLowStock(false)
		}
	}, [])

	useEffect(() => {
		fetchStats(period)
		fetchChartData(period)
		fetchLowStock()
	}, [period, fetchStats, fetchChartData, fetchLowStock])

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(value)
	}

	const formatPercentage = (value: number) => {
		// Handle edge cases
		if (!isFinite(value) || isNaN(value)) return '0.0%'
		const sign = value > 0 ? '+' : ''
		return `${sign}${value.toFixed(1)}%`
	}

	// Pagination for low stock items
	const totalLowStockPages = Math.max(1, Math.ceil(lowStockItems.length / LOW_STOCK_PAGE_SIZE))
	const paginatedLowStock = lowStockItems.slice(
		(lowStockPage - 1) * LOW_STOCK_PAGE_SIZE,
		lowStockPage * LOW_STOCK_PAGE_SIZE
	)

	if (loading) {
		return (
			<AdminLayout sidebarActive="dashboard">
				<div className="mx-auto max-w-full">
					<h1 className="mb-2 text-2xl font-semibold text-black">Dashboard</h1>
					<p className="mb-6 text-sm text-neutral-600">Memuat data...</p>
				</div>
			</AdminLayout>
		)
	}

	if (error || !stats) {
		return (
			<AdminLayout sidebarActive="dashboard">
				<div className="mx-auto max-w-full">
					<h1 className="mb-2 text-2xl font-semibold text-black">Dashboard</h1>
					<p className="mb-6 text-sm text-red-600">{error || 'Terjadi kesalahan'}</p>
					<button
						onClick={handleRefresh}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						Coba Lagi
					</button>
				</div>
			</AdminLayout>
		)
	}

	return (
		<AdminLayout sidebarActive="dashboard">
			<div className="mx-auto max-w-full">
				<h1 className="mb-2 text-2xl font-semibold text-black">Dashboard</h1>
				<p className="mb-6 text-sm text-neutral-600">
					Ringkasan performa toko dan penjualan {period === 'daily' ? 'hari ini' : '30 hari terakhir'}.
				</p>

				{/* Range selector */}
				<div className="mb-4 flex items-center gap-2">
					<div className="inline-flex rounded-md border border-neutral-200 p-0.5">
						<button 
							onClick={() => handlePeriodChange('daily')}
							className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
								period === 'daily' 
									? 'bg-red-600 text-white' 
									: 'text-neutral-700 hover:bg-neutral-100'
							}`}
						>
							Hari ini
						</button>
						<button 
							onClick={() => handlePeriodChange('30days')}
							className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
								period === '30days' 
									? 'bg-red-600 text-white' 
									: 'text-neutral-700 hover:bg-neutral-100'
							}`}
						>
							30 Hari
						</button>
					</div>
					<button
						onClick={handleRefresh}
						className="ml-auto rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
						aria-label="Refresh"
						title="Refresh data"
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="23 4 23 10 17 10" />
							<polyline points="1 20 1 14 7 14" />
							<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
							<path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
						</svg>
					</button>
				</div>

				{/* Top stats */}
				<div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<StatCard
						title="Total Pendapatan"
						value={formatCurrency(stats.totalIncome)}
						delta={formatPercentage(stats.incomeChange)}
						sub={period === 'daily' ? 'dari kemarin' : 'dari periode sebelumnya'}
					/>
					<StatCard
						title="Total Pesanan"
						value={stats.totalOrders.toString()}
						delta={formatPercentage(stats.orderChange)}
						sub={period === 'daily' ? 'dari kemarin' : 'dari periode sebelumnya'}
					/>
					<StatCard
						title="Produk Terjual"
						value={stats.totalSelling.toString()}
						delta={formatPercentage(stats.sellingChange)}
						sub={period === 'daily' ? 'dari kemarin' : 'dari periode sebelumnya'}
					/>
				</div>

				{/* Produk Terlaris */}
				<div className="mb-6 rounded-md border border-neutral-200 bg-white">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="text-sm font-semibold text-neutral-900">Produk Terlaris</div>
					<button onClick={handleRefresh} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Refresh">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="23 4 23 10 17 10" />
							<polyline points="1 20 1 14 7 14" />
							<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
							<path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
						</svg>
					</button>
				</div>
				<div className="px-2 pb-2">
					{loadingCharts ? (
						<div className="py-8 text-center text-sm text-neutral-500">Memuat...</div>
					) : (
						<ProductBarChart data={bestSelling} />
					)}
					</div>
				</div>

				{/* Tren Penjualan */}
				<div className="mb-6 rounded-md border border-neutral-200 bg-white">
					<div className="flex items-center justify-between px-4 py-3">
					<div className="text-sm font-semibold text-neutral-900">
						Tren Penjualan {period === 'daily' ? '(Hari Ini)' : '(30 Hari)'}
					</div>
					<button onClick={handleRefresh} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Refresh">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<polyline points="23 4 23 10 17 10" />
							<polyline points="1 20 1 14 7 14" />
							<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
							<path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
						</svg>
					</button>
				</div>
				<div className="px-4 pb-4">
					{loadingCharts ? (
						<div className="py-8 text-center text-sm text-neutral-500">Memuat...</div>
					) : (
						<SalesAreaChart data={salesTrend} />
					)}
					</div>
				</div>

				{/* Peringatan Stok Rendah */}
				<div className="rounded-md border border-neutral-200 bg-white">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="flex items-center gap-2">
							<div className="text-sm font-semibold text-neutral-900">Peringatan Stok Rendah</div>
							<span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
								{lowStockItems.length} item
							</span>
						</div>
					</div>
					<div className="divide-y divide-neutral-200">
						{loadingLowStock ? (
							<div className="px-4 py-8 text-center text-sm text-neutral-500">
								Memuat data stok rendah...
							</div>
						) : paginatedLowStock.length === 0 ? (
							<div className="px-4 py-8 text-center text-sm text-neutral-500">
								Tidak ada produk dengan stok rendah
							</div>
						) : (
							paginatedLowStock.map((item) => (
								<div key={item.variantId} className="flex items-center justify-between px-4 py-3 text-sm">
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 overflow-hidden">
											{item.thumbnail ? (
												<img
												src={getImageUrl(item.thumbnail)}
													alt={item.productName}
													className="h-full w-full object-cover"
												/>
											) : (
												<span className="text-neutral-500">📦</span>
											)}
										</div>
										<div className="min-w-0">
											<div className="truncate font-medium text-neutral-900">{item.productName}</div>
											<div className="truncate text-xs text-neutral-500">Varian: {item.variantName}</div>
										</div>
									</div>
									<div className="flex items-center gap-10">
										<div className="text-red-600 font-semibold">{item.stock} unit</div>
									</div>
								</div>
							))
						)}
					</div>
					{lowStockItems.length > 0 && (
						<div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
							<span>
								Menampilkan {paginatedLowStock.length} dari {lowStockItems.length} produk stok rendah
							</span>
							<div className="flex items-center gap-1">
								<ButtonIcon
									aria-label="Prev"
									icon="arrow-left"
									size="sm"
									variant="light"
									className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
									onClick={() => setLowStockPage(p => Math.max(1, p - 1))}
								/>
								{Array.from({ length: totalLowStockPages }).map((_, idx) => {
									const pageNum = idx + 1
									return (
										<button
											key={pageNum}
											onClick={() => setLowStockPage(pageNum)}
											className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
												pageNum === lowStockPage
													? 'bg-neutral-900 text-white'
													: 'text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100'
											}`}
										>
											{pageNum}
										</button>
									)
								})}
								<ButtonIcon
									aria-label="Next"
									icon="arrow-right"
									size="sm"
									variant="light"
									className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
									onClick={() => setLowStockPage(p => Math.min(totalLowStockPages, p + 1))}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminDashboard

