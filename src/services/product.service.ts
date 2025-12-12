import axios from 'axios'
import { api } from './api.service'

export type ApiResponse<T> = {
	data: T
	message?: string
	[key: string]: unknown
}

export type ISODateString = string

export interface Category {
	id: string
	name: string
	created_at: ISODateString
}

export interface Product {
	id: string
	category_id: string
	name: string
	description: string
	created_at: ISODateString
	updated_at: ISODateString
	product_variant?: ProductVariant[]
}

export interface ProductVariant {
	id: string
	product_id?: string
	variant_name?: string
	price?: number
	stock?: number
	product_image?: ProductImage[]
}

export interface ProductImage {
	id: string
	product_variant_id?: string
	image_url: string
	is_thumbnail?: boolean
	created_at?: ISODateString
}

export type CreateProductDTO = {
	category_id: string
	name: string
	description: string
}

export type UpdateProductDTO = Partial<Pick<CreateProductDTO, 'category_id' | 'name' | 'description'>>

export type UpdateVariantDTO = Record<string, unknown>
export type AddVariantDTO = {
	variant_name: string
	price: number
	stock: number
	images?: Array<{ id?: string; image_url: string; is_thumbnail?: boolean }>
}

function normalizeAxiosError(err: unknown) {
	if (axios.isAxiosError(err)) {
		const axiosErr = err
		return {
			message: (axiosErr.response?.data as any)?.message || axiosErr.message,
			status: axiosErr.response?.status,
			data: axiosErr.response?.data,
		}
	}
	return { message: String(err) }
}

// Auth handled by interceptor

// Utility to extract an array of objects from various response shapes
function extractArray<T = unknown>(raw: any): T[] {
	if (Array.isArray(raw)) return raw
	if (Array.isArray(raw?.data)) return raw.data
	const candidates = ['products', 'items', 'result', 'rows', 'list']
	for (const key of candidates) {
		if (Array.isArray(raw?.[key])) return raw[key]
		if (Array.isArray(raw?.data?.[key])) return raw.data[key]
	}
	// Fallback: first array property found
	for (const val of Object.values(raw ?? {})) {
		if (Array.isArray(val)) return val as T[]
		if (val && typeof val === 'object') {
			for (const inner of Object.values(val)) {
				if (Array.isArray(inner)) return inner as T[]
			}
		}
	}
	return []
}

// READ: Get all products
export async function getAllProduct(params?: Record<string, unknown>, _token?: string): Promise<ApiResponse<Product[]>> {
	try {
		const res = await api.get<any>('/product', { params })
		const raw = res.data
		const list: Product[] = extractArray<Product>(raw)
		const meta = (raw && (raw.meta || raw.pagination || raw?.data?.meta)) || undefined
		return { data: list, message: raw?.message, meta }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// READ: Get product by id
export async function getProductById(id: string, _token?: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(id)}` )
		const raw = res.data
		const candidate = raw?.data ?? raw?.product ?? raw
		return { data: candidate as Product, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// CREATE: Admin only
export async function createProduct(dto: CreateProductDTO, _token?: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.post<ApiResponse<Product>>('/product', dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// UPDATE: Admin only
export async function updateProduct(id: string, dto: UpdateProductDTO, _token?: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.put<ApiResponse<Product>>(`/product/${encodeURIComponent(id)}`, dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// DELETE: Admin only
export async function deleteProduct(id: string, _token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/${encodeURIComponent(id)}`)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: update
export async function updateProductVariant(variantId: string, dto: UpdateVariantDTO, _token?: string): Promise<ApiResponse<unknown>> {
	try {
		const res = await api.put<ApiResponse<unknown>>(`/product/variant/${encodeURIComponent(variantId)}`, dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: delete
export async function deleteProductVariant(variantId: string, _token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/variant/${encodeURIComponent(variantId)}`)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// CASCADE DELETE: attempt to delete all variants before deleting the product to satisfy FK constraints
export async function deleteProductWithVariants(productId: string, _token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	// Collect variant IDs from several possible response shapes
	function collectVariantIds(raw: any): string[] {
		const variantContainers = [
			raw?.variants,
			raw?.data?.variants,
			raw?.product?.variants,
			raw?.data?.product?.variants,
			raw?.product_variant,
			raw?.data?.product_variant,
		]
		const ids: string[] = []
		for (const container of variantContainers) {
			if (Array.isArray(container)) {
				for (const v of container) {
					const vid = v?.id || v?.variant_id || v?.uuid || null
					if (vid && typeof vid === 'string') ids.push(vid)
				}
			}
		}
		return Array.from(new Set(ids))
	}

	try {
		// Fetch raw product to inspect variants
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}`)
		const raw = res.data
		const variantIds = collectVariantIds(raw)
		for (const vid of variantIds) {
			try {
				await deleteProductVariant(vid)
			} catch (err) {
				// Ignore individual variant deletion errors; continue attempting others
			}
		}
	} catch (err) {
		// If we cannot fetch variants we still attempt direct product deletion below
	}

	// Finally delete product
	return await deleteProduct(productId)
}

// VARIANT: list by product
export async function getVariantsByProductId(productId: string, _token?: string): Promise<ApiResponse<ProductVariant[]>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}/variant`)
		const raw = res.data
		const list: ProductVariant[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
		return { data: list, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: get by id (admin)
export async function getVariantById(productId: string, variantId: string, _token?: string): Promise<ApiResponse<ProductVariant>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}/variant/${encodeURIComponent(variantId)}`)
		const raw = res.data
		const data = raw?.data ?? raw
		return { data, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: add to product (admin)
export async function addProductVariant(productId: string, dto: AddVariantDTO, _token?: string): Promise<ApiResponse<ProductVariant>> {
	try {
		const res = await api.post<any>(`/product/${encodeURIComponent(productId)}/variant`, dto)
		return { data: res.data, message: res.data?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// IMPORT: CSV/Excel file (admin)
export async function importProducts(file: File, _token?: string): Promise<ApiResponse<{ imported: number } | unknown>> {
	try {
		const form = new FormData()
		form.append('file', file)
		const res = await api.post<any>(`/product/import`, form, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return { data: res.data, message: (res.data && (res.data.message || res.data?.msg)) }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// LOW STOCK: Get products with variants having stock below threshold
export interface LowStockItem {
	productId: string
	productName: string
	variantId: string
	variantName: string
	stock: number
	thumbnail?: string
}

export async function getLowStockProducts(threshold: number = 5, _token?: string): Promise<ApiResponse<LowStockItem[]>> {
	try {
		// Simplified approach: fetch all products with basic variant data first
		const allProducts: Product[] = []
		let currentPage = 1
		const limit = 10 // Backend default is 10 per page
		
		// Paginate through all products
		while (true) {
			const res = await api.get<any>('/product', { params: { page: currentPage, limit } })
			const raw = res.data
			const products: Product[] = extractArray<Product>(raw)
			
			console.log(`Fetching page ${currentPage}, got ${products.length} products`)
			
			if (!products || products.length === 0) break
			
			allProducts.push(...products)
			
			// Check if there are more pages - backend uses 'hasNext' in meta
			const meta = raw?.meta || raw?.pagination || raw?.data?.meta
			console.log('Meta:', meta)
			
			// If we got fewer products than the limit, we're on the last page
			if (products.length < limit) break
			
			// Also check meta if available
			if (meta && (meta.hasNext === false || meta.has_next === false)) break
			
			currentPage++
			if (currentPage > 100) break // Safety limit
		}
		
		console.log('Total products fetched:', allProducts.length)
		
		// Now process each product to find low stock variants
		const lowStockPromises = allProducts.map(async (product) => {
			try {
				// Fetch full product details with images
				const detailRes = await api.get<any>(`/product/${encodeURIComponent(product.id)}`)
				const detailRaw = detailRes.data
				const detailedProduct = detailRaw?.data ?? detailRaw?.product ?? detailRaw
				
				const variants = detailedProduct?.product_variant || []
				const items: LowStockItem[] = []
				
				if (Array.isArray(variants)) {
					for (const variant of variants) {
						const stock = Number(variant.stock)
						console.log(`Product: ${product.name}, Variant: ${variant.variant_name}, Stock: ${stock}`)
						
						// Check if stock is low (including 0 stock items)
						if (!isNaN(stock) && stock <= threshold) {
							let thumbnail: string | undefined
							if (Array.isArray(variant.product_image) && variant.product_image.length > 0) {
								const thumbImg = variant.product_image.find((img: ProductImage) => img.is_thumbnail) || variant.product_image[0]
								thumbnail = thumbImg?.image_url
							}
							
							items.push({
								productId: product.id,
								productName: product.name || detailedProduct?.name || 'Unknown Product',
								variantId: variant.id,
								variantName: variant.variant_name || 'Default',
								stock: stock,
								thumbnail: thumbnail,
							})
						}
					}
				}
				
				return items
			} catch (err) {
				console.error(`Failed to fetch details for product ${product.id}:`, err)
				return []
			}
		})
		
		// Wait for all product details to be fetched
		const allLowStockArrays = await Promise.all(lowStockPromises)
		const lowStockItems = allLowStockArrays.flat()
		
		console.log('Low stock items found:', lowStockItems.length)
		
		// Sort by stock ascending (lowest first)
		lowStockItems.sort((a, b) => a.stock - b.stock)
		
		return { data: lowStockItems, message: 'Low stock items retrieved' }
	} catch (err) {
		console.error('Error in getLowStockProducts:', err)
		throw normalizeAxiosError(err)
	}
}