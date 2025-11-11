import AdminLayout from "../../layouts/AdminLayout"

const AdminDashboard = () => {
	return (
		<AdminLayout sidebarActive="dashboard">
			<div className="mx-auto max-w-full">
				<h1 className="text-2xl font-semibold text-black mb-2">Dashboard</h1>
				<p className="text-sm text-neutral-600 mb-6">Ringkasan performa toko dan penjualan hari ini.</p>
				<div className="rounded-md border border-neutral-200 bg-white p-6 text-sm text-neutral-700">Belum ada konten dashboard. (Placeholder)</div>
			</div>
    	</AdminLayout>
	)
}

export default AdminDashboard

