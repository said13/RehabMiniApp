import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Category, Training } from '../../types';

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState({ title: '', coverUrl: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
    fetchTrainings();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchTrainings = async () => {
    const res = await fetch('/api/trainings');
    const data = await res.json();
    setTrainings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: form.title, coverUrl: form.coverUrl };
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setForm({ title: '', coverUrl: '' });
    setEditId(null);
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ title: cat.title, coverUrl: cat.coverUrl });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2 mb-8">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="bg-neutral-900 px-4 py-2 rounded-lg"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => router.push(`/admin/categories/${cat.id}`)}
            >
              <span className="font-medium">{cat.title}</span>
              <div className="flex items-center gap-3 text-sm">
                <button
                  className="text-blue-400 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(cat);
                  }}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <ul className="mt-2 ml-4 space-y-1">
              {trainings
                .filter((t) => t.categoryId === cat.id)
                .map((t) => (
                  <li key={t.id}>
                    <button
                      className="text-sm text-blue-400 hover:underline"
                      onClick={() => router.push(`/admin/categories/${cat.id}/${t.id}`)}
                    >
                      {t.title}
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">{editId ? 'Edit' : 'Add'} Category</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          placeholder="cover URL"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          {editId ? 'Update' : 'Create'}
        </button>
      </form>
    </>
  );
}
