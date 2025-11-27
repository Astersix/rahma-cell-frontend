import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'customer' | 'admin' | null

interface AuthState {
	isAuthenticated: boolean
	role: UserRole
	token: string | null
	loginAsUser: (token?: string | null) => void
	loginAsAdmin: (token?: string | null) => void
	logout: () => void
	setAuthenticated: (value: boolean) => void
	setRole: (role: UserRole) => void
	setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			isAuthenticated: false,
			role: null,
			token: null,
			loginAsUser: (token) => set({ isAuthenticated: true, role: 'customer', token: token ?? null }),
			loginAsAdmin: (token) => set({ isAuthenticated: true, role: 'admin', token: token ?? null }),
			logout: () => set({ isAuthenticated: false, role: null, token: null }),
			setAuthenticated: (value) => set({ isAuthenticated: value }),
			setRole: (role) => set({ role }),
			setToken: (token) => set({ token }),
		}),
		{ name: 'auth-store' },
	),
)

