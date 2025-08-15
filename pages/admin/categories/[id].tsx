import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';

type Training = {
  id: string;
  title: string;
};

type Category = {
  id: string;
  title: string;
  coverUrl: string;
  trainings: Training[];
};

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    const res = await fetch(`/api/categories/${id}`);
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
            <button onClick={() => router.push(`/admin/categories/${id}/${t.id}`)}>{t.title}</button>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
