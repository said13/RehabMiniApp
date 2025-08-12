import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Course, Exercise, Lap } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

const blankExercise: Exercise = {
  id: '',
  title: '',
  video: '',
  mode: 'time',
  durationSec: 30,
  reps: 0,
};

const blankLap: Lap = { id: '', title: '', exercises: [] };

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<Exercise>(blankExercise);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [lapForm, setLapForm] = useState<Lap>(blankLap);
  const [lapEditIdx, setLapEditIdx] = useState<number | null>(null);
  const [activeLapIdx, setActiveLapIdx] = useState(0);

  useEffect(() => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    const res = await fetch(`/api/courses/${id}`);
    const data = await res.json();
    if (!data.laps || !data.laps.length) {
      data.laps = [{ id: 'main', title: 'Main', exercises: [] }];
    }
    setCourse(data);
    setActiveLapIdx(0);
  };

  const saveCourse = async (updated: Course) => {
    await fetch(`/api/courses/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const handleLapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    const laps = [...course.laps];
    if (lapEditIdx !== null) {
      laps[lapEditIdx] = { ...laps[lapEditIdx], id: lapForm.id, title: lapForm.title };
    } else {
      laps.push({ ...lapForm, exercises: [] });
    }
    const updated: Course = { ...course, laps };
    await saveCourse(updated);
    setLapEditIdx(null);
    setLapForm(blankLap);
    fetchCourse();
  };

  const handleLapEdit = (idx: number, lap: Lap) => {
    setLapEditIdx(idx);
    setLapForm({ id: lap.id, title: lap.title, exercises: [] });
  };

  const handleLapDelete = async (idx: number) => {
    if (!course) return;
    const laps = course.laps.filter((_, i) => i !== idx);
    const updated: Course = { ...course, laps };
    await saveCourse(updated);
    setActiveLapIdx(0);
    fetchCourse();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    const lap = course.laps[activeLapIdx];
    const exercises = [...lap.exercises];
    if (editIdx !== null) {
      exercises[editIdx] = form;
    } else {
      exercises.push(form);
    }
    const laps = course.laps.map((l, i) =>
      i === activeLapIdx ? { ...lap, exercises } : l
    );
    const updated: Course = { ...course, laps };
    await saveCourse(updated);
    setEditIdx(null);
    setForm(blankExercise);
    fetchCourse();
  };

  const handleEdit = (idx: number, ex: Exercise) => {
    setEditIdx(idx);
    setForm(ex);
  };

  const handleDelete = async (idx: number) => {
    if (!course) return;
    const lap = course.laps[activeLapIdx];
    const exercises = lap.exercises.filter((_, i) => i !== idx);
    const laps = course.laps.map((l, i) =>
      i === activeLapIdx ? { ...lap, exercises } : l
    );
    const updated: Course = { ...course, laps };
    await saveCourse(updated);
    fetchCourse();
  };

  const activeLap = course?.laps[activeLapIdx];

  return (
    <AdminLayout>
      <button onClick={() => router.back()}>Back</button>
      <h1>Training: {course?.title}</h1>

      <h2>Complexes</h2>
      <ul>
        {course?.laps.map((lap, idx) => (
          <li key={lap.id}>
            <button onClick={() => setActiveLapIdx(idx)}>{lap.title}</button>
            <button onClick={() => handleLapEdit(idx, lap)}>Edit</button>
            <button onClick={() => handleLapDelete(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <h3 style={{ marginTop: 20 }}>{lapEditIdx !== null ? 'Edit' : 'Add'} Complex</h3>
      <form onSubmit={handleLapSubmit}>
        <input
          value={lapForm.id}
          onChange={(e) => setLapForm({ ...lapForm, id: e.target.value })}
          placeholder="id"
          disabled={lapEditIdx !== null}
        />
        <input
          value={lapForm.title}
          onChange={(e) => setLapForm({ ...lapForm, title: e.target.value })}
          placeholder="title"
        />
        <button type="submit">{lapEditIdx !== null ? 'Update' : 'Create'}</button>
      </form>

      <h2 style={{ marginTop: 30 }}>
        Exercises in {activeLap?.title}
      </h2>
      <ul>
        {activeLap?.exercises.map((ex, idx) => (
          <li key={ex.id}>
            {ex.title} ({ex.mode})
            <button onClick={() => handleEdit(idx, ex)}>Edit</button>
            <button onClick={() => handleDelete(idx)}>Delete</button>
          </li>
        ))}
      </ul>
      <h3 style={{ marginTop: 20 }}>{editIdx !== null ? 'Edit' : 'Add'} Exercise</h3>
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
