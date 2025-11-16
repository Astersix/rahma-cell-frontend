import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getProductById, getVariantsByProductId, updateProduct, updateProductVariant, addProductVariant, type UpdateProductDTO } from '../../services/product.service'
import { getAllCategories, type Category } from '../../services/category.service'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

const AdminUpdateProductPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  // keep local, but we don't need the whole object after initializing state fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [variants, setVariants] = useState<Array<{ id?: string; variant_name?: string; price?: number; stock?: number }>>([])
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    async function run() {
      try {
        const [p, cats] = await Promise.all([
          getProductById(id as string),
          getAllCategories(token || undefined).catch(() => ({ data: [] as Category[] })),
        ])
        setName(p.data?.name ?? '')
        setDescription(p.data?.description ?? '')
        setCategoryId(p.data?.category_id ?? '')
        setCategories(cats.data || [])
        // load variants
        const v = await getVariantsByProductId(id as string, token || undefined)
        setVariants((v.data || []).map((it) => ({ id: it.id, variant_name: it.variant_name, price: it.price as number | undefined, stock: it.stock as number | undefined })))
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat data produk')
      }
    }
    run()
  }, [id, token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    setSuccess(null)
    try {
      setLoading(true)
      const dto: UpdateProductDTO = {
        name,
        description,
        category_id: categoryId,
      }
      await updateProduct(id, dto, token || undefined)
      setSuccess('Perubahan disimpan')
      navigate(`/admin/products/${encodeURIComponent(id)}`)
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui produk')
    } finally {
      setLoading(false)
    }
  }

  async function saveVariant(idx: number) {
    if (!id) return
    const v = variants[idx]
    if (!v) return
    try {
      if (v.id) {
        setSavingVariantId(v.id)
        await updateProductVariant(v.id, { variant_name: v.variant_name, price: v.price, stock: v.stock }, token || undefined)
      } else {
        // add new variant
        const res = await addProductVariant(id, { variant_name: v.variant_name || '', price: v.price || 0, stock: v.stock || 0 }, token || undefined)
        const newId = (res.data as any)?.id
        setVariants(prev => prev.map((pv, pidx) => pidx === idx ? { ...pv, id: newId } : pv))
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan varian')
    } finally {
      setSavingVariantId(null)
    }
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-4xl">
        <button className="mb-4 text-sm text-neutral-600 hover:text-black" onClick={() => navigate(-1)}>&larr; Kembali</button>
        <div className="mb-2 text-2xl font-semibold text-black">Edit Produk</div>
        <p className="mb-6 text-sm text-neutral-600">Perbarui informasi produk.</p>

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input label="Nama Produk" placeholder="Masukkan nama produk" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              <label className="mb-1 block text-sm font-medium text-black">Deskripsi Produk</label>
              <textarea
                className="block w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black placeholder:text-neutral-400 outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                rows={4}
                placeholder="Tulis deskripsi lengkap"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">Kategori Produk</label>
              <select
                className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black outline-none focus:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !name || !categoryId} className="bg-red-500 hover:bg-red-600 active:bg-red-700">
                {loading ? 'Menyimpan...' : 'Simpan perubahan'}
              </Button>
              <Button type="button" onClick={() => navigate(`/admin/products/${encodeURIComponent(id || '')}`)}>
                Batal
              </Button>
            </div>
          </form>
        </Card>

        {/* Variasi Produk */}
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-black">Variasi Produk</div>
            <button type="button" className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50" onClick={() => setVariants(vs => [...vs, { variant_name: '', price: 0, stock: 0 }])}>+ Tambah Varian</button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={v.id || `new-${i}`} className="grid grid-cols-1 gap-3 md:grid-cols-5">
                <input
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="Nama varian"
                  value={v.variant_name || ''}
                  onChange={(e) => setVariants(prev => prev.map((pv, idx) => idx === i ? { ...pv, variant_name: e.target.value } : pv))}
                />
                <input
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="Harga (Rp)"
                  type="number"
                  min={0}
                  value={v.price ?? ''}
                  onChange={(e) => setVariants(prev => prev.map((pv, idx) => idx === i ? { ...pv, price: e.target.value === '' ? undefined : Number(e.target.value) } : pv))}
                />
                <input
                  className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="Stok"
                  type="number"
                  min={0}
                  value={v.stock ?? ''}
                  onChange={(e) => setVariants(prev => prev.map((pv, idx) => idx === i ? { ...pv, stock: e.target.value === '' ? undefined : Number(e.target.value) } : pv))}
                />
                <div className="flex items-center gap-2 md:col-span-2">
                  <Button type="button" className="bg-red-500 hover:bg-red-600" onClick={() => saveVariant(i)} disabled={savingVariantId === v.id}>
                    {savingVariantId === v.id ? 'Menyimpan...' : 'Simpan Varian'}
                  </Button>
                  {/* Remove locally (not deleting backend to keep safe) */}
                  <Button type="button" onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}>Hapus</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminUpdateProductPage
