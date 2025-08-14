import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { TrainingWithComplexes, Exercise, Complex } from 'src/types';
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
  const [training, setTraining] = useState<TrainingWithComplexes | null>(null);
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
    const trainingData = await res.json();
    let complexesRes = await fetch(`/api/complexes?trainingId=${id}`);
    let complexesData = await complexesRes.json();
    if (!complexesData.length) {
      const createdRes = await fetch(`/api/complexes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Main', trainingId: id }),
      });
      const created = await createdRes.json();
      complexesData = [created];
    }
    const complexesWithExercises: Complex[] = await Promise.all(
      complexesData.map(async (c: any) => {
        const exRes = await fetch(`/api/exercises?complexId=${c.id}`);
        const exData = await exRes.json();
        return {
          id: c.id,
          title: c.title,
          rounds: c.rounds,
          restBetweenSec: c.restBetweenSec,
          exercises: exData,
        } as Complex;
      })
    );
    setTraining({ ...trainingData, complexes: complexesWithExercises });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!training) return;
    const complex = training.complexes[0];
    if (editIdx !== null) {
      const exId = complex.exercises[editIdx].id;
      await fetch(`/api/exercises/${exId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, complexId: complex.id }),
      });
    } else {
      await fetch(`/api/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, complexId: complex.id }),
      });
    }
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
    const ex = complex.exercises[idx];
    await fetch(`/api/exercises/${ex.id}`, { method: 'DELETE' });
    fetchTraining();
  };

  return (
    <AdminLayout>
      <button onClick={() => router.back()}>Back</button>
      <h1>Training: {training?.name}</h1>
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
