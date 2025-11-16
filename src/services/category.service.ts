import axios from 'axios'

// API base (reuse env or fallback) with normalization
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
	return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET ALL (requires auth per backend routes)
export async function getAllCategories(token?: string): Promise<ApiResponse<Category[]>> {
	try {
		const res = await api.get<any>('/category', { headers: authHeaders(token) })
		const raw = res.data
		const list: Category[] = Array.isArray(raw)
			? raw
			: Array.isArray(raw?.data)
			? raw.data
			: Array.isArray(raw?.categories)
			? raw.categories
			: Array.isArray(raw?.data?.categories)
			? raw.data.categories
			: []
		return { data: list, message: raw?.message }
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// GET BY ID (requires auth)
export async function getCategoryById(id: string, token?: string): Promise<ApiResponse<Category>> {
	try {
		const res = await api.get<ApiResponse<Category>>(`/category/${id}`, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

