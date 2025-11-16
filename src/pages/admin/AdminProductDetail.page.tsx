import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import DeleteProductPopup from '../../components/ui/DeleteProductPopup'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { deleteProduct, getProductById, getVariantsByProductId, type ProductVariant } from '../../services/product.service'
import { useAuthStore } from '../../store/auth.store'
import { getCategoryById } from '../../services/category.service'

const AdminProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])

  useEffect(() => {
    if (!id) return
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await getProductById(id as string)
        const p = res.data
        setName(p?.name ?? '')
        setDescription(p?.description ?? '')
        const catId = p?.category_id ?? ''
        // fetch variants for this product
        const vres = await getVariantsByProductId(id as string, token || undefined)
        setVariants(vres.data || [])
        // fetch category name (admin endpoint)
        if (catId) {
          try {
            const cres = await getCategoryById(String(catId), token || undefined)
            setCategoryName(cres?.data?.name || '')
          } catch {
            setCategoryName('')
          }
        } else {
          setCategoryName('')
        }
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat detail produk')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id, token])

  function confirmDelete() {
    if (!id) return
    setShowDelete(false)
    // Navigate immediately to the products list
    navigate('/admin/products', { state: { refreshAfter: 'delete', deletedId: id } })
    // Fire-and-forget deletion in the background
    deleteProduct(id, token || undefined).catch(() => {
      // Optionally report through a global toast/log; ignored here to keep UX snappy
    })
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button className="mb-2 text-sm text-neutral-600 hover:text-black" onClick={() => navigate(-1)}>&larr; Kembali</button>
            <h1 className="text-2xl font-semibold text-black">Detail Produk</h1>
            <p className="mt-1 text-sm text-neutral-600">Lihat detail produk dan prediksi kebutuhan stok.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(`/admin/products/${encodeURIComponent(id || '')}/edit`)} className="text-black border border-neutral-300 hover:bg-neutral-50">Edit Produk</Button>
            <Button onClick={() => setShowDelete(true)} className="bg-red-500 hover:bg-red-600 active:bg-red-700 border border-red-300">Hapus Produk</Button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        {loading && <p className="mb-4 text-sm text-neutral-500">Memuat...</p>}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informasi Produk */}
          <Card>
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-md bg-neutral-100 text-xs text-neutral-500">Product Image</div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-neutral-500">Nama Produk</div>
                  <div className="font-medium text-neutral-900">{name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Deskripsi Produk</div>
                  <div className="text-neutral-700">{description || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Kategori</div>
                  <div className="text-neutral-700">{categoryName || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Status</div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Tersedia
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Daftar Varian */}
          <Card>
            <div className="mb-3 text-sm font-semibold text-neutral-800">Daftar Varian Produk</div>
            {(!variants || variants.length === 0) ? (
              <div className="text-sm text-neutral-500">Belum ada data varian.</div>
            ) : (
              <div className="overflow-hidden rounded-md border border-neutral-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Nama Varian</th>
                      <th className="px-3 py-2 font-medium">Harga</th>
                      <th className="px-3 py-2 font-medium">Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {variants.map((v) => (
                      <tr key={v.id}>
                        <td className="px-3 py-2 text-neutral-900">{v.variant_name || '-'}</td>
                        <td className="px-3 py-2 text-neutral-700">{typeof v.price === 'number' ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v.price) : '-'}</td>
                        <td className="px-3 py-2 text-neutral-700">{v.stock ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Gambar Produk (placeholder grid) */}
          <Card className="md:col-span-1">
            <div className="mb-3 text-sm font-semibold text-neutral-800">Gambar Produk</div>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-16 rounded-md ${i === 0 ? 'ring-1 ring-red-500' : 'bg-neutral-100'}`}></div>
              ))}
            </div>
          </Card>

          {/* Prediksi Kebutuhan Stok (placeholder) */}
          <Card>
            <div className="mb-3 text-sm font-semibold text-neutral-800">Prediksi Kebutuhan Stok</div>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>Perkiraan Penjualan Bulan Depan: 75 unit</li>
              <li>Rekomendasi Stok Minimum: 90 unit</li>
            </ul>
            <div className="mt-3 rounded-md bg-neutral-50 p-2 text-xs text-neutral-500">
              Prediksi dihitung menggunakan model SVM berdasarkan histori penjualan (placeholder).
            </div>
            <Button className="mt-3 bg-red-500 hover:bg-red-600">Refresh prediksi</Button>
          </Card>
        </div>
      </div>
      <DeleteProductPopup
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Hapus produk ini?"
        description="Tindakan ini tidak dapat dibatalkan."
        confirmLabel={deleting ? 'Menghapus...' : 'Hapus'}
        cancelLabel="Batalkan"
      />
    </AdminLayout>
  )
}

export default AdminProductDetailPage
