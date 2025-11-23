import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { getProductById, getVariantsByProductId, updateProduct, updateProductVariant, addProductVariant, deleteProductVariant, type UpdateProductDTO, type ProductImage } from '../../services/product.service'
import { getAllCategories, type Category } from '../../services/category.service'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'

const AdminUpdateProductPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [variants, setVariants] = useState<Array<{ id?: string; variant_name?: string; price?: number; stock?: number; images: Array<{ id?: string; image_url: string; is_thumbnail?: boolean }> }>>([])
  const [removingId, setRemovingId] = useState<string | null>(null)

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
        setVariants((v.data || []).map((it) => ({
          id: it.id,
          variant_name: it.variant_name,
          price: it.price as number | undefined,
          stock: it.stock as number | undefined,
          images: Array.isArray(it.product_image)
            ? (it.product_image as ProductImage[]).map(img => ({ id: img.id, image_url: img.image_url, is_thumbnail: !!img.is_thumbnail }))
            : []
        })))
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

      // Save all variants (update existing, add new)
      for (const v of variants) {
        const payload = { variant_name: v.variant_name, price: v.price, stock: v.stock, images: v.images }
        if (v.id) {
          await updateProductVariant(v.id, payload as any, token || undefined)
        } else {
          await addProductVariant(id, (payload as any), token || undefined)
        }
      }
      setSuccess('Perubahan disimpan')
      navigate(`/admin/products/${encodeURIComponent(id)}`)
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui produk')
    } finally {
      setLoading(false)
    }
  }

  function addImage(idx: number) {
    setVariants(prev => prev.map((pv, i) => i === idx ? { ...pv, images: [...pv.images, { image_url: '', is_thumbnail: pv.images.length === 0 }] } : pv))
  }

  function updateImage(idx: number, imgIdx: number, value: string) {
    setVariants(prev => prev.map((pv, i) => i === idx ? { ...pv, images: pv.images.map((im, ii) => ii === imgIdx ? { ...im, image_url: value } : im) } : pv))
  }

  function removeImage(idx: number, imgIdx: number) {
    setVariants(prev => prev.map((pv, i) => {
      if (i !== idx) return pv
      const filtered = pv.images.filter((_, ii) => ii !== imgIdx)
      // Ensure at least one thumbnail; if none flagged after removal, set first as thumbnail
      if (filtered.length && !filtered.some(im => im.is_thumbnail)) {
        filtered[0] = { ...filtered[0], is_thumbnail: true }
      }
      return { ...pv, images: filtered }
    }))
  }

  function setThumbnail(idx: number, imgIdx: number) {
    setVariants(prev => prev.map((pv, i) => i === idx ? { ...pv, images: pv.images.map((im, ii) => ({ ...im, is_thumbnail: ii === imgIdx })) } : pv))
  }

  async function removeVariant(idx: number) {
    const v = variants[idx]
    if (!v) return
    try {
      if (v.id) {
        setRemovingId(v.id)
        await deleteProductVariant(v.id, token || undefined)
      }
      setVariants(prev => prev.filter((_, i) => i !== idx))
    } catch (err: any) {
      setError(err?.message || 'Gagal menghapus varian')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-1 items-center mb-2">
          <button className="inline-flex items-center justify-center h-8 hover:text-neutral-600 text-2xl font-semibold text-black"
            onClick={() => navigate(-1)}>
            &larr; Edit Produk
          </button>
        </div>
        <p className="mb-6 text-sm text-neutral-600">Perbarui informasi produk.</p>

        <Card className="mb-6">
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

            {/* Variasi Produk (merged) */}
            <div className="rounded-lg border border-neutral-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-black">Variasi Produk</div>
                <button type="button" className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50" onClick={() => setVariants(vs => [...vs, { variant_name: '', price: 0, stock: 0, images: [] }])}>+ Tambah Varian</button>
              </div>
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={v.id || `new-${i}`} className="space-y-3 rounded-md border border-neutral-200 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium text-neutral-700">Varian #{i + 1}</div>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        disabled={!!(v.id && removingId === v.id) || loading}
                        className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {v.id && removingId === v.id ? 'Menghapus...' : 'Hapus Varian'}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
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
                      <div className="flex items-center gap-2 md:col-span-2" />
                    </div>
                    {/* Images */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-neutral-700">Gambar Varian</div>
                        <button type="button" onClick={() => addImage(i)} className="rounded border border-neutral-300 px-2 py-0.5 text-xs hover:bg-neutral-50">+ Tambah Gambar</button>
                      </div>
                      {v.images.length === 0 && <p className="text-xs text-neutral-400">Belum ada gambar.</p>}
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                        {v.images.map((img, ii) => (
                          <div key={ii} className="rounded-md border border-neutral-200 p-2 space-y-2">
                            <input
                              className="w-full rounded-md border border-neutral-200 px-2 py-1 text-xs"
                              placeholder="URL gambar"
                              value={img.image_url}
                              onChange={(e) => updateImage(i, ii, e.target.value)}
                            />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-1 text-[11px] text-neutral-600">
                                <input
                                  type="radio"
                                  name={`thumb-${i}`}
                                  checked={!!img.is_thumbnail}
                                  onChange={() => setThumbnail(i, ii)}
                                />
                                Thumbnail
                              </label>
                              <button type="button" onClick={() => removeImage(i, ii)} className="text-[11px] text-red-600 hover:underline">Hapus</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
      </div>
    </AdminLayout>
  )
}

export default AdminUpdateProductPage
