import AdminLayout from '../../layouts/AdminLayout'
import ButtonIcon from '../../components/ui/ButtonIcon'

const sampleProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', category: 'Handphone', variants: 3, stock: 8, status: 'Aktif' },
  { id: 2, name: 'Samsung Galaxy S24', category: 'Handphone', variants: 4, stock: 25, status: 'Aktif' },
  { id: 3, name: 'Case iPhone 15', category: 'Aksesoris', variants: 6, stock: 150, status: 'Tidak Aktif' },
]

const ProductsPage = () => {
  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-full">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">Produk</h1>
          <p className="mt-2 text-sm text-neutral-600">Kelola katalog produk, variasi, dan stok.</p>
        </div>

        {/* Controls row 1 */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 pl-9 text-sm text-black placeholder:text-neutral-400 outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ButtonIcon
              variant="light"
              size="md"
              icon="csv"
              className="border border-neutral-300 text-black hover:bg-neutral-50 active:bg-neutral-100"
            >
              Impor CSV
            </ButtonIcon>
            <ButtonIcon
              variant="dark"
              size="md"
              icon="plus"
              className="hover:bg-neutral-800 active:bg-neutral-900"
            >
              Tambah Produk
            </ButtonIcon>
          </div>
        </div>

        {/* Controls row 2 */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <div className="flex gap-4">
            <div className="relative w-48">
              <select className="w-full appearance-none rounded-md border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm text-black outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]">
                <option>Semua Kategori</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
            <div className="relative w-48">
              <select className="w-full appearance-none rounded-md border border-neutral-200 bg-white px-3 py-2 pr-8 text-sm text-black outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]">
                <option>Semua Status</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3 font-medium">Gambar Utama</th>
                <th className="px-4 py-3 font-medium">Nama Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Jumlah Varian</th>
                <th className="px-4 py-3 font-medium">Total Stok</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {sampleProducts.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-200 text-[10px] font-medium text-neutral-600">IMG</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.category}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.variants}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={p.status === 'Aktif' ? 'inline-flex rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800' : 'inline-flex rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-500'}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
            <span>Menampilkan 1-10 dari 45 produk</span>
            <div className="flex items-center gap-1">
              <ButtonIcon
                aria-label="Prev"
                icon="arrow-left"
                size="sm"
                variant="light"
                className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
              />
              <button className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">1</button>
              <button className="h-8 w-8 rounded-md bg-black text-white">2</button>
              <button className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50">3</button>
              <ButtonIcon
                aria-label="Next"
                icon="arrow-right"
                size="sm"
                variant="light"
                className="h-8 w-8 p-0 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100"
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ProductsPage
