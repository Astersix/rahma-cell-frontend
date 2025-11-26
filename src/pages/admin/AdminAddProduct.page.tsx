import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { createProduct, type CreateProductDTO } from '../../services/product.service'
import { getAllCategories, type Category } from '../../services/category.service'
import { useAuthStore } from '../../store/auth.store'
import { useNavigate } from 'react-router-dom'

const AdminAddProductPage = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  type NewImage = { image_url: string; is_thumbnail?: boolean }
  type NewVariant = { variant_name: string; price: number | ''; stock: number | ''; images: NewImage[] }
  const [variants, setVariants] = useState<NewVariant[]>([
    { variant_name: '', price: '', stock: '', images: [] },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const { token } = useAuthStore()

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getAllCategories(token || undefined)
        setCategories(res.data || [])
      } catch (err: any) {
        // 
      }
    }
    fetchCategories()
  }, [token])

  function normalizeVariants() {
    return variants
      .filter(v => v.variant_name.trim() && v.price !== '' && v.stock !== '')
      .map(v => ({
        variant_name: v.variant_name.trim(),
        price: Number(v.price),
        stock: Number(v.stock),
        images: v.images.filter(img => img.image_url.trim()),
      }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!categoryId) {
      setError('Kategori wajib dipilih')
      return
    }
    const preparedVariants = normalizeVariants()
    try {
      setLoading(true)
      const dto: CreateProductDTO = { name, description, category_id: categoryId } as any
      if (preparedVariants.length > 0) {
        ;(dto as any).variants = preparedVariants
      }
      await createProduct(dto, token || undefined)
      setSuccess('Produk berhasil dibuat')
      navigate('/admin/products')
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-1 items-center mb-2">
          <button className="inline-flex items-center justify-center h-8 hover:text-neutral-600 text-2xl font-semibold text-black"
            onClick={() => navigate(-1)}>
            &larr; Tambah Produk
          </button>
        </div>
        <p className="mb-6 text-sm text-neutral-600">Masukkan informasi lengkap untuk menambahkan produk baru ke katalog.</p>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {/* Gambar Produk per varian (URL) */}
            <div>
              <div className="mb-2 text-sm font-semibold text-black">Gambar Produk per Varian</div>
              <p className="mb-3 text-xs text-neutral-600">Masukkan URL gambar untuk setiap varian (1–6), tandai satu sebagai thumbnail.</p>
              {variants.map((v, vi) => (
                <div key={vi} className="mb-4 rounded-md border border-neutral-200 p-3">
                  <div className="mb-2 text-xs font-medium text-neutral-700">Varian #{vi + 1} - Gambar</div>
                  <div className="space-y-2">
                    {v.images.map((img, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="https://..."
                          value={img.image_url}
                          onChange={(e) => {
                            const nv = [...variants]
                            nv[vi].images[ii].image_url = e.target.value
                            setVariants(nv)
                          }}
                          className="flex-1 rounded-md border border-neutral-200 px-3 py-2 text-sm"
                        />
                        <label className="flex items-center gap-1 text-xs text-neutral-700">
                          <input
                            type="radio"
                            name={`thumb-${vi}`}
                            checked={!!img.is_thumbnail}
                            onChange={() => {
                              const nv = [...variants]
                              nv[vi].images = nv[vi].images.map((g, gi) => ({ ...g, is_thumbnail: gi === ii }))
                              setVariants(nv)
                            }}
                          /> Thumbnail
                        </label>
                        <button type="button" className="rounded border px-2 py-1 text-xs" onClick={() => {
                          const nv = [...variants]
                          nv[vi].images.splice(ii, 1)
                          setVariants(nv)
                        }}>Hapus</button>
                      </div>
                    ))}
                    <button type="button" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50" onClick={() => {
                      const nv = [...variants]
                      nv[vi].images.push({ image_url: '', is_thumbnail: nv[vi].images.length === 0 })
                      setVariants(nv)
                    }}>+ Tambah Gambar</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Variasi Produk */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-black">Variasi Produk</div>
                <button
                  type="button"
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-50"
                  onClick={() => setVariants(vs => [...vs, { variant_name: '', price: '', stock: '', images: [] }])}
                >
                  + Tambah Varian
                </button>
              </div>
              <div className="space-y-3">
                {variants.map((v, vi) => (
                  <div key={vi} className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                      className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                      placeholder="Nama varian (mis. 128GB Black)"
                      value={v.variant_name}
                      onChange={(e) => {
                        const nv = [...variants]
                        nv[vi].variant_name = e.target.value
                        setVariants(nv)
                      }}
                    />
                    <input
                      className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                      placeholder="Harga (Rp)"
                      type="number"
                      min={0}
                      value={v.price}
                      onChange={(e) => {
                        const nv = [...variants]
                        nv[vi].price = e.target.value === '' ? '' : Number(e.target.value)
                        setVariants(nv)
                      }}
                    />
                    <input
                      className="rounded-md border border-neutral-200 px-3 py-2 text-sm"
                      placeholder="Stok"
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => {
                        const nv = [...variants]
                        nv[vi].stock = e.target.value === '' ? '' : Number(e.target.value)
                        setVariants(nv)
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-md border border-neutral-300 px-3 py-2 text-xs hover:bg-neutral-50" onClick={() => setVariants(vs => vs.filter((_, idx) => idx !== vi))}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={loading || !name || !categoryId} className="bg-red-500 hover:bg-red-600 active:bg-red-700">
                {loading ? 'Menyimpan...' : 'Simpan produk'}
              </Button>
              <Button type="button" onClick={() => navigate('/admin/products')}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminAddProductPage
