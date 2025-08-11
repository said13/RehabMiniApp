import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Course, Exercise } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

interface FlatExercise extends Exercise {
  courseId: string;
  courseTitle: string;
}

export default function AdminExercises() {
  const [exercises, setExercises] = useState<FlatExercise[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const res = await fetch('/api/courses');
    const data: Course[] = await res.json();
    const flat: FlatExercise[] = [];
    data.forEach((course) => {
      course.laps[0]?.exercises.forEach((ex) => {
        flat.push({ ...ex, courseId: course.id, courseTitle: course.title });
      });
    });
    setExercises(flat);
  };

  return (
    <AdminLayout>
      <h1>Exercises</h1>
      <ul>
        {exercises.map((ex) => (
          <li key={ex.id}>
            {ex.title} – {ex.courseTitle}
            <Link href={`/admin/courses/${ex.courseId}`} style={{ marginLeft: 10 }}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
