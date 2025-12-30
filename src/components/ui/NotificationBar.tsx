interface NotificationBarProps {
	icon?: 'check' | 'truck'
	title: string
	message: string
	action?: string
	timestamp: string
	badge?: string
	isActive?: boolean
	isRead?: boolean
	onClick?: () => void
	onAction?: () => void
}

const NotificationBar = ({
	icon = 'check',
	title,
	message,
	action,
	timestamp,
	badge,
	isActive = false,
	isRead = false,
	onClick,
	onAction,
}: NotificationBarProps) => {
	const IconCheck = () => (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
			<polyline points="22 4 12 14.01 9 11.01" />
		</svg>
	)

	const IconTruck = () => (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<rect x="1" y="3" width="15" height="13" />
			<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
			<circle cx="5.5" cy="18.5" r="2.5" />
			<circle cx="18.5" cy="18.5" r="2.5" />
		</svg>
	)

	return (
		<div
			className={`flex items-start gap-3 border-l-4 px-4 py-4 transition-colors ${
				isActive
					? 'border-l-neutral-900 bg-neutral-50'
					: 'border-l-transparent bg-white hover:bg-neutral-50'
			} ${onClick ? 'cursor-pointer' : ''}`}
			onClick={onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{/* Icon */}
			<div className="shrink-0 pt-0.5 relative">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white">
					{icon === 'check' ? <IconCheck /> : <IconTruck />}
				</div>
				{!isRead && (
					<div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-600 border-2 border-white" />
				)}
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				<div className="mb-1 flex items-start justify-between gap-2">
					<h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
					{badge && (
						<span className="shrink-0 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
							{badge}
						</span>
					)}
				</div>
				<p className="text-sm text-neutral-700">{message}</p>
				{action && isActive && (
					<button
						type="button"
						className="mt-2 text-sm font-medium text-neutral-900 underline hover:text-neutral-700"
						onClick={(e) => {
							e.stopPropagation()
							if (onAction) onAction()
						}}
					>
						{action}
					</button>
				)}
				<div className="mt-2 text-xs text-neutral-500">{timestamp}</div>
			</div>
		</div>
	)
}

export default NotificationBar
