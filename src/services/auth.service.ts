import axios from 'axios'

// Placeholder base URL. Replace with your actual API URL or set VITE_API_BASE_URL in .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com'

const api = axios.create({
	baseURL: API_BASE_URL,
	// Enable if your API uses cookies/sessions
	withCredentials: false,
})

export type LoginPayload = {
	email: string
	password: string
}

export type RegisterPayload = {
	name: string
	email: string
	password: string
}

// Adjust this to your backend's response shape when available
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

export async function login(payload: LoginPayload): Promise<AuthResponse> {
	// Endpoint path is a placeholder; update when backend is ready
	const res = await api.post<AuthResponse>('/auth/login', payload)
	return res.data
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
	// Endpoint path is a placeholder; update when backend is ready
	const res = await api.post<AuthResponse>('/auth/register', payload)
	return res.data
}

