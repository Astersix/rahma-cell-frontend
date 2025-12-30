import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PopupModal from '../../components/ui/PopupModal'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'
import { ArrowLongLeftIcon } from '@heroicons/react/24/outline'

function formatIDR(n?: number) {
	if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
	return 'Rp ' + n.toLocaleString('id-ID')
}

const OrderDetailPage = () => {
	const navigate = useNavigate()
	const { orderId } = useParams<{ orderId: string }>()
	const [order, setOrder] = useState<any | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [cancelling, setCancelling] = useState(false)
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [showSuccessModal, setShowSuccessModal] = useState(false)
	const [qrUrl, setQrUrl] = useState<string | null>(null)
	const [paymentExpiry, setPaymentExpiry] = useState<Date | null>(null)
	const [timer, setTimer] = useState<number>(15 * 60) // 15 minutes
	const [paymentStatusLabel, setPaymentStatusLabel] = useState<string>('Menunggu Pembayaran')
	const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false)
	const [showPaymentFailureModal, setShowPaymentFailureModal] = useState(false)

	useEffect(() => {
		if (!orderId) return
		let cancelled = false
		async function fetchOrder() {
			try {
				setLoading(true)
				setError(null)
				const res = await orderService.getOrderById(orderId!)
				if (cancelled) return
				const orderData = res?.data || res
				setOrder(orderData)

				// If payment method is QRIS and status is waiting for payment, load QR code
				if (orderData?.payment_method === 'qris' && orderData?.status?.toLowerCase() === 'menunggu_pembayaran') {
					try {
						const qrRes = await paymentService.initiateQris(orderId!)
						const url = qrRes?.data?.qr?.url || qrRes?.data?.payment?.qr_code || null
						
						if (!cancelled && typeof url === 'string') {
							setQrUrl(url)
						}

						// Set payment expiry time (persist across refresh using localStorage)
						if (!cancelled) {
							const storageKey = `payment-expiry-${orderId}`
							let expiry: Date
							
							// Check localStorage first for existing expiry
							const storedExpiry = localStorage.getItem(storageKey)
							if (storedExpiry) {
								expiry = new Date(storedExpiry)
							} else {
								// Try to get expiry from backend response
								const expiryStr = qrRes?.data?.qr?.expiry || qrRes?.data?.payment?.expiry_time
								
								if (expiryStr) {
									expiry = new Date(expiryStr)
								} else {
									// If no expiry from backend, set 15 minutes from now
									expiry = new Date(Date.now() + 15 * 60 * 1000)
								}
								
								// Store expiry in localStorage for persistence across refresh
								localStorage.setItem(storageKey, expiry.toISOString())
							}
							
							setPaymentExpiry(expiry)
						}

						// Start polling payment status in background
						paymentService.waitForSettlement(orderId!, { intervalMs: 3000, timeoutMs: 30 * 60 * 1000 }).then((p) => {
							if (cancelled) return
							const st = (p?.payment?.status || '').toString().toLowerCase()
							if (['settlement', 'capture', 'paid', 'success'].includes(st)) {
								setPaymentStatusLabel('Pembayaran Berhasil')
								setShowPaymentSuccessModal(true)
								// Clean up localStorage when payment succeeds
								localStorage.removeItem(`payment-expiry-${orderId}`)
							} else if (['failed', 'expire', 'cancel'].includes(st)) {
								setPaymentStatusLabel('Pembayaran Gagal/Kedaluwarsa')
							}
						})
					} catch (qrErr) {
						// Silent QR error - user can still view order details
					}
				}
			} catch (err: any) {
				if (!cancelled) setError(err?.message || 'Gagal memuat detail pesanan')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		fetchOrder()
		return () => {
			cancelled = true
		}
	}, [orderId])

	useEffect(() => {
		if (!paymentExpiry) return
		
		const updateTimer = () => {
			const now = Date.now()
			const expiry = paymentExpiry.getTime()
			const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
			
			setTimer(remaining)
			
			if (remaining === 0 && paymentStatusLabel !== 'Pembayaran Berhasil') {
				setPaymentStatusLabel('Pembayaran Kedaluwarsa')
				setShowPaymentFailureModal(true)
				// Clean up localStorage when payment expires
				if (orderId) {
					localStorage.removeItem(`payment-expiry-${orderId}`)
				}
			}
		}
		
		// Update immediately
		updateTimer()
		
		// Update every second
		const interval = setInterval(updateTimer, 1000)
		
		return () => clearInterval(interval)
	}, [paymentExpiry, paymentStatusLabel, orderId])

	async function handleCancel() {
		if (!orderId || cancelling) return
		try {
			setCancelling(true)
			await orderService.cancelOrder(orderId)
			// Clean up localStorage when order is canceled
			localStorage.removeItem(`payment-expiry-${orderId}`)
			setShowCancelModal(false)
			setShowSuccessModal(true)
		} catch (err: any) {
			setError(err?.message || 'Gagal membatalkan pesanan')
			setShowCancelModal(false)
		} finally {
			setCancelling(false)
		}
	}

	const statusLabel = (status?: string) => {
		switch (status?.toLowerCase()) {
			case 'menunggu_pembayaran':
				return 'Menunggu Pembayaran'
			case 'diproses':
				return 'Diproses'
			case 'dikirim':
				return 'Dikirim'
			case 'selesai':
				return 'Selesai'
			case 'batal':
				return 'Dibatalkan'
			default:
				return status || '—'
		}
	}

	const statusColor = (status?: string) => {
		switch (status?.toLowerCase()) {
			case 'menunggu_pembayaran':
				return 'text-amber-600'
			case 'diproses':
				return 'text-blue-600'
			case 'dikirim':
				return 'text-purple-600'
			case 'selesai':
				return 'text-emerald-600'
			case 'batal':
				return 'text-red-600'
			default:
				return 'text-neutral-600'
		}
	}

	const items = order?.order_product || []
	const subtotal = order?.subtotal || 0
	const total = order?.total || 0
	const paymentMethod = order?.payment_method === 'cod' ? 'COD' : order?.payment_method === 'qris' ? 'QRIS' : '—'

	const canCancel = order?.status?.toLowerCase() === 'menunggu_pembayaran'

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-4xl min-h-screen">
				<div className="mb-6 flex items-start justify-between">
					<div>
						<div className="flex items-center gap-2">
							<button className="text-neutral-600 hover:text-neutral-800" onClick={() => navigate('/orders')} aria-label="Kembali">
								<ArrowLongLeftIcon className="w-6 h-6" />
							</button>
							<h1 className="text-2xl font-semibold text-black">Detail Pesanan</h1>
						</div>
						<p className="text-sm text-neutral-600">Lihat status dan rincian pesanan Anda</p>
					</div>
					<div className="text-right">
						<div className="mb-1 text-sm text-neutral-700">
							ID Pesanan: <span className="font-medium">#{order?.id || orderId}</span>
						</div>
						<div className={`text-sm font-semibold ${statusColor(order?.status)}`}>
							{statusLabel(order?.status)}
						</div>
					</div>
				</div>

				{loading && <p className="text-sm text-neutral-500">Memuat detail pesanan...</p>}
				{error && <p className="mb-4 text-sm text-red-600">{error}</p>}

				{order && (
					<div className="space-y-4">
						{/* Alamat Pengiriman */}
						<Card>
							<div className="mb-3 text-base font-semibold text-neutral-900">Alamat Pengiriman</div>
							<div className="space-y-1 text-sm text-neutral-700">
								{order.send_address ? (
									<>
										<div className="font-medium text-neutral-800">
											{order.send_address.split('(')[0]?.trim() || 'Penerima'}
										</div>
										<div>
											{order.send_address.includes('-') 
												? order.send_address.split('-')[1]?.trim() 
												: order.send_address}
										</div>
										{order.send_address.includes('(') && (
											<div>
												Telepon: {order.send_address.match(/\((.*?)\)/)?.[1] || '—'}
											</div>
										)}
									</>
								) : (
									<div className="text-neutral-500">Alamat tidak tersedia</div>
								)}
							</div>
						</Card>

						{/* Ringkasan Pesanan */}
						<Card>
							<div className="mb-4 text-base font-semibold text-neutral-900">Ringkasan Pesanan</div>
							<div className="space-y-4">
								{items.map((item: any, idx: number) => {
									const variant = item.product_variant
									const imageUrl = variant?.product_image?.find((img: any) => img.is_thumbnail)?.image_url || variant?.product_image?.[0]?.image_url
									const productName = item.name || variant?.variant_name || 'Produk'
									const price = Number(item.price) || 0
									const quantity = Number(item.quantity) || 1
									const lineTotal = price * quantity

									// Extract variant details if available
									const variantInfo = item.name?.split(' - ')[1] || variant?.variant_name || ''

									return (
										<div key={idx} className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
											<div className="flex items-start gap-3">
											<div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-neutral-100 border border-neutral-200 text-[10px] text-neutral-500">
												{imageUrl ? (
													<img src={imageUrl} alt={productName.split(' - ')[0]} className="h-full w-full object-cover" />
												) : (
													'Produk'
												)}
											</div>
											<div className="text-sm">
												<div className="mb-1 font-medium text-neutral-800 leading-snug">
													{productName.split(' - ')[0]}
												</div>
												{variantInfo && (
													<div className="text-xs text-neutral-600">Varian: {variantInfo}</div>
												)}
												<div className="mt-1 text-xs text-neutral-600">x{quantity}</div>
												</div>
											</div>
											<div className="text-sm font-medium text-neutral-800 whitespace-nowrap">
												{formatIDR(lineTotal)}
											</div>
										</div>
									)
								})}

								<div className="space-y-2 pt-3 border-t border-neutral-200">
									<div className="flex items-center justify-between text-sm">
										<span className="text-neutral-700">Subtotal</span>
										<span className="font-medium text-neutral-900">{formatIDR(subtotal)}</span>
									</div>
									<div className="flex items-center justify-between pt-2 border-t border-neutral-200">
										<span className="font-semibold text-neutral-900">Total</span>
										<span className="text-lg font-bold text-neutral-900">
											{total > 0 ? formatIDR(total) : '—'}
										</span>
									</div>
									<div className="flex items-center justify-between pt-2 text-sm">
										<span className="text-neutral-700">Metode Pembayaran</span>
										<span className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2 py-0.5 text-xs font-medium">
											{paymentMethod}
										</span>
									</div>
								</div>
							</div>
						</Card>

						{/* QRIS Payment Section */}
						{order.payment_method === 'qris' && order.status?.toLowerCase() === 'menunggu_pembayaran' && qrUrl && (
							<Card className="p-0">
								<div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
									<div className="text-sm font-semibold text-neutral-900">Pembayaran QRIS</div>
									<div className="text-xs font-semibold text-amber-600">{paymentStatusLabel}</div>
								</div>
								<div className="px-4 py-4">
									<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 p-6">
										<div className="mb-3 h-48 w-48 rounded-md bg-neutral-100 p-2">
											<img src={qrUrl} alt="QR Code" className="h-full w-full object-contain" />
										</div>
										<div className="mb-2 text-lg font-bold tracking-wider text-neutral-900">
											{String(Math.floor(timer / 3600)).padStart(2, '0')}:
											{String(Math.floor((timer % 3600) / 60)).padStart(2, '0')}:
											{String(timer % 60).padStart(2, '0')}
										</div>
										<div className="text-center text-xs text-neutral-600">
											Pindai kode QR di atas menggunakan m-banking atau e-wallet Anda. Status pesanan akan berubah otomatis setelah pembayaran terkonfirmasi.
										</div>
									</div>
								</div>
							</Card>
						)}

						{/* Catatan */}
						{order.payment_method === 'cod' && (
							<Card className="bg-amber-50 border-amber-200">
								<div className="text-sm font-medium text-amber-900 mb-2">Catatan:</div>
								<div className="text-xs text-amber-800 leading-relaxed">
									Admin akan menambahkan biaya ongkos kirim terbaru sebelum pesanan dikirim. Jangan lupa siapkan uang tunai saat barang diterima, ya!
								</div>
							</Card>
						)}

						{/* Cancel Button */}
						{canCancel && (
							<div className="pt-2">
								<Button
									fullWidth
									variant="light"
									className="border-red-500 text-red-600 hover:bg-red-50 active:bg-red-100"
								onClick={() => setShowCancelModal(true)}
								disabled={cancelling}
							>
								Batalkan Pesanan
								</Button>
							</div>
						)}
					</div>
				)}
			</div>

			<PopupModal
				open={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				icon="warning"
				title="Batalkan Pesanan?"
				description="Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
				primaryButton={{
					label: cancelling ? 'Membatalkan...' : 'Ya, Batalkan',
					variant: 'filled',
					onClick: handleCancel,
				}}
				secondaryButton={{
					label: 'Tidak, Kembali',
					variant: 'outlined',
					onClick: () => setShowCancelModal(false),
				}}
			/>

			<PopupModal
				open={showSuccessModal}
				onClose={() => {
					setShowSuccessModal(false)
					navigate('/orders')
				}}
				icon="success"
				title="Pesanan Berhasil Dibatalkan"
				description="Pesanan Anda berhasil dibatalkan"
				primaryButton={{
					label: 'Kembali ke Pesanan',
					variant: 'filled',
					onClick: () => {
						setShowSuccessModal(false)
						navigate('/orders')
					},
				}}
			/>

			<PopupModal
				open={showPaymentSuccessModal}
				onClose={() => {
					setShowPaymentSuccessModal(false)
					window.location.reload()
				}}
				icon="success"
				title="Pembayaran Berhasil!"
				description="Pesanan Anda sedang diproses. Halaman akan dimuat ulang untuk menampilkan status terbaru."
				primaryButton={{
					label: 'Muat Ulang',
					variant: 'filled',
					onClick: () => {
						setShowPaymentSuccessModal(false)
						window.location.reload()
					},
				}}
			/>

			<PopupModal
				open={showPaymentFailureModal}
				onClose={() => {
					setShowPaymentFailureModal(false)
					navigate('/orders')
				}}
				icon="error"
				title="Pembayaran Gagal"
				description="Waktu pembayaran telah habis. Silakan buat pesanan baru untuk melanjutkan."
				primaryButton={{
					label: 'Kembali ke Pesanan',
					variant: 'filled',
					onClick: () => {
						setShowPaymentFailureModal(false)
						navigate('/orders')
					},
				}}
			/>
		</CustomerLayout>
	)
}

export default OrderDetailPage
