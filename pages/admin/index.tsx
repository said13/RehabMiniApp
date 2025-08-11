import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Category } from '../../src/types';

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

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
    router.replace('/admin/login');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>
      <nav style={{ marginBottom: 20 }}>
        <Link href="/admin">Categories</Link> |{' '}
        <Link href="/admin/videos">Videos</Link>
        <button style={{ marginLeft: 20 }} onClick={logout}>Logout</button>
      </nav>
      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            {cat.title} ({cat.id}){' '}
            <button onClick={() => handleEdit(cat)}>Edit</button>
            <button onClick={() => handleDelete(cat.id)}>Delete</button>
            <Link href={`/admin/categories/${cat.id}`} style={{ marginLeft: 10 }}>
              Trainings
            </Link>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editId ? 'Edit' : 'Add'} Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="id"
          disabled={!!editId}
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}
