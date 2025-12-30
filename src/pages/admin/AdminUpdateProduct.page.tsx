import { useEffect, useState } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import AlertMessage from '../../components/ui/AlertMessage'
import PopupModal from '../../components/ui/PopupModal'
import { getProductById, getVariantsByProductId, updateProduct, updateProductVariant, addProductVariant, deleteProductVariant, getAllProduct, type UpdateProductDTO, type ProductImage } from '../../services/product.service'
import { uploadTempImages, finalizeImages, deleteTempImage, deleteFinalImage } from '../../services/image.service'
import { getAllCategories, type Category } from '../../services/category.service'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import { API_BASE_URL } from '../../services/api.service'
import { ArrowLongLeftIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/outline'

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
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [variants, setVariants] = useState<Array<{ id?: string; variant_name?: string; price?: number; stock?: number; images: Array<{ id?: string; image_url?: string; tempName?: string; previewUrl: string; is_thumbnail?: boolean }>; imageDeleted?: boolean }>>([])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [productThumbnail, setProductThumbnail] = useState<{ variantIdx: number; imageIdx: number } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  function fileNameFromUrl(url: string) {
    try {
      const u = new URL(url, 'http://local')
      return u.pathname.split('/').pop() || url
    } catch {
      const parts = url.split('?')[0].split('#')[0].split('/')
      return parts[parts.length - 1] || url
    }
  }

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
        const v = await getVariantsByProductId(id as string, token || undefined)
        const mappedVariants = (v.data || []).map((it) => ({
          id: it.id,
          variant_name: it.variant_name,
          price: it.price as number | undefined,
          stock: it.stock as number | undefined,
          images: Array.isArray(it.product_image)
            ? (it.product_image as ProductImage[]).map(img => ({ 
                id: img.id, 
                image_url: img.image_url, 
                previewUrl: img.image_url, 
                is_thumbnail: !!img.is_thumbnail 
              }))
            : []
        }))
        setVariants(mappedVariants)
        
        // Find and set the current product thumbnail
        for (let vIdx = 0; vIdx < mappedVariants.length; vIdx++) {
          const imgIdx = mappedVariants[vIdx].images.findIndex(img => img.is_thumbnail)
          if (imgIdx !== -1) {
            setProductThumbnail({ variantIdx: vIdx, imageIdx: imgIdx })
            break
          }
        }
        // If no thumbnail found, set first image as default
        if (mappedVariants.length > 0 && mappedVariants[0].images.length > 0) {
          if (!mappedVariants.some(v => v.images.some(img => img.is_thumbnail))) {
            setProductThumbnail({ variantIdx: 0, imageIdx: 0 })
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Gagal memuat data produk')
      }
    }
    run()
  }, [id, token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Check for duplicate product name before showing confirmation
    try {
      setLoading(true)
      const productsRes = await getAllProduct()
      const allProducts = productsRes?.data || []
      
      // Check if another product (not this one) has the same name
      const isDuplicate = allProducts.some((p: any) => 
        p.id !== id && p.name?.toLowerCase().trim() === name.toLowerCase().trim()
      )
      
      if (isDuplicate) {
        setShowDuplicateAlert(true)
        setLoading(false)
        return
      }
    } catch (err) {
      // Continue with update even if check fails
    } finally {
      setLoading(false)
    }
    
    setShowConfirmDialog(true)
  }

  async function confirmUpdate() {
    if (!id) return
    setShowConfirmDialog(false)
    setError(null)
    setSuccess(null)
    try {
      setLoading(true)
      
      // Collect all temp images that need to be finalized
      const tempNames: string[] = []
      const tempNameMap = new Map<string, { variantIdx: number, imageIdx: number }>()
      
      variants.forEach((v, vIdx) => {
        v.images.forEach((img, imgIdx) => {
          if (img.tempName) {
            tempNames.push(img.tempName)
            tempNameMap.set(img.tempName, { variantIdx: vIdx, imageIdx: imgIdx })
          }
        })
      })
      
      // Finalize temp images to product directory
      if (tempNames.length > 0) {
        const result = await finalizeImages(tempNames)
        // Update variants with finalized URLs
        const updatedVariants = [...variants]
        tempNames.forEach((name, idx) => {
          const location = tempNameMap.get(name)
          if (location && result.urls[idx]) {
            const img = updatedVariants[location.variantIdx].images[location.imageIdx]
            img.image_url = result.urls[idx]
            img.previewUrl = result.urls[idx]
            delete img.tempName
          }
        })
        setVariants(updatedVariants)
      }
      
      const dto: UpdateProductDTO = {
        name,
        description,
        category_id: categoryId,
      }
      await updateProduct(id, dto, token || undefined)

      for (let vIdx = 0; vIdx < variants.length; vIdx++) {
        const v = variants[vIdx]
        const base: any = {
          variant_name: v.variant_name,
          price: v.price,
          stock: v.stock,
        }
        
        // If image was explicitly deleted, send null to remove from database
        if (v.imageDeleted) {
          base.image = null
        } else {
          // Backend expects single 'image' object, not 'images' array
          const primaryImage = v.images?.[0]
          if (primaryImage) {
            let imageUrl = primaryImage.image_url || primaryImage.previewUrl
            // Convert relative path to full URL for backend validation
            if (imageUrl && imageUrl.startsWith('/')) {
              const baseUrl = API_BASE_URL.replace('/api', '')
              imageUrl = `${baseUrl}${imageUrl}`
            }
            // Mark as thumbnail only if this is the selected product thumbnail
            const isThumbnail = productThumbnail?.variantIdx === vIdx && productThumbnail?.imageIdx === 0
            base.image = {
              id: primaryImage.id,
              image_url: imageUrl,
              is_thumbnail: isThumbnail
            }
          }
        }
        
        if (v.id) {
          // Update existing variant with single image
          await updateProductVariant(v.id, base, token || undefined)
        } else {
          // Create new variant with single image
          await addProductVariant(id, base, token || undefined)
        }
      }
      setSuccess('Perubahan disimpan')
      navigate(`/admin/products/${encodeURIComponent(id)}`)
    } catch (err: any) {
      const errorMsg = err?.message || 'Gagal memperbarui produk'
      // Check if error is about duplicate product name
      if (errorMsg.toLowerCase().includes('sudah ada') || errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate')) {
        setShowDuplicateAlert(true)
        setError(null)
        setShowConfirmDialog(false)
      } else {
        setError(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function removeImage(idx: number, imgIdx: number) {
    const variant = variants[idx]
    const img = variant?.images[imgIdx]
    
    // Delete image from server
    if (img) {
      try {
        if (img.tempName) {
          // It's a temp image, delete from temp
          await deleteTempImage(img.tempName)
        } else if (img.image_url || img.previewUrl) {
          // It's a final image, extract filename and delete
          const fileName = fileNameFromUrl(img.image_url || img.previewUrl)
          if (fileName) {
            await deleteFinalImage(fileName)
          }
        }
      } catch (e: any) {
        // Show error but continue with UI update
        setError(e?.message || 'Gagal menghapus gambar dari server')
      }
    }
    
    setVariants(prev => prev.map((pv, i) => {
      if (i !== idx) return pv
      const filtered = pv.images.filter((_, ii) => ii !== imgIdx)
      if (filtered.length && !filtered.some(im => im.is_thumbnail)) {
        filtered[0] = { ...filtered[0], is_thumbnail: true }
      }
      // Mark that image was deleted so backend knows to remove DB record
      return { ...pv, images: filtered, imageDeleted: filtered.length === 0 }
    }))
  }

  async function handleFilesSelect(idx: number, files: FileList | null) {
    if (!files || files.length === 0) return
    const first = files[0]
    
    // Delete old image first if exists
    const variant = variants[idx]
    const oldImage = variant?.images[0]
    if (oldImage) {
      try {
        if (oldImage.tempName) {
          // It's a temp image, delete from temp
          await deleteTempImage(oldImage.tempName)
        } else if (oldImage.image_url || oldImage.previewUrl) {
          // It's a final image, extract filename and delete
          const fileName = fileNameFromUrl(oldImage.image_url || oldImage.previewUrl)
          if (fileName) {
            await deleteFinalImage(fileName)
          }
        }
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
        nv[idx] = { 
          ...nv[idx], 
          images: [{ 
            tempName: result.tempName, 
            previewUrl: result.previewUrl, 
            is_thumbnail: true 
          }],
          imageDeleted: false
        }
        return nv
      })
      // Automatically set this image as the product thumbnail
      setProductThumbnail({ variantIdx: idx, imageIdx: 0 })
    } catch (e: any) {
      setError(e?.message || 'Gagal mengunggah gambar')
    } finally {
      setLoading(false)
    }
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
      {showDuplicateAlert && (
        <AlertMessage
          variant="error"
          message="Produk dengan nama tersebut sudah ada. Silakan gunakan nama yang berbeda."
          onClose={() => setShowDuplicateAlert(false)}
          duration={5000}
        />
      )}
      <div className="min-h-screen">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center gap-2">
          <button className="text-neutral-600 hover:text-neutral-800" onClick={() => navigate(-1)} aria-label="Kembali">
            <ArrowLongLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-black">Edit Produk</h1>
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-neutral-700">Gambar Varian</div>
                      </div>
                      <div
                        className="mb-2 flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-neutral-300 text-neutral-500 hover:bg-neutral-50"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleFilesSelect(i, e.dataTransfer.files)
                        }}
                        onClick={() => document.getElementById(`upd-file-${i}`)?.click()}
                      >
                        <div className="mb-1 rounded bg-neutral-200 p-2 text-neutral-600">
                          <PhotoIcon className="w-6 h-6" />
                        </div>
                        <div className="text-xs">Drag & drop gambar di sini</div>
                        <div className="text-[11px]">atau</div>
                        <div className="mt-1 rounded-md bg-red-600 px-3 py-1 text-[11px] font-medium text-white">Pilih file</div>
                        <input id={`upd-file-${i}`} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFilesSelect(i, e.target.files)} />
                      </div>

                      {v.images.length === 0 && <p className="text-xs text-neutral-400">Belum ada gambar.</p>}
                      {v.images.length > 0 && (
                        <div className="space-y-2 rounded-md border border-neutral-200 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-500">IMG</div>
                              <div className="max-w-[320px] truncate text-sm text-neutral-800">{fileNameFromUrl(v.images[0].previewUrl)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1 text-xs text-neutral-700 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name="product-thumbnail" 
                                  checked={productThumbnail?.variantIdx === i && productThumbnail?.imageIdx === 0}
                                  onChange={() => setProductThumbnail({ variantIdx: i, imageIdx: 0 })}
                                />
                                Thumbnail Utama
                              </label>
                              <button type="button" onClick={() => removeImage(i, 0)} className="text-neutral-500 hover:text-red-600" aria-label="Hapus">
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
      </div>

      <PopupModal
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        icon="warning"
        title="Konfirmasi Perubahan"
        description="Apakah Anda yakin ingin menyimpan perubahan pada produk ini?"
        primaryButton={{
          label: 'Ya, Simpan',
          variant: 'filled',
          onClick: confirmUpdate,
        }}
        secondaryButton={{
          label: 'Tidak',
          variant: 'outlined',
          onClick: () => setShowConfirmDialog(false),
        }}
      />
    </AdminLayout>
  )
}

export default AdminUpdateProductPage
