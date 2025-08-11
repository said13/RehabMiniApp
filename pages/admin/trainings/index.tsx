import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { Course } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

export default function AdminTrainings() {
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const res = await fetch('/api/courses');
    const data = await res.json();
    setCourses(data);
  };

  return (
    <AdminLayout>
      <h1>Trainings</h1>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            {c.title}
            <Link href={`/admin/courses/${c.id}`} style={{ marginLeft: 10 }}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
