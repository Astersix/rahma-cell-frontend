export interface AdminHeaderProps {
	className?: string
	onLogout?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

import { useAuthStore } from '../../store/auth.store'
import { useNavigate } from 'react-router-dom'

const AdminHeader = ({ className, onLogout }: AdminHeaderProps) => {
	const { logout } = useAuthStore()
	const navigate = useNavigate()

	function handleLogout() {
		if (onLogout) {
			onLogout()
			return
		}
		logout()
		navigate('/landing')
	}
	return (
		<header className={cn('sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/90', className)}>
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
				{/* Brand */}
				<div className="flex items-center gap-2">
					<div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', 'bg-black text-white')}>
						<span className="text-lg font-bold">RC</span>
					</div>
					<span className={cn('text-lg font-semibold text-black')}>CV Rahma Cell</span>
				</div>
				{/* Notification and Logout icons */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						aria-label="Notifications"
						onClick={() => navigate('/admin/notifications')}
						className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100"
					>
						{/* notification bell icon */}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
							<path d="M10 22h4" />
						</svg>
					</button>
					<button
						type="button"
						aria-label="Logout"
						onClick={handleLogout}
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
			</div>
		</header>
	)
}

export default AdminHeader

