import AdminLayout from '../../layouts/AdminLayout'

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
  return (
    <AdminLayout sidebarActive="orders">
      <div className="mx-auto max-w-full">
        <h1 className="mb-2 text-2xl font-semibold text-black">Pesanan</h1>
        <p className="mb-6 text-sm text-neutral-600">Pantau dan kelola seluruh pesanan pelanggan.</p>

        {/* Filters + Search */}
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'Semua', active: true },
              { label: 'Menunggu Pembayaran' },
              { label: 'Diproses' },
              { label: 'Dikirim' },
              { label: 'Selesai' },
              { label: 'Dibatalkan' },
            ].map((t) => (
              <button
                key={t.label}
                className={`rounded-md px-3 py-1 text-xs font-medium ${t.active ? 'bg-red-600 text-white' : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
              >
                {t.label}
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
              <tr>
                <td className="px-4 py-3">#ORD001</td>
                <td className="px-4 py-3">Ahmad Rizki</td>
                <td className="px-4 py-3">Rp 450.000</td>
                <td className="px-4 py-3">QRIS</td>
                <td className="px-4 py-3"><StatusBadge label="Menunggu Pembayaran" tone="warning" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3">#ORD002</td>
                <td className="px-4 py-3">Siti Nurhaliza</td>
                <td className="px-4 py-3">Rp 320.000</td>
                <td className="px-4 py-3">COD</td>
                <td className="px-4 py-3"><StatusBadge label="Diproses" tone="process" /></td>
              </tr>
              <tr>
                <td className="px-4 py-3">#ORD003</td>
                <td className="px-4 py-3">Ahmad Rizki</td>
                <td className="px-4 py-3">Rp 450.000</td>
                <td className="px-4 py-3">QRIS</td>
                <td className="px-4 py-3"><StatusBadge label="Selesai" tone="success" /></td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-600">
            <div>Menampilkan 1-10 dari 45 pesanan</div>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-neutral-200 px-2 py-1 hover:bg-neutral-50" aria-label="Prev">&lt;</button>
              <button className="rounded-md bg-red-600 px-2 py-1 font-semibold text-white">1</button>
              <button className="rounded-md border border-neutral-200 px-2 py-1 hover:bg-neutral-50">2</button>
              <button className="rounded-md border border-neutral-200 px-2 py-1 hover:bg-neutral-50">3</button>
              <button className="rounded-md border border-neutral-200 px-2 py-1 hover:bg-neutral-50" aria-label="Next">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default OrdersPage
