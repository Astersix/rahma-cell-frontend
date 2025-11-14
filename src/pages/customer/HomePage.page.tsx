import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import CustomerHeader from '../../components/ui/CustomerHeader'
import ProductCategory from '../../components/ui/ProductCategory'
import { useState, useMemo } from 'react'

interface ProductCardData {
	id: string
	title: string
	variant: string
	price: string
	category: string
	image?: string
}

const products: ProductCardData[] = [
	{
		id: 'iphone15pm',
		title: 'iPhone 15 Pro Max 256GB',
		variant: 'iPhone 15 Pro Max',
		price: 'Rp 18.999.000',
		category: 'smartphone',
		image: 'https://images.unsplash.com/photo-1603899122299-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop'
	},
	{
		id: 's24ultra',
		title: 'Samsung Galaxy S24 Ultra',
		variant: 'Samsung Galaxy S24',
		price: 'Rp 16.499.000',
		category: 'smartphone',
		image: 'https://images.unsplash.com/photo-1610945265361-9050b0323d19?q=80&w=800&auto=format&fit=crop'
	},
	{
		id: 'chargerfast',
		title: 'Charger Fast Charging 65W',
		variant: 'Charger Fast Charging',
		price: 'Rp 149.000',
		category: 'charger',
		image: 'https://images.unsplash.com/photo-1603565816033-2f28a27419b1?q=80&w=800&auto=format&fit=crop'
	},
	{
		id: 'casepremium1',
		title: 'Case iPhone Pro Max',
		variant: 'Case iPhone Premium',
		price: 'Rp 89.000',
		category: 'accessories'
	},
	{
		id: 'casepremium2',
		title: 'Case iPhone Pro Max',
		variant: 'Case iPhone Premium',
		price: 'Rp 89.000',
		category: 'accessories'
	},
	{
		id: 'chargerfast2',
		title: 'Charger Fast Charging 65W',
		variant: 'Charger Fast Charging',
		price: 'Rp 149.000',
		category: 'charger'
	},
	{
		id: 'iphone15pm2',
		title: 'iPhone 15 Pro Max 256GB',
		variant: 'iPhone 15 Pro Max',
		price: 'Rp 18.999.000',
		category: 'smartphone'
	},
	{
		id: 's24ultra2',
		title: 'Samsung Galaxy S24 Ultra',
		variant: 'Samsung Galaxy S24',
		price: 'Rp 16.499.000',
		category: 'smartphone'
	},
	{
		id: 'chargerfast3',
		title: 'Charger Fast Charging 65W',
		variant: 'Charger Fast Charging',
		price: 'Rp 149.000',
		category: 'charger'
	},
	{
		id: 'casepremium3',
		title: 'Case iPhone Pro Max',
		variant: 'Case iPhone Premium',
		price: 'Rp 89.000',
		category: 'accessories'
	},
	{
		id: 'casepremium4',
		title: 'Case iPhone Pro Max',
		variant: 'Case iPhone Premium',
		price: 'Rp 89.000',
		category: 'accessories'
	}
]

const HomePage = () => {
	const [category, setCategory] = useState<string>('all')

	const filtered = useMemo(() => {
		if (category === 'all') return products
		return products.filter(p => p.category === category)
	}, [category])

	return (
		<MainLayout
			headerComponent={<CustomerHeader />}
			headerFixed={true}
		>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-8 md:grid-cols-[250px_1fr]">
					{/* Category Sidebar */}
					<div>
						<ProductCategory value={category} onChange={setCategory} />
					</div>
					{/* Products Section */}
					<div className="space-y-6">
						<div>
							<h2 className="text-xl font-semibold">Produk Terbaru</h2>
							<p className="mt-1 text-sm text-neutral-600">Temukan gadget impian Anda dengan harga terbaik</p>
						</div>
						<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{filtered.map(product => (
								<Card key={product.id} className="p-0 overflow-hidden">
									<div className="h-32 w-full bg-neutral-100">
										{product.image ? (
											<img
												src={product.image}
												alt={product.title}
												className="h-full w-full object-cover"
												loading="lazy"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
												{product.variant}
											</div>
										)}
									</div>
									<div className="space-y-1 p-3">
										<h3 className="text-xs font-medium text-neutral-700 line-clamp-2 min-h-[2.2rem]">{product.title}</h3>
										<p className="text-xs text-neutral-500">{product.price}</p>
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

