import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL

export type PaymentMethod = 'cod' | 'qris'

export interface PlaceOrderPayload {
  paymentMethod: PaymentMethod
  addressId: string
  productVariantIds: string[]
}

export interface PlaceOrderSuccess {
  success: true
  message: string
  data: {
    orderId: string | number
    total: number
    status: string
    payment?: {
      qr_code?: string
      status?: string
      total?: number
    }
  }
}

export const orderService = {
  placeOrder: async (payload: PlaceOrderPayload, token: string): Promise<PlaceOrderSuccess> => {
    const response = await axios.post<PlaceOrderSuccess>(
      `${API_URL}/orders/place-order`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data
  },

  getOrderStatus: async (orderId: number | string, token: string) => {
    const response = await axios.get(`${API_URL}/orders/status/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}