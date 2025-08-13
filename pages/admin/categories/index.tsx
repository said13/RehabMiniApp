import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Category } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

const emptyForm = { id: '', title: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyForm);
    setEditId(null);
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ id: cat.id, title: cat.title });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2 mb-8">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between bg-neutral-900 px-4 py-2 rounded-lg"
          >
            <Link
              href={`/admin/categories/${cat.id}`}
              className="font-medium hover:underline"
            >
              {cat.title}
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <button
                className="text-blue-400 hover:underline"
                onClick={() => handleEdit(cat)}
              >
                Edit
              </button>
              <button
                className="text-red-400 hover:underline"
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">
        {editId ? 'Edit' : 'Add'} Category
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="id"
          disabled={!!editId}
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          {editId ? 'Update' : 'Create'}
        </button>
      </form>
    </AdminLayout>
  );
}
