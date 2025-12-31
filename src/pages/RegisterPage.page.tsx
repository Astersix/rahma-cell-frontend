import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AlertMessage from '../components/ui/AlertMessage'
import { register, checkPhoneExists } from '../services/auth.service'
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [agree, setAgree] = useState(false)
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [alert, setAlert] = useState<{ variant: 'success' | 'error'; message: string } | null>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!agree) return

        // Validate phone input on submit: must contain only digits
        const cleanedPhone = phone.replace(/\D/g, '')
        if (!cleanedPhone || cleanedPhone !== phone) {
            const message = 'Nomor telepon tidak valid. Hanya angka yang diperbolehkan.'
            setError(message)
            return
        }

        // Validate lengths
        if ((name || '').trim().length < 3) {
            const message = 'Nama minimal 3 karakter.'
            setError(message)
            setAlert({ variant: 'error', message })
            return
        }

        if ((password || '').length < 8) {
            const message = 'Kata sandi minimal 8 karakter.'
            setError(message)
            setAlert({ variant: 'error', message })
            return
        }

        if (cleanedPhone.length < 11) {
            const message = 'Nomor telepon minimal 11 angka.'
            setError(message)
            setAlert({ variant: 'error', message })
            return
        }

        setError(null)
        setAlert(null)
        setLoading(true)
        try {
            // Check phone uniqueness
            const exists = await checkPhoneExists(cleanedPhone)
            if (exists) {
                const message = 'Nomor telepon sudah terdaftar.'
                setError(message)
                setLoading(false)
                return
            }

            const res = await register({ name, phone: cleanedPhone, email, password, role: 'customer' })

            const successMsg = (res as any)?.message || 'Registrasi berhasil. Silakan masuk.'
            setAlert({ variant: 'success', message: successMsg })
            setLoading(false)

            // Wait for the alert duration (3s) then redirect to login
            setTimeout(() => navigate('/login'), 3000)
        } catch (err: any) {
            const message = err?.message || err?.data?.message || 'Registrasi gagal. Coba lagi.'
            setError(message)
            setAlert({ variant: 'error', message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <MainLayout>
            {alert && (
                <AlertMessage
                    variant={alert.variant}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                    duration={3000}
                />
            )}
            <section className="mx-auto max-w-3xl pb-10 min-h-screen">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold">Bergabung dengan CV Rahma Cell</h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Belanja lebih cerdas dan lacak pesanan Anda dengan mudah
                    </p>
                </div>

                <Card className="mx-auto max-w-2xl">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <Input label="Nama Lengkap *" placeholder="contoh: Dinda Rahmawati" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="md:col-span-2">
                                <Input label="Nomor Telepon *" placeholder="contoh: 081234567890" value={phone} onChange={e => setPhone(e.target.value)} required />
                            </div>
                            <div className="md:col-span-2">
                                <Input label="Alamat Email *" placeholder="contoh: dinda@example.com" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                            </div>
                            <div className="md:col-span-2">
                                <label className="mb-1 block text-sm font-medium text-black">Kata Sandi *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Buat kata sandi yang kuat"
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
                                            <EyeSlashIcon className="w-[18px] h-[18px]" />
                                        ) : (
                                            <EyeIcon className="w-[18px] h-[18px]" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={agree}
                                onChange={e => setAgree(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                            />
                            <label htmlFor="terms" className="text-xs text-neutral-700">
                                Saya setuju dengan <a href="#" className="font-medium hover:underline">Syarat Ketentuan</a>
                            </label>
                        </div>

                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        <Button
                            type="submit"
                            fullWidth
                            disabled={!agree || loading || !name || !phone || !email || !password}
                            className="rounded-md bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Daftar'}
                        </Button>

                        <p className="text-center text-sm text-neutral-700">
                            Sudah punya akun? <a href="/login" className="font-medium hover:underline">Masuk di sini</a>
                        </p>

                        <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-600">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-neutral-700" />
                                <span>Informasi Anda aman dan tidak akan pernah dibagikan kepada pihak ketiga</span>
                            </div>
                        </div>
                    </form>
                </Card>
            </section>
        </MainLayout>
    )
}

export default RegisterPage
