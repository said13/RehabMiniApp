import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Video } from '../../../src/types';

const emptyVideo: Video = { id: '', title: '', url: '' };

export default function AdminVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [form, setForm] = useState<Video>(emptyVideo);
  const [editId, setEditId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    setVideos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/videos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm(emptyVideo);
    setEditId(null);
    fetchVideos();
  };

  const handleEdit = (v: Video) => {
    setEditId(v.id);
    setForm(v);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    fetchVideos();
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.push('/admin')}>Back</button>
      <h1>Videos</h1>
      <ul>
        {videos.map((v) => (
          <li key={v.id}>
            {v.title} ({v.id})
            <button onClick={() => handleEdit(v)}>Edit</button>
            <button onClick={() => handleDelete(v.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editId ? 'Edit' : 'Add'} Video</h2>
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
        <input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="Mux URL"
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
      </form>
    </div>
  );
}
