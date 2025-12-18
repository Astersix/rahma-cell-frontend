import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import ButtonIcon from '../../components/ui/ButtonIcon'
import ProductCategory, { type CategoryItem } from '../../components/ui/ProductCategory'
import { useState, useMemo, useEffect } from 'react'
import { getAllProduct, getVariantsByProductId, type Product, type ProductVariant } from '../../services/product.service'
import { getAllCategories } from '../../services/category.service'
import { useAuthStore } from '../../store/auth.store'
import { Link, useSearchParams } from 'react-router-dom'

const PAGE_SIZE = 20

const HomePage = () => {
	const [searchParams] = useSearchParams()
	const searchQuery = searchParams.get('search') || ''
	const [category, setCategory] = useState<string>('all')
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<CategoryItem[]>([{ key: 'all', label: 'Semua Produk', icon: 'all' }])
	const [loadingProducts, setLoadingProducts] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [errorProducts, setErrorProducts] = useState<string | null>(null)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)
	const [page, setPage] = useState<number>(1)
	const [hasNext, setHasNext] = useState<boolean>(false)
	const [totalPages, setTotalPages] = useState<number>(1)
	const { isAuthenticated, token } = useAuthStore()

	useEffect(() => {
		async function fetchProducts() {
			setLoadingProducts(true)
			setErrorProducts(null)
			try {
				const params: Record<string, unknown> = { page, limit: PAGE_SIZE }
				if (category !== 'all') {
					params.category_id = category
				}
				const res: any = await getAllProduct(params, token || undefined)
				const list = (res.data || []).map((p: any) => ({
					...p,
					id: String(p.id ?? p.product_id ?? p.productId ?? p.ulid ?? p.uid ?? ''),
					category_id: String(p.category_id ?? p.categoryId ?? ''),
				}))

				// Determine if there is next page using meta if available
				const meta = res?.meta
				if (meta) {
					const current = Number(meta.page || meta.currentPage || page)
					const last = Number(meta.lastPage || meta.last || current)
					setHasNext(current < last)
					setTotalPages(Math.max(1, last))

				} else {
					// Fallback when meta is not provided
					setHasNext((list?.length ?? 0) === PAGE_SIZE)
					setTotalPages(page + ((list?.length ?? 0) === PAGE_SIZE ? 1 : 0))
				}

				const withThumb = await Promise.all(list.map(async (p: any) => {
					try {
						const vres = await getVariantsByProductId(String(p.id), token || undefined)
						const variants: ProductVariant[] = vres.data || []
						let thumb: string | undefined
						for (const v of variants) {
							if (Array.isArray(v.product_image) && v.product_image.length) {
								const t = v.product_image.find(img => img.is_thumbnail) || v.product_image[0]
								if (t?.image_url) { thumb = t.image_url; break }
							}
						}
						return { ...p, thumbnail_url: thumb }
					} catch {
						return { ...p }
					}
				}))
				// Cap to maximum PAGE_SIZE items displayed per page
				setProducts((withThumb as any).slice(0, PAGE_SIZE))
			} catch (err: any) {
				setErrorProducts(err.message || 'Gagal memuat produk')
			} finally {
				setLoadingProducts(false)
			}
		}
		fetchProducts()
	}, [page, category, token])

	useEffect(() => {
		async function fetchCategories() {
			if (!isAuthenticated) return
			setLoadingCategories(true)
			setErrorCategories(null)
			try {
				const res = await getAllCategories(token || undefined)
				const mapped: CategoryItem[] = [
					{ key: 'all', label: 'Semua Produk', icon: 'all' },
					...(res.data || []).map(c => ({ key: c.id, label: c.name, icon: 'all' })),
				]
				setCategories(mapped)
			} catch (err: any) {
				setErrorCategories(err.message || 'Gagal memuat kategori')
			} finally {
				setLoadingCategories(false)
			}
		}
		fetchCategories()
	}, [isAuthenticated, token])

	const filtered = useMemo(() => {
		let result = products
		
		// Filter by search query (category filtering now handled by API)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase()
			result = result.filter(p => 
				p.name.toLowerCase().includes(query) ||
				p.description?.toLowerCase().includes(query)
			)
		}
		
		return result
	}, [products, searchQuery])

		return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-[250px_1fr]">
					<div>
						<ProductCategory
							categories={categories}
							value={category}
							onChange={(cat) => {
								setCategory(cat)
								setPage(1)
							}}
						/>
						{loadingCategories && <p className="mt-2 text-xs text-neutral-500">Memuat kategori...</p>}
						{errorCategories && <p className="mt-2 text-xs text-red-600">{errorCategories}</p>}
					</div>
					<div className="space-y-6">
						<div>
							<h2 className="text-xl font-semibold">
								{searchQuery ? `Hasil Pencarian "${searchQuery}"` : 'Produk Terbaru'}
							</h2>
							<p className="mt-1 text-sm text-neutral-600">
								{searchQuery 
									? `Menampilkan ${filtered.length} produk yang ditemukan` 
									: 'Temukan gadget impian Anda dengan harga terbaik'}
							</p>
						</div>
						{errorProducts && <p className="text-sm text-red-600">{errorProducts}</p>}
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{filtered.map((product: any) => {
								const pid = (product as any)?.id ?? (product as any)?._id ?? (product as any)?.product_id
								const card = (
								<Card className="p-0 overflow-hidden">
									{product.thumbnail_url ? (
										<div className="h-32 w-full overflow-hidden bg-neutral-100">
											<img src={product.thumbnail_url} alt={product.name} className="h-full w-full object-cover" />
										</div>
									) : (
										<div className="h-32 w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
											<span>{product.name.slice(0, 16)}</span>
										</div>
									)}
									<div className="space-y-1 p-3">
										<h3 className="text-xs font-medium text-neutral-700 line-clamp-2 min-h-[2.2rem]">{product.name}</h3>
										<p className="text-[11px] text-neutral-500 line-clamp-2 min-h-[2.2rem]">{product.description}</p>
										{/* pricetag removed */}
									</div>
								</Card>
								)
								return pid ? (
									<Link to={`/product/${encodeURIComponent(String(pid))}`} key={String(pid)} className="block">
										{card}
									</Link>
								) : (
									<div key={`no-id-${product.name}`}>
										{card}
									</div>
								)
							})}
						</div>
						<div className="flex items-center justify-end px-1 sm:px-0 py-3 text-xs text-neutral-600">
							<div className="flex items-center gap-1">
							<ButtonIcon
								aria-label="Prev"
								icon="arrow-left"
								size="sm"
								variant="light"
								className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50"
								onClick={() => setPage(p => Math.max(1, p - 1))}
								disabled={page === 1 || loadingProducts}
							/>
								{[page - 1, page, page + 1]
									.filter(pnum => pnum >= 1 && pnum <= totalPages)
									.map((pnum) => {
										const active = pnum === page
										return (
											<button
												key={pnum}
												onClick={() => setPage(pnum)}
												className={active
													? 'h-8 w-8 rounded-md bg-black text-white'
													: 'h-8 w-8 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'}
												disabled={loadingProducts}
											>
												{pnum}
											</button>
										)
									})}
							<ButtonIcon
								aria-label="Next"
								icon="arrow-right"
								size="sm"
								variant="light"
								className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50"
								onClick={() => setPage(p => p + 1)}
									disabled={!hasNext || loadingProducts}
							/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</CustomerLayout>
	)
}

export default HomePage

