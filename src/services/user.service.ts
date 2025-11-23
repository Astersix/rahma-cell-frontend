import axios from 'axios'

// Base URL normalization like other services
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

export type ISODateString = string

export interface Address {
	id: string
	user_id?: string
	recipient_name: string
	phone: string
	address: string
	is_default?: boolean
	created_at?: ISODateString
	updated_at?: ISODateString
}

export interface UserProfile {
	id: string
	name?: string
	email?: string
	phone?: string
	role?: string
	address?: Address[]
}

export type UpdateProfileDto = Partial<Pick<UserProfile, 'name' | 'email' | 'phone'>>
export type UpdateAddressDto = {
	recipient_name: string
	phone: string
	address: string
	is_default?: boolean
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

// GET /users/me -> { message, data: UserProfile }
export async function getMyProfile(token?: string): Promise<UserProfile> {
	try {
		const res = await api.get('/users/me', { headers: authHeaders(token) })
		const raw = res.data
		return (raw?.data ?? raw) as UserProfile
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PATCH /users/me/profile
export async function updateMyProfile(dto: UpdateProfileDto, token?: string) {
	try {
		const res = await api.patch('/users/me/profile', dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PATCH /users/me/address (upsert default)
export async function updateMyDefaultAddress(dto: UpdateAddressDto, token?: string) {
	try {
		const res = await api.patch('/users/me/address', dto, { headers: authHeaders(token) })
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

