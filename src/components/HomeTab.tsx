import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { BannerCarousel } from './BannerCarousel';
import { CategoriesSection } from './CategoriesSection';
import type {
  Category,
  Training,
  Exercise,
  ComplexWithExercises,
  TrainingWithComplexes,
} from '../types';
import type { Dispatch, SetStateAction } from 'react';

interface HomeTabProps {
  viewerCourse: TrainingWithComplexes | null;
  setViewerCourse: Dispatch<SetStateAction<TrainingWithComplexes | null>>;
}

export function HomeTab({ viewerCourse, setViewerCourse }: HomeTabProps) {
  const router = useRouter();

  const banners = useMemo(
    () => [
      { id: 'sub', title: 'Go PRO', text: 'Unlock all courses & programs', cta: 'Subscribe', color: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
      { id: 'spine', title: 'Healthy Back', text: '10‑min daily plan', cta: 'Explore', color: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
    ],
    [],
  );

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    if (viewerCourse) return;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [viewerCourse, banners.length]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Training | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercises, setExercises] = useState<ComplexWithExercises[]>([]);

  useEffect(() => {
    if (selectedCategory) {
      fetch('/api/trainings')
        .then((res) => res.json())
        .then((data: Training[]) =>
          setTrainings(data.filter((t) => t.categoryId === selectedCategory.id)),
        )
        .catch(() => {});
    } else {
      setTrainings([]);
    }
    setSelectedCourse(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCourse) {
      Promise.all([fetch('/api/complexes'), fetch('/api/exercises')])
        .then(async ([cRes, eRes]) => {
          const allComplexes = await cRes.json();
          const allExercises = await eRes.json();
          const courseComplexes: ComplexWithExercises[] = allComplexes
            .filter((c: ComplexWithExercises) => c.trainingId === selectedCourse.id)
            .map((c: any) => ({
              ...c,
              exercises: allExercises.filter((e: Exercise) => e.complexId === c.id),
            }));
          setExercises(courseComplexes);
        })
        .catch(() => {});
    } else {
      setExercises([]);
    }
  }, [selectedCourse]);

  const startExercise = (ex: Exercise) => {
    if (!selectedCourse) return;
    const single: TrainingWithComplexes = {
      id: `${selectedCourse.id}-${ex.id}`,
      categoryId: selectedCourse.categoryId,
      title: ex.title,
      description: '',
      coverUrl: '',
      complexes: [{ id: ex.id, trainingId: selectedCourse.id, order: 1, rounds: 1, exercises: [ex] }],
    };
    setViewerCourse(single);
  };

  return (
    <div>
      {!selectedCategory && !selectedCourse && (
        <BannerCarousel banners={banners} activeIndex={bannerIdx} onSelect={setBannerIdx} router={router} />
      )}
        <CategoriesSection
          categories={categories}
          trainings={trainings}
          exercises={exercises}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedCourse={selectedCourse}
          onSelectCourse={setSelectedCourse}
          onStartCourse={() =>
            selectedCourse &&
            setViewerCourse({ ...selectedCourse, complexes: exercises })
          }
          onStartExercise={startExercise}
        />
      </div>
    );
}
