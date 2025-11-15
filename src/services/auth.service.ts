import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5000/api'

const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: false,
	headers: {
		'Content-Type': 'application/json',
	},
})

export type LoginPayload = {
	email: string
	password: string
}

export type RegisterPayload = {
	name: string
	phone: string
	email: string
	password: string
	role: 'customer' | string
}

export type AuthResponse = {
	token?: string
	user?: {
		id?: string | number
		name?: string
		email?: string
		role?: string
	}
	message?: string
	[key: string]: unknown
}

function normalizeAxiosError(err: unknown) {
	if (axios.isAxiosError(err)) {
		const axiosErr = err
		return {
			message: axiosErr.response?.data?.message || axiosErr.message,
			status: axiosErr.response?.status,
			data: axiosErr.response?.data,
		}
	}
	return { message: String(err) }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
	try {
		const res = await api.post<AuthResponse>('/auth/login', payload)
		return res.data
	} catch (err) {
		const info = normalizeAxiosError(err)
		throw info
	}
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
	try {
		const res = await api.post<AuthResponse>('/auth/register', payload)
		return res.data
	} catch (err) {
		const info = normalizeAxiosError(err)
		throw info
	}
}