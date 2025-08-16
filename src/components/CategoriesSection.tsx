import { TrainingsSection } from './TrainingsSection';
import { ExercisesSection } from './ExercisesSection';
import { CoverCard } from './CoverCard';
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
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CoverCard
                key={cat.id}
                title={cat.title}
                imageUrl={cat.coverUrl}
                onClick={() => onSelectCategory(cat)}
              />
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

