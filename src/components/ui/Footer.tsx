const Footer = () => {
	return (
		<footer className="w-full bg-black text-neutral-300">
			<div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-4">
					<div>
						<div className="mb-3 flex items-center gap-2">
							<div className="flex items-center gap-2">
								<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black'>
									<span className="text-lg font-bold">RC</span>
								</div>
								<span className='text-lg font-semibold text-white'>CV Rahma Cell</span>
							</div>
						</div>
						<p className="max-w-sm text-sm text-neutral-400">
							Toko handphone dan aksesoris terpercaya di Indonesia sejak 2015.
						</p>
						<div className="mt-4 flex items-center gap-3 text-neutral-300">
							<a href="#" aria-label="Facebook" className="hover:text-white">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.3l-.4 3h-1.9v7A10 10 0 0 0 22 12"></path>
								</svg>
							</a>
							<a href="#" aria-label="Instagram" className="hover:text-white">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM18 7a1 1 0 1 1-1 1 1 1 0 0 1 1-1z"></path>
								</svg>
							</a>
							<a href="#" aria-label="WhatsApp" className="hover:text-white">
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M20 3.9A10 10 0 0 0 3.2 16.8L2 22l5.4-1.4A10 10 0 1 0 20 3.9zm-8 16a8 8 0 0 1-4.3-1.3l-.3-.2-3.2.8.9-3.1-.2-.3A8 8 0 1 1 12 19.9zm4.6-5.8c-.3-.2-1.9-1-2.2-1.1s-.5-.2-.7.2-.8 1.1-1 1.3-.4.3-.7.1a6.6 6.6 0 0 1-1.9-1.2 7.1 7.1 0 0 1-1.4-1.8c-.2-.4 0-.6.1-.8l.4-.5c.2-.2.2-.4 0-.7s-.7-1.7-.9-2.3-.5-.5-.7-.5h-.6c-.3 0-.7.1-1 .5s-1.3 1.3-1.3 3.1 1.3 3.6 1.5 3.9 2.6 3.9 6.2 5.3a21.2 21.2 0 0 0 2.1.7 5 5 0 0 0 2.3.1c.7-.1 2.2-.9 2.5-1.8s.3-1.7.2-1.8-.3-.2-.6-.4z"></path>
								</svg>
							</a>
						</div>
					</div>

					<div>
						<h4 className="mb-3 text-sm font-semibold text-white">Kategori</h4>
						<ul className="space-y-2 text-sm text-neutral-400">
							<li>Smartphone</li>
							<li>Aksesoris</li>
							<li>Charger & Kabel</li>
							<li>Case & Pelindung</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-3 text-sm font-semibold text-white">Layanan</h4>
						<ul className="space-y-2 text-sm text-neutral-400">
							<li>Garansi Resmi</li>
							<li>Service Center</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-3 text-sm font-semibold text-white">Hubungi Kami</h4>
						<ul className="space-y-2 text-sm text-neutral-400">
							<li className="flex items-center gap-2">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.3a2 2 0 0 1-.5 2L8.3 8.9a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2-.5c.7.3 1.5.5 2.3.6a2 2 0 0 1 1.6 1.8z"/></svg>
								<span>+62 812-3456-7890</span>
							</li>
							<li className="flex items-center gap-2">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2l8 6 8-6H4zm16 12V8l-8 6-8-6v10h16z"/></svg>
								<span>info@cvrahmacell.com</span>
							</li>
							<li className="flex items-center gap-2">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a8 8 0 0 0-8 8c0 5.3 8 12 8 12s8-6.7 8-12a8 8 0 0 0-8-8zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
								<span>Cianjur, Jawa Barat</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-10 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500">
					© 2025 CV Rahma Cell. Semua hak dilindungi.
				</div>
			</div>
		</footer>
	)
}

export default Footer

