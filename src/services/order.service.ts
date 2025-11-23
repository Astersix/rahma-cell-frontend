import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface PlaceOrderPayload {
  paymentMethod: 'COD' | 'QRIS';
  addressId: number;
}

export interface PlaceOrderResponse {
  success: boolean;
  orderId: number;
  qrCode?: string; // Only present if paymentMethod is QRIS
  message?: string;
}

export const orderService = {
  placeOrder: async (payload: PlaceOrderPayload, token: string): Promise<PlaceOrderResponse> => {
    const response = await axios.post<PlaceOrderResponse>(
      `${API_URL}/orders/place-order`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getOrderStatus: async (orderId: number, token: string) => {
    const response = await axios.get(`${API_URL}/orders/status/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Expected { status: 'MENUNGGU_PEMBAYARAN' | 'DIPROSES' | ... }
  },
};