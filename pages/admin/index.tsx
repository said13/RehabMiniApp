import AdminLayout from 'src/components/admin/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-300">Select a section from the menu to manage content.</p>
    </AdminLayout>
  );
}
