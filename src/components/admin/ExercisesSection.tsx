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
      <h1 className="text-2xl font-bold mb-4">Exercises</h1>
      <ul className="space-y-2 mb-8">
        {exercises.map((ex) => (
          <li key={ex.id} className="bg-neutral-900 px-4 py-2 rounded-lg">
            {ex.title} – {ex.complexId}
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">Add Exercise</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.complexId}
          onChange={(e) => setForm({ ...form, complexId: e.target.value })}
          placeholder="complexId"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          type="number"
          value={form.videoDurationSec}
          onChange={(e) => setForm({ ...form, videoDurationSec: Number(e.target.value) })}
          placeholder="video duration sec"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          type="number"
          value={form.performDurationSec}
          onChange={(e) => setForm({ ...form, performDurationSec: Number(e.target.value) })}
          placeholder="perform duration sec"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          Create
        </button>
      </form>
    </>
  );
}
