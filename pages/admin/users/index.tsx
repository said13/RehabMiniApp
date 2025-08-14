import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { UsersSection } from 'src/components/admin/UsersSection';

export default function AdminUsersPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <AdminLayout>
      <UsersSection />
    </AdminLayout>
  );
}

