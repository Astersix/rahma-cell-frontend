import AdminLayout from '../../layouts/AdminLayout'

const OrdersPage = () => {
  return (
    <AdminLayout sidebarActive="orders">
      <div className="mx-auto max-w-full">
        <h1 className="text-2xl font-semibold text-black mb-2">Pesanan</h1>
        <p className="text-sm text-neutral-600 mb-6">Pantau dan kelola seluruh pesanan pelanggan.</p>
        <div className="rounded-md border border-neutral-200 bg-white p-6 text-sm text-neutral-700">Belum ada konten pesanan. (Placeholder)</div>
      </div>
    </AdminLayout>
  )
}

export default OrdersPage
