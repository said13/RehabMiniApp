import type { Category } from '../types';

export function TrainingsScreen({
  category,
  onBack,
  onSelectTraining,
}: {
  category: Category;
  onBack: () => void;
  onSelectTraining: (trainingId: string) => void;
}) {
  return (
    <div className="px-4 pt-4">
      <button className="mb-4 text-sm text-gray-400 flex items-center gap-1" onClick={onBack}>
        <i className="fa-solid fa-chevron-left"></i>
        <span>Back</span>
      </button>
      <h4 className="text-lg font-bold mb-3">{category.title}</h4>
      <div className="grid gap-3">
        {category.trainings.map((t) => (
          <button
            key={t.id}
            className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800"
            onClick={() => onSelectTraining(t.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium leading-snug line-clamp-2">{t.title}</div>
            </div>
            <span className="text-gray-500"><i className="fa-solid fa-chevron-right"></i></span>
          </button>
        ))}
      </div>
    </div>
  );
}
