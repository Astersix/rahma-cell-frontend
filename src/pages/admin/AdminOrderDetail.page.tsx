import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { orderService } from '../../services/order.service'

function formatIDR(n?: number) {
	if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
	return 'Rp ' + n.toLocaleString('id-ID')
}

const AdminOrderDetailPage = () => {
	const navigate = useNavigate()
	const { orderId } = useParams<{ orderId: string }>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [order, setOrder] = useState<any | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<string>('')
	const [updating, setUpdating] = useState(false)

	const items = useMemo(() => Array.isArray(order?.order_product) ? order.order_product : [], [order])
	const subtotal = useMemo(() => items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0), [items])

	useEffect(() => {
		let mounted = true
		async function load() {
			try {
				setLoading(true)
				if (!orderId) {
					setOrder(null)
					return
				}
				const res = await orderService.getOrderById(String(orderId))
				const data = (res?.data ?? res)
				if (mounted) {
					setOrder(data || null)
					setSelectedStatus(data?.status || '')
				}
			} catch (e: any) {
				setError(e?.message || 'Gagal memuat detail pesanan')
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [orderId])

	async function handleUpdateStatus() {
		if (!orderId || !selectedStatus) return
		try {
			setUpdating(true)
			await orderService.updateOrderStatus(String(orderId), { status: selectedStatus })
			// Reload order data to reflect changes
			const res = await orderService.getOrderById(String(orderId))
			const data = (res?.data ?? res)
			setOrder(data || null)
			setSelectedStatus(data?.status || '')
			navigate('/admin/orders', { state: { refreshAfter: 'status-update' } })
		} catch (e: any) {
			setError(e?.message || 'Gagal mengubah status pesanan')
		} finally {
			setUpdating(false)
		}
	}

	const statusTone = (st?: string) => {
		const v = (st || '').toLowerCase()
		if (v === 'menunggu_pembayaran') return { label: 'Menunggu Pembayaran', cls: 'bg-orange-100 text-orange-700' }
		if (v === 'diproses') return { label: 'Diproses', cls: 'bg-orange-100 text-orange-700' }
		if (v === 'dikirim') return { label: 'Dikirim', cls: 'bg-blue-100 text-blue-700' }
		if (v === 'selesai') return { label: 'Selesai', cls: 'bg-emerald-100 text-emerald-700' }
		if (v === 'dibatalkan') return { label: 'Dibatalkan', cls: 'bg-amber-100 text-amber-700' }
		return { label: st || '-', cls: 'bg-neutral-100 text-neutral-700' }
	}

	return (
		<AdminLayout sidebarActive="orders">
			<div className="mx-auto max-w-full">
				<div className='flex'>
					<div>
						<div className="mb-4 flex items-center gap-2">
						<button onClick={() => navigate(-1)} className="text-neutral-600 hover:text-neutral-800" aria-label="Kembali">←</button>
						<h1 className="text-2xl font-semibold text-black">Detail Pesanan</h1>
					</div>
					<p className="mb-6 text-sm text-neutral-600">Lihat dan ubah status pesanan pelanggan.</p>
					</div>
					<div className='justify-right ml-auto	'>
						{/* Status badge (top right style per reference) */}
						<div className="mb-4">
							{(() => {
								const t = statusTone(order?.status)
								return <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${t.cls}`}>{t.label}</span>
							})()}
						</div>
					</div>
				</div>
				<div className="mb-3 text-xs text-neutral-600">ID Pesanan: <span className="font-semibold text-neutral-900">#{order?.id || orderId}</span></div>

				<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
					{/* Left column: Customer info + products table */}
					<div className="space-y-6">
						<Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Informasi Pelanggan</div>
							<div className="px-4 pb-4 text-xs text-neutral-700">
								<div className="font-medium text-neutral-800">{order?.user?.name || order?.user_name}</div>
								<div className="mt-1">{order?.send_address || '-'}</div>
							</div>
						</Card>

						<Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Detail Produk Pesanan</div>
							<div className="px-4 pb-3">
								<div className="overflow-hidden rounded-md border border-neutral-200">
									<table className="w-full text-left text-xs">
										<thead className="bg-neutral-50 text-neutral-600">
											<tr>
												<th className="px-3 py-2">Gambar</th>
												<th className="px-3 py-2">Nama Produk</th>
												<th className="px-3 py-2">Varian</th>
												<th className="px-3 py-2">Qty</th>
												<th className="px-3 py-2">Harga Satuan</th>
												<th className="px-3 py-2">Subtotal</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-neutral-200 text-neutral-800">
											{items.map((it: any, idx: number) => {
												const variant = it?.product_variant
												const images = variant?.product_image || []
												const thumbnail = images.find((img: any) => img.is_thumbnail) || images[0]
												const imageUrl = thumbnail?.image_url
												return (
													<tr key={idx}>
														<td className="px-3 py-2">
															{imageUrl ? (
																<div className="h-8 w-8 overflow-hidden rounded-md bg-neutral-100">
																	<img src={imageUrl} alt={it?.name || '-'} className="h-full w-full object-cover" />
																</div>
															) : (
																<div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">IMG</div>
															)}
														</td>
														<td className="px-3 py-2">{it?.name || '-'}</td>
														<td className="px-3 py-2">{variant?.variant_name || '-'}</td>
														<td className="px-3 py-2">x{Number(it?.quantity) || 0}</td>
														<td className="px-3 py-2">{formatIDR(Number(it?.price) || 0)}</td>
														<td className="px-3 py-2">{formatIDR((Number(it?.price) || 0) * (Number(it?.quantity) || 0))}</td>
													</tr>
												)
											})}
										</tbody>
									</table>
								</div>
							</div>
						</Card>
					</div>

					{/* Right column: Payment info + status change + admin notes (static actions) */}
					<div className="space-y-6">
						{/* <Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Informasi Pembayaran</div>
							<div className="px-4 pb-4 text-xs text-neutral-700">
								<div className="mb-2">Metode Pembayaran: <span className="font-semibold">{(order?.payment_method || 'qris').toUpperCase()}</span></div>
								<div className="mb-2">Subtotal: <span className="font-semibold">{formatIDR(Number(order?.subtotal) || subtotal)}</span></div>
								<div className="mb-2">Ongkos Kirim</div>
								<input type="number" className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs" placeholder="25000" />
								<Button fullWidth className="bg-red-600 hover:bg-red-700 active:bg-red-800" onClick={() => navigate('/admin/orders', { state: { refreshAfter: 'shipping-fee' } })}>Simpan ongkos kirim</Button>
								<div className="mt-3">Total: <span className="font-semibold">{formatIDR(Number(order?.total) || subtotal)}</span></div>
							</div>
						</Card> */}

						<Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Status Pesanan</div>
							<div className="px-4 pb-4 text-xs text-neutral-700">
								<div className="mb-2">Ubah Status</div>
								<select 
									className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs"
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value)}
									disabled={updating}
								>
									<option value="menunggu_pembayaran">Menunggu Pembayaran</option>
									<option value="diproses">Diproses</option>
									<option value="dikirim">Dikirim</option>
									<option value="selesai">Selesai</option>
									<option value="dibatalkan">Dibatalkan</option>
								</select>
								<Button 
									fullWidth 
									className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50" 
									onClick={handleUpdateStatus}
									disabled={updating || !selectedStatus || selectedStatus === order?.status}
								>
									{updating ? 'Menyimpan...' : 'Simpan status'}
								</Button>
							</div>
						</Card>

						{/* <Card className="p-0">
							<div className="px-4 py-3 text-sm font-semibold text-neutral-900">Catatan Admin</div>
							<div className="px-4 pb-4 text-xs text-neutral-700">
								<textarea className="mb-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs" placeholder="Tambahkan catatan pengiriman atau info ongkos kirim" rows={3} />
								<Button fullWidth className="bg-red-600 hover:bg-red-700 active:bg-red-800" onClick={() => navigate('/admin/orders', { state: { refreshAfter: 'admin-note' } })}>Simpan catatan</Button>
							</div>
						</Card> */}
					</div>
				</div>
			</div>
		</AdminLayout>
	)
}

export default AdminOrderDetailPage
