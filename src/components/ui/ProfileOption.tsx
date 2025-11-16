import type { FC } from 'react'

export interface ProfileOptionProps {
	className?: string
	variant?: 'light' | 'dark'
	onMyAccount?: () => void
	onOrders?: () => void
	onLogout?: () => void
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const IconUser = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M20 21a8 8 0 0 0-16 0" />
		<circle cx="12" cy="7" r="4" />
	</svg>
)

const IconLock = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<rect x="3" y="11" width="18" height="11" rx="2" />
		<path d="M7 11V7a5 5 0 0 1 10 0v4" />
	</svg>
)

const IconLogout = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<path d="M16 17l5-5-5-5" />
		<path d="M21 12H9" />
	</svg>
)

const baseItem = 'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition'

const ProfileOption: FC<ProfileOptionProps> = ({ className, variant = 'light', onMyAccount, onOrders, onLogout }) => {
	const lightPanel = 'border-neutral-200 bg-white text-black'
	const darkPanel = 'border-neutral-700 bg-black/95 text-white'

	const lightItem = 'text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20'
	const darkItem = 'text-neutral-200 hover:bg-neutral-800 active:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20'

	const redItem = variant === 'dark'
		? 'text-red-400 hover:bg-neutral-800 active:bg-neutral-700'
		: 'text-red-600 hover:bg-neutral-100 active:bg-neutral-200'

	return (
		<div className={cn('absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-md border p-2 shadow-lg backdrop-blur', variant === 'dark' ? darkPanel : lightPanel, className)}>
			<button type="button" onClick={onMyAccount} className={cn(baseItem, variant === 'dark' ? darkItem : lightItem)}>
				<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconUser /></span>
				<span>Akun saya</span>
			</button>
			<button type="button" onClick={onOrders} className={cn(baseItem, variant === 'dark' ? darkItem : lightItem)}>
				<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconLock /></span>
				<span>Pesanan</span>
			</button>
			<div className={cn('my-2 h-px', variant === 'dark' ? 'bg-neutral-800' : 'bg-neutral-200')} />
			<button type="button" onClick={onLogout} className={cn(baseItem, redItem)}>
				<span className="inline-flex h-5 w-5 items-center justify-center text-current"><IconLogout /></span>
				<span>Keluar</span>
			</button>
		</div>
	)
}

export default ProfileOption

