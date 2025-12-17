import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CustomerLayout from '../../layouts/CustomerLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import PopupModal from '../../components/ui/PopupModal'
import { orderService } from '../../services/order.service'
import { paymentService } from '../../services/payment.service'

function formatIDR(n?: number) {
  if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
  return 'Rp ' + n.toLocaleString('id-ID')
}

const QrisPaymentPage = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()

  // no explicit loading UI; keep page responsive
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [paymentExpiry, setPaymentExpiry] = useState<Date | null>(null)
  const [timer, setTimer] = useState<number>(15 * 60) // 15 minutes
  const [statusLabel, setStatusLabel] = useState<string>('Menunggu Pembayaran')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFailureModal, setShowFailureModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const items = useMemo(() => (Array.isArray(order?.order_product) ? order.order_product : []), [order])
  const subtotal = useMemo(() => items.reduce((s: number, it: any) => s + (Number(it?.price) || 0) * (Number(it?.quantity) || 0), 0), [items])

  async function handleCancelOrder() {
    if (!orderId || canceling) return
    try {
      setCanceling(true)
      await orderService.cancelOrder(orderId)
      // Clean up localStorage when order is canceled
      localStorage.removeItem(`payment-expiry-${orderId}`)
      setShowCancelModal(false)
      navigate('/orders')
    } catch (e: any) {
      setError(e?.message || 'Gagal membatalkan pesanan')
      setShowCancelModal(false)
    } finally {
      setCanceling(false)
    }
  }

  useEffect(() => {
    let mounted = true
    
    async function init() {
      if (!orderId) return
      try {
        // Find order from my orders
        const res = await orderService.getMyOrders()
        const list = (res?.data ?? res) as any[]
        const found = Array.isArray(list) ? list.find((o) => String(o.id) === String(orderId)) : null
        if (mounted) setOrder(found || null)
        
        // Initiate QRIS payment (backend will return existing if already created)
        const qrRes = await paymentService.initiateQris(orderId)
        
        // Extract QR URL from response (prioritize new structure)
        const url =
          qrRes?.data?.qr?.url ||
          qrRes?.data?.payment?.qr_code ||
          null
        
        if (mounted && typeof url === 'string') {
          setQrUrl(url)
        }

        // Set payment expiry time (persist across refresh using localStorage)
        if (mounted) {
          const storageKey = `payment-expiry-${orderId}`
          let expiry: Date
          
          // Check localStorage first for existing expiry
          const storedExpiry = localStorage.getItem(storageKey)
          if (storedExpiry) {
            expiry = new Date(storedExpiry)
          } else {
            // Try to get expiry from backend response
            const expiryStr = qrRes?.data?.qr?.expiry || qrRes?.data?.payment?.expiry_time
            
            if (expiryStr) {
              expiry = new Date(expiryStr)
            } else {
              // If no expiry from backend, set 15 minutes from now
              expiry = new Date(Date.now() + 15 * 60 * 1000)
            }
            
            // Store expiry in localStorage for persistence across refresh
            localStorage.setItem(storageKey, expiry.toISOString())
          }
          
          setPaymentExpiry(expiry)
        }

        // Start polling payment status in background
        paymentService.waitForSettlement(orderId, { intervalMs: 3000, timeoutMs: 30 * 60 * 1000 }).then((p) => {
          if (!mounted) return
          const st = (p?.payment?.status || '').toString().toLowerCase()
          if (['settlement', 'capture', 'paid', 'success'].includes(st)) {
            setStatusLabel('Pembayaran Berhasil')
            setShowSuccessModal(true)
            // Clean up localStorage when payment succeeds
            localStorage.removeItem(`payment-expiry-${orderId}`)
          } else if (['failed', 'expire', 'cancel'].includes(st)) {
            setStatusLabel('Pembayaran Gagal/Kedaluwarsa')
          }
        })
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Gagal memuat pembayaran')
        }
      }
    }
    
    init()
    
    return () => {
      mounted = false
    }
  }, [orderId, navigate])

  useEffect(() => {
    if (!paymentExpiry) return
    
    const updateTimer = () => {
      const now = Date.now()
      const expiry = paymentExpiry.getTime()
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000))
      
      setTimer(remaining)
      
      if (remaining === 0 && statusLabel !== 'Pembayaran Berhasil') {
        setStatusLabel('Pembayaran Kedaluwarsa')
        setShowFailureModal(true)
        // Clean up localStorage when payment expires
        if (orderId) {
          localStorage.removeItem(`payment-expiry-${orderId}`)
        }
      }
    }
    
    // Update immediately
    updateTimer()
    
    // Update every second
    const interval = setInterval(updateTimer, 1000)
    
    return () => clearInterval(interval)
  }, [paymentExpiry, statusLabel])

  const hh = String(Math.floor(timer / 3600)).padStart(2, '0')
  const mm = String(Math.floor((timer % 3600) / 60)).padStart(2, '0')
  const ss = String(timer % 60).padStart(2, '0')

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-black">Pembayaran</h1>
          <p className="text-sm text-neutral-600">Selesaikan pembayaran Anda untuk memproses pesanan.</p>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {/* Status */}
            <Card className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold text-neutral-900">Status Pesanan</div>
                <div className="text-xs font-semibold text-amber-600">{statusLabel}</div>
              </div>
              <div className="flex items-center gap-4 px-4 pb-4 text-xs text-neutral-700">
                <div className="inline-flex items-center gap-2"><span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">ID Pesanan</span> <span>#{order?.id || orderId}</span></div>
                {order?.invoice && <div className="inline-flex items-center gap-2"><span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">INV</span> <span>{String(order?.invoice)}</span></div>}
              </div>
            </Card>

            {/* Rincian Pembayaran */}
            <Card className="p-0">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold text-neutral-900">Rincian Pembayaran</div>
                <div className="text-sm font-semibold text-neutral-900">Total Pembayaran <span className="ml-3">{formatIDR(Number(order?.total) || subtotal)}</span></div>
              </div>
              <div className="px-4 pb-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 p-6">
                  <div className="mb-3 h-48 w-48 rounded-md bg-neutral-100 p-2">
                    {qrUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrUrl} alt="QR Code" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-500">QR Code</div>
                    )}
                  </div>
                  <div className="mb-2 text-lg font-bold tracking-wider text-neutral-900">{hh}:{mm}:{ss}</div>
                  <div className="text-center text-xs text-neutral-600">Pindai kode QR di atas menggunakan m-banking atau e-wallet Anda. Status pesanan akan berubah menjadi "Diproses" secara otomatis setelah pembayaran terkonfirmasi.</div>
                </div>
                <div className="mt-4">
                  <Button 
                    fullWidth 
                    className="bg-red-600 hover:bg-red-700 active:bg-red-800"
                    onClick={() => setShowCancelModal(true)}
                    disabled={canceling || statusLabel === 'Pembayaran Berhasil'}
                  >
                    Batalkan Pesanan
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <div className="text-sm font-semibold text-neutral-900">Pembaruan Otomatis</div>
              <div className="mt-2 text-xs text-neutral-600">Status akan berubah otomatis setelah sistem menerima notifikasi pembayaran.</div>
            </Card>
          </div>

          {/* Ringkasan Pesanan */}
          <div>
            <Card className="p-0">
              <div className="px-4 py-3 text-sm font-semibold text-neutral-900">Ringkasan Pesanan</div>
              <div className="space-y-3 px-4 pb-3">
                {items.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">Produk</div>
                      <div className="leading-snug text-neutral-700">
                        <div className="font-medium text-neutral-800">{it?.name || 'Produk'}</div>
                        <div className="text-neutral-600">Qty: {Number(it?.quantity) || 1}</div>
                      </div>
                    </div>
                    <div className="text-neutral-800">{formatIDR((Number(it?.price) || 0) * (Number(it?.quantity) || 1))}</div>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm">
                  <span className="font-medium text-neutral-800">Subtotal</span>
                  <span className="font-semibold text-neutral-900">{formatIDR(subtotal)}</span>
                </div>
                <div className="-mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-700">Total</span>
                  <span className="font-semibold text-neutral-900">{formatIDR(Number(order?.total) || subtotal)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-neutral-700">
                  <span>Metode Pembayaran</span>
                  <span className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2 py-0.5">QRIS</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PopupModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          navigate('/orders')
        }}
        icon="success"
        title="Pembayaran Berhasil!"
        description="Pesanan Anda sedang diproses. Anda akan diarahkan ke halaman riwayat pesanan."
        primaryButton={{
          label: 'Lihat Pesanan',
          variant: 'filled',
          onClick: () => {
            setShowSuccessModal(false)
            navigate('/orders')
          },
        }}
      />

      <PopupModal
        open={showFailureModal}
        onClose={() => {
          setShowFailureModal(false)
          navigate('/orders')
        }}
        icon="error"
        title="Pembayaran Gagal"
        description="Waktu pembayaran telah habis. Silakan buat pesanan baru untuk melanjutkan."
        primaryButton={{
          label: 'Kembali ke Pesanan',
          variant: 'filled',
          onClick: () => {
            setShowFailureModal(false)
            navigate('/orders')
          },
        }}
      />

      <PopupModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        icon="warning"
        title="Batalkan Pesanan?"
        description="Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan."
        primaryButton={{
          label: 'Tidak, Kembali',
          variant: 'filled',
          onClick: () => setShowCancelModal(false),
        }}
        secondaryButton={{
          label: 'Ya, Batalkan',
          variant: 'outlined',
          onClick: handleCancelOrder,
        }}
      />
    </CustomerLayout>
  )
}

export default QrisPaymentPage
