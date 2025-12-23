import { useNavigate } from 'react-router-dom'
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import MainLayout from "../layouts/MainLayout"
import heroImg from "../assets/hero.png"
import footerImg from "../assets/footer-img.png"
import { 
	DevicePhoneMobileIcon, 
	ShieldCheckIcon, 
	BoltIcon, 
	CpuChipIcon,
	HomeIcon,
	PencilIcon,
	SpeakerWaveIcon,
	ArrowTopRightOnSquareIcon,
	ChatBubbleLeftRightIcon,
	PhoneIcon
} from '@heroicons/react/24/outline'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	'smartphone': DevicePhoneMobileIcon,
	'audio': SpeakerWaveIcon,
	'charger': BoltIcon,
	'cable': CpuChipIcon,
	'peralatan rumah tangga': HomeIcon,
	'alat tulis': PencilIcon,
}

const getIconForCategory = (categoryName: string) => {
	const normalized = categoryName.toLowerCase()
	for (const [key, Icon] of Object.entries(iconMap)) {
		if (normalized.includes(key)) {
			return Icon
		}
	}
	return DevicePhoneMobileIcon
}

// Dummy data for landing page (no authentication required)
const dummyCategories = [
	{ id: '1', name: 'Smartphone', created_at: '2024-01-01' },
	{ id: '2', name: 'Audio', created_at: '2024-01-01' },
	{ id: '3', name: 'Charger', created_at: '2024-01-01' },
	{ id: '4', name: 'Cable', created_at: '2024-01-01' },
	{ id: '5', name: 'Peralatan Rumah Tangga', created_at: '2024-01-01' },
	{ id: '6', name: 'Alat Tulis', created_at: '2024-01-01' },
]

const dummyProducts = [
	{
		id: '1',
		category_id: '1',
		name: 'iPhone 15 Pro Max',
		description: 'Latest flagship smartphone',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
		product_variant: [{
			id: '1',
			product_id: '1',
			variant_name: '256GB • Natural Titanium',
			price: 19999000,
			stock: 15,
			product_image: [{
				id: '1',
				product_variant_id: '1',
				image_url: 'https://imgs.search.brave.com/3GUyVG79yRlOwgoFFUAvAH117Phqg7E1CJ6vGjDBd8k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/YXBwbGUuY29tL25l/d3Nyb29tL2ltYWdl/cy8yMDIzLzA5L2Fw/cGxlLXVudmVpbHMt/aXBob25lLTE1LXBy/by1hbmQtaXBob25l/LTE1LXByby1tYXgv/YXJ0aWNsZS9BcHBs/ZS1pUGhvbmUtMTUt/UHJvLWxpbmV1cC1o/ZXJvLTIzMDkxMl9G/dWxsLUJsZWVkLUlt/YWdlLmpwZy5sYXJn/ZS5qcGc',
				is_thumbnail: true,
			}]
		}]
	},
	{
		id: '2',
		category_id: '1',
		name: 'Samsung Galaxy S24 Ultra',
		description: 'Premium Android flagship',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
		product_variant: [{
			id: '2',
			product_id: '2',
			variant_name: '512GB • Titanium Black',
			price: 18999000,
			stock: 12,
			product_image: [{
				id: '2',
				product_variant_id: '2',
				image_url: 'https://imgs.search.brave.com/o4B-v1o2CGflXPktpTDkJzndw9fLW2wufWFLRbccWDA/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudG9paW1nLmNv/bS90aHVtYi9yZXNp/emVtb2RlLTQsbXNp/ZC05NDQ3NDI4Nyxp/bWdzaXplLTIwMCx3/aWR0aC02MDAvOTQ0/NzQyODcuanBn',
				is_thumbnail: true,
			}]
		}]
	},
	{
		id: '3',
		category_id: '2',
		name: 'AirPods Pro 2nd Gen',
		description: 'Premium wireless earbuds',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
		product_variant: [{
			id: '3',
			product_id: '3',
			variant_name: 'USB-C • White',
			price: 3799000,
			stock: 25,
			product_image: [{
				id: '3',
				product_variant_id: '3',
				image_url: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&auto=format&fit=crop',
				is_thumbnail: true,
			}]
		}]
	},
	{
		id: '4',
		category_id: '1',
		name: 'Xiaomi 13T Pro',
		description: 'Flagship killer smartphone',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
		product_variant: [{
			id: '4',
			product_id: '4',
			variant_name: '256GB • Meadow Green',
			price: 8999000,
			stock: 18,
			product_image: [{
				id: '4',
				product_variant_id: '4',
				image_url: 'https://imgs.search.brave.com/05EI8v5o6QQ3uAcDwRkxHcWITo2agsZ8rAz3qg7b80w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NjF2MGptM2ZXMUwu/anBn',
				is_thumbnail: true,
			}]
		}]
	},
	{
		id: '5',
		category_id: '3',
		name: 'Anker PowerPort III',
		description: 'Fast charging adapter',
		created_at: '2024-01-01',
		updated_at: '2024-01-01',
		product_variant: [{
			id: '5',
			product_id: '5',
			variant_name: '65W • Black',
			price: 599000,
			stock: 30,
			product_image: [{
				id: '5',
				product_variant_id: '5',
				image_url: 'https://imgs.search.brave.com/4p-RCAwXpqHv9c34F7uzVRfavDFmD6O8hhNdyFiIvkk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/ZXZlcnl0aGluZ2Jy/YW5kZWQuY29tL3Ns/aXIvdzUwMC1oNTAw/LWMxeDEvY2F0YWxv/Zy8xOTgvNTgxLzIv/cC8zMDMwODQwMTYu/anBn',
				is_thumbnail: true,
			}]
		}]
	},
]

const LandingPage = () => {
	const navigate = useNavigate()

	const navLinks = [
		{ label: 'Produk', href: '#produk' },
		{ label: 'Kategori', href: '#kategori' },
		{ label: 'Tentang Kami', href: '#kontak' },
		{ label: 'Kontak', href: '#kontak' },
	]

	const formatPrice = (price?: number) => {
		if (!price) return 'Rp 0'
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(price)
	}

	const getProductImage = (product: typeof dummyProducts[0]) => {
		const variant = product.product_variant?.[0]
		const image = variant?.product_image?.[0]
		return image?.image_url || 'https://via.placeholder.com/300x200?text=No+Image'
	}

	const getProductPrice = (product: typeof dummyProducts[0]) => {
		return product.product_variant?.[0]?.price || 0
	}

	const handleBelanjaSekarang = () => {
		navigate('/login')
		window.scrollTo({ top: 0, behavior: 'instant' })
	}

	const handleWhatsApp = () => {
		const phoneNumber = '6281234567890'
		const message = encodeURIComponent('Halo, saya ingin berkonsultasi tentang produk Rahma Cell')
		window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
	}

	return (
		<MainLayout navbarLinks={navLinks}>
			<div className="space-y-12 pb-0">
				{/* Hero Section */}
				<section className="relative overflow-hidden rounded-2xl">
					<div className="absolute inset-0">
						<img
							src={heroImg}
							alt="Banner"
							className="h-full w-full object-cover"
							loading="eager"
						/>
						<div className="absolute inset-0" />
					</div>
					<div className="relative p-8 md:p-12 min-h-[400px] flex items-center">
						<div className="max-w-2xl text-black">
							<h1 className="text-3xl font-extrabold md:text-4xl lg:text-5xl mb-4">
								Belanja Kebutuhan
								<br />
								Sehari-hari Tanpa Ribet
							</h1>
							<p className="text-sm text-black/90 mb-6 max-w-lg">
								Temukan produk original, harga bersahabat, dan pelayanan cepat untuk setiap kebutuhan Anda.
							</p>
							<div className="flex flex-wrap gap-3 mb-4">
								<Button variant="dark" className="bg-red-500" onClick={handleBelanjaSekarang}>
									Belanja Sekarang
								</Button>
							</div>
							<div className="flex flex-wrap items-center gap-3 text-xs text-black">
								<span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-3 py-1.5">
									<ShieldCheckIcon className="w-4 h-4" />
									Garansi Resmi
								</span>
								<span className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur px-3 py-1.5">
									<PhoneIcon className="w-4 h-4" />
									Support 24 jam
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Produk Unggulan */}
			<section id="produk" className="space-y-4 scroll-mt-20">
					<div className="text-center">
						<h2 className="text-2xl font-bold">Produk Unggulan</h2>
						<p className="text-sm text-neutral-600 mt-1">Produk terlaris dan terpopuler bulan ini</p>
					</div>

					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
						{dummyProducts.map((product) => {
								const variant = product.product_variant?.[0]
								const image = getProductImage(product)
								const price = getProductPrice(product)

								return (
								<div 
									key={product.id}
								onClick={() => {
									window.scrollTo({ top: 0, behavior: 'instant' })
									navigate('/login')
								}}
									className="cursor-pointer"
								>
									<Card className="group flex flex-col gap-3 p-0 overflow-hidden hover:shadow-lg transition-shadow">
										<div className="relative overflow-hidden bg-neutral-100 aspect-square">
											<img 
												src={image} 
												alt={product.name} 
												className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
												loading="lazy" 
											/>
											<div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded">
												<ArrowTopRightOnSquareIcon className="w-3 h-3" />
											</div>
										</div>
										<div className="px-3 pb-3 flex flex-col gap-2">
											<h3 className="text-sm font-semibold line-clamp-2 min-h-10">
												{product.name}
											</h3>
											{variant?.variant_name && (
												<p className="text-xs text-neutral-600 line-clamp-1">
													{variant.variant_name}
												</p>
											)}
											<div className="mt-auto">
												<span className="text-base font-bold">
													{formatPrice(price)}
												</span>
												{variant?.stock !== undefined && (
													<p className="text-xs text-neutral-500 mt-1">
														Stok: {variant.stock}
													</p>
												)}
											</div>
										</div>
									</Card>
								</div>
							)
						})}
					</div>
				</section>

					{/* Kategori Produk Pilihan */}
			<section id="kategori" className="space-y-4 scroll-mt-20">
					<div className="text-center">
						<h2 className="text-2xl font-bold">Kategori Produk Pilihan</h2>
						<p className="text-sm text-neutral-600 mt-1">Temukan berbagai kategori produk sesuai kebutuhan Anda</p>
					</div>

					<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
						{dummyCategories.map((category) => {
								const IconComponent = getIconForCategory(category.name)
								return (
								<div
									key={category.id}
								onClick={() => {
									window.scrollTo({ top: 0, behavior: 'instant' })
									navigate('/login')
								}}
									className="cursor-pointer"
								>
									<Card className="flex flex-col items-center gap-3 p-6 transition-all hover:shadow-md hover:-translate-y-1">
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100">
											<IconComponent className="h-6 w-6 text-neutral-700" />
										</div>
										<span className="text-sm font-medium text-center">{category.name}</span>
									</Card>
								</div>
								)
							})}
						</div>

				</section>
				
				{/* Lengkapi Kebutuhan Section with Footer Image */}
			<section id="kontak" className="relative overflow-hidden rounded-2xl bg-linear-to-br from-neutral-50 to-neutral-100 -mx-4 sm:mx-0 scroll-mt-20 pb-10">
					<div className="grid md:grid-cols-2 gap-8 items-center">
						<div className="p-8 md:p-12">
							<h3 className="text-2xl font-bold md:text-3xl mb-2">
								Lengkapi Kebutuhan Anda Hari Ini!
							</h3>
							<p className="text-sm text-neutral-600 mb-6">
								Mulai dari elektronik, pulsa, hingga perlengkapan rumah tangga. Semua ada di Rahma Cell!
							</p>
							<div className="flex flex-wrap gap-3">
								<Button variant="dark" onClick={handleBelanjaSekarang}>
									<ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
									Mulai Belanja
								</Button>
								<Button variant="light" onClick={handleWhatsApp}>
									Konsultasi via Whatsapp
								</Button>
							</div>
						</div>
						<div className="relative h-64 md:h-full min-h-[300px]">
							<img 
								src={footerImg} 
								alt="Workspace" 
								className="absolute inset-0 w-full h-full object-cover rounded-r-2xl"
								loading="lazy"
							/>
						</div>
					</div>
				</section>
			</div>
		</MainLayout>
	)
}

export default LandingPage

