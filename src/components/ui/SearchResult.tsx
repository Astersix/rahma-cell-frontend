import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProduct, getVariantsByProductId, type Product, type ProductVariant } from '../../services/product.service'

interface SearchResultProps {
	query: string
	onClose: () => void
	variant?: 'light' | 'dark'
	onNavigate?: () => void
}

interface ProductWithThumbnail extends Product {
	thumbnail_url?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const SearchResult = ({ query, onClose, variant = 'light', onNavigate }: SearchResultProps) => {
	const navigate = useNavigate()
	const [results, setResults] = useState<ProductWithThumbnail[]>([])
	const [loading, setLoading] = useState(false)
	const isDark = variant === 'dark'

	useEffect(() => {
		if (!query || query.length < 2) {
			setResults([])
			return
		}

		let cancelled = false
		const timer = setTimeout(async () => {
			setLoading(true)
			try {
				const res = await getAllProduct({ page: 1, limit: 10, search: query })
				if (cancelled) return
				
				const filtered = res.data || []

				// Fetch thumbnails for filtered products
				const withThumbs = await Promise.all(
					filtered.map(async (p) => {
						try {
							const vres = await getVariantsByProductId(String(p.id))
							const variants: ProductVariant[] = vres.data || []
							let thumb: string | undefined
							for (const v of variants) {
								if (Array.isArray(v.product_image) && v.product_image.length) {
									const t = v.product_image.find(img => img.is_thumbnail) || v.product_image[0]
									if (t?.image_url) {
										thumb = t.image_url
										break
									}
								}
							}
							return { ...p, thumbnail_url: thumb }
						} catch {
							return { ...p }
						}
					})
				)

				if (!cancelled) {
					setResults(withThumbs.slice(0, 8))
				}
			} catch {
				if (!cancelled) setResults([])
			} finally {
				if (!cancelled) setLoading(false)
			}
		}, 300)

		return () => {
			cancelled = true
			clearTimeout(timer)
		}
	}, [query])

	const handleProductClick = (productId: string) => {
		navigate(`/product/${encodeURIComponent(productId)}`)
		onNavigate?.()
		onClose()
	}

	const handleViewAll = () => {
		navigate(`/?search=${encodeURIComponent(query)}`)
		onNavigate?.()
		onClose()
	}

	if (!query || query.length < 2) return null

	return (
		<div
			className={cn(
				'absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-lg border shadow-lg z-50',
				isDark
					? 'border-neutral-700 bg-neutral-900'
					: 'border-neutral-200 bg-white'
			)}
		>
			{loading && (
				<div className={cn('px-4 py-3 text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
					Mencari produk...
				</div>
			)}

			{!loading && results.length === 0 && (
				<div className={cn('px-4 py-6 text-center text-sm', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
					<svg
						className="mx-auto mb-2 h-12 w-12 opacity-50"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={1.5}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<p>Tidak ada produk ditemukan untuk "{query}"</p>
				</div>
			)}

			{!loading && results.length > 0 && (
				<>
					<div className={cn('px-3 py-2 text-xs font-medium', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
						Hasil Pencarian ({results.length})
					</div>
					<div className="divide-y divide-neutral-200">
						{results.map((product) => (
							<button
								key={product.id}
								onClick={() => handleProductClick(String(product.id))}
								className={cn(
									'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
									isDark
										? 'hover:bg-neutral-800'
										: 'hover:bg-neutral-50'
								)}
							>
								<div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-neutral-200">
									{product.thumbnail_url ? (
										<img
											src={product.thumbnail_url}
											alt={product.name}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className={cn(
											'flex h-full w-full items-center justify-center text-xs',
											isDark ? 'bg-neutral-800 text-neutral-600' : 'bg-neutral-100 text-neutral-400'
										)}>
											<svg
												className="h-6 w-6"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</div>
									)}
								</div>
								<div className="flex-1 overflow-hidden">
									<div className={cn('truncate text-sm font-medium', isDark ? 'text-white' : 'text-neutral-900')}>
										{product.name}
									</div>
									<div className={cn('truncate text-xs', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
										{product.description || 'Tidak ada deskripsi'}
									</div>
								</div>
								<svg
									className={cn('h-5 w-5 shrink-0', isDark ? 'text-neutral-600' : 'text-neutral-400')}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						))}
					</div>
					<button
						onClick={handleViewAll}
						className={cn(
							'w-full border-t px-4 py-2.5 text-center text-sm font-medium transition-colors',
							isDark
								? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
								: 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
						)}
					>
						Lihat Semua Hasil untuk "{query}"
					</button>
				</>
			)}
		</div>
	)
}

export default SearchResult
