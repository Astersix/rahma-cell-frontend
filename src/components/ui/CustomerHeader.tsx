import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { notificationService } from '../../services/notification.service'
import ProfileOption from './ProfileOption'
import PopupModal from './PopupModal'
import SearchResult from './SearchResult'

export interface CustomerHeaderProps {
	className?: string
	cartCount?: number
	notificationCount?: number
	onSearchChange?: (value: string) => void
	searchValue?: string
	onBellClick?: () => void
	onCartClick?: () => void
	avatarSrc?: string
	avatarAlt?: string
	rightExtra?: ReactNode
	variant?: 'light' | 'dark'
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const CustomerHeader = ({
	className,
	cartCount = 0,
	notificationCount = 0,
	onSearchChange,
	searchValue = '',
	onBellClick,
	onCartClick,
	avatarSrc = '/vite.svg',
	avatarAlt = 'User Avatar',
	rightExtra,
    variant = 'light',
}: CustomerHeaderProps) => {
	const [open, setOpen] = useState(false)
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [showSearchResults, setShowSearchResults] = useState(false)
	const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
	const menuRef = useRef<HTMLDivElement | null>(null)
	const searchRef = useRef<HTMLDivElement | null>(null)
	const navigate = useNavigate()
	const { logout, token } = useAuthStore()

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setShowSearchResults(false)
			}
		}
		function handleEsc(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				if (showSearchResults) {
					setShowSearchResults(false)
				} else if (!showLogoutModal) {
					setOpen(false)
				}
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleEsc)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleEsc)
		}
	}, [showLogoutModal, showSearchResults])

	useEffect(() => {
		async function checkUnreadNotifications() {
			if (!token) return
			try {
				const items = await notificationService.getMyNotifications()
				const hasUnread = Array.isArray(items) && items.some(n => !n.is_read)
				setHasUnreadNotifications(hasUnread)
			} catch {
				// Silent error
			}
		}
		checkUnreadNotifications()
		// Poll every 30 seconds for new notifications
		const interval = setInterval(checkUnreadNotifications, 30000)
		return () => clearInterval(interval)
	}, [token])

	function handleLogout() {
		setShowLogoutModal(true)
		setOpen(false)
	}

	function handleConfirmLogout() {
		setShowLogoutModal(false)
		logout()
		navigate('/landing')
	}

	function handleCancelLogout() {
		setShowLogoutModal(false)
	}

	function handleMyAccount() {
		navigate('/profile')
		setOpen(false)
	}

	function handleOrders() {
		navigate('/orders')
		setOpen(false)
	}

	function handleCart() {
		if (onCartClick) {
			onCartClick()
		} else {
			navigate('/cart')
		}
	}

	function handleSearchChange(value: string) {
		setSearchQuery(value)
		setShowSearchResults(value.length >= 2)
		if (onSearchChange) {
			onSearchChange(value)
		}
	}

	function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter' && searchQuery.trim()) {
			navigate(`/?search=${encodeURIComponent(searchQuery)}`)
			setShowSearchResults(false)
		}
	}

	const isLight = variant === 'light'
	const isDark = variant === 'dark'

	return (
		<>
		<header
			className={cn(
				'fixed left-0 top-0 z-50 w-full border-b backdrop-blur',
				isDark ? 'border-neutral-800 bg-black/90 text-white' : 'border-neutral-200 bg-white/95 text-black',
				className,
			)}
		>
			<div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
				{/* Brand */}
				<button
					type="button"
					onClick={() => navigate('/')}
					className="flex items-center gap-2 hover:opacity-80 transition-opacity"
				>
					<div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', isLight ? 'bg-black text-white' : 'bg-white text-black')}>
						<span className="text-lg font-bold">RC</span>
					</div>
					<span className={cn('text-lg font-semibold', isLight ? 'text-black' : 'text-white')}>CV Rahma Cell</span>
				</button>

				{/* Center search */}
				<div className="flex flex-1 justify-center">
					<div className="w-full max-w-2xl mr-9" ref={searchRef}>
						<div className="relative">
							<span className={cn('pointer-events-none absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-neutral-400' : 'text-neutral-400')}>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="11" cy="11" r="8" />
									<path d="m21 21-4.3-4.3" />
								</svg>
							</span>
								<input
									type="text"
									placeholder="Cari HP, aksesoris, charger dan lainnya..."
									value={searchQuery || searchValue}
									onChange={(e) => handleSearchChange(e.target.value)}
									onKeyDown={handleSearchKeyDown}
									onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
									className={cn(
										'w-full rounded-md px-9 py-2 text-sm outline-none transition-shadow',
										isDark
											? 'border border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.15)]'
											: 'border border-neutral-200 bg-white text-black placeholder:text-neutral-400 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]',
									)}
								/>
							{showSearchResults && (
								<SearchResult
									query={searchQuery}
									onClose={() => setShowSearchResults(false)}
									variant={variant}
									onNavigate={() => setSearchQuery('')}
								/>
							)}
						</div>
					</div>
				</div>

				{/* Right icons */}
				<div className="flex items-center gap-6">
					{/* Bell */}
					<button
						type="button"
						onClick={() => onBellClick ? onBellClick() : navigate('/notifications')}
						aria-label="Notifikasi"
						className={cn('relative', isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black')}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
							<path d="M10 22h4" />
						</svg>
						{hasUnreadNotifications && (
							<span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white">
								<span className="sr-only">notifikasi belum dibaca</span>
							</span>
						)}
					</button>

					{/* Cart */}
						<button
							type="button"
							onClick={handleCart}
							aria-label="Keranjang"
							className={cn('relative', isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black')}
						>
							<svg
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="9" cy="21" r="1" />
								<circle cx="20" cy="21" r="1" />
								<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
							</svg>
							{cartCount > 0 && (
								<span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-medium text-white shadow">
									{cartCount}
									<span className="sr-only">item dalam keranjang</span>
								</span>
							)}
						</button>

								{/* Avatar + Dropdown */}
								<div className="relative" ref={menuRef}>
									<button
										type="button"
										aria-haspopup="menu"
										aria-expanded={open}
										onClick={() => setOpen(v => !v)}
										className={cn('h-8 w-8 overflow-hidden rounded-full border focus:outline-none focus:ring-2', isDark ? 'border-neutral-700 bg-neutral-800 focus:ring-white/30' : 'border-neutral-200 bg-neutral-100 focus:ring-black/20')}
									>
										<img
											src={avatarSrc}
											alt={avatarAlt}
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									</button>
									{open && (
										<ProfileOption
											variant={isDark ? 'dark' : 'light'}
											onMyAccount={handleMyAccount}
											onOrders={handleOrders}
											onLogout={handleLogout}
										/>
									)}
								</div>
					{rightExtra}
				</div>
			</div>
		</header>

		<PopupModal
			open={showLogoutModal}
			onClose={handleCancelLogout}
			icon="warning"
			title="Apakah Anda yakin ingin keluar?"
			description="Tindakan ini tidak dapat dibatalkan"
			primaryButton={{
				label: 'Kembali',
				variant: 'filled',
				onClick: handleCancelLogout,
			}}
			secondaryButton={{
				label: 'Keluar',
				variant: 'outlined',
				onClick: handleConfirmLogout,
			}}
		/>
	</>
	)
}

export default CustomerHeader
