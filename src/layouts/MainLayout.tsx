import type { PropsWithChildren, ReactNode } from 'react'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'

export interface MainLayoutProps extends PropsWithChildren {
	className?: string
	navbarVariant?: 'dark' | 'light'
	navbarRight?: ReactNode
	headerComponent?: ReactNode
	headerFixed?: boolean
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const MainLayout = ({ children, className, navbarVariant = 'light', navbarRight, headerComponent, headerFixed = true }: MainLayoutProps) => {
	return (
		<div className={cn('min-h-screen flex flex-col bg-white text-black', className)}>
			{headerComponent ?? <Navbar variant={navbarVariant} rightSlot={navbarRight} />}
			{/* top padding to offset fixed navbar height when applicable */}
			<main className={cn('mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6', headerFixed && 'pt-20')}>
				{children}
			</main>
			<Footer />
		</div>
	)
}

export default MainLayout

