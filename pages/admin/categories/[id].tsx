import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Category, Training } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

const emptyTraining = { name: '', description: '', coverUrl: '' };

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [category, setCategory] = useState<Category | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState(emptyTraining);
  const [editId, setEditId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    if (editId) {
      await fetch(`/api/trainings/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: category.id }),
      });
    } else {
      await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: category.id }),
      });
    }
    setForm(emptyTraining);
    setEditId(null);
    fetchCategory();
  };

  const handleEdit = (training: Training) => {
    setEditId(training.id);
    setForm({
      name: training.name,
      description: training.description,
      coverUrl: training.coverUrl,
    });
  };

  const handleDelete = async (trainingId: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/trainings/${trainingId}`, { method: 'DELETE' });
    fetchCategory();
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push('/admin/categories')}>Back</button>
      <h1>Category: {category?.name}</h1>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            {t.name}
            <button onClick={() => handleEdit(t)}>Edit</button>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editId ? 'Edit' : 'Add'} Training</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="name"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="description"
        />
        <input
          value={form.coverUrl}
          onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
          placeholder="coverUrl"
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
      </form>
    </AdminLayout>
  );
}
