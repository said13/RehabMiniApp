import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Training, Exercise } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

const blankExercise: Exercise = {
  id: '',
  title: '',
  video: '',
  mode: 'time',
  durationSec: 30,
  reps: 0,
};

export default function TrainingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [training, setTraining] = useState<Training | null>(null);
  const [form, setForm] = useState<Exercise>(blankExercise);
  const [editIdx, setEditIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchTraining();
  }, [id]);

  const fetchTraining = async () => {
    const res = await fetch(`/api/trainings/${id}`);
    const data = await res.json();
    if (!data.complexes || !data.complexes.length) {
      data.complexes = [{ id: 'main', title: 'Main', exercises: [] }];
    }
    setTraining(data);
  };

  const saveTraining = async (updated: Training) => {
    await fetch(`/api/trainings/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;
    const complex = training.complexes[0];
    const exercises = [...complex.exercises];
    if (editIdx !== null) {
      exercises[editIdx] = form;
    } else {
      exercises.push(form);
    }
    const updated: Training = { ...training, complexes: [{ ...complex, exercises }] };
    await saveTraining(updated);
    setEditIdx(null);
    setForm(blankExercise);
    fetchTraining();
  };

  const handleEdit = (idx: number, ex: Exercise) => {
    setEditIdx(idx);
    setForm(ex);
  };

  const handleDelete = async (idx: number) => {
    if (!training) return;
    const complex = training.complexes[0];
    const exercises = complex.exercises.filter((_, i) => i !== idx);
    const updated: Training = { ...training, complexes: [{ ...complex, exercises }] };
    await saveTraining(updated);
    fetchTraining();
  };

  return (
    <AdminLayout>
      <button onClick={() => router.back()}>Back</button>
      <h1>Training: {training?.title}</h1>
      <ul>
        {training?.complexes[0]?.exercises.map((ex: Exercise, idx: number) => (
          <li key={ex.id}>
            {ex.title} ({ex.mode})
            <button onClick={() => handleEdit(idx, ex)}>Edit</button>
            <button onClick={() => handleDelete(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editIdx !== null ? 'Edit' : 'Add'} Exercise</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="id"
          disabled={editIdx !== null}
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
        />
        <input
          value={form.video}
          onChange={(e) => setForm({ ...form, video: e.target.value })}
          placeholder="Mux video URL"
        />
        <select
          value={form.mode}
          onChange={(e) =>
            setForm({ ...form, mode: e.target.value as Exercise['mode'] })
          }
        >
          <option value="time">time</option>
          <option value="reps">reps</option>
          <option value="demo">demo</option>
        </select>
        {form.mode === 'time' && (
          <input
            type="number"
            value={form.durationSec || ''}
            onChange={(e) =>
              setForm({ ...form, durationSec: Number(e.target.value) })
            }
            placeholder="durationSec"
          />
        )}
        {form.mode === 'reps' && (
          <input
            type="number"
            value={form.reps || ''}
            onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
            placeholder="reps"
          />
        )}
        <input
          type="number"
          value={form.restSec || ''}
          onChange={(e) => setForm({ ...form, restSec: Number(e.target.value) })}
          placeholder="restSec"
        />
        <button type="submit">{editIdx !== null ? 'Update' : 'Create'}</button>
      </form>
    </AdminLayout>
  );
}
