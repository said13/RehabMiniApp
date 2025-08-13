import Link from 'next/link';
import AdminLayout from 'src/components/admin/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-4 max-w-xs">
        <Link
          href="/admin/subscription"
          className="block px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
        >
          Subscription Settings
        </Link>
        <Link
          href="/admin/categories"
          className="block px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
        >
          Categories Settings
        </Link>
        <Link
          href="/admin/users"
          className="block px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
        >
          Users Settings
        </Link>
      </div>
    </AdminLayout>
  );
}
