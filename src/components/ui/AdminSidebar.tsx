export interface AdminSidebarProps {
	className?: string
	active?: 'dashboard' | 'products' | 'orders'
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const items = [
	{ key: 'dashboard', label: 'Dashboard' },
	{ key: 'products', label: 'Produk' },
	{ key: 'orders', label: 'Pesanan' },
 ] as const

const IconTrend = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="23 7 16 14 10 8 1 17" />
		<polyline points="17 7 23 7 23 13" />
	</svg>
)

const AdminSidebar = ({ className, active = 'dashboard' }: AdminSidebarProps) => {
	return (
		<aside className={cn('w-64 border-r border-neutral-200 bg-white p-6', className)}>
			<nav className="space-y-3">
				{items.map((item) => {
					const isActive = item.key === active
					return (
						<a
							key={item.key}
							href="#"
							className={cn(
								'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-neutral-800',
								isActive ? 'bg-neutral-100' : 'hover:bg-neutral-100',
							)}
						>
							<IconTrend />
							<span>{item.label}</span>
						</a>
					)
				})}
			</nav>
		</aside>
	)
}

export default AdminSidebar

