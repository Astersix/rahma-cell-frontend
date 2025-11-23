import { useMemo, useState } from 'react'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useCartStore } from '../../store/cart.store'
import { useNavigate } from 'react-router-dom'

function formatIDR(n?: number) {
	if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
	return 'Rp ' + n.toLocaleString('id-ID')
}

const ProductCartPage = () => {
	const navigate = useNavigate()
	const items = useCartStore(s => s.items)
	const updateQuantity = useCartStore(s => s.updateQuantity)
	const removeItem = useCartStore(s => s.removeItem)
	const [selected, setSelected] = useState<string[]>(() => items.map(i => i.key))

	function toggleSelect(key: string) {
		setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
	}

	const selectedItems = useMemo(() => items.filter(i => selected.includes(i.key)), [items, selected])
	const totalQuantity = useMemo(() => selectedItems.reduce((s, i) => s + i.quantity, 0), [selectedItems])
	const totalPrice = useMemo(() => selectedItems.reduce((s, i) => s + (i.price || 0) * i.quantity, 0), [selectedItems])

	function dec(key: string, current: number) {
		updateQuantity(key, Math.max(1, current - 1))
	}
	function inc(key: string, current: number) {
		updateQuantity(key, current + 1)
	}

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				{/* Breadcrumb */}
				<nav className="mb-6 text-xs text-neutral-500">
					<button onClick={() => navigate('/')} className="text-neutral-600 hover:underline">Beranda</button>
					<span className="mx-2">/</span>
					<span className="text-neutral-800">Keranjang Belanja</span>
				</nav>
				<div className="grid gap-6 md:grid-cols-[1fr_320px]">
					{/* Left: Cart Table */}
					<div>
						<h1 className="mb-2 text-xl font-semibold text-neutral-900">Keranjang Belanja Anda</h1>
						<p className="mb-4 text-xs text-neutral-600">Tinjau produk yang dipilih sebelum melanjutkan ke pembayaran</p>
						<div className="overflow-hidden rounded-md border border-neutral-200">
							<table className="w-full text-sm">
								<thead className="bg-neutral-50 text-neutral-700">
									<tr className="text-xs">
										<th className="px-4 py-3 text-left">Produk</th>
										<th className="px-4 py-3 text-left">Harga</th>
										<th className="px-4 py-3 text-left">Jumlah</th>
										<th className="px-4 py-3 text-left">Subtotal</th>
										<th className="px-4 py-3 text-left">Aksi</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-200">
									{items.map(item => {
										const lineTotal = (item.price || 0) * item.quantity
										return (
											<tr key={item.key} className="align-top">
												<td className="px-4 py-4">
													<div className="flex items-start gap-3">
														<input
															type="checkbox"
															className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
															checked={selected.includes(item.key)}
															onChange={() => toggleSelect(item.key)}
														/>
														{item.imageUrl ? (
															<div className="h-14 w-14 overflow-hidden rounded-md bg-neutral-100">
																<img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
															</div>
														) : (
															<div className="flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">IMG</div>
														)}
														<div className="space-y-0.5 text-xs">
															<div className="font-semibold text-neutral-800 leading-snug">{item.productName}</div>
															{item.variantName && <div className="text-neutral-600">Warna: {item.variantName}</div>}
															<div className="text-neutral-500">Garansi: 1 Tahun</div>
														</div>
													</div>
												</td>
												<td className="px-4 py-4 text-neutral-800">{formatIDR(item.price)}</td>
												<td className="px-4 py-4">
													<div className="flex items-center">
														<button
															className="h-6 w-6 rounded border border-neutral-300 text-xs hover:bg-neutral-100"
															onClick={() => dec(item.key, item.quantity)}
														>−</button>
														<div className="mx-2 min-w-6 text-center text-neutral-800">{item.quantity}</div>
														<button
															className="h-6 w-6 rounded border border-neutral-300 text-xs hover:bg-neutral-100"
															onClick={() => inc(item.key, item.quantity)}
														>+</button>
													</div>
												</td>
												<td className="px-4 py-4 font-medium text-neutral-800">{formatIDR(lineTotal)}</td>
												<td className="px-4 py-4">
													<button
														aria-label="Hapus"
														onClick={() => removeItem(item.key)}
														className="rounded p-1 text-neutral-500 hover:text-red-600"
													>
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
															<polyline points="3 6 5 6 21 6" />
															<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
															<line x1="10" y1="11" x2="10" y2="17" />
															<line x1="14" y1="11" x2="14" y2="17" />
														</svg>
													</button>
												</td>
											</tr>
										)
									})}
									{items.length === 0 && (
										<tr>
											<td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-500">Keranjang kosong.</td>
										</tr>
									)}
								</tbody>
							</table>
							<div className="flex items-center justify-start border-t border-neutral-200 px-4 py-3">
								<Button
									variant="light"
									size="sm"
									className="border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100"
									type="button"
									onClick={() => navigate('/')}
								>
									← Lanjut Belanja
								</Button>
							</div>
						</div>
					</div>
					{/* Right: Summary */}
					<div>
						<Card className="space-y-4">
							<div>
								<div className="text-sm font-semibold text-neutral-900">Ringkasan Pesanan</div>
							</div>
							<div className="space-y-2 text-xs">
								<div className="flex items-center justify-between">
									<span>Subtotal ({totalQuantity} item)</span>
									<span className="font-medium text-neutral-800">{formatIDR(totalPrice)}</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Total Sementara</span>
									<span className="font-semibold text-neutral-900">{formatIDR(totalPrice)}</span>
								</div>
							</div>
							<Button
								fullWidth
								className="bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500"
								onClick={() => navigate('/checkout')}
								disabled={selectedItems.length === 0}
							>
								Lanjut ke Checkout
							</Button>
							<div className="mt-1 text-center text-[10px] text-neutral-500">Transaksi aman dan terpercaya</div>
							<div className="flex justify-center gap-2 text-neutral-400">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l2.5 2.5" /></svg>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
							</div>
						</Card>
					</div>
				</div>
			</div>
		</CustomerLayout>
	)
}

export default ProductCartPage
