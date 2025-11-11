export interface AdminHeaderProps {
	className?: string
	onLogout?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const AdminHeader = ({ className, onLogout }: AdminHeaderProps) => {
	return (
		<header className={cn('sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90', className)}>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
				{/* Brand */}
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
						{/* phone icon */}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
							<line x1="12" y1="18" x2="12" y2="18"></line>
						</svg>
					</div>
					<span className="text-sm font-medium text-black md:text-base">CV Rahma Cell</span>
				</div>

				{/* Logout icon */}
				<button
					type="button"
					aria-label="Logout"
					onClick={onLogout}
					className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100"
				>
					{/* logout icon */}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
						<polyline points="16 17 21 12 16 7" />
						<line x1="21" y1="12" x2="9" y2="12" />
					</svg>
				</button>
			</div>
		</header>
	)
}

export default AdminHeader

