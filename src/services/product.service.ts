import axios from 'axios'

// prefer env var without trailing slash; fallback to localhost API
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

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
}

export type CreateProductDTO = {
	category_id: string
	name: string
	description: string
}

export type UpdateProductDTO = Partial<Pick<CreateProductDTO, 'category_id' | 'name' | 'description'>>

export type UpdateVariantDTO = Record<string, unknown>

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
		const res = await api.get<ApiResponse<Product>>(`/product/${id}`)
		return res.data
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
		const res = await api.put<ApiResponse<Product>>(`/product/${id}`, dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// DELETE: Admin only
export async function deleteProduct(id: string, token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/${id}`, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: update
export async function updateProductVariant(variantId: string, dto: UpdateVariantDTO, token?: string): Promise<ApiResponse<unknown>> {
	try {
		const res = await api.put<ApiResponse<unknown>>(`/product/variant/${variantId}`, dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// VARIANT: delete
export async function deleteProductVariant(variantId: string, token?: string): Promise<ApiResponse<{ deleted: boolean } | null>> {
	try {
		const res = await api.delete<ApiResponse<{ deleted: boolean } | null>>(`/product/variant/${variantId}`, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}