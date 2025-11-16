import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import ButtonIcon from '../../components/ui/ButtonIcon'
import { getAllProduct, getVariantsByProductId, type Product } from '../../services/product.service'
import ImportFilePopup from '../../components/ui/ImportFile'
import { getAllCategories, type Category } from '../../services/category.service'
import { useAuthStore } from '../../store/auth.store'

const ProductsPage = () => {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { refreshAfter?: string; deletedId?: string } } as any
  const { token } = useAuthStore()
  const [query, setQuery] = useState('')
  type ProductRow = Product & { variantCount?: number; totalStock?: number; category_name?: string }
  const [items, setItems] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>({})

  useEffect(() => {
    let canceled = false
    async function run(initial = false) {
      setLoading(true)
      setError(null)
      try {
        // Fetch categories (admin-only) in parallel to map id -> name
        const [catRes, prodRes] = await Promise.all([
          getAllCategories(token || undefined).catch(() => ({ data: [] as Category[] } as any)),
          getAllProduct(),
        ])
        const cmap: Record<string, string> = {}
        for (const c of catRes?.data || []) {
          if (c?.id) cmap[String(c.id)] = c.name
        }
        if (!canceled) setCategoriesMap(cmap)

        const res = prodRes
        let list: ProductRow[] = (res.data || []).map((p: any) => {
          const id = String(p.id ?? p.product_id ?? p.productId ?? '')
          // if variants are included, compute counts immediately
          const variants = Array.isArray(p.product_variant) ? p.product_variant : []
          const variantCount = variants.length || undefined
          const totalStock = variants.length ? variants.reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0) : undefined
          const category_name = cmap[String(p.category_id ?? '')] || undefined
          return {
            ...p,
            id,
            variantCount,
            totalStock,
            category_name,
          }
        })
        // Optimistically hide the just-deleted product if we were navigated here from a delete
        if (location?.state?.refreshAfter === 'delete' && location?.state?.deletedId) {
          const delId = String(location.state.deletedId)
          list = list.filter((p) => String(p.id) !== delId)
        }
        if (!canceled) setItems(list)

        // For items without variantCount/totalStock (API didn't include variants), fetch variants per product
        const needVariantFetch = list.filter((p) => p.variantCount == null || p.totalStock == null)
        if (needVariantFetch.length) {
          const results = await Promise.all(
            needVariantFetch.map(async (p) => {
              try {
                const vres = await getVariantsByProductId(String(p.id))
                const variants = vres.data || []
                return { id: p.id, variantCount: variants.length, totalStock: variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) }
              } catch {
                return { id: p.id, variantCount: 0, totalStock: 0 }
              }
            }),
          )
          if (!canceled) {
            setItems((prev) =>
              prev.map((p) => {
                const found = results.find((r) => String(r.id) === String(p.id))
                if (!found) return p
                return { ...p, variantCount: found.variantCount, totalStock: found.totalStock }
              }),
            )
          }
        }
      } catch (err: any) {
        if (!canceled) setError(err?.message || 'Gagal memuat produk')
      } finally {
        if (!canceled) setLoading(false)
      }
      // After an optimistic hide, reconcile with a follow-up fetch to reflect backend completion
      if (initial && location?.state?.refreshAfter === 'delete') {
        // Clear the navigation state so future visits don't keep filtering
        navigate('.', { replace: true, state: null })
        setTimeout(() => {
          if (!canceled) run(false)
        }, 700)
      }
    }
    run(true)
    return () => {
      canceled = true
    }
  }, [navigate, location?.state])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }, [items, query])

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
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
              onClick={() => setShowImport(true)}
            >
              Impor CSV
            </ButtonIcon>
            <ButtonIcon
              variant="dark"
              size="md"
              icon="plus"
              className="hover:bg-neutral-800 active:bg-neutral-900"
              onClick={() => navigate('/admin/products/new')}
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
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => p.id && navigate(`/admin/products/${encodeURIComponent(String(p.id))}`)}>
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-200 text-[10px] font-medium text-neutral-600">IMG</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.category_name || categoriesMap[String(p.category_id)] || '-'}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.variantCount != null ? p.variantCount : '-'}</td>
                  <td className="px-4 py-3 text-neutral-700">{p.totalStock != null ? p.totalStock : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={'inline-flex rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800'}>
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-xs text-neutral-600">
            <span>{loading ? 'Memuat...' : error ? error : `Menampilkan ${filtered.length} produk`}</span>
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
      <ImportFilePopup
        open={showImport}
        onClose={() => !uploading && setShowImport(false)}
        uploading={uploading}
        onImport={async (file) => {
          // Placeholder: integrate with backend upload endpoint
          try {
            setUploading(true)
            // Simulate upload latency
            await new Promise(r => setTimeout(r, 800))
            console.log('Imported file:', file.name)
          } finally {
            setUploading(false)
          }
        }}
      />
    </AdminLayout>
  )
}

export default ProductsPage
