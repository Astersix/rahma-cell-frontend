import ButtonIcon from './ButtonIcon'
import type { ReactNode } from 'react'
type NavbarVariant = 'dark' | 'light'

interface NavbarProps {
	variant?: NavbarVariant
	rightSlot?: ReactNode
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const Navbar = ({ variant = 'dark', rightSlot }: NavbarProps) => {
	const isLight = variant === 'light'

	return (
		<header className={cn(
			'fixed inset-x-0 top-0 z-50 w-full border-b border-neutral-200 backdrop-blur',
			isLight ? 'bg-white' : 'bg-black'
		)}>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
				<div className="flex items-center gap-2">
					<div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', isLight ? 'bg-black text-white' : 'bg-white text-black')}>
						<span className="text-lg font-bold">RC</span>
					</div>
					<span className={cn('text-lg font-semibold', isLight ? 'text-black' : 'text-white')}>CV Rahma Cell</span>
				</div>
				<nav className="hidden items-center gap-6 text-sm md:flex">
					<a href="#" className={cn('hover:font-semibold', isLight ? 'text-black' : 'text-white')}>Beranda</a>
					<a href="#" className={cn('hover:font-semibold', isLight ? 'text-black' : 'text-white')}>Produk</a>
					<a href="#" className={cn('hover:font-semibold', isLight ? 'text-black' : 'text-white')}>Kategori</a>
					<a href="#" className={cn('hover:font-semibold', isLight ? 'text-black' : 'text-white')}>Tentang Kami</a>
					<a href="#" className={cn('hover:font-semibold', isLight ? 'text-black' : 'text-white')}>Kontak</a>
				</nav>
				<div className="hidden items-center gap-3 md:flex">
					{rightSlot}
				</div>
				<div className="md:hidden">
					<ButtonIcon
						aria-label="Open Menu"
						variant="light"
						className="h-9 w-9 p-0 border border-neutral-200"
						icon={
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<line x1="3" y1="6" x2="21" y2="6"></line>
								<line x1="3" y1="12" x2="21" y2="12"></line>
								<line x1="3" y1="18" x2="21" y2="18"></line>
							</svg>
						}
					/>
				</div>
			</div>
		</header>
	)
}

export default Navbar

