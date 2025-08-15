import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import { ExercisesSection } from 'src/components/admin/ExercisesSection';
import type { Training } from 'src/types';

export default function TrainingExercisesPage() {
  const router = useRouter();
  const { categoryId, trainingId } = router.query as { categoryId?: string; trainingId?: string };
  const [training, setTraining] = useState<Training | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!trainingId) return;
    fetchTraining();
  }, [trainingId]);

  const fetchTraining = async () => {
    const res = await fetch(`/api/trainings/${trainingId}`);
    const data = await res.json();
    setTraining(data);
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push(`/admin/categories/${categoryId}`)}>Back</button>
      <h1>Training: {training?.title}</h1>
      <ExercisesSection />
    </AdminLayout>
  );
}
