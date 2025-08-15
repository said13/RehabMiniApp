import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { Category, Training } from 'src/types';

export default function CategoryDetail() {
  const router = useRouter();
  const { categoryId } = router.query as { categoryId?: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState({ title: '', description: '', coverUrl: '' });

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/trainings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, categoryId }),
    });
    setForm({ title: '', description: '', coverUrl: '' });
    fetchCategory();
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
      <h2 style={{ marginTop: 30 }}>Add Training</h2>
      <form onSubmit={handleCreate}>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="description"
        />
        <input
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          placeholder="cover url"
        />
        <button type="submit">Create</button>
      </form>
    </AdminLayout>
  );
}
