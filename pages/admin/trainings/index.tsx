import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Training } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

export default function AdminTrainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    const res = await fetch('/api/trainings');
    const data = await res.json();
    setTrainings(data);
  };

  return (
    <AdminLayout>
      <h1>Trainings</h1>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            {t.name}
            <Link href={`/admin/trainings/${t.id}`} style={{ marginLeft: 10 }}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
