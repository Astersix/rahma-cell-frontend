# 🛒 Frontend - Marketplace Digital CV Rahma Cell

Repository ini berisi kode sumber antarmuka pengguna (Frontend) untuk **Sistem Marketplace CV Rahma Cell**. [cite_start]Aplikasi ini dibangun sebagai *Single Page Application* (SPA) yang responsif untuk memudahkan pelanggan berbelanja secara digital[cite: 38].

## 📱 Tech Stack
* [cite_start]**Framework:** React.js dengan Vite [cite: 382]
* [cite_start]**Styling:** Tailwind CSS [cite: 384]
* [cite_start]**State Management:** Zustand [cite: 385]
* [cite_start]**HTTP Client:** Axios [cite: 387]

## ✨ Fitur Utama
* [cite_start]**Katalog Produk:** Pencarian dan filter kategori produk yang responsif[cite: 52].
* [cite_start]**Keranjang & Checkout:** Mendukung pembayaran QRIS dan Cash on Delivery (COD)[cite: 157].
* [cite_start]**Dashboard Admin:** Visualisasi data penjualan dan manajemen produk[cite: 55].
* [cite_start]**Mobile-First Design:** Tampilan optimal di Smartphone dan Desktop[cite: 280].

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
[cite_start]**Developed by Astersix Team** [cite: 1]
