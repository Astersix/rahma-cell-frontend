import axios from 'axios'
import { api } from './api.service'

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

// Auth handled by interceptor

// GET /user/me -> { message, data: UserProfile }
export async function getMyProfile(_token?: string): Promise<UserProfile> {
	try {
		const res = await api.get('/user/me')
		const raw = res.data
		return (raw?.data ?? raw) as UserProfile
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PATCH /user/me/profile
export async function updateMyProfile(dto: UpdateProfileDto, _token?: string) {
	try {
		const res = await api.patch('/user/me/profile', dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PATCH /user/me/address (upsert default)
export async function updateMyDefaultAddress(dto: UpdateAddressDto, _token?: string) {
	try {
		const res = await api.patch('/user/me/address', dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// POST /user/me/address (create new address)
export async function createAddress(dto: UpdateAddressDto, _token?: string) {
	try {
		const res = await api.post('/user/me/address', dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// PATCH /user/me/address/:id (update specific address)
export async function updateAddress(addressId: string, dto: UpdateAddressDto, _token?: string) {
	try {
		const res = await api.patch(`/user/me/address/${addressId}`, dto)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

// DELETE /user/me/address/:id (delete address)
export async function deleteAddress(addressId: string, _token?: string) {
	try {
		const res = await api.delete(`/user/me/address/${addressId}`)
		return res.data
	} catch (err) {
		throw normalizeAxiosError(err)
	}
}

