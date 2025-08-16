import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { Category, Training } from 'src/types';
import { ImageUploader } from 'src/components/admin/ImageUploader';

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
      <button
        className="mb-4 px-3 py-2 text-sm bg-neutral-800 rounded-lg hover:bg-neutral-700"
        onClick={() => router.push('/admin/categories')}
      >
        Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Category: {category?.title}</h1>
      <ul className="space-y-2 mb-8">
        {trainings.map((t) => (
          <li key={t.id} className="bg-neutral-900 px-4 py-2 rounded-lg">
            <button
              className="text-blue-400 hover:underline"
              onClick={() => router.push(`/admin/categories/${categoryId}/${t.id}`)}
            >
              {t.title}
            </button>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Add Training</h2>
      <form onSubmit={handleCreate} className="space-y-3 max-w-sm">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="description"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <ImageUploader
          value={form.coverUrl}
          onChange={(url) => setForm({ ...form, coverUrl: url })}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          Create
        </button>
      </form>
    </AdminLayout>
  );
}
