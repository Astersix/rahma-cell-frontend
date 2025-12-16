import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { createProduct, type CreateProductDTO } from '../../services/product.service'
import { uploadTempImages, finalizeImages, deleteTempImage } from '../../services/image.service'
import { getAllCategories, type Category } from '../../services/category.service'
import { useAuthStore } from '../../store/auth.store'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../services/api.service'

const AdminAddProductPage = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  type NewImage = { tempName?: string; previewUrl: string; is_thumbnail?: boolean }
  type NewVariant = { variant_name: string; price: number | ''; stock: number | ''; images: NewImage[] }
  const [variants, setVariants] = useState<NewVariant[]>([
    { variant_name: '', price: '', stock: '', images: [] },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [productThumbnail, setProductThumbnail] = useState<{ variantIdx: number; imageIdx: number }>({ variantIdx: 0, imageIdx: 0 })
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

  function normalizeVariants(finalizedUrls: Map<string, string>) {
    return variants
      .filter(v => v.variant_name.trim() && v.price !== '' && v.stock !== '')
      .map((v, vIdx) => {
        const imgs = v.images.filter(img => img.previewUrl.trim())
        const primary = imgs[0]
        
        const result: any = {
          variant_name: v.variant_name.trim(),
          price: Number(v.price),
          stock: Number(v.stock),
        }
        
        if (primary) {
          // If it has tempName, use finalized URL, otherwise use previewUrl directly
          let imageUrl = primary.tempName ? finalizedUrls.get(primary.tempName) : primary.previewUrl
          if (imageUrl && imageUrl.trim()) {
            // Convert relative path to full URL for backend validation
            if (imageUrl.startsWith('/')) {
              const baseUrl = API_BASE_URL.replace('/api', '')
              imageUrl = `${baseUrl}${imageUrl}`
            }
            // Mark as thumbnail only if this is the selected product thumbnail
            const isThumbnail = productThumbnail?.variantIdx === vIdx && productThumbnail?.imageIdx === 0
            result.image = {
              image_url: imageUrl.trim(),
              is_thumbnail: isThumbnail
            }
          }
        }
        
        return result
      })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!categoryId) {
      setError('Kategori wajib dipilih')
      return
    }
    
    try {
      setLoading(true)
      
      // Collect all temp image names that need to be finalized
      const tempNames: string[] = []
      variants.forEach(v => {
        v.images.forEach(img => {
          if (img.tempName) {
            tempNames.push(img.tempName)
          }
        })
      })
      
      // Finalize temp images to product directory
      const finalizedUrls = new Map<string, string>()
      if (tempNames.length > 0) {
        const result = await finalizeImages(tempNames)
        // Map tempName to final URL
        tempNames.forEach((name, idx) => {
          if (result.urls[idx]) {
            finalizedUrls.set(name, result.urls[idx])
          }
        })
      }
      
      const preparedVariants = normalizeVariants(finalizedUrls)
      const dto: CreateProductDTO = { name, description, category_id: categoryId } as any
      if (preparedVariants.length > 0) {
        // Backend expects `variants` array with optional single `image` per variant
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

  function fileNameFromUrl(url: string) {
    try {
      const u = new URL(url, 'http://local')
      return u.pathname.split('/').pop() || url
    } catch {
      const parts = url.split('?')[0].split('#')[0].split('/')
      return parts[parts.length - 1] || url
    }
  }

  async function handleFilesSelect(vi: number, files: FileList | null) {
    if (!files || files.length === 0) return
    const first = files[0]
    
    // Delete old temp image first if exists
    const variant = variants[vi]
    const oldImage = variant?.images[0]
    if (oldImage?.tempName) {
      try {
        await deleteTempImage(oldImage.tempName)
      } catch (e) {
        // Silent fail - continue with upload
      }
    }
    
    try {
      setLoading(true)
      const results = await uploadTempImages([first])
      if (!results || results.length === 0) throw new Error('No result from upload')
      const result = results[0]
      setVariants(prev => {
        const nv = [...prev]
        nv[vi] = { 
          ...nv[vi], 
          images: [{ 
            tempName: result.tempName, 
            previewUrl: result.previewUrl, 
            is_thumbnail: true 
          }] 
        }
        return nv
      })
      // Automatically set this image as the product thumbnail
      setProductThumbnail({ variantIdx: vi, imageIdx: 0 })
    } catch (e: any) {
      setError(e?.message || 'Gagal mengunggah gambar')
    } finally {
      setLoading(false)
    }
  }

  async function removeImage(vi: number) {
    const variant = variants[vi]
    const img = variant?.images[0]
    
    // Delete temp image from server if it exists
    if (img?.tempName) {
      try {
        await deleteTempImage(img.tempName)
      } catch (e) {
        // Silent fail - image might already be deleted or doesn't exist
      }
    }
    
    setVariants(prev => {
      const nv = [...prev]
      nv[vi].images = []
      return nv
    })
  }

  return (
    <AdminLayout sidebarActive="products">
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-1 items-center mb-2">
          <button className="inline-flex items-center justify-center h-8 hover:text-neutral-600 text-2xl font-semibold text-black"
            onClick={() => navigate('/admin/products')}>
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

            {/* Gambar Produk per Varian (Upload/local) */}
            <div>
              <div className="mb-2 text-sm font-semibold text-black">Gambar Produk</div>
              <p className="mb-3 text-xs text-neutral-600">Unggah gambar produk sesuai dengan varian yang tersedia.</p>
              {variants.map((v, vi) => (
                <div key={vi} className="mb-4 rounded-md border border-neutral-200 p-3">
                  <div className="mb-2 text-xs font-medium text-neutral-700">Varian #{vi + 1} - Gambar</div>
                  <div
                    className="mb-3 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleFilesSelect(vi, e.dataTransfer.files)
                    }}
                    onClick={() => document.getElementById(`file-${vi}`)?.click()}
                  >
                    <div className="mb-2 rounded bg-neutral-200 p-3 text-neutral-600">🖼️</div>
                    <div className="text-sm">Drag & drop gambar di sini</div>
                    <div className="text-xs">atau</div>
                    <div className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">Pilih file</div>
                    <input id={`file-${vi}`} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelect(vi, e.target.files)} />
                  </div>

                  {v.images.length > 0 && (
                    <div className="space-y-2 rounded-md border border-neutral-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">IMG</div>
                          <div className="text-sm text-neutral-800 truncate max-w-[320px]">{fileNameFromUrl(v.images[0].previewUrl)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 text-xs text-neutral-700 cursor-pointer">
                            <input 
                              type="radio" 
                              name="product-thumbnail" 
                              checked={productThumbnail?.variantIdx === vi && productThumbnail?.imageIdx === 0}
                              onChange={() => setProductThumbnail({ variantIdx: vi, imageIdx: 0 })}
                            />
                            Thumbnail Utama
                          </label>
                          <button type="button" onClick={() => removeImage(vi)} aria-label="Hapus" className="text-neutral-500 hover:text-red-600">🗑️</button>
                        </div>
                      </div>
                    </div>
                  )}
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
