import AdminLayout from "../../layouts/AdminLayout"

const AdminDashboard = () => {
	return (
		<>
			<AdminLayout sidebarActive="dashboard">
				<div className="p-6 text-2xl font-bold">Admin Dashboard</div>
			</AdminLayout>
		</>
	)
}

export default AdminDashboard

