import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useCartStore } from '../../store/cart.store'
import { useAuthStore } from '../../store/auth.store'
import PaymentSuccessPopup from '../../components/ui/PaymentSuccessPopup'
import { orderService } from '../../services/order.service'

function formatIDR(n?: number) {
	if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
	return 'Rp ' + n.toLocaleString('id-ID')
}

const ProductCheckoutPage = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const token = useAuthStore(s => s.token || '')
	const cartItems = useCartStore(s => s.items)
	const [payment, setPayment] = useState<'qris' | 'cod'>('qris')
	const [selectedAddress, setSelectedAddress] = useState<string>('addr-1')
	const [placing, setPlacing] = useState(false)
	const [showSuccess, setShowSuccess] = useState(false)
	const addresses = useMemo(() => ([
		{ id: '1', recipient_name: 'Budi Santoso', phone: '081234567890', address: 'Jl. Merdeka No. 10, Jakarta' },
		{ id: '2', recipient_name: 'Andi Wijaya', phone: '082345678901', address: 'Jl. Sudirman No. 21, Bandung' },
	]), [])

	const stateSelected = (location.state as any)?.selectedKeys as string[] | undefined
	const stateSelectedItems = (location.state as any)?.selectedItems as Array<{
		key: string
		productName?: string
		variantName?: string
		price?: number
		quantity: number
		imageUrl?: string
    variantId?: string
	}> | undefined
	const querySelected = useMemo(() => {
		const sp = new URLSearchParams(location.search)
		const raw = sp.get('selected')
		if (!raw) return undefined
		return raw.split(',').map(s => s.trim()).filter(Boolean)
	}, [location.search])
	const selectedKeys = stateSelected?.length ? stateSelected : querySelected
	const selectedItems = useMemo(() => {
		if (selectedKeys && selectedKeys.length) {
			const set = new Set(selectedKeys)
			return cartItems.filter(it => set.has(it.key))
		}
		return cartItems
	}, [cartItems, selectedKeys])

	const displayItems = stateSelectedItems && stateSelectedItems.length ? stateSelectedItems : selectedItems

	const subtotal = useMemo(() => displayItems.reduce((s, it) => s + (Number(it.price) || 0) * it.quantity, 0), [displayItems])

	const selectedVariantIds = useMemo(() => {
		const ids = displayItems.map((it: any) => it.variantId).filter(Boolean) as string[]
		if (ids.length) return ids
		const setKeys = new Set(displayItems.map((it: any) => it.key))
		return cartItems.filter(ci => setKeys.has(ci.key)).map(ci => String(ci.variantId))
	}, [displayItems, cartItems])

	async function handlePlaceOrder() {
		if (!token) {
			alert('Silakan login untuk membuat pesanan.')
			return
		}
		const addr = addresses.find(a => String(a.id) === String(selectedAddress))
		if (!addr) {
			alert('Pilih alamat pengiriman.')
			return
		}
		try {
			setPlacing(true)
			const payload = {
				paymentMethod: payment,
				addressId: String(addr.id),
				productVariantIds: selectedVariantIds,
			}
			if (!payload.productVariantIds.length) {
				throw new Error('Tidak ada produk yang dipilih untuk dipesan.')
			}
			await orderService.placeOrder(payload, token)
			setShowSuccess(true)
		} catch (e: any) {
			alert(e?.message || 'Gagal membuat pesanan')
		} finally {
			setPlacing(false)
		}
	}

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<div className="mb-5 flex items-center gap-2">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="text-neutral-600 hover:text-neutral-800"
						aria-label="Kembali"
					>
						←
					</button>
					<h1 className="text-xl font-semibold text-neutral-900">Checkout / Pembayaran</h1>
				</div>

				<div className="grid gap-6 md:grid-cols-[1fr_320px]">
					<div className="space-y-4">
						<Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">
								Pilih Alamat Pengiriman
							</div>
							<div className="space-y-3 p-3">
								{addresses.map((a) => (
									<label
										key={a.id}
										className="flex cursor-pointer items-start gap-3 rounded-md border border-neutral-200 px-3 py-3 hover:bg-neutral-50"
									>
										<input
											type="radio"
											name="address"
											className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
											checked={selectedAddress === a.id}
											onChange={() => setSelectedAddress(a.id)}
										/>
										<div className="text-xs leading-relaxed">
											<div className="font-semibold text-neutral-800">{a.recipient_name}</div>
											<div className="text-neutral-700">
												<span className="font-medium">Alamat:</span> {a.address}
											</div>
											<div className="text-neutral-700">
												<span className="font-medium">Telepon:</span> {a.phone}
											</div>
										</div>
									</label>
								))}
							</div>
						</Card>

						<Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Metode Pembayaran</div>
							<div className="space-y-3 p-3">
								<label className="flex cursor-pointer items-center justify-between rounded-md border border-neutral-200 p-3 hover:bg-neutral-50">
									<div className="flex items-start gap-3">
										<input
											type="radio"
											name="payment"
											className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
											checked={payment === 'qris'}
											onChange={() => setPayment('qris')}
										/>
										<div className="text-xs">
											<div className="font-semibold text-neutral-800">QRIS</div>
											<div className="text-neutral-600">
												Bayar dengan scan QR code menggunakan aplikasi mobile banking atau e-wallet
											</div>
										</div>
									</div>
									<button type="button" className="rounded-md border border-neutral-300 p-2 text-neutral-600">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<rect x="3" y="3" width="7" height="7" />
											<rect x="14" y="3" width="7" height="7" />
											<rect x="14" y="14" width="7" height="7" />
											<path d="M3 14h7v7H3z" />
										</svg>
									</button>
								</label>

								<label className="flex cursor-pointer items-center justify-between rounded-md border border-neutral-200 p-3 hover:bg-neutral-50">
									<div className="flex items-start gap-3">
										<input
											type="radio"
											name="payment"
											className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
											checked={payment === 'cod'}
											onChange={() => setPayment('cod')}
										/>
										<div className="text-xs">
											<div className="font-semibold text-neutral-800">COD (Bayar di Tempat)</div>
											<div className="text-neutral-600">Bayar tunai saat barang sampai di lokasi Anda</div>
										</div>
									</div>
									<button type="button" className="rounded-md border border-neutral-300 p-2 text-neutral-600">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<rect x="3" y="4" width="18" height="14" rx="2" />
											<path d="M7 4v4h10V4" />
										</svg>
									</button>
								</label>
							</div>
						</Card>
					</div>

					<div>
						<Card className="space-y-4 p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Ringkasan Pesanan</div>
							<div className="space-y-3 px-4 py-3">
								{displayItems.map((it) => {
									const imageUrl = it.imageUrl
									const name = it.variantName || it.productName || 'Produk'
									const price = Number(it.price) || 0
									return (
										<div key={it.key} className="flex items-start justify-between gap-3 text-xs">
											<div className="flex items-start gap-3">
												<div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-neutral-200 text-[10px] text-neutral-600">
													{imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : 'Produk'}
												</div>
												<div className="leading-snug text-neutral-700">
													<div className="font-medium text-neutral-800">{name}</div>
													<div className="text-neutral-600">Qty: {it.quantity}</div>
												</div>
											</div>
											<div className="text-neutral-800">{formatIDR(price * it.quantity)}</div>
										</div>
									)
								})}

								<div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
									<span className="font-medium text-neutral-800">Total</span>
									<span className="font-semibold text-neutral-900">{formatIDR(subtotal)}</span>
								</div>
							</div>
							<div className="px-4 pb-4">
								<Button fullWidth className={`bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 ${placing ? 'opacity-70' : ''}`} disabled={displayItems.length === 0 || placing} onClick={handlePlaceOrder}>
									Buat Pesanan
								</Button>
							</div>
						</Card>
					</div>
				</div>
				<PaymentSuccessPopup open={showSuccess} onClose={() => setShowSuccess(false)} />
			</div>
		</CustomerLayout>
	)
}

export default ProductCheckoutPage

