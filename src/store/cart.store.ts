import axios from 'axios';
import { create } from 'zustand';


interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  clearCart: () => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token'); // Ambil token user yg login
      const API_URL = import.meta.env.VITE_API_BASE_URL;

      // Panggil API dari backend
      const response = await axios.get(`${API_URL}/cart/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Masukkan data dari backend ke state
      // (Asumsi backend kirim array produk di response.data.items atau response.data)
      set({ items: response.data.items || response.data });
      
    } catch (error) {
      console.error("Gagal mengambil keranjang:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: () => set({ items: [] }),

  totalPrice: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
