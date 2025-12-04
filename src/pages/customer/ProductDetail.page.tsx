import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import { getProductById, getVariantsByProductId, type Product, type ProductVariant } from '../../services/product.service'
import { addItemToCart, getCartByUserId } from '../../services/cart.service'
import { getMyProfile } from '../../services/user.service'
import { useAuthStore } from '../../store/auth.store'

const PlaceholderImage = () => (
	<div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
		Main Product Image
	</div>
)

const ProductDetailPage = () => {
	const { id } = useParams<{ id: string }>()
	const [product, setProduct] = useState<Product | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [variants, setVariants] = useState<ProductVariant[]>([])
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)
	const [qty, setQty] = useState<number>(1)
	const token = useAuthStore(s => s.token || undefined)
	const [actionMsg, setActionMsg] = useState<string | null>(null)

	useEffect(() => {
		if (!id) return
		let canceled = false
		async function run() {
			setLoading(true)
			setError(null)
			try {
				const [pres, vres] = await Promise.all([
					getProductById(id as string),
					getVariantsByProductId(id as string),
				])
				if (canceled) return
				const p = pres.data
				setProduct(p)
				const vs = vres.data || []
				setVariants(vs)
				const first = vs[0]
				const firstThumb = first?.product_image?.find((img) => img.is_thumbnail)?.image_url || first?.product_image?.[0]?.image_url || null
				setSelectedVariantId(first?.id || null)
				setSelectedImageUrl(firstThumb || null)
				setQty(1)
			} catch (err: any) {
				if (!canceled) setError(err?.message || 'Gagal memuat detail produk')
			} finally {
				if (!canceled) setLoading(false)
			}
		}
		run()
		return () => {
			canceled = true
		}
	}, [id])

	const selectedVariant = useMemo(() => variants.find(v => String(v.id) === String(selectedVariantId)) || null, [variants, selectedVariantId])
	const priceText = useMemo(() => {
		if (!selectedVariant || typeof selectedVariant.price !== 'number') return 'Rp —'
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(selectedVariant.price)
	}, [selectedVariant])
	const stock = selectedVariant?.stock ?? 0
	const inStock = (stock || 0) > 0

	function handleChooseVariant(vid: string) {
		setSelectedVariantId(vid)
		const v = variants.find(x => String(x.id) === String(vid))
		const thumb = v?.product_image?.find((img) => img.is_thumbnail)?.image_url || v?.product_image?.[0]?.image_url || null
		setSelectedImageUrl(thumb || null)
		setQty(1)
	}

	function inc() {
		setQty((q) => {
			const s = Number(stock || 0)
			if (!s) return Math.max(1, q + 1)
			return Math.min(s, q + 1)
		})
	}
	function dec() {
		setQty((q) => Math.max(1, q - 1))
	}

	async function doAddToCart() {
		if (!product || !selectedVariant) return
		if (!token) {
			setActionMsg('Silakan login untuk menambahkan ke keranjang')
			setTimeout(() => setActionMsg(null), 1500)
			return
		}
		try {
			const me = await getMyProfile(token)
			const userId = me.id
			await getCartByUserId(userId, token)
			await addItemToCart(userId, { product_variant_id: String(selectedVariant.id), quantity: qty }, token)
			await getCartByUserId(userId, token)
			setActionMsg('Ditambahkan ke keranjang')
		} catch (err: any) {
			setActionMsg(err?.message || 'Gagal menambahkan ke keranjang')
		} finally {
			setTimeout(() => setActionMsg(null), 1500)
		}
	}

	function doBuyNow() {
		doAddToCart()
		setActionMsg('Produk ditambahkan. Lanjutkan ke keranjang untuk checkout.')
		setTimeout(() => setActionMsg(null), 2000)
	}

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<nav className="mb-4 text-xs text-neutral-500">
					<button
						type="button"
						onClick={() => window.history.back()}
						className="text-neutral-600 hover:underline"
					>
						Beranda
					</button>
					<span className="mx-2">/</span>
					<span className="text-neutral-800">{product?.name ?? 'Memuat...'}</span>
				</nav>

				{loading && <p className="text-sm text-neutral-500">Memuat detail produk...</p>}
				{error && <p className="text-sm text-red-600">{error}</p>}

				{product && (
					<div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
						<div>
							<Card className="h-[360px]">
								{selectedImageUrl ? (
									<img src={selectedImageUrl} alt={product.name} className="h-full w-full rounded-lg object-contain" />
								) : (
									<PlaceholderImage />
								)}
							</Card>
							<div className="mt-3 grid grid-cols-5 gap-3">
								{(selectedVariant?.product_image || []).map((img, idx) => (
									<button
										key={img.id || idx}
										className={`rounded-md ${selectedImageUrl === img.image_url ? 'ring-1 ring-red-500' : ''}`}
										onClick={() => setSelectedImageUrl(img.image_url)}
									>
										<div className="h-16 w-full overflow-hidden rounded-md bg-neutral-100">
											<img src={img.image_url} alt={`img-${idx}`} className="h-full w-full object-cover" />
										</div>
									</button>
								))}
								{(!selectedVariant || !selectedVariant.product_image || selectedVariant.product_image.length === 0) && (
									Array.from({ length: 5 }).map((_, idx) => (
										<Card key={idx} className={idx === 0 ? 'ring-1 ring-red-500' : ''}>
											<div className="h-16 w-full rounded-md bg-neutral-100 text-center text-[11px] leading-16 text-neutral-400">Image {idx + 1}</div>
										</Card>
									))
								)}
							</div>
						</div>

						<div>
							<h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
							<p className="mt-2 max-w-xl text-sm text-neutral-600">{product.description || 'Tidak ada deskripsi.'}</p>

							<div className="my-4 h-px bg-neutral-200" />

							<div className="mb-4 flex items-end gap-3">
								<div className="text-2xl font-semibold text-neutral-900">{priceText}</div>
							</div>

							<div className="space-y-3">
								<div>
									<div className="mb-2 text-sm font-medium text-neutral-800">Pilih Varian</div>
									<div className="flex flex-wrap gap-2">
										{variants.length === 0 && <span className="text-sm text-neutral-500">—</span>}
										{variants.map((v) => (
											<button
												key={v.id}
												className={`rounded-md border px-4 py-1.5 text-sm ${String(selectedVariantId) === String(v.id) ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'}`}
												onClick={() => handleChooseVariant(String(v.id))}
											>
												{v.variant_name || 'Varian'}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="my-4 h-px bg-neutral-200" />

							<div className="mb-4 flex items-center gap-3 text-sm text-neutral-700">
								<span className={`inline-flex h-2 w-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
								<span>{inStock ? `Stok tersedia (${stock}) - Siap untuk dikirim` : 'Stok habis'}</span>
							</div>

							<div className="flex items-center gap-3">
								<button
									disabled={!selectedVariant}
									onClick={doAddToCart}
									className={`flex-1 rounded-md px-4 py-2 text-sm font-medium text-white ${selectedVariant ? 'bg-red-500 hover:bg-red-600' : 'bg-neutral-400 cursor-not-allowed'}`}
								>
									Masukkan keranjang
								</button>
								<div className="flex items-center rounded-md border border-neutral-300">
									<button className="px-3 py-2 text-neutral-700" onClick={dec}>-</button>
									  <div className="px-3 py-2 text-neutral-800 min-w-8 text-center">{qty}</div>
									<button className="px-3 py-2 text-neutral-700" onClick={inc}>+</button>
								</div>
							</div>

							<button
								disabled={!selectedVariant}
								onClick={doBuyNow}
								className={`mt-3 w-full rounded-md border px-4 py-2 text-sm font-medium ${selectedVariant ? 'border-red-400 text-red-600 hover:bg-red-50' : 'border-neutral-300 text-neutral-400 cursor-not-allowed'}`}
							>
								Beli Sekarang
							</button>

							{actionMsg && (
								<div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{actionMsg}</div>
							)}

							<div className="my-6">
								<Card>
									<div className="text-sm font-medium text-neutral-800">Deskripsi Produk</div>
									<p className="mt-2 text-sm text-neutral-600">{product.description || '—'}</p>
								</Card>
							</div>
						</div>
					</div>
				)}
			</div>
		</CustomerLayout>
	)
}

export default ProductDetailPage

