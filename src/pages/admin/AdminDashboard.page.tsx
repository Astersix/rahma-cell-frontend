import { useEffect, useState } from "react"
import AdminLayout from "../../layouts/AdminLayout"
import { dashboardService, type DashboardStats } from "../../services/dashboard.service"
import { getLowStockProducts, type LowStockItem } from "../../services/product.service"
import ButtonIcon from "../../components/ui/ButtonIcon"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

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

const RefreshButton = () => (
	<button type="button" className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100" aria-label="Refresh">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<polyline points="23 4 23 10 17 10" />
			<polyline points="1 20 1 14 7 14" />
			<path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
			<path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
		</svg>
	</button>
)

const BarChart = () => {
	const bars = [80, 65, 55, 48, 95, 30, 18, 12, 40, 72, 20, 10]
	return (
		<div className="relative h-40 w-full">
			<div className="absolute inset-0 flex items-end gap-2 px-3 pb-3">
				{bars.map((h, i) => (
					<div key={i} className="flex-1">
						<div className="mx-auto w-4 rounded bg-red-500" style={{ height: `${Math.max(6, h)}%` }} />
					</div>
				))}
			</div>
		</div>
	)
}

const LineChart = () => {
	const points = [23, 30, 18, 28, 26, 34, 20, 32, 24, 29, 18, 36, 22, 31, 27]
	const w = 600
	const h = 180
	const pad = 16
	const max = 40
	const stepX = (w - pad * 2) / (points.length - 1)
	const toY = (v: number) => h - pad - (v / max) * (h - pad * 2)
	const d = points.map((p, i) => `${pad + i * stepX},${toY(p)}`).join(" ")
	return (
		<div className="relative">
			<svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full">
				<defs>
					<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
						<stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
					</linearGradient>
				</defs>
				<polyline fill="none" stroke="#ef4444" strokeWidth="2" points={d} />
				<polygon fill="url(#grad)" points={`${pad},${h - pad} ${d} ${w - pad},${h - pad}`} />
				{points.map((p, i) => (
					<circle key={i} cx={pad + i * stepX} cy={toY(p)} r="3" fill="#ef4444" />
				))}
			</svg>
		</div>
	)
}

const AdminDashboard = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
	const [loadingLowStock, setLoadingLowStock] = useState(true)
	const [lowStockPage, setLowStockPage] = useState(1)
	const LOW_STOCK_PAGE_SIZE = 10

	const fetchStats = async () => {
		try {
			setLoading(true)
			setError(null)
			const data = await dashboardService.getAllStats()
			setStats(data)
		} catch (err) {
			console.error('Failed to fetch dashboard stats:', err)
			setError('Gagal memuat data dashboard')
		} finally {
			setLoading(false)
		}
	}

	const fetchLowStock = async () => {
		try {
			setLoadingLowStock(true)
			const response = await getLowStockProducts(5)
			setLowStockItems(response.data)
		} catch (err) {
			console.error('Failed to fetch low stock items:', err)
		} finally {
			setLoadingLowStock(false)
		}
	}

	useEffect(() => {
		fetchStats()
		fetchLowStock()
	}, [])

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0,
		}).format(value)
	}

	const formatPercentage = (value: number) => {
		const sign = value >= 0 ? '+' : ''
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
						onClick={fetchStats}
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
				<p className="mb-6 text-sm text-neutral-600">Ringkasan performa toko dan penjualan hari ini.</p>

				{/* Range selector */}
				<div className="mb-4 flex items-center gap-2">
					<div className="inline-flex rounded-md border border-neutral-200 p-0.5">
						<button className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white">Hari ini</button>
						<button className="rounded-md px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100">30 Hari</button>
					</div>
					<button
						onClick={fetchStats}
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
						sub="dari kemarin"
					/>
					<StatCard
						title="Total Pesanan"
						value={stats.totalOrders.toString()}
						delta={formatPercentage(stats.orderChange)}
						sub="dari kemarin"
					/>
					<StatCard
						title="Produk Terjual"
						value={stats.totalSelling.toString()}
						delta={formatPercentage(stats.sellingChange)}
						sub="dari kemarin"
					/>
				</div>

				{/* Produk Terlaris */}
				<div className="mb-6 rounded-md border border-neutral-200 bg-white">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="text-sm font-semibold text-neutral-900">Produk Terlaris</div>
						<RefreshButton />
					</div>
					<div className="px-2 pb-2">
						<BarChart />
					</div>
				</div>

				{/* Tren Penjualan */}
				<div className="mb-6 rounded-md border border-neutral-200 bg-white">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="text-sm font-semibold text-neutral-900">Tren Penjualan</div>
						<RefreshButton />
					</div>
					<div className="px-4 pb-4">
						<LineChart />
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
													src={`${API_BASE_URL}${item.thumbnail}`}
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

