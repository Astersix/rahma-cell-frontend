import { useEffect } from 'react'

interface AlertMessageProps {
	variant: 'success' | 'error'
	message: string
	onClose?: () => void
	duration?: number
}

const AlertMessage = ({ variant, message, onClose, duration = 3000 }: AlertMessageProps) => {
	useEffect(() => {
		if (duration && onClose) {
			const timer = setTimeout(() => {
				onClose()
			}, duration)
			return () => clearTimeout(timer)
		}
	}, [duration, onClose])

	const isSuccess = variant === 'success'

	return (
		<div
			className={`fixed top-4 left-1/2 z-10000 flex min-w-[320px] max-w-md -translate-x-1/2 items-center gap-3 rounded-full border px-6 py-3 shadow-lg ${
				isSuccess
					? 'border-emerald-200 bg-emerald-50 text-emerald-700'
					: 'border-red-200 bg-red-50 text-red-700'
			}`}
		>
			<div className="shrink-0">
				{isSuccess ? (
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
						<polyline points="20 6 9 17 4 12" />
					</svg>
				) : (
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
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				)}
			</div>
			<span className="flex-1 text-sm font-medium">{message}</span>
			{onClose && (
				<button
					onClick={onClose}
					className="shrink-0 text-current opacity-60 hover:opacity-100"
					aria-label="Tutup"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			)}
		</div>
	)
}

export default AlertMessage
