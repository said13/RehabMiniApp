import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface Category { id: string; title: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authed = localStorage.getItem('auth');
      if (!authed) {
        router.push('/admin/login');
      } else {
        fetchCategories();
        fetchVideos();
      }
    }
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      setTitle('');
      fetchCategories();
    }
  };

  const fetchVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    setVideos(data); 
  };

  const uploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: videoUrl }),
    });
    if (res.ok) {
      setVideoUrl('');
      fetchVideos();
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Categories</h2>
        <form onSubmit={addCategory} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="New category title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
        <ul>
          {categories.map((c) => (
            <li key={c.id}>{c.title}</li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Videos</h2>
        <form onSubmit={uploadVideo} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <button type="submit">Upload</button>
        </form>
        <ul>
          {videos?.data?.map((v: any) => (
            <li key={v.id}>{v.id}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
