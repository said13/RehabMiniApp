import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Exercise } from '../../types';

export function ExercisesSection() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [form, setForm] = useState({
    title: '',
    complexId: '',
    videoDurationSec: 0,
    performDurationSec: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const res = await fetch('/api/exercises');
    const data = await res.json();
    setExercises(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', complexId: '', videoDurationSec: 0, performDurationSec: 0 });
    fetchExercises();
  };

  return (
    <>
      <h1>Exercises</h1>
      <ul>
        {exercises.map((ex) => (
          <li key={ex.id}>
            {ex.title} – {ex.complexId}
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>Add Exercise</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
        />
        <input
          value={form.complexId}
          onChange={(e) => setForm({ ...form, complexId: e.target.value })}
          placeholder="complexId"
        />
        <input
          type="number"
          value={form.videoDurationSec}
          onChange={(e) => setForm({ ...form, videoDurationSec: Number(e.target.value) })}
          placeholder="video duration sec"
        />
        <input
          type="number"
          value={form.performDurationSec}
          onChange={(e) => setForm({ ...form, performDurationSec: Number(e.target.value) })}
          placeholder="perform duration sec"
        />
        <button type="submit">Create</button>
      </form>
    </>
  );
}
