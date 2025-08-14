import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { TrainingsSection } from 'src/components/admin/TrainingsSection';

export default function AdminTrainingsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <AdminLayout>
      <TrainingsSection />
    </AdminLayout>
  );
}

