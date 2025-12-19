import { NavLink } from 'react-router-dom'
import { Squares2X2Icon, CubeIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export interface AdminSidebarProps {
	className?: string
	active?: 'dashboard' | 'products' | 'orders'
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const items = [
	{ key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard' },
	{ key: 'products', label: 'Produk', icon: 'box', to: '/admin/products' },
	{ key: 'orders', label: 'Pesanan', icon: 'file', to: '/admin/orders' },
] as const

const Icon = ({ name }: { name: string }) => {
	switch (name) {
		case 'dashboard':
			return <Squares2X2Icon className="w-4 h-4" />
		case 'box':
			return <CubeIcon className="w-4 h-4" />
		case 'file':
			return <DocumentTextIcon className="w-4 h-4" />
		default:
			return null
	}
}

const AdminSidebar = ({ className }: AdminSidebarProps) => {
	return (
		<aside className={cn('w-64 border-r border-neutral-200 bg-white p-4', className)}>
			<nav className="space-y-1">
				{items.map((item) => (
					<NavLink
						key={item.key}
						to={item.to}
						className={({ isActive }) =>
							cn(
								'group flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors',
								isActive
									? 'bg-red-500 text-white shadow-sm'
									: 'text-neutral-800 hover:bg-neutral-100',
							)
						}
						end={item.key === 'dashboard'}
					>
						<span className={cn('flex h-6 w-6 items-center justify-center')}> <Icon name={item.icon} /> </span>
						<span>{item.label}</span>
					</NavLink>
				))}
			</nav>
		</aside>
	)
}

export default AdminSidebar

