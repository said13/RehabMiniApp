import AdminLayout from 'src/components/admin/AdminLayout';
import AdminDashboard from 'src/components/admin/AdminDashboard';

export default function AdminIndex() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}
