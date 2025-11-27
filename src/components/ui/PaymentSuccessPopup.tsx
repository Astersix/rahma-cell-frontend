import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

type Props = {
	open: boolean
	onClose?: () => void
}

const PaymentSuccessPopup = ({ open, onClose }: Props) => {
	const navigate = useNavigate()

	useEffect(() => {
		if (!open) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose?.()
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [open, onClose])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<div className="relative z-10 w-[320px] rounded-2xl bg-white p-5 shadow-xl">
				<button
					aria-label="Tutup"
					className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
					onClick={onClose}
				>
					×
				</button>
				<div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						<path d="M20 6L9 17l-5-5" />
					</svg>
				</div>
				<div className="mb-1 text-center text-sm font-semibold text-neutral-900">Pembayaran berhasil</div>
				<div className="mb-4 text-center text-xs text-neutral-600">
					Silakan cek pesanan Anda untuk melihat status pengiriman
				</div>
				<div className="flex justify-center">
					<button
						className="w-full rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
						onClick={() => {
							onClose?.()
							navigate('/orders')
						}}
					>
						Lihat Pesanan
					</button>
				</div>
			</div>
		</div>
	)
}

export default PaymentSuccessPopup

