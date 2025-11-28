import { api, API_BASE_URL } from './api.service'

export type PaymentMethod = 'cod' | 'qris'
export type CheckoutMethod = 'cart' | 'direct'

export interface CheckoutItem {
  product_variant_id: string
  quantity: number
}

// Matches backend zod schema (snake_case)
export interface PlaceOrderRequest {
  payment_method: PaymentMethod
  address_id: string
  checkout_method: CheckoutMethod
  items: CheckoutItem[]
}

export interface PlaceOrderResponse {
  success?: boolean
  succes?: boolean
  message?: string
  data?: {
    order_id: string | number
    total: number
    status: string
    payment?: {
      qr_code?: string
      status?: string
      total?: number
    } | null
  }
}

export const orderService = {
  // POST /order/place-order
  placeOrder: async (payload: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    const res = await api.post<PlaceOrderResponse>(`/order/place-order`, payload)
    return res.data
  },

  // POST /payment/:orderId/qris
  initiateQris: async (orderId: string | number) => {
    const res = await api.post(`${API_BASE_URL}/payment/${orderId}/qris`)
    return res.data
  },

  // GET /payment/:orderId
  getPaymentByOrder: async (orderId: string | number) => {
    const res = await api.get(`${API_BASE_URL}/payment/${orderId}`)
    return res.data
  },

  // GET /order/me
  getMyOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await api.get(`/order/me`, { params })
    return res.data
  },
}