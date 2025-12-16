import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import PopupModal from '../../components/ui/PopupModal'
import AlertMessage from '../../components/ui/AlertMessage'
import { getMyProfile, updateMyProfile, deleteAddress, type Address } from '../../services/user.service'
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

const IconEdit = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
		<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
	</svg>
)

const IconTrash = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="3 6 5 6 21 6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

const ProfileDetailPage = () => {
	const navigate = useNavigate()
	const token = useAuthStore((s) => s.token)
	const [profile, setProfile] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showLogoutModal, setShowLogoutModal] = useState(false)
	const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
	const [showErrorModal, setShowErrorModal] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [showSuccessAlert, setShowSuccessAlert] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
	const [deleting, setDeleting] = useState(false)

	const [name, setName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [addresses, setAddresses] = useState<Address[]>([])

	// Track original values to detect changes
	const [originalName, setOriginalName] = useState('')
	const [originalPhone, setOriginalPhone] = useState('')
	const [originalEmail, setOriginalEmail] = useState('')

	useEffect(() => {
		async function load() {
			try {
				setLoading(true)
				setError(null)
				const data = await getMyProfile(token!)
				setProfile(data)
				const loadedName = data.name || ''
				const loadedPhone = data.phone || ''
				const loadedEmail = data.email || ''
				
				setName(loadedName)
				setPhone(loadedPhone)
				setEmail(loadedEmail)
				setAddresses(data.address || [])
				
				// Store original values
				setOriginalName(loadedName)
				setOriginalPhone(loadedPhone)
				setOriginalEmail(loadedEmail)
			} catch (err: any) {
				setError(err?.message || 'Gagal memuat profil')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [token])

	// Check if there are any changes
	const hasChanges = 
		name !== originalName || 
		phone !== originalPhone || 
		email !== originalEmail

	function handleSaveClick() {
		// Validate fields are not empty
		if (!name.trim()) {
			setErrorMessage('Nama lengkap tidak boleh kosong')
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
		if (!email.trim()) {
			setErrorMessage('Email tidak boleh kosong')
			setShowErrorModal(true)
			return
		}
		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			setErrorMessage('Format email tidak valid')
			setShowErrorModal(true)
			return
		}
		
		setShowSaveConfirmModal(true)
	}

	async function handleConfirmSave() {
		setShowSaveConfirmModal(false)
		try {
			setSaving(true)
			await updateMyProfile({ name, phone, email }, token!)
			
			// Update original values after successful save
			setOriginalName(name)
			setOriginalPhone(phone)
			setOriginalEmail(email)
			
			setShowSuccessAlert(true)
		} catch (err: any) {
setErrorMessage(err?.message || 'Gagal menyimpan profil')
				setShowErrorModal(true)
		} finally {
			setSaving(false)
		}
	}

	function handleCancelSave() {
		setShowSaveConfirmModal(false)
	}

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

	function handleAddAddress() {
		navigate('/address/add')
	}

	function handleEditAddress(addressId: string) {
		navigate(`/address/edit/${addressId}`)
	}

	function handleDeleteClick(addressId: string) {
		setAddressToDelete(addressId)
		setShowDeleteModal(true)
	}

	async function handleConfirmDelete() {
		if (!addressToDelete || !token) return
		try {
			setDeleting(true)
			// Delete the address
			await deleteAddress(addressToDelete, token)
			// Reload profile to refresh address list
			const data = await getMyProfile(token)
			setAddresses(data.address || [])
			setShowDeleteModal(false)
			setAddressToDelete(null)
			setShowSuccessAlert(true)
		} catch (err: any) {
			setErrorMessage(err?.message || 'Gagal menghapus alamat')
			setShowErrorModal(true)
			setShowDeleteModal(false)
		} finally {
			setDeleting(false)
		}
	}

	function handleCancelDelete() {
		setShowDeleteModal(false)
		setAddressToDelete(null)
	}

	return (
		<CustomerLayout>
			<div className="mx-auto max-w-7xl">
				<div className="grid gap-6 md:grid-cols-[200px_1fr]">
					<Sidebar active="akun" onNavigate={navigate} onLogoutClick={handleLogoutClick} />

					<div>
						<div className="mb-6">
							<h1 className="text-2xl font-semibold text-neutral-900">Profil</h1>
							<p className="text-sm text-neutral-600">
								Kelola informasi akun, alamat pengiriman, dan riwayat pesanan Anda.
							</p>
						</div>

						{loading && <p className="text-sm text-neutral-500">Memuat profil...</p>}
						{error && <p className="mb-4 text-sm text-red-600">{error}</p>}

						{!loading && profile && (
							<div className="space-y-6">
								{/* Informasi Profil */}
								<Card>
									<h2 className="mb-4 text-base font-semibold text-neutral-900">Informasi Profil</h2>
									<div className="space-y-4">
										{/* Profile Picture */}
										<div className="flex items-center gap-4">
											<div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-neutral-200 bg-neutral-50">
												<svg
													width="32"
													height="32"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="text-neutral-400"
												>
													<path d="M20 21a8 8 0 0 0-16 0" />
													<circle cx="12" cy="7" r="4" />
												</svg>
											</div>
											<div>
												<div className="mb-1 text-xs font-medium text-neutral-700">Ubah Foto</div>
												<button className="text-xs text-blue-600 hover:underline">Upload Foto</button>
											</div>
										</div>

										{/* Form Fields */}
										<div>
											<Input
												label="Nama Lengkap"
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="Masukkan nama lengkap"
											/>
										</div>
										<div>
											<Input
												label="Nomor Telepon"
												value={phone}
												onChange={(e) => setPhone(e.target.value)}
												placeholder="Masukkan nomor telepon"
											/>
										</div>
										<div>
											<Input
												label="Email"
												type="email"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												placeholder="Masukkan email"
											/>
										</div>

										<div className="flex justify-end">
											<Button
												className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-400 disabled:cursor-not-allowed"
												onClick={handleSaveClick}
												disabled={saving || !hasChanges}
											>
												{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
											</Button>
										</div>
									</div>
								</Card>

								{/* Alamat Saya */}
								<Card>
									<div className="mb-4 flex items-center justify-between">
										<h2 className="text-base font-semibold text-neutral-900">Alamat Saya</h2>
									<button
										type="button"
										onClick={handleAddAddress}
										className="text-sm text-blue-600 hover:underline"
									>
										+ Tambah Alamat
									</button>
									</div>
									<div className="text-xs text-neutral-600 mb-4">
										Simpan dan kelola alamat pengiriman untuk checkout yang lebih cepat
									</div>
									<div className="space-y-3">
										{addresses.length === 0 ? (
											<div className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
												Belum ada alamat tersimpan
											</div>
										) : (
											addresses.map((addr) => (
												<div
													key={addr.id}
													className="flex items-start justify-between rounded-md border border-neutral-200 p-4"
												>
													<div className="flex-1 text-sm">
														<div className="mb-1 font-semibold text-neutral-900">
															{addr.recipient_name}
														</div>
														<div className="text-neutral-700">
															<strong>Alamat:</strong> {addr.address}
														</div>
														<div className="text-neutral-700">
															<strong>Telepon:</strong> {addr.phone}
														</div>
													</div>
													<div className="flex items-center gap-2">
														<button
																type="button"
																onClick={() => handleEditAddress(addr.id)}
																className="rounded p-1.5 text-neutral-600 hover:bg-red-50 hover:text-red-600"
																aria-label="Edit"
															>
																<IconEdit />
															</button>
															<button
																type="button"
																onClick={() => handleDeleteClick(addr.id)}
															className="rounded p-1.5 text-neutral-600 hover:bg-red-50 hover:text-red-600"
															aria-label="Hapus"
														>
															<IconTrash />
														</button>
													</div>
												</div>
											))
										)}
									</div>
								</Card>

								{/* Keamanan Akun */}
								<Card>
									<h2 className="mb-4 text-base font-semibold text-neutral-900">Keamanan Akun</h2>
									<div className="flex items-center justify-between rounded-md border border-neutral-200 p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
												<IconLock />
											</div>
											<div className="text-sm">
												<div className="font-medium text-neutral-900">Ubah Password</div>
												<div className="text-xs text-neutral-600">
													Anda perlu login ulang setelah mengubah password
												</div>
											</div>
										</div>
										<button className="text-sm text-blue-600 hover:underline">Ubah</button>
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
				open={showSaveConfirmModal}
				onClose={handleCancelSave}
				icon="warning"
				title="Apakah Anda yakin ingin menyimpan perubahan?"
				description="Tindakan ini tidak dapat dibatalkan"
				primaryButton={{
					label: 'Kembali',
					variant: 'filled',
					onClick: handleCancelSave,
				}}
				secondaryButton={{
					label: 'Simpan',
					variant: 'outlined',
					onClick: handleConfirmSave,
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

			<PopupModal
				open={showDeleteModal}
				onClose={handleCancelDelete}
				icon="warning"
				title="Hapus Alamat?"
				description="Alamat yang dihapus tidak dapat dikembalikan"
				primaryButton={{
					label: 'Batal',
					variant: 'filled',
					onClick: handleCancelDelete,
				}}
				secondaryButton={{
					label: deleting ? 'Menghapus...' : 'Hapus',
					variant: 'outlined',
					onClick: handleConfirmDelete,
				}}
			/>

			{showSuccessAlert && (
				<AlertMessage
					variant="success"
					message="Profil Anda telah berhasil diperbarui"
					onClose={() => setShowSuccessAlert(false)}
					duration={3000}
				/>
			)}
		</CustomerLayout>
	)
}

export default ProfileDetailPage
