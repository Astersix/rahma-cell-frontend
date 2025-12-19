import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import DeleteProductPopup from '../../components/ui/DeleteProductPopup'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { deleteProductWithVariants, getProductById, getVariantsByProductId, type ProductVariant, predictVariantStock } from '../../services/product.service'
import { useAuthStore } from '../../store/auth.store'
import { getCategoryById, getAllCategories } from '../../services/category.service'

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
  const [deleting, setDeleting] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null)
  const [predictionData, setPredictionData] = useState<any>(null)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

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
        const vres = await getVariantsByProductId(id as string)
        const vs = vres.data || []
        setVariants(vs)
        // derive main image: first thumbnail among variants; fallback first image of first variant
        let main: string | null = null
        for (const v of vs) {
          if (Array.isArray(v.product_image) && v.product_image.length) {
            const thumb = v.product_image.find(img => img.is_thumbnail) || v.product_image[0]
            if (thumb?.image_url) { main = thumb.image_url; break }
          }
        }
        setMainImageUrl(main)
        // Fetch category name
        if (catId) {
          try {
            const cres = await getCategoryById(String(catId), token || undefined)
            // Response is flat object, not nested under 'data'
            setCategoryName((cres as any)?.name || cres?.data?.name || '')
          } catch (e) {
            try {
              const all = await getAllCategories(token || undefined)
              const found = (all?.data || []).find((c: any) => String(c?.id) === String(catId))
              setCategoryName(found?.name || '')
            } catch {
              setCategoryName('')
            }
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

  // Set first variant as selected when variants are loaded
  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0].id)
    }
  }, [variants, selectedVariantId])

  async function refreshPrediction() {
    if (!selectedVariantId) {
      setPredictionError('Pilih varian terlebih dahulu')
      return
    }

    setPredictionLoading(true)
    setPredictionError(null)
    
    try {
      console.log(`Fetching prediction for variant: ${selectedVariantId}`)
      const result = await predictVariantStock(selectedVariantId, token || undefined)
      console.log('Prediction result:', result)
      setPredictionData(result.data)
    } catch (err: any) {
      console.error('Prediction error:', err)
      const errorMessage = err?.message || 'Gagal mendapatkan prediksi stok'
      
      // Check if it's a connection error
      if (errorMessage.includes('not responding') || 
          errorMessage.includes('Network Error') || 
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          err?.status === undefined) {
        setPredictionError('Tidak dapat terhubung ke backend. Pastikan server backend dan AI service berjalan.')
      } else if (errorMessage.includes('Insufficient sales data') || errorMessage.includes('No sales found')) {
        setPredictionError('Data penjualan tidak cukup. Minimal harus ada transaksi selesai dalam 30 hari terakhir untuk varian ini.')
      } else if (errorMessage.includes('AI prediction service') || errorMessage.includes('AI service')) {
        setPredictionError('Service AI prediksi tidak tersedia. Pastikan backend AI service (Python) sedang berjalan.')
      } else if (err?.status === 404) {
        setPredictionError('Varian tidak ditemukan.')
      } else if (err?.status === 401 || err?.status === 403) {
        setPredictionError('Anda tidak memiliki akses untuk fitur prediksi.')
      } else {
        setPredictionError(errorMessage)
      }
    } finally {
      setPredictionLoading(false)
    }
  }

  async function confirmDelete() {
    if (!id) return
    setDeleting(true)
    try {
      // Attempt to delete variants then product on backend
      await deleteProductWithVariants(id)
      setShowDelete(false)
      // Navigate back to products list and hint refresh
      navigate('/admin/products', { state: { refreshAfter: 'delete', deletedId: id } })
    } catch (err) {
      // Surface a simple error state
      setError((err as any)?.message || 'Gagal menghapus produk')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 items-center mb-2">
          <button
            className="inline-flex items-center justify-center h-8 hover:text-neutral-600 text-2xl font-semibold text-black"
            onClick={() => navigate('/admin/products')}
          >
            &larr; Detail Produk
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(`/admin/products/${encodeURIComponent(id || '')}/edit`)} className="text-black border border-neutral-300 hover:bg-neutral-50">Edit Produk</Button>
          <Button onClick={() => setShowDelete(true)} className="bg-red-500 hover:bg-red-600 active:bg-red-700 border border-red-300">Hapus Produk</Button>
        </div>
        </div>

        <p className="flex mt-1 text-sm text-neutral-600 mb-6">Lihat detail produk dan prediksi kebutuhan stok.</p>

        {loading && <p className="mb-4 text-sm text-neutral-500">Memuat...</p>}
        
        {error && !loading ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-neutral-900">Product Not Found</h2>
              <p className="mb-6 text-sm text-neutral-600 max-w-md">
                {error.includes('tidak ditemukan') || error.includes('not found') || error.includes('404') 
                  ? 'Produk yang Anda cari tidak ditemukan. Produk mungkin telah dihapus atau tidak tersedia.'
                  : error}
              </p>
              <Button 
                onClick={() => navigate('/admin/products')}
                className="bg-red-500 hover:bg-red-600 active:bg-red-700"
              >
                Kembali ke Daftar Produk
              </Button>
            </div>
          </Card>
        ) : null}

        {!error && !loading && <div className="grid gap-6 md:grid-cols-2">
          {/* Informasi Produk */}
          <Card>
            <div className="grid grid-cols-[120px_1fr] gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-neutral-100 text-xs text-neutral-500">
                {mainImageUrl ? <img src={mainImageUrl} alt={name} className="h-full w-full object-cover" /> : 'Product Image'}
              </div>
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

          {/* Gambar Produk (variant thumbnails) */}
          <Card className="md:col-span-1">
            <div className="mb-3 text-sm font-semibold text-neutral-800">Gambar Produk</div>
            <div className="grid grid-cols-5 gap-3">
              {variants.flatMap(v => (v.product_image || []).map(img => img)).slice(0,5).map((img, i) => (
                <div key={img.id || i} className={`h-16 overflow-hidden rounded-md ${img.is_thumbnail ? 'ring-1 ring-red-500' : ''}`}>
                  {img.image_url ? <img src={img.image_url} alt={String(i)} className="h-full w-full object-cover" /> : null}
                </div>
              ))}
              {variants.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-16 rounded-md ${i === 0 ? 'ring-1 ring-red-500' : 'bg-neutral-100'}`}></div>
              ))}
            </div>
          </Card>

          {/* Prediksi Kebutuhan Stok */}
          <Card>
            <div className="mb-3 text-sm font-semibold text-neutral-800">Prediksi Kebutuhan Stok</div>
            
            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="mb-4">
                <label className="text-xs text-neutral-500 mb-1 block">Pilih Varian</label>
                <select 
                  value={selectedVariantId || ''} 
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
                >
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.variant_name || 'Default'} - Stok: {v.stock || 0}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {predictionError && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {predictionError}
              </div>
            )}

            {predictionLoading && (
              <div className="mb-3 text-sm text-neutral-500">
                Memuat prediksi...
              </div>
            )}

            {predictionData && !predictionLoading && (
              <>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li>Varian: {predictionData.variant_name}</li>
                  <li>Stok Saat Ini: {predictionData.current_stock || 0} unit</li>
                  <li>Periode Prediksi: {predictionData.prediction?.prediction_period || '-'}</li>
                  <li>Total Penjualan Diprediksi: {
                    predictionData.prediction?.daily_predictions 
                      ? predictionData.prediction.daily_predictions.reduce((a: number, b: number) => a + b, 0).toFixed(0)
                      : 0
                  } unit</li>
                  <li className="font-semibold text-red-600">
                    Rekomendasi Restock: {predictionData.prediction?.total_restock_recommended || 0} unit
                  </li>
                </ul>
                <div className="mt-3 rounded-md bg-neutral-50 p-2 text-xs text-neutral-500">
                  Prediksi dihitung menggunakan model SVM berdasarkan histori penjualan 30 hari terakhir.
                  Dibuat pada: {predictionData.generated_at ? new Date(predictionData.generated_at).toLocaleString('id-ID') : '-'}
                </div>
              </>
            )}

            {!predictionData && !predictionLoading && !predictionError && (
              <div className="mb-3 text-sm text-neutral-500">
                Klik tombol di bawah untuk mendapatkan prediksi stok
              </div>
            )}

            <Button 
              onClick={refreshPrediction} 
              disabled={predictionLoading || !selectedVariantId}
              className="mt-3 bg-red-500 hover:bg-red-600 disabled:bg-neutral-300 disabled:cursor-not-allowed"
            >
              {predictionLoading ? 'Memuat...' : 'Refresh Prediksi'}
            </Button>
          </Card>
        </div>}
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
