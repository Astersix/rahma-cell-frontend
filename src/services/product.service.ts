import axios from 'axios'

// Base URL normalization similar to category.service
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
const API_BASE_URL = RAW_BASE
	? (/^https?:\/\//i.test(RAW_BASE) ? RAW_BASE : `http://localhost${RAW_BASE}`)
	: 'http://localhost:5000/api'

const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
	headers: {
		'Content-Type': 'application/json',
	},
})

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

function authHeaders(token?: string) {
	return token
		? {
			  Authorization: `Bearer ${token}`,
		  }
		: undefined
}

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
export async function getAllProduct(params?: Record<string, unknown>): Promise<ApiResponse<Product[]>> {
	try {
		const res = await api.get<any>('/product', { params })
		const raw = res.data
		const list: Product[] = extractArray<Product>(raw)
		return { data: list, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// READ: Get product by id
export async function getProductById(id: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(id)}`)
		const raw = res.data
		const candidate = raw?.data ?? raw?.product ?? raw
		return { data: candidate as Product, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// CREATE: Admin only
export async function createProduct(dto: CreateProductDTO, token?: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.post<ApiResponse<Product>>('/product', dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// UPDATE: Admin only
export async function updateProduct(id: string, dto: UpdateProductDTO, token?: string): Promise<ApiResponse<Product>> {
	try {
		const res = await api.put<ApiResponse<Product>>(`/product/${encodeURIComponent(id)}`, dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// DELETE: Admin only
export async function deleteProduct(id: string, token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/${encodeURIComponent(id)}`, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: update
export async function updateProductVariant(variantId: string, dto: UpdateVariantDTO, token?: string): Promise<ApiResponse<unknown>> {
	try {
		const res = await api.put<ApiResponse<unknown>>(`/product/variant/${encodeURIComponent(variantId)}`, dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: delete
export async function deleteProductVariant(variantId: string, token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/variant/${encodeURIComponent(variantId)}`, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// CASCADE DELETE: attempt to delete all variants before deleting the product to satisfy FK constraints
export async function deleteProductWithVariants(productId: string, token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
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
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}`, { headers: authHeaders(token) })
		const raw = res.data
		const variantIds = collectVariantIds(raw)
		for (const vid of variantIds) {
			try {
				await deleteProductVariant(vid, token)
			} catch (err) {
				// Ignore individual variant deletion errors; continue attempting others
			}
		}
	} catch (err) {
		// If we cannot fetch variants we still attempt direct product deletion below
	}

	// Finally delete product
	return await deleteProduct(productId, token)
}

// VARIANT: list by product
export async function getVariantsByProductId(productId: string, token?: string): Promise<ApiResponse<ProductVariant[]>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}/variant`, { headers: authHeaders(token) })
		const raw = res.data
		const list: ProductVariant[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
		return { data: list, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: get by id (admin)
export async function getVariantById(productId: string, variantId: string, token?: string): Promise<ApiResponse<ProductVariant>> {
	try {
		const res = await api.get<any>(`/product/${encodeURIComponent(productId)}/variant/${encodeURIComponent(variantId)}`, { headers: authHeaders(token) })
		const raw = res.data
		const data = raw?.data ?? raw
		return { data, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: add to product (admin)
export async function addProductVariant(productId: string, dto: AddVariantDTO, token?: string): Promise<ApiResponse<ProductVariant>> {
	try {
		const res = await api.post<any>(`/product/${encodeURIComponent(productId)}/variant`, dto, { headers: authHeaders(token) })
		return { data: res.data, message: res.data?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}