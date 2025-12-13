import { useEffect } from 'react'

type IconType = 'success' | 'error' | 'warning' | 'none'
type ButtonVariant = 'filled' | 'outlined' | 'outlined-blue'

type Button = {
	label: string
	variant?: ButtonVariant
	onClick: () => void
}

type Props = {
	open: boolean
	onClose?: () => void
	icon?: IconType
	title?: string
	description?: string
	primaryButton?: Button
	secondaryButton?: Button
	showCloseButton?: boolean
}

const SuccessIcon = () => (
	<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500">
		<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
			<path d="M20 6L9 17l-5-5" />
		</svg>
	</div>
)

const ErrorIcon = () => (
	<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500">
		<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	</div>
)

const WarningIcon = () => (
	<div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
		<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
			<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="17" x2="12.01" y2="17" />
		</svg>
	</div>
)

const PopupModal = ({
	open,
	onClose,
	icon = 'none',
	title,
	description,
	primaryButton,
	secondaryButton,
	showCloseButton = true,
}: Props) => {
	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && onClose) onClose()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [open, onClose])

	if (!open) return null

	const getButtonClass = (variant: ButtonVariant = 'filled') => {
		switch (variant) {
			case 'outlined':
				return 'rounded-md border border-red-500 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors'
			case 'outlined-blue':
				return 'rounded-md border border-red-500 bg-white px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors'
			case 'filled':
			default:
				return 'rounded-md bg-red-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors'
		}
	}

	return (
		<div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="relative z-10 w-full max-w-[380px] rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
				{showCloseButton && onClose && (
					<button
						aria-label="Tutup"
						className="absolute right-4 top-4 text-2xl text-neutral-400 hover:text-neutral-600 transition-colors"
						onClick={onClose}
					>
						×
					</button>
				)}
				
				{icon !== 'none' && (
					<div className="mb-4">
						{icon === 'success' && <SuccessIcon />}
						{icon === 'error' && <ErrorIcon />}
						{icon === 'warning' && <WarningIcon />}
					</div>
				)}

				{title && (
					<div className={`mb-2 text-center text-base font-bold text-neutral-900 ${icon === 'none' ? 'mt-2' : ''}`}>
						{title}
					</div>
				)}

				{description && (
					<div className="mb-6 text-center text-sm text-neutral-600 leading-relaxed">
						{description}
					</div>
				)}

				<div className={`flex gap-3 ${secondaryButton ? 'flex-row' : 'justify-center'}`}>
					{primaryButton && (
						<button
							className={secondaryButton ? getButtonClass(primaryButton.variant) + ' flex-1' : getButtonClass(primaryButton.variant)}
							onClick={primaryButton.onClick}
						>
							{primaryButton.label}
						</button>
					)}
					{secondaryButton && (
						<button
							className={getButtonClass(secondaryButton.variant) + ' flex-1'}
							onClick={secondaryButton.onClick}
						>
							{secondaryButton.label}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}

export default PopupModal

