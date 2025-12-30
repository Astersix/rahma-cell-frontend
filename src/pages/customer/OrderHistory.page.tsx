import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import PopupModal from '../../components/ui/PopupModal'
import { orderService } from '../../services/order.service'
import { useAuthStore } from '../../store/auth.store'

const IconUser = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M20 21a8 8 0 0 0-16 0" />
		<circle cx="12" cy="7" r="4" />
	</svg>
)

const IconLock = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<rect x="3" y="11" width="18" height="11" rx="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	</svg>
)

const IconLogout = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<path d="M16 17l5-5-5-5" />
		<path d="M21 12H9" />
	</svg>
)

function formatIDR(n?: number) {
	if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
	return 'Rp' + n.toLocaleString('id-ID')
}

const Sidebar = ({ active, onNavigate, onLogoutClick }: { active: 'akun' | 'pesanan'; onNavigate: (page: string) => void; onLogoutClick: () => void }) => (
	<aside className="rounded-lg border border-neutral-200 p-3 text-sm">
		<nav className="space-y-2">
			<button
				onClick={() => onNavigate('/profile')}
				className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
					active === 'akun' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'
				}`}
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconUser />
					</span>
					Akun Saya
				</span>
			</button>
			<button
				onClick={() => onNavigate('/orders')}
				className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
					active === 'pesanan' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'
				}`}
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconLock />
					</span>
					Pesanan
				</span>
			</button>
			<button
				onClick={onLogoutClick}
				className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconLogout />
					</span>
					Keluar
				</span>
			</button>
		</nav>
	</aside>
)

type TabKey = 'semua' | 'belum-bayar' | 'diproses' | 'dikirim' | 'selesai' | 'dibatalkan'

const Tabs = ({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) => {
	const tabs: { key: TabKey; label: string }[] = [
		{ key: 'semua', label: 'Semua' },
		{ key: 'belum-bayar', label: 'Belum Bayar' },
		{ key: 'diproses', label: 'Sedang Diproses' },
		{ key: 'dikirim', label: 'Dikirim' },
		{ key: 'selesai', label: 'Selesai' },
		{ key: 'dibatalkan', label: 'Dibatalkan' },
	]
	return (
		<div className="mb-4 flex flex-wrap gap-2 text-sm">
			{tabs.map((t) => (
				<button
					key={t.key}
					onClick={() => onChange(t.key)}
					className={
						active === t.key
							? 'rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-neutral-900 shadow-sm'
							: 'rounded-full border border-neutral-200 px-4 py-1.5 text-neutral-600 hover:bg-neutral-50'
					}
				>
					{t.label}
				</button>
			))}
		</div>
	)
}

const OrderCard = ({
	statusTitle,
	statusNote,
	statusTone,
	name,
	variant,
	qty,
	total,
	ctaLabel,
	onNavigate,
}: {
	orderId: string
	statusTitle: string
	statusNote?: string
	statusTone: 'red' | 'amber' | 'green'
	name: string
	variant: string
	qty: number
	total: number
	ctaLabel?: string
	onNavigate: () => void
}) => {
	const toneBorder = 'border-neutral-200'
	const toneText = statusTone === 'red' ? 'text-red-600' : statusTone === 'amber' ? 'text-amber-600' : 'text-emerald-600'

	return (
		<div className={`rounded-lg border ${toneBorder} bg-white p-4 cursor-pointer hover:shadow-md transition-shadow`} onClick={onNavigate}> 
			<div className="mb-3 flex items-center justify-between text-xs">
				<div className={`font-medium ${toneText}`}>{statusTitle}</div>
				{statusNote && <div className="text-neutral-500">{statusNote}</div>}
			</div>
			<div className="flex items-start gap-3">
				<div className="flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">
					Product Image
				</div>
				<div className="flex-1 text-xs">
					<div className="font-semibold text-neutral-900">{name}</div>
					<div className="text-neutral-600">Varian: {variant}</div>
					<div className="text-neutral-600">x{qty}</div>
				</div>
			</div>
			<div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-xs">
				<div className="text-neutral-600">Total Pesanan:</div>
				<div className="font-semibold text-neutral-900">{formatIDR(total)}</div>
			</div>
			{statusTone === 'amber' && (
				<div className="mt-1 text-[11px] text-neutral-500">Catatan: Jangan lupa memberikan ongkos kirim kepada kurir</div>
			)}
			{ctaLabel && (
				<div className="mt-3">
					<button className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
						{ctaLabel}
					</button>
				</div>
			)}
		</div>
	)
}

const normalizeStatus = (s?: string) => {
	const v = (s || '').toLowerCase()
	if (v.includes('menunggu') && v.includes('bayar')) return 'belum-bayar'
	if (v.includes('menunggu_pembayaran')) return 'belum-bayar'
	if (v.includes('diproses') || v.includes('kemas')) return 'diproses'
	if (v.includes('dikirim')) return 'dikirim'
	if (v.includes('selesai')) return 'selesai'
	if (v.includes('batal')) return 'dibatalkan'
	return 'diproses'
}

const statusTone = (k: TabKey): 'red' | 'amber' | 'green' => {
	if (k === 'belum-bayar') return 'red'
	if (k === 'selesai') return 'green'
	if (k === 'dikirim' || k === 'diproses') return 'amber'
	return 'amber'
}

const OrderHistoryPage = () => {
	const navigate = useNavigate()
	const token = useAuthStore(s => s.token)
	const [orders, setOrders] = useState<any[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [tab, setTab] = useState<TabKey>('semua')
	const [showLogoutModal, setShowLogoutModal] = useState(false)

	// Prevent going back to checkout page using browser back button
	useEffect(() => {
		// Push a dummy state to history to intercept back navigation
		window.history.pushState(null, '', window.location.href)
		
		const handlePopState = () => {
			// When user presses back button, redirect to home page instead
			navigate('/', { replace: true })
		}
		
		window.addEventListener('popstate', handlePopState)
		
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [navigate])

	function handleLogoutClick() {
		setShowLogoutModal(true)
	}

	function handleConfirmLogout() {
		setShowLogoutModal(false)
		useAuthStore.getState().logout()
		navigate('/login')
	}

	function handleCancelLogout() {
		setShowLogoutModal(false)
	}

	useEffect(() => {
		async function load() {
			try {
				setLoading(true)
				setError(null)
				const res = await orderService.getMyOrders()
				const list = (res?.data ?? res) as any[]
				setOrders(Array.isArray(list) ? list : [])
			} catch (e: any) {
				setError(e?.message || 'Gagal memuat pesanan')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [token])

	const filtered = useMemo(() => {
		if (tab === 'semua') return orders
		return orders.filter((o) => normalizeStatus(o?.status) === tab)
	}, [orders, tab])

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl min-h-screen">
				<div className="grid gap-6 md:grid-cols-[200px_1fr]">
					{/* Sidebar */}
					<Sidebar active="pesanan" onNavigate={navigate} onLogoutClick={handleLogoutClick} />

					{/* Main content */}
					<div>
						<Tabs active={tab} onChange={setTab} />

						{loading && <div className="text-sm text-neutral-600">Memuat pesanan…</div>}
						{error && <div className="text-sm text-red-600">{error}</div>}
						{!loading && !error && (
							<div className="space-y-4">
								{filtered.length === 0 ? (
									<div className="rounded-md border border-neutral-200 bg-white p-4 text-sm text-neutral-600">Tidak ada pesanan untuk filter ini.</div>
								) : (
									filtered.map((o) => {
										const items = Array.isArray(o?.order_product) ? o.order_product : []
										const first = items[0]
										const name: string = first?.name || 'Produk'
										const variant = first?.name?.split(' - ')[1] || '-'
										const qty = items.reduce((s: number, it: any) => s + (Number(it?.quantity) || 0), 0) || 1
										const k = normalizeStatus(o?.status) as TabKey
										const tone = statusTone(k)
										const titleMap: Record<TabKey, string> = {
											'semua': 'Pesanan',
											'belum-bayar': 'Belum Bayar',
											'diproses': 'Diproses',
											'dikirim': 'Dikirim',
											'selesai': 'Selesai',
											'dibatalkan': 'Dibatalkan',
										}
										const note = k === 'belum-bayar' ? 'Menunggu pembayaran' : (k === 'dikirim' ? 'Pesanan dalam perjalanan' : undefined)
										const cta = k === 'selesai' ? undefined : undefined
										return (
											<OrderCard
												key={o.id}
												orderId={o.id}
												statusTitle={titleMap[k]}
												statusNote={note}
												statusTone={tone}
												name={name}
												variant={variant}
												qty={qty}
												total={Number(o?.total) || 0}
												ctaLabel={cta}
												onNavigate={() => navigate(`/orders/${o.id}`)}
											/>
										)
									})
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			<PopupModal
				open={showLogoutModal}
				onClose={handleCancelLogout}
				icon="warning"
				title="Apakah Anda yakin ingin keluar?"
				description="Tindakan ini tidak dapat dibatalkan"
				primaryButton={{
					label: 'Keluar',
					variant: 'filled',
					onClick: handleConfirmLogout,
				}}
				secondaryButton={{
					label: 'Kembali',
					variant: 'outlined',
					onClick: handleCancelLogout,
				}}
			/>
		</CustomerLayout>
	)
}

export default OrderHistoryPage

