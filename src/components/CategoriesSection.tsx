import { TrainingsSection } from './TrainingsSection';
import { ExercisesSection } from './ExercisesSection';
import type { Category, Training, Exercise, ComplexWithExercises } from '../types';

interface CategoriesSectionProps {
  categories: Category[];
  trainings: Training[];
  exercises: ComplexWithExercises[];
  selectedCategory: Category | null;
  onSelectCategory: (cat: Category | null) => void;
  selectedCourse: Training | null;
  onSelectCourse: (course: Training | null) => void;
  onStartCourse: () => void;
  onStartExercise: (ex: Exercise) => void;
}

export function CategoriesSection({
  categories,
  trainings,
  exercises,
  selectedCategory,
  onSelectCategory,
  selectedCourse,
  onSelectCourse,
  onStartCourse,
  onStartExercise,
}: CategoriesSectionProps) {
  return (
    <>
      {!selectedCategory && !selectedCourse && (
        <section className="px-4 mt-6">
          <h4 className="text-lg font-bold mb-3">Категории</h4>
          <div className="grid gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800"
                onClick={() => onSelectCategory(cat)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug line-clamp-2">{cat.title}</div>
                </div>
                <span className="text-gray-500">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedCategory && !selectedCourse && (
        <TrainingsSection
          category={selectedCategory}
          trainings={trainings}
          onSelectCourse={(t) => onSelectCourse(t)}
          onBack={() => onSelectCategory(null)}
        />
      )}

      {selectedCourse && (
        <ExercisesSection
          course={selectedCourse}
          complexes={exercises}
          onBack={() => onSelectCourse(null)}
          onStartCourse={onStartCourse}
          onStartExercise={onStartExercise}
        />
      )}
    </>
  );
}

