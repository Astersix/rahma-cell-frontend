import type { PropsWithChildren } from 'react'
import AdminHeader from '../components/ui/AdminHeader'
import AdminSidebar from '../components/ui/AdminSidebar'

export interface AdminLayoutProps extends PropsWithChildren {
	sidebarActive?: 'dashboard' | 'products' | 'orders'
	className?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const AdminLayout = ({ children, sidebarActive = 'dashboard', className }: AdminLayoutProps) => {
	return (
		<div className={cn('min-h-screen bg-white text-black', className)}>
			<AdminHeader />
			<div className="flex">
				<AdminSidebar active={sidebarActive} />
				<main className="flex-1 p-6">
					{children}
				</main>
			</div>
		</div>
	)
}

export default AdminLayout

