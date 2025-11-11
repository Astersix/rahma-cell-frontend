import { NavLink } from 'react-router-dom'

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
			return (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M3 13h8V3H3v10z" />
					<path d="M13 21h8V8h-8v13z" />
				</svg>
			)
		case 'box':
			return (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
					<path d="M3.3 7l8.7 5 8.7-5" />
					<path d="M12 22V12" />
				</svg>
			)
		case 'file':
			return (
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
					<path d="M14 2v6h6" />
				</svg>
			)
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

