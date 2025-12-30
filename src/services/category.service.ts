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

// GET ALL (requires auth per backend routes)
export async function getAllCategories(_token?: string): Promise<ApiResponse<Category[]>> {
	try {
		const res = await api.get<any>('/category')
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
export async function getCategoryById(id: string, _token?: string): Promise<ApiResponse<Category>> {
	try {
		const res = await api.get<ApiResponse<Category>>(`/category/${id}`)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

