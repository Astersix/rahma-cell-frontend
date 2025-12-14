import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { login } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

const LoginPage = () => {
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()
	const { loginAsUser, loginAsAdmin } = useAuthStore()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			const data = await login({ email, password })
			console.log('Login response:', data) // Debug log
			
			const role = (data.user?.role === 'admin') ? 'admin' : 'customer'
			const token = data.accessToken 
				|| data.token 
				|| (data as any).jwt
				|| (data as any)?.data?.token
				|| (data as any)?.data?.accessToken
				|| null
			
			if (!token) {
				throw new Error('Token tidak ditemukan dalam respons')
			}
			
			if (role === 'admin') {
				loginAsAdmin(token)
			} else {
				loginAsUser(token)
			}
			
			navigate(role === 'admin' ? '/admin/dashboard' : '/homepage')
		} catch (err: any) {
			console.error('Login error:', err) // Debug log
			const message = err?.message || err?.data?.message || 'Gagal masuk. Coba lagi.'
			setError(message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<MainLayout>
			<section className="mx-auto max-w-3xl">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-semibold">Selamat Datang Kembali!</h1>
					<p className="mt-2 text-sm text-neutral-600">
						Akses pesanan Anda, lacak pengiriman, dan berbelanja lebih cepat
					</p>
				</div>

				<Card className="mx-auto max-w-2xl">
					<form className="space-y-4" onSubmit={handleSubmit}>
						<Input
							label="Alamat Email"
							placeholder="Masukkan alamat email Anda"
							value={email}
							onChange={e => setEmail(e.target.value)}
							type="email"
							required
						/>
						<div>
							<label className="mb-1 block text-sm font-medium text-black">Kata Sandi</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder="Masukkan kata sandi Anda"
									value={password}
									onChange={e => setPassword(e.target.value)}
									required
									className="block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm text-black placeholder:text-neutral-400 outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(0,0,0,0.1)]"
								/>
								<button
									type="button"
									aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
									onClick={() => setShowPassword(v => !v)}
									className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:text-neutral-700"
								>
									{showPassword ? (
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.46-1.07 1.12-2.08 1.94-3M10.58 10.58a2 2 0 0 0 2.84 2.84" />
											<path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-.6 1.4-1.4 2.7-2.35 3.88M1 1l22 22" />
										</svg>
									) : (
										<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
											<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
											<circle cx="12" cy="12" r="3" />
										</svg>
									)}
								</button>
							</div>
							<div className="mt-2 text-right">
								<a href="#" className="text-sm text-neutral-600 hover:text-black">Lupa kata sandi?</a>
							</div>
						</div>
						{error && (
							<p className="text-sm text-red-600">{error}</p>
						)}
						<Button
							type="submit"
							fullWidth
							disabled={loading || !email || !password}
							className="rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
						>
							{loading ? 'Memproses...' : 'Masuk'}
						</Button>
						<p className="text-center text-sm text-neutral-700">
							Belum punya akun? <a href="/register" className="font-medium hover:underline">Daftar di sini</a>
						</p>
						<div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
							<div className="flex items-center gap-2">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
								</svg>
								<span>Informasi Anda aman dan tidak akan pernah dibagikan kepada pihak ketiga</span>
							</div>
						</div>
					</form>
				</Card>

				<div className="mt-8 space-y-2 text-center text-xs text-neutral-500">
					<p>
						Butuh bantuan? <a href="#" className="font-medium hover:underline">Hubungi customer service</a>
					</p>
					<p>
						Dengan masuk, Anda menyetujui <a href="#" className="font-medium hover:underline">Syarat & Ketentuan</a> dan <a href="#" className="font-medium hover:underline">Kebijakan Privasi</a>
					</p>
				</div>
			</section>
		</MainLayout>
	)
}

export default LoginPage

