import axios from 'axios'
import { api } from './api.service'

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

export async function checkPhoneExists(phone: string): Promise<boolean> {
	try {
		const res = await api.get<{ exists: boolean }>('/auth/check-phone', { params: { phone } })
		return !!res.data.exists
	} catch (err) {
		const info = normalizeAxiosError(err)
		throw info
	}
}

// Refresh access token: POST /auth/refresh
export async function refreshToken(): Promise<AuthResponse> {
	try {
		const res = await api.post<AuthResponse>('/auth/refresh')
		return res.data
	} catch (err) {
		const info = normalizeAxiosError(err)
		throw info
	}
}

// Logout: POST /auth/logout
export async function logout(): Promise<{ message?: string; [k: string]: unknown }> {
	try {
		const res = await api.post('/auth/logout')
		return res.data
	} catch (err) {
		const info = normalizeAxiosError(err)
		throw info
	}
}