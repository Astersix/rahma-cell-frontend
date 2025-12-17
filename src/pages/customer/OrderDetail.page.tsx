import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PopupModal from '../../components/ui/PopupModal'
import { orderService } from '../../services/order.service'

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

	useEffect(() => {
		if (!orderId) return
		let cancelled = false
		async function fetchOrder() {
			try {
				setLoading(true)
				setError(null)
				const res = await orderService.getOrderById(orderId!)
				if (cancelled) return
				setOrder(res?.data || res)
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

	async function handleCancel() {
		if (!orderId || cancelling) return
		try {
			setCancelling(true)
			await orderService.cancelOrder(orderId)
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
	const deliveryFee = order?.delivery_fee || 0
	const total = order?.total || 0
	const paymentMethod = order?.payment_method === 'cod' ? 'COD' : order?.payment_method === 'qris' ? 'QRIS' : '—'

	const canCancel = ['menunggu_pembayaran', 'diproses'].includes(order?.status?.toLowerCase() || '')

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-4xl">
				<div className="mb-6 flex items-start justify-between">
					<div>
						<div className="mb-2 flex items-center gap-2">
							<button
								type="button"
								onClick={() => navigate('/orders')}
								className="text-neutral-600 hover:text-neutral-800"
								aria-label="Kembali"
							>
								←
							</button>
							<h1 className="text-xl font-semibold text-neutral-900">Detail Pesanan</h1>
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
												<div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-neutral-100 text-[10px] text-neutral-500">
													{imageUrl ? (
														<img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
													) : (
														'Produk'
													)}
												</div>
												<div className="text-sm">
													<div className="mb-1 font-medium text-neutral-800 leading-snug">
														{productName}
													</div>
													{variantInfo && (
														<div className="text-xs text-neutral-600">{variantInfo}</div>
													)}
													<div className="mt-1 text-xs text-neutral-600">X{quantity}</div>
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
									<div className="flex items-center justify-between text-sm">
										<span className="text-neutral-700">Ongkos Kirim</span>
										<span className="font-medium text-neutral-900">
											{deliveryFee > 0 ? formatIDR(deliveryFee) : <span className="text-amber-600 text-xs">Menunggu admin</span>}
										</span>
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
					label: 'Tidak, Kembali',
					variant: 'filled',
					onClick: () => setShowCancelModal(false),
				}}
				secondaryButton={{
					label: cancelling ? 'Membatalkan...' : 'Ya, Batalkan',
					variant: 'outlined',
					onClick: handleCancel,
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
		</CustomerLayout>
	)
}

export default OrderDetailPage
