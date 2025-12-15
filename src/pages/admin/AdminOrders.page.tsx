import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import ButtonIcon from '../../components/ui/ButtonIcon'
import { orderService } from '../../services/order.service'

type OrderRow = {
  id: string | number
  user_name?: string
  total?: number
  payment_method?: string
  status?: string
  created_at?: string
}

const StatusBadge = ({ label, tone }: { label: string; tone: 'warning' | 'process' | 'success' }) => {
  const classes =
    tone === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : tone === 'process'
        ? 'bg-orange-100 text-orange-700'
        : 'bg-emerald-100 text-emerald-700'
  return <span className={`rounded px-2 py-0.5 text-xs font-semibold ${classes}`}>{label}</span>
}

const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { refreshAfter?: string } } as any
  const [items, setItems] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'menunggu_konfirmasi' | 'menunggu_pembayaran' | 'diproses' | 'dikirim' | 'selesai' | 'batal'>('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  async function loadOrders() {
    setLoading(true)
    setError(null)
    try {
      // Admin: fetch all orders
      const res: any = await orderService.getAllOrdersAdmin({ page: 1, limit: 100 })
      const list = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []
      const rows: OrderRow[] = list.map((o: any) => ({
        id: o?.id,
        user_name: o?.user?.name || o?.user_name,
        total: Number(o?.total) || 0,
        payment_method: o?.payment_method || o?.payment?.method || 'qris',
        status: (o?.status || '').toString().toLowerCase(),
        created_at: o?.created_at,
      }))
      setItems(rows)
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [location?.state])

  // Clear refresh flag and reload softly
  useEffect(() => {
    if (location?.state?.refreshAfter) {
      navigate('.', { replace: true, state: null })
      // optional small delay to ensure state cleared
      setTimeout(() => loadOrders(), 300)
    }
  }, [location, navigate])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let base = items
    if (tab !== 'all') base = base.filter(o => (o.status || '') === tab)
    if (!q) return base
    return base.filter(o => String(o.id).toLowerCase().includes(q) || (o.user_name || '').toLowerCase().includes(q))
  }, [items, query, tab])

  useEffect(() => { setPage(1) }, [query, tab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const statuses = [
    { key: 'all', label: 'Semua' },
    { key: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
    { key: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
    { key: 'diproses', label: 'Diproses' },
    { key: 'dikirim', label: 'Dikirim' },
    { key: 'selesai', label: 'Selesai' },
    { key: 'batal', label: 'Dibatalkan' },
  ] as const

  function formatIDR(n?: number) {
    if (typeof n !== 'number' || isNaN(n)) return 'Rp —'
    return 'Rp ' + n.toLocaleString('id-ID')
  }

  return (
    <AdminLayout sidebarActive="orders">
      <div className="mx-auto max-w-full">
        <h1 className="mb-2 text-2xl font-semibold text-black">Pesanan</h1>
        <p className="mb-6 text-sm text-neutral-600">Pantau dan kelola seluruh pesanan pelanggan.</p>

        {/* Filters + Search */}
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => (
              <button
                key={s.key}
                onClick={() => setTab(s.key)}
                className={`rounded-md px-3 py-1 text-xs font-medium ${tab === s.key ? 'bg-red-600 text-white' : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Cari berdasarkan ID Pesanan atau Nama Pelanggan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-md border border-neutral-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID Pesanan</th>
                <th className="px-4 py-3 font-medium">Nama Pelanggan</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Metode Pembayaran</th>
                <th className="px-4 py-3 font-medium">Status Pesanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {loading && (
                <tr><td className="px-4 py-3" colSpan={5}>Memuat…</td></tr>
              )}
              {error && !loading && (
                <tr><td className="px-4 py-3 text-red-600" colSpan={5}>{error}</td></tr>
              )}
              {!loading && !error && paginated.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => navigate(`/admin/orders/${encodeURIComponent(String(o.id))}`)}>
                  <td className="px-4 py-3">#{o.id}</td>
                  <td className="px-4 py-3">{o.user_name || '-'}</td>
                  <td className="px-4 py-3">{formatIDR(o.total)}</td>
                  <td className="px-4 py-3">{(o.payment_method || '').toUpperCase()}</td>
                  <td className="px-4 py-3">
                    {o.status === 'menunggu_konfirmasi' ? <StatusBadge label="Menunggu Konfirmasi" tone="warning" />
                      : o.status === 'menunggu_pembayaran' ? <StatusBadge label="Menunggu Pembayaran" tone="warning" />
                      : o.status === 'diproses' ? <StatusBadge label="Diproses" tone="process" />
                      : o.status === 'dikirim' ? <StatusBadge label="Dikirim" tone="process" />
                      : o.status === 'selesai' ? <StatusBadge label="Selesai" tone="success" />
                      : o.status === 'batal' ? <StatusBadge label="Dibatalkan" tone="warning" />
                      : <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">{o.status}</span>}
                  </td>
                </tr>
              ))}
              {!loading && !error && paginated.length === 0 && (
                <tr><td className="px-4 py-3" colSpan={5}>Tidak ada pesanan</td></tr>
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-600">
            <div>{loading ? 'Memuat…' : error ? error : `Menampilkan ${paginated.length} dari ${filtered.length} pesanan`}</div>
            <div className="flex items-center gap-1">
              <ButtonIcon
                aria-label="Prev"
                icon="arrow-left"
                size="sm"
                variant="light"
                className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                onClick={() => setPage(p => Math.max(1, p - 1))}
              />
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pnum = idx + 1
                const active = pnum === page
                return (
                  <button
                    key={pnum}
                    onClick={() => setPage(pnum)}
                    className={active
                      ? 'h-8 w-8 rounded-md bg-black text-white'
                      : 'h-8 w-8 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'}
                  >
                    {pnum}
                  </button>
                )
              })}
              <ButtonIcon
                aria-label="Next"
                icon="arrow-right"
                size="sm"
                variant="light"
                className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default OrdersPage
