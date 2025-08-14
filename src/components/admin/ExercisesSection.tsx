import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Exercise } from '../../types';

interface DBExercise extends Exercise {
  complexId: string;
}

export function ExercisesSection() {
  const [exercises, setExercises] = useState<DBExercise[]>([]);
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
    </>
  );
}
