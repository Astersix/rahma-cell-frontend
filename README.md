# 🛒 Frontend - Marketplace Digital CV Rahma Cell

Repository ini berisi kode sumber antarmuka pengguna (Frontend) untuk **Sistem Marketplace CV Rahma Cell**. [cite_start]Aplikasi ini dibangun sebagai *Single Page Application* (SPA) yang responsif untuk memudahkan pelanggan berbelanja secara digital[cite: 38].

## 📱 Tech Stack
* **Framework:** React.js dengan Vite
* **Styling:** Tailwind CSS
* **State Management:** Zustand 
* **HTTP Client:** Axios 

## ✨ Fitur Utama
* **Katalog Produk:** Pencarian dan filter kategori produk yang responsif.
* **Keranjang & Checkout:** Mendukung pembayaran QRIS dan Cash on Delivery (COD).
* **Dashboard Admin:** Visualisasi data penjualan dan manajemen produk.
* **Mobile-First Design:** Tampilan optimal di Smartphone dan Desktop.

## 🚀 Cara Menjalankan (Local Development)

Pastikan Node.js sudah terinstall.

1.  **Clone repositori:**
    ```bash
    git clone [https://github.com/Astersix/frontend.git](https://github.com/Astersix/frontend.git)
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment Variable:**
    Buat file `.env` di root folder dan isi sesuai `.env.example`:
    ```env
    VITE_API_BASE_URL=http://localhost:3000/api/v1
    ```
4.  **Jalankan aplikasi:**
    ```bash
    npm run dev
    ```

---
**Developed by Astersix Team**
