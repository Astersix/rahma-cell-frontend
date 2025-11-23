import * as XLSX from 'xlsx'
import { addProductVariant, createProduct, type AddVariantDTO } from '../services/product.service'

export type ImportedRow = {
  category_id?: string
  name?: string
  description?: string
  variant_name?: string
  price?: string | number
  stock?: string | number
  image_url?: string
}

export type ImportResult = {
  productsCreated: number
  variantsCreated: number
  errors: Array<{ row: number; message: string }>
}

function toArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}

function normalizeHeader(h: string): keyof ImportedRow | null {
  const k = h.trim().toLowerCase().replace(/\s+/g, '_')
  if (['category_id', 'name', 'description', 'variant_name', 'price', 'stock', 'image_url'].includes(k)) return k as keyof ImportedRow
  return null
}

export async function parseFile(file: File): Promise<ImportedRow[]> {
  const ab = await toArrayBuffer(file)
  const wb = XLSX.read(ab, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<any>(ws, { header: 1, defval: '' }) as any[][]
  if (!raw.length) return []
  const headerRow = raw[0].map((v) => String(v))
  const headerMap = headerRow.map(normalizeHeader)
  const rows: ImportedRow[] = []
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i]
    if (!r || r.length === 0) continue
    const obj: ImportedRow = {}
    for (let c = 0; c < headerMap.length; c++) {
      const key = headerMap[c]
      if (!key) continue
      const val = r[c]
      obj[key] = typeof val === 'string' ? val.trim() : val
    }
    // skip entirely empty product names
    if (!obj.name) continue
    rows.push(obj)
  }
  return rows
}

function imagesFromField(field?: string): Array<{ image_url: string; is_thumbnail?: boolean }> | undefined {
  if (!field) return undefined
  const parts = field
    .split('|')
    .map((s) => s.split(/\s+/).filter(Boolean).join(' ')) // collapse spaces
    .join('|')
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
  const normalized = parts.length ? parts : field.split(',').map((s) => s.trim()).filter(Boolean)
  if (!normalized.length) return undefined
  return normalized.map((url, idx) => ({ image_url: url, is_thumbnail: idx === 0 }))
}

export async function importProductsFromRows(rows: ImportedRow[], token?: string): Promise<ImportResult> {
  // group rows by product key (category_id + name + description)
  const groups = new Map<string, { key: string; product: { category_id: string; name: string; description: string }; variants: ImportedRow[] }>()
  for (const r of rows) {
    const category_id = String(r.category_id ?? '').trim()
    const name = String(r.name ?? '').trim()
    const description = String(r.description ?? '').trim()
    if (!category_id || !name) continue
    const key = `${category_id}::${name}::${description}`
    if (!groups.has(key)) {
      groups.set(key, { key, product: { category_id, name, description }, variants: [] })
    }
    groups.get(key)!.variants.push(r)
  }

  let productsCreated = 0
  let variantsCreated = 0
  const errors: Array<{ row: number; message: string }> = []
  let rowIndex = 1 // considering header is row 0

  for (const g of groups.values()) {
    try {
      const res = await createProduct(g.product, token)
      const productId = String((res as any)?.data?.id ?? (res as any)?.id ?? '')
      if (!productId) throw new Error('Failed to get product id')
      productsCreated++
      for (const v of g.variants) {
        try {
          const dto: AddVariantDTO = {
            variant_name: String(v.variant_name ?? '').trim() || 'Default',
            price: Number(v.price ?? 0) || 0,
            stock: Number(v.stock ?? 0) || 0,
            images: imagesFromField(typeof v.image_url === 'string' ? v.image_url : String(v.image_url ?? '')),
          }
          await addProductVariant(productId, dto, token)
          variantsCreated++
        } catch (e: any) {
          errors.push({ row: rowIndex, message: e?.message || 'Failed to add variant' })
        }
        rowIndex++
      }
    } catch (e: any) {
      errors.push({ row: rowIndex, message: e?.message || 'Failed to create product' })
      // advance rowIndex by number of rows in this group
      rowIndex += g.variants.length
    }
  }

  return { productsCreated, variantsCreated, errors }
}

export async function importProductsFromFile(file: File, token?: string): Promise<ImportResult> {
  const rows = await parseFile(file)
  const result = await importProductsFromRows(rows, token)
  // Throw when nothing succeeded but we have errors to surface
  if (result.productsCreated === 0 && result.variantsCreated === 0 && result.errors.length) {
    const first = result.errors[0]
    throw new Error(first?.message || 'Import failed for all rows')
  }
  return result
}
