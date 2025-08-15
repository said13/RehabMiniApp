import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Training } from '../../types';

export function TrainingsSection() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    description: '',
    coverUrl: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    const res = await fetch('/api/trainings');
    const data = await res.json();
    setTrainings(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      categoryId: form.categoryId,
      description: form.description,
      coverUrl: form.coverUrl,
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
    setForm({ title: '', categoryId: '', description: '', coverUrl: '' });
    setEditId(null);
    fetchTrainings();
  };

  const handleEdit = (t: Training) => {
    setEditId(t.id);
    setForm({
      title: t.title,
      categoryId: t.categoryId,
      description: t.description,
      coverUrl: t.coverUrl,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/trainings/${id}`, { method: 'DELETE' });
    fetchTrainings();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Trainings</h1>
      <ul className="space-y-2 mb-8">
        {trainings.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between bg-neutral-900 px-4 py-2 rounded-lg cursor-pointer"
            onClick={() => router.push(`/admin/trainings/${t.id}`)}
          >
            <span className="font-medium">{t.title}</span>
            <div className="flex items-center gap-3 text-sm">
              <button
                className="text-blue-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(t);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">{editId ? 'Edit' : 'Add'} Training</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          placeholder="category ID"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="description"
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

