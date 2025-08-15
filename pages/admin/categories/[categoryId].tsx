import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { Category, Training } from 'src/types';

export default function CategoryDetail() {
  const router = useRouter();
  const { categoryId } = router.query as { categoryId?: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    if (!categoryId) return;
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    const res = await fetch(`/api/categories/${categoryId}`);
    const data = await res.json();
    setCategory(data);
    setTrainings(data.trainings || []);
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push('/admin/categories')}>Back</button>
      <h1>Category: {category?.title}</h1>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            <button onClick={() => router.push(`/admin/categories/${categoryId}/${t.id}`)}>{t.title}</button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
