const Navbar = () => {
	return (
		<header className="w-full border-b border-neutral-200 bg-black">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
				<div className="flex items-center gap-2">
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black">
						<span className="text-lg font-bold">RC</span>
					</div>
					<span className="text-lg font-semibold text-white">CV Rahma Cell</span>
				</div>
				<nav className="hidden items-center gap-6 text-sm text-neutral-700 md:flex">
					<a href="#" className="hover:font-semibold text-white">Beranda</a>
                    <a href="#" className="hover:font-semibold text-white">Produk</a>
					<a href="#" className="hover:font-semibold text-white">Kategori</a>
					<a href="#" className="hover:font-semibold text-white">Tentang Kami</a>
					<a href="#" className="hover:font-semibold text-white">Kontak</a>
				</nav>
				<div className="md:hidden">
					<button aria-label="Open Menu" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="3" y1="6" x2="21" y2="6"></line>
							<line x1="3" y1="12" x2="21" y2="12"></line>
							<line x1="3" y1="18" x2="21" y2="18"></line>
						</svg>
					</button>
				</div>
			</div>
		</header>
	)
}

export default Navbar

