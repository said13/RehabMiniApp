import type { Category, Training, Exercise } from '../types';

interface CategoriesSectionProps {
  categories: Category[];
  selectedCategory: Category | null;
  onSelectCategory: (cat: Category | null) => void;
  selectedCourse: Training | null;
  onSelectCourse: (course: Training | null) => void;
  onStartCourse: () => void;
  onStartExercise: (ex: Exercise) => void;
}

export function CategoriesSection({
  categories,
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
        <div className="px-4 pt-4">
          <button
            className="mb-4 text-sm text-gray-400 flex items-center gap-1"
            onClick={() => onSelectCategory(null)}
          >
            <i className="fa-solid fa-chevron-left"></i>
            <span>Back</span>
          </button>
          <h4 className="text-lg font-bold mb-3">{selectedCategory.title}</h4>
          <div className="grid gap-3">
            {selectedCategory.trainings.map((t) => (
              <button
                key={t.id}
                className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800"
                onClick={() => onSelectCourse(t)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug line-clamp-2">{t.title}</div>
                </div>
                <span className="text-gray-500">
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && (
        <div className="px-4 pt-4">
          <button
            className="mb-4 text-sm text-gray-400 flex items-center gap-1"
            onClick={() => onSelectCourse(null)}
          >
            <i className="fa-solid fa-chevron-left"></i>
            <span>Back</span>
          </button>
          <button
            className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition"
            onClick={onStartCourse}
          >
            Start workout
          </button>
          <h4 className="text-lg font-bold mb-3">{selectedCourse.title}</h4>
          <div className="grid gap-4">
            {selectedCourse.complexes.map((l) => (
              <div key={l.id} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                <div className="font-medium mb-2">
                  {l.title}
                  {l.rounds ? ` ×${l.rounds}` : ''}
                </div>
                <div className="grid gap-2">
                  {l.exercises.map((e) => (
                    <button
                      key={e.id}
                      className="w-full text-left p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-between"
                      onClick={() => onStartExercise(e)}
                    >
                      <span className="text-sm">
                        {e.title} — {e.mode === 'time' ? `${e.durationSec}s` : `${e.reps} reps`}
                      </span>
                      <i className="fa-solid fa-play text-blue-400 text-sm"></i>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
