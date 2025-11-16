import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  key: string // productId:variantId
  productId: string
  productName: string
  variantId: string
  variantName?: string
  price?: number
  imageUrl?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'key'>, quantity?: number) => void
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const key = `${item.productId}:${item.variantId}`
        const items = [...get().items]
        const existing = items.find((i) => i.key === key)
        if (existing) {
          existing.quantity = Math.max(1, existing.quantity + quantity)
          set({ items: [...items] })
        } else {
          items.push({ key, ...item, quantity: Math.max(1, quantity) })
          set({ items })
        }
      },
      updateQuantity: (key, quantity) => {
        const q = Math.max(1, quantity)
        set({
          items: get().items.map((i) => (i.key === key ? { ...i, quantity: q } : i)),
        })
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart-store' },
  ),
)
