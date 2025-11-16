import { useCallback, useEffect, useRef, useState } from 'react'

export interface ImportFilePopupProps {
	open: boolean
	onClose: () => void
	onImport?: (file: File) => Promise<void> | void
	uploading?: boolean
}

type ValidationState = {
	error?: string
	file?: File
}

function cn(...parts: Array<string | false | null | undefined>) {
	return parts.filter(Boolean).join(' ')
}

const ACCEPT_EXTENSIONS = ['.csv', '.xls', '.xlsx']
const ACCEPT_MIME = [
	'text/csv',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

function isAccepted(file: File) {
	const name = file.name.toLowerCase()
	const extOk = ACCEPT_EXTENSIONS.some(ext => name.endsWith(ext))
	const mimeOk = ACCEPT_MIME.includes(file.type)
	return extOk || mimeOk
}

export default function ImportFilePopup({ open, onClose, onImport, uploading }: ImportFilePopupProps) {
	const inputRef = useRef<HTMLInputElement | null>(null)
	const [state, setState] = useState<ValidationState>({})
	const [dragging, setDragging] = useState(false)

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}
		if (open) document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [open, onClose])

	const handleFiles = useCallback((files: FileList | null) => {
		if (!files || files.length === 0) return
		const file = files[0]
		if (!isAccepted(file)) {
			setState({ error: 'Format tidak didukung. Hanya CSV atau Excel.' })
			return
		}
		setState({ file, error: undefined })
	}, [])

	const onChoose = useCallback(() => {
		inputRef.current?.click()
	}, [])

	const onDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragging(false)
		handleFiles(e.dataTransfer.files)
	}, [handleFiles])

	const onDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragging(true)
	}, [])

	const onDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragging(false)
	}, [])

	async function submit() {
		if (!state.file || uploading) return
		try {
			await onImport?.(state.file)
			onClose()
			setState({})
		} catch (err: any) {
			setState({ file: state.file, error: err?.message || 'Gagal mengimpor berkas.' })
		}
	}

	function clearFile() {
		setState({})
		if (inputRef.current) inputRef.current.value = ''
	}

	if (!open) return null

	return (
		<div className="fixed inset-0 z-100">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="absolute left-1/2 top-1/2 w-[480px] -translate-x-1/2 -translate-y-1/2">
				<div className="relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl">
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
					<div className="mb-5 text-center">
						<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
							<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
								<path d="M4 4h16v4H4z" />
								<path d="M4 14h16v6H4z" />
								<path d="M4 8h16v6H4z" />
							</svg>
						</div>
						<h2 className="text-lg font-semibold text-neutral-900">Impor Data Produk</h2>
						<p className="mt-1 text-sm text-neutral-500">Unggah berkas CSV atau Excel untuk memperbarui katalog.</p>
					</div>
					{/* Drop Zone */}
					<div
						onDrop={onDrop}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						className={cn(
							'group relative mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition',
							dragging ? 'border-red-500 bg-red-50' : 'border-neutral-300 hover:border-neutral-400'
						)}
					>
						<input
							ref={inputRef}
							type="file"
							accept={ACCEPT_EXTENSIONS.join(',') + ',' + ACCEPT_MIME.join(',')}
							className="hidden"
							onChange={(e) => handleFiles(e.target.files)}
						/>
						{!state.file && (
							<>
								<div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100">
									<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
										<path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
										<path d="M12 12v6" />
										<path d="M8 12l4-4 4 4" />
										<path d="M12 2v6" />
									</svg>
								</div>
								<p className="text-sm text-neutral-600">
									<button type="button" onClick={onChoose} className="font-medium text-red-600 hover:underline">Pilih berkas</button>
									<span className="px-1">atau</span>Drag & Drop
								</p>
								<p className="mt-2 text-xs text-neutral-500">Format yang didukung: CSV, XLS, XLSX. Maks 5MB.</p>
							</>
						)}
						{state.file && (
							<div className="w-full">
								<div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-left">
									<div className="flex min-w-0 items-center gap-2">
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 shrink-0">
											<path d="M4 4h16v16H4z" />
											<path d="M4 8h16" />
											<path d="M8 4v16" />
										</svg>
										<span className="truncate text-sm text-neutral-800" title={state.file.name}>{state.file.name}</span>
									</div>
									<button type="button" onClick={clearFile} className="rounded p-1 text-neutral-500 hover:text-neutral-700">
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<line x1="18" y1="6" x2="6" y2="18" />
											<line x1="6" y1="6" x2="18" y2="18" />
										</svg>
									</button>
								</div>
								{uploading && (
									<div className="mt-2 h-1 w-full overflow-hidden rounded bg-neutral-200">
										<div className="h-full w-1/2 animate-pulse bg-red-500" />
									</div>
								)}
							</div>
						)}
					</div>
					{state.error && <p className="mb-4 text-xs text-red-600">{state.error}</p>}
					{/* Actions */}
					<div className="mt-2 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							disabled={uploading}
							className={cn('rounded-lg px-4 py-2 text-sm font-medium', uploading ? 'cursor-not-allowed opacity-60 bg-neutral-100 text-neutral-400' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200')}
						>
							Batal
						</button>
						<button
							type="button"
							disabled={!state.file || uploading}
							onClick={submit}
							className={cn('rounded-lg px-4 py-2 text-sm font-medium text-white', !state.file || uploading ? 'cursor-not-allowed bg-red-300 opacity-60' : 'bg-red-600 hover:bg-red-700 active:bg-red-800')}
						>
							{uploading ? 'Mengunggah...' : 'Impor'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

