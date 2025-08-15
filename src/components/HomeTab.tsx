import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { BannerCarousel } from './BannerCarousel';
import { CategoriesSection } from './CategoriesSection';
import type { Category, Training, Exercise } from '../types';
import type { Dispatch, SetStateAction } from 'react';

interface HomeTabProps {
  viewerCourse: Training | null;
  setViewerCourse: Dispatch<SetStateAction<Training | null>>;
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

  const startExercise = (ex: Exercise) => {
    if (!selectedCourse) return;
    const single: Training = {
      id: `${selectedCourse.id}-${ex.id}`,
      title: ex.title,
      complexes: [{ id: ex.id, title: ex.title, exercises: [ex] }],
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
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        onStartCourse={() => selectedCourse && setViewerCourse(selectedCourse)}
        onStartExercise={startExercise}
      />
    </div>
  );
}
