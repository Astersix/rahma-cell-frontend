import type { PropsWithChildren } from 'react'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'

export interface MainLayoutProps extends PropsWithChildren {
	className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const MainLayout = ({ children, className }: MainLayoutProps) => {
	return (
		<div className={cn('min-h-screen flex flex-col bg-white text-black', className)}>
			<Navbar />
			<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
				{children}
			</main>
			<Footer />
		</div>
	)
}

export default MainLayout

