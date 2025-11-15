import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import CustomerHeader from '../../components/ui/CustomerHeader'
import ProductCategory, { type CategoryItem } from '../../components/ui/ProductCategory'
import { useState, useMemo, useEffect } from 'react'
import { getAllProduct, type Product } from '../../services/product.service'
import { getAllCategories } from '../../services/category.service'
import { useAuthStore } from '../../store/auth.store'

const HomePage = () => {
	const [category, setCategory] = useState<string>('all')
	const [products, setProducts] = useState<Product[]>([])
	const [categories, setCategories] = useState<CategoryItem[]>([{ key: 'all', label: 'Semua Produk', icon: 'all' }])
	const [loadingProducts, setLoadingProducts] = useState(false)
	const [loadingCategories, setLoadingCategories] = useState(false)
	const [errorProducts, setErrorProducts] = useState<string | null>(null)
	const [errorCategories, setErrorCategories] = useState<string | null>(null)
	const { isAuthenticated, token } = useAuthStore()

	useEffect(() => {
		async function fetchProducts() {
			setLoadingProducts(true)
			setErrorProducts(null)
			try {
				const res = await getAllProduct()
				setProducts(res.data || [])
			} catch (err: any) {
				setErrorProducts(err.message || 'Gagal memuat produk')
			} finally {
				setLoadingProducts(false)
			}
		}
		fetchProducts()
	}, [])

	useEffect(() => {
		// categories require auth; only attempt when authenticated
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
		if (category === 'all') return products
		return products.filter(p => p.category_id === category)
	}, [category, products])

	return (
		<MainLayout headerComponent={<CustomerHeader />} headerFixed={true}>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-[250px_1fr]">
					{/* Category Sidebar */}
					<div>
						<ProductCategory
							categories={categories}
							value={category}
							onChange={setCategory}
						/>
						{loadingCategories && <p className="mt-2 text-xs text-neutral-500">Memuat kategori...</p>}
						{errorCategories && <p className="mt-2 text-xs text-red-600">{errorCategories}</p>}
					</div>
					{/* Products Section */}
					<div className="space-y-6">
						<div>
							<h2 className="text-xl font-semibold">Produk Terbaru</h2>
							<p className="mt-1 text-sm text-neutral-600">Temukan gadget impian Anda dengan harga terbaik</p>
						</div>
						{loadingProducts && <p className="text-sm text-neutral-500">Memuat produk...</p>}
						{errorProducts && <p className="text-sm text-red-600">{errorProducts}</p>}
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{filtered.map(product => (
								<Card key={product.id} className="p-0 overflow-hidden">
									<div className="h-32 w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs">
										{/* No image in schema; placeholder with name initial */}
										<span>{product.name.slice(0, 16)}</span>
									</div>
									<div className="space-y-1 p-3">
										<h3 className="text-xs font-medium text-neutral-700 line-clamp-2 min-h-[2.2rem]">{product.name}</h3>
										<p className="text-[11px] text-neutral-500 line-clamp-2 min-h-[2.2rem]">{product.description}</p>
									</div>
								</Card>
							))}
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	)
}

export default HomePage

