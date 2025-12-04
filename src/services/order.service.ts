import { api } from './api.service'

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
    const res = await api.post(`/payment/${orderId}/qris`)
    return res.data
  },

  // GET /payment/:orderId
  getPaymentByOrder: async (orderId: string | number) => {
    const res = await api.get(`/payment/${orderId}`)
    return res.data
  },

  // GET /order/me
  getMyOrders: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await api.get(`/order/me`, { params })
    return res.data
  },

  // Admin: GET /order (list all orders) if available
  getAllOrdersAdmin: async (params?: { page?: number; limit?: number; status?: string }) => {
    const res = await api.get(`/order`, { params })
    return res.data
  },
  
  // New: fetch single order details (admin/customer with proper auth)
  getOrderById: async (orderId: string) => {
    const { data } = await api.get(`/order/${orderId}`)
    return data
  },
  
  // New: update order status or details (admin)
  updateOrderStatus: async (
    orderId: string,
    payload: { status?: string; trackingNumber?: string; note?: string }
  ) => {
    const { data } = await api.patch(`/order/${orderId}`, payload)
    return data
  },
  
  // New: cancel an order by id (customer/admin as allowed by backend)
  cancelOrder: async (orderId: string) => {
    const { data } = await api.post(`/order/${orderId}/cancel`)
    return data
  },
}
