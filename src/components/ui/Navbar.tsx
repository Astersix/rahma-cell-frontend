import type { ReactNode } from 'react'
import { Bars3Icon } from '@heroicons/react/24/outline'
import ButtonIcon from './ButtonIcon'
import { cn } from '../../utils/cn'

type NavbarVariant = 'dark' | 'light'

interface NavbarProps {
	variant?: NavbarVariant
	rightSlot?: ReactNode
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
				<nav className={cn('hidden items-center gap-6 text-sm md:flex md:ml-auto', isLight ? 'text-black' : 'text-white')}>
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
						icon={<Bars3Icon className="w-[18px] h-[18px]" />}
					/>
				</div>
			</div>
		</header>
	)
}

export default Navbar

