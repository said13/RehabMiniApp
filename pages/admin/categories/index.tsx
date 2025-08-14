import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { CategoriesSection } from 'src/components/admin/CategoriesSection';

export default function AdminCategoriesPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <AdminLayout>
      <CategoriesSection />
    </AdminLayout>
  );
}
