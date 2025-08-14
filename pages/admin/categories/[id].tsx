import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';

type Training = {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
};

type Category = {
  id: string;
  name: string;
  coverUrl: string;
  trainings: Training[];
};

const emptyTraining = { name: '', description: '', coverUrl: '' };

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [category, setCategory] = useState<Category | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState(emptyTraining);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);

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
    if (editId && editingTraining) {
      const updated: Training = {
        ...editingTraining,
        name: form.name,
        description: form.description,
        coverUrl: form.coverUrl,
      };
      await fetch(`/api/trainings/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } else {
      await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, training: form }),
      });
    }
    setForm(emptyTraining);
    setEditId(null);
    setEditingTraining(null);
    fetchCategory();
  };

  const handleEdit = (training: Training) => {
    setEditId(training.id);
    setEditingTraining(training);
    setForm({ name: training.name, description: training.description, coverUrl: training.coverUrl });
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
            {t.name} ({t.id}){' '}
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
        <textarea
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
