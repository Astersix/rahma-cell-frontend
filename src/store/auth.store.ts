import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'customer' | 'admin' | null

interface AuthState {
	isAuthenticated: boolean
	role: UserRole
	// actions
	loginAsUser: () => void
	loginAsAdmin: () => void
	logout: () => void
	setAuthenticated: (value: boolean) => void
	setRole: (role: UserRole) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			isAuthenticated: false,
			role: null,
			loginAsUser: () => set({ isAuthenticated: true, role: 'customer' }),
			loginAsAdmin: () => set({ isAuthenticated: true, role: 'admin' }),
			logout: () => set({ isAuthenticated: false, role: null }),
			setAuthenticated: (value) => set({ isAuthenticated: value }),
			setRole: (role) => set({ role }),
		}),
		{ name: 'auth-store' },
	),
)

