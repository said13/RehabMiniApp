import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';

type Training = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
};

type Category = {
  id: string;
  title: string;
  coverUrl: string;
  trainings: Training[];
};

const emptyTraining = { title: '', description: '', coverUrl: '' };

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
    const payload = {
      title: form.title,
      description: form.description,
      coverUrl: form.coverUrl,
      categoryId: category.id,
    };
    if (editId) {
      await fetch(`/api/trainings/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setForm(emptyTraining);
    setEditId(null);
    fetchCategory();
  };

  const handleEdit = (training: Training) => {
    setEditId(training.id);
    setForm({ title: training.title, description: training.description, coverUrl: training.coverUrl });
  };

  const handleDelete = async (trainingId: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/trainings/${trainingId}`, { method: 'DELETE' });
    fetchCategory();
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push('/admin/categories')}>Back</button>
      <h1>Category: {category?.title}</h1>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            {t.title} ({t.id}){' '}
            <button onClick={() => handleEdit(t)}>Edit</button>
            <button onClick={() => handleDelete(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editId ? 'Edit' : 'Add'} Training</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
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
