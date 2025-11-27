import CustomerLayout from '../../layouts/CustomerLayout'

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

const Sidebar = () => (
	<aside className="rounded-lg border border-neutral-200 p-3 text-sm">
		<nav className="space-y-2">
			<button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50">
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconUser /></span>
					Akun saya
				</span>
			</button>
			<button className="flex w-full items-center justify-between rounded-md bg-red-600 px-3 py-2 text-left text-white">
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconLock /></span>
					Pesanan
				</span>
			</button>
			<button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50">
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconLogout /></span>
					Keluar
				</span>
			</button>
		</nav>
	</aside>
)

const Tabs = () => (
	<div className="mb-4 flex flex-wrap gap-2 text-sm">
		{[
			{ key: 'semua', label: 'Semua', active: true },
			{ key: 'belum-bayar', label: 'Belum Bayar' },
			{ key: 'sedang-dikemas', label: 'Sedang Dikemas' },
			{ key: 'dikirim', label: 'Dikirim' },
			{ key: 'selesai', label: 'Selesai' },
			{ key: 'dibatalkan', label: 'Dibatalkan' },
			{ key: 'pengembalian', label: 'Pengembalian Barang' },
		].map((t) => (
			<button
				key={t.key}
				className={
					t.active
						? 'rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-neutral-900 shadow-sm'
						: 'rounded-full border border-neutral-200 px-4 py-1.5 text-neutral-600 hover:bg-neutral-50'
				}
			>
				{t.label}
			</button>
		))}
	</div>
)

const OrderCard = ({
	statusTitle,
	statusNote,
	statusTone,
	name,
	variant,
	qty,
	total,
	ctaLabel,
}: {
	statusTitle: string
	statusNote?: string
	statusTone: 'red' | 'amber' | 'green'
	name: string
	variant: string
	qty: number
	total: number
	ctaLabel?: string
}) => {
	const toneBorder = 'border-neutral-200'
	const toneText = statusTone === 'red' ? 'text-red-600' : statusTone === 'amber' ? 'text-amber-600' : 'text-emerald-600'

	return (
		<div className={`rounded-lg border ${toneBorder} bg-white p-4`}> 
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

const OrderHistoryPage = () => {
	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-6 md:grid-cols-[200px_1fr]">
					{/* Sidebar */}
					<Sidebar />

					{/* Main content */}
					<div>
						<Tabs />

						{/* Belum Bayar */}
						<div className="space-y-4">
							<OrderCard
								statusTitle="Belum Bayar"
								statusNote="Menunggu pembayaran"
								statusTone="red"
								name="iPhone 15 Pro Max 256GB Natural Titanium"
								variant="Natural Titanium 256GB"
								qty={1}
								total={18999000}
							/>

							{/* Dikirim */}
							<OrderCard
								statusTitle="Dikirim"
								statusNote="Pesanan dalam perjalanan"
								statusTone="amber"
								name="iPhone 15 Pro Max 256GB Natural Titanium"
								variant="Natural Titanium 256GB"
								qty={1}
								total={18999000}
							/>

							{/* Selesai */}
							<OrderCard
								statusTitle="Selesai"
								statusTone="green"
								name="iPhone 15 Pro Max 256GB Natural Titanium"
								variant="Natural Titanium 256GB"
								qty={1}
								total={18999000}
								ctaLabel="Beli lagi"
							/>
						</div>
					</div>
				</div>
			</div>
		</CustomerLayout>
	)
}

export default OrderHistoryPage

