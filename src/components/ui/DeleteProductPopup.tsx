import { useEffect } from 'react'

export interface DeleteProductPopupProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const DeleteProductPopup = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  title = 'Apakah Anda yakin ingin menghapus produk ini?',
  description = 'Tindakan ini tidak dapat dibatalkan',
  confirmLabel = 'Keluar',
  cancelLabel = 'Batalkan',
}: DeleteProductPopupProps) => {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[360px] -translate-x-1/2 -translate-y-1/2">
        <div className="relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
          {/* Close */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 rounded p-1 text-neutral-500 hover:text-neutral-700"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Icon */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          {/* Text */}
          <div className="text-center">
            <div className="mb-1 text-base font-semibold text-neutral-900">{title}</div>
            <div className="text-sm text-neutral-500">{description}</div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className={cn('min-w-[110px] rounded-lg border px-4 py-2 text-sm', loading ? 'cursor-not-allowed opacity-60' : 'border-red-300 text-red-600 hover:bg-red-50')}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className={cn('min-w-[110px] rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white', loading ? 'cursor-not-allowed opacity-60' : 'hover:bg-red-600')}
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteProductPopup
