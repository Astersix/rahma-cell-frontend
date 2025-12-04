import axios from 'axios'
import { attachAuthInterceptor, API_BASE_URL } from './api.service'

// Base URL Normalization
const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)
const BASE = RAW_BASE
	? (/^https?:\/\//i.test(RAW_BASE) ? RAW_BASE : `http://localhost${RAW_BASE}`)
	: API_BASE_URL

const api = axios.create({
	baseURL: BASE,
	withCredentials: false,
	headers: {
		'Content-Type': 'application/json',
	},
})

attachAuthInterceptor(api)

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
	if (!token) return undefined
	const raw = String(token)
	const t = raw.replace(/^Bearer\s+/i, '')
	return { Authorization: `Bearer ${t}` }
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

