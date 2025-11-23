import Button from "../components/ui/Button"
import Card from "../components/ui/Card"
import MainLayout from "../layouts/MainLayout"
import heroImg from "../assets/hero-img.png"

const Icon = ({ name, className = "w-5 h-5" }: { name: 'phone' | 'headphone' | 'bolt' | 'plug' | 'home' | 'pen' | 'shield' | 'support'; className?: string }) => {
	switch (name) {
		case 'phone':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
			)
		case 'headphone':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-3a9 9 0 0 1 18 0v3"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3"/></svg>
			)
		case 'bolt':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
			)
		case 'plug':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-7"/><path d="M7 7h10"/><path d="M7 3v4"/><path d="M17 3v4"/><rect x="7" y="7" width="10" height="9" rx="2"/></svg>
			)
		case 'home':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>
			)
		case 'pen':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
			)
		case 'shield':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
			)
		case 'support':
			return (
				<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>
			)
		default:
			return null
	}
}

const categories = [
	{ name: 'Smartphone', icon: 'phone' as const },
	{ name: 'Audio', icon: 'headphone' as const },
	{ name: 'Charger', icon: 'bolt' as const },
	{ name: 'Charger', icon: 'plug' as const },
	{ name: 'Peralatan Rumah Tangga', icon: 'home' as const },
	{ name: 'Alat Tulis', icon: 'pen' as const },
]

const products = [
	{ title: 'iPhone 15 Pro Max', variant: '256GB • Natural Titanium', price: 'Rp 19.999.000', oldPrice: 'Rp 21.000.000', sold: '480 Terjual', img: 'https://images.unsplash.com/photo-1603899122299-3dfeb3be25e7?q=80&w=1200&auto=format&fit=crop' },
	{ title: 'Samsung Galaxy S24 Ultra', variant: '512GB • Titanium Black', price: 'Rp 18.999.000', oldPrice: 'Rp 19.999.000', sold: '198 Terjual', img: 'https://images.unsplash.com/photo-1610945265361-9050b0323d19?q=80&w=1200&auto=format&fit=crop' },
	{ title: 'AirPods Pro 2nd Gen', variant: 'USB-C • White', price: 'Rp 3.799.000', oldPrice: 'Rp 3.899.000', sold: '240 Terjual', img: 'https://images.unsplash.com/photo-1588422333076-09c9b7b28d5c?q=80&w=1200&auto=format&fit=crop' },
	{ title: 'Xiaomi 13T Pro', variant: '256GB • Meadow Green', price: 'Rp 8.999.000', oldPrice: '', sold: '97 Terjual', img: 'https://images.unsplash.com/photo-1589751946331-72788d8f9ab1?q=80&w=1200&auto=format&fit=crop' },
	{ title: 'AirPods Pro 2nd Gen', variant: 'USB-C • White', price: 'Rp 3.799.000', oldPrice: '', sold: '243 Terjual', img: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?q=80&w=1200&auto=format&fit=crop' },
]

const LandingPage = () => {
	return (
		<MainLayout>
			<div className="space-y-12">
				{/* Hero */}
				<section className="relative overflow-hidden rounded-2xl border border-neutral-200">
					<div className="absolute inset-0">
						{/* Background image with gradient overlay */}
						<img
							src={heroImg}
							alt="Banner"
							className="h-full w-full object-cover"
							loading="eager"
						/>
						<div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-transparent" />
					</div>
					<div className="relative grid gap-8 p-8 md:grid-cols-2 md:p-12">
						<div className="text-white">
							<p className="mb-2 text-sm/6 font-medium text-white/80">CV Rahma Cell</p>
							<h1 className="text-3xl font-extrabold md:text-4xl lg:text-5xl">
								Belanja Handphone & Aksesoris Berkualitas
								<br />
								Tanpa Ribet
							</h1>
						</div>
						<div className="ml-auto max-w-md rounded-xl bg-white/90 p-6 backdrop-blur">
							<p className="text-sm text-neutral-700">
								Temukan produk original, harga bersahabat, dan pelayanan cepat untuk setiap kebutuhan Anda.
							</p>
							<div className="mt-4 flex flex-wrap gap-3">
								<Button variant="light">Lihat Katalog</Button>
								<Button variant="dark">Belanja Sekarang</Button>
							</div>
							<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-700">
								<span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
									<Icon name="shield" />
									Garansi Resmi
								</span>
								<span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
									<Icon name="support" />
									Support 24 jam
								</span>
							</div>
						</div>
					</div>
				</section>

				{/* Categories */}
				<section className="space-y-2">
					<h2 className="text-center text-2xl font-bold">Kategori Produk Pilihan</h2>
					<p className="text-center text-sm text-neutral-600">Temukan berbagai kategori produk sesuai kebutuhan Anda</p>

					<div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
						{categories.map((cat) => (
							<Card key={cat.name} className="flex cursor-pointer items-center gap-3 px-4 py-5 transition hover:shadow">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
									<Icon name={cat.icon} className="h-5 w-5" />
								</div>
								<span className="text-sm font-medium">{cat.name}</span>
							</Card>
						))}
					</div>
				</section>

				{/* Featured Products */}
				<section className="space-y-2">
					<h2 className="text-center text-2xl font-bold">Produk Unggulan</h2>
					<p className="text-center text-sm text-neutral-600">Produk terlaris dan terpopuler bulan ini</p>

					<div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
						{products.map((p) => (
							<Card key={p.title} className="flex flex-col gap-3 p-4">
								<div className="overflow-hidden rounded-lg bg-neutral-100">
									<img src={p.img} alt={p.title} className="h-40 w-full object-cover" loading="lazy" />
								</div>
								<div className="space-y-1">
									<h3 className="text-sm font-semibold">{p.title}</h3>
									<p className="text-xs text-neutral-600">{p.variant}</p>
								</div>
								<div className="mt-1 flex items-baseline gap-2">
									<span className="text-base font-bold">{p.price}</span>
									{p.oldPrice && (
										<span className="text-xs text-neutral-400 line-through">{p.oldPrice}</span>
									)}
								</div>
								<p className="text-xs text-neutral-500">{p.sold}</p>
								<Button className="mt-auto" variant="dark" size="sm">Tambah ke Keranjang</Button>
							</Card>
						))}
					</div>
				</section>

				{/* CTA */}
				<section>
					<Card variant="dark" className="flex flex-col items-center gap-4 rounded-2xl p-10 text-center text-white md:flex-row md:justify-between md:text-left">
						<div>
							<h3 className="text-xl font-bold md:text-2xl">Siap Upgrade Handphone Anda?</h3>
							<p className="mt-1 text-sm text-white/80">Jangan lewatkan penawaran terbaik bulan ini.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Button variant="light">Mulai Belanja</Button>
							<Button variant="light">Konsultasi via Whatsapp</Button>
						</div>
					</Card>
				</section>
			</div>
		</MainLayout>
	)
}

export default LandingPage

