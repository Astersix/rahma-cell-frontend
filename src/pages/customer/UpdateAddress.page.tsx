import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PopupModal from '../../components/ui/PopupModal'
import AlertMessage from '../../components/ui/AlertMessage'
import { getMyProfile, updateAddress } from '../../services/user.service'
import { useAuthStore } from '../../store/auth.store'

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

const IconInfo = () => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	</svg>
)

const Sidebar = ({ active, onNavigate, onLogoutClick }: { active: 'akun' | 'pesanan'; onNavigate: (page: string) => void; onLogoutClick: () => void }) => (
	<aside className="rounded-lg border border-neutral-200 p-3 text-sm">
		<nav className="space-y-2">
			<button
				onClick={() => onNavigate('/profile')}
				className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
					active === 'akun' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'
				}`}
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconUser />
					</span>
					Akun Saya
				</span>
			</button>
			<button
				onClick={() => onNavigate('/orders')}
				className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left ${
					active === 'pesanan' ? 'bg-red-600 text-white' : 'text-neutral-700 hover:bg-neutral-50'
				}`}
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconLock />
					</span>
					Pesanan
				</span>
			</button>
			<button
				onClick={onLogoutClick}
				className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-neutral-700 hover:bg-neutral-50"
			>
				<span className="inline-flex items-center gap-2">
					<span className="inline-flex h-5 w-5 items-center justify-center text-current">
						<IconLogout />
					</span>
					Keluar
				</span>
			</button>
		</nav>
	</aside>
)

const UpdateAddressPage = () => {
	const navigate = useNavigate()
	const { id } = useParams<{ id: string }>()
	const token = useAuthStore((s) => s.token)
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [showErrorModal, setShowErrorModal] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [showSuccessAlert, setShowSuccessAlert] = useState(false)

	const [recipientName, setRecipientName] = useState('')
	const [phone, setPhone] = useState('')
	const [address, setAddress] = useState('')
	const [isDefault, setIsDefault] = useState(false)

	useEffect(() => {
		async function loadAddress() {
			if (!id || !token) return
			try {
				setLoading(true)
				const profile = await getMyProfile(token)
				const addresses = profile.address || []
				const currentAddress = addresses.find((addr) => String(addr.id) === String(id))

				if (currentAddress) {
					setRecipientName(currentAddress.recipient_name || '')
					setPhone(currentAddress.phone || '')
					setAddress(currentAddress.address || '')
					setIsDefault(currentAddress.is_default || false)
				} else {
					setErrorMessage('Alamat tidak ditemukan')
					setShowErrorModal(true)
				}
			} catch (err: any) {
				setErrorMessage(err?.message || 'Gagal memuat alamat')
				setShowErrorModal(true)
			} finally {
				setLoading(false)
			}
		}
		loadAddress()
	}, [id, token])

	function handleLogoutClick() {
		setShowLogoutModal(true)
	}

	function handleConfirmLogout() {
		setShowLogoutModal(false)
		useAuthStore.getState().logout()
		navigate('/login')
	}

	function handleCancelLogout() {
		setShowLogoutModal(false)
	}

	function handleCancel() {
		navigate('/profile')
	}

	async function handleSave() {
		// Validate fields
		if (!recipientName.trim()) {
			setErrorMessage('Nama penerima tidak boleh kosong')
			setShowErrorModal(true)
			return
		}
		if (!phone.trim()) {
			setErrorMessage('Nomor telepon tidak boleh kosong')
			setShowErrorModal(true)
			return
		}
		if (phone.trim().replace(/\D/g, '').length < 10) {
			setErrorMessage('Nomor telepon harus minimal 10 digit')
			setShowErrorModal(true)
			return
		}
		if (!address.trim()) {
			setErrorMessage('Alamat lengkap tidak boleh kosong')
			setShowErrorModal(true)
			return
		}
		if (address.trim().length < 10) {
			setErrorMessage('Alamat lengkap harus minimal 10 karakter')
			setShowErrorModal(true)
			return
		}

		try {
			setSaving(true)
			await updateAddress(
				id!,
				{
					recipient_name: recipientName,
					phone,
					address,
					is_default: isDefault,
				},
				token!
			)
			setShowSuccessAlert(true)
			setTimeout(() => {
				navigate('/profile')
			}, 1500)
		} catch (err: any) {
			setErrorMessage(err?.message || 'Gagal memperbarui alamat')
			setShowErrorModal(true)
		} finally {
			setSaving(false)
		}
	}

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-6 md:grid-cols-[200px_1fr]">
					<Sidebar active="akun" onNavigate={navigate} onLogoutClick={handleLogoutClick} />

					<div>
						<div className="mb-6 flex items-center gap-2">
							<button
								type="button"
								onClick={() => navigate('/profile')}
								className="text-neutral-600 hover:text-neutral-800"
								aria-label="Kembali"
							>
								←
							</button>
							<div>
								<h1 className="text-2xl font-semibold text-neutral-900">Edit Alamat</h1>
								<p className="text-sm text-neutral-600">Perbarui detail alamat pengiriman</p>
							</div>
						</div>

						{loading && <p className="text-sm text-neutral-500">Memuat alamat...</p>}

						{!loading && (
							<div className="space-y-6">
								<Card>
									<div className="space-y-4">
										<div>
											<Input
												label="Nama Penerima*"
												value={recipientName}
												onChange={(e) => setRecipientName(e.target.value)}
												placeholder="Contoh: Aya Kartika"
											/>
										</div>
										<div>
											<Input
												label="Nomor Telepon*"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="0819-2345-6789"
											/>
										</div>
										<div>
											<label className="mb-2 block text-sm font-medium text-neutral-700">
												Alamat Lengkap*
											</label>
											<textarea
												value={address}
												onChange={(e) => setAddress(e.target.value)}
												placeholder="Masukkan jalan, blok, RT/RW, kelurahan, kecamatan"
												rows={4}
												className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
											/>
										</div>

										<div className="flex items-center gap-2">
											<input
												type="checkbox"
												id="isDefault"
												checked={isDefault}
												onChange={(e) => setIsDefault(e.target.checked)}
												className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
											/>
											<label htmlFor="isDefault" className="text-sm text-neutral-700">
												Jadikan alamat ini sebagai alamat utama
											</label>
										</div>

										<div className="flex justify-end gap-3">
											<Button
												className="border border-red-600 bg-white text-red-600 hover:bg-red-50"
												onClick={handleCancel}
												disabled={saving}
												variant='light'
											>
												Batalkan
											</Button>
											<Button
												className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
												onClick={handleSave}
												disabled={saving}
											>
												{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
											</Button>
										</div>
									</div>
								</Card>

								<Card className="bg-neutral-50">
									<div className="flex gap-3">
									<div className="shrink-0 text-neutral-600">
											<IconInfo />
										</div>
										<div className="text-sm text-neutral-700">
											<div className="mb-2 font-semibold text-neutral-900">Informasi Penting:</div>
											<ul className="space-y-1 pl-4">
												<li className="list-disc">
													Pastikan nomor telepon dapat dihubungi untuk konfirmasi pengiriman
												</li>
												<li className="list-disc">
													Alamat yang lengkap membantu kurir menemukan lokasi dengan mudah
												</li>
												<li className="list-disc">
													Alamat utama akan digunakan sebagai default saat checkout
												</li>
											</ul>
										</div>
									</div>
								</Card>
							</div>
						)}
					</div>
				</div>
			</div>

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

			<PopupModal
				open={showErrorModal}
				onClose={() => setShowErrorModal(false)}
				icon="error"
				title="Gagal Menyimpan"
				description={errorMessage}
				primaryButton={{
					label: 'Tutup',
					variant: 'filled',
					onClick: () => setShowErrorModal(false),
				}}
			/>

			{showSuccessAlert && (
				<AlertMessage
					variant="success"
					message="Alamat berhasil diperbarui"
					onClose={() => setShowSuccessAlert(false)}
					duration={3000}
				/>
			)}
		</CustomerLayout>
	)
}

export default UpdateAddressPage
