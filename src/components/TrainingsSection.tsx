import type { Category, Training } from '../types';
import { CoverCard } from './CoverCard';

interface TrainingsSectionProps {
  category: Category;
  trainings: Training[];
  onSelectCourse: (course: Training) => void;
  onBack: () => void;
}

export function TrainingsSection({ category, trainings, onSelectCourse, onBack }: TrainingsSectionProps) {
  return (
    <div className="px-4 pt-4">
      <button
        className="mb-4 text-sm text-gray-400 flex items-center gap-1"
        onClick={onBack}
      >
        <i className="fa-solid fa-chevron-left"></i>
        <span>Back</span>
      </button>
      <h4 className="text-lg font-bold mb-3">{category.title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {trainings.map((t) => (
          <CoverCard
            key={t.id}
            title={t.title}
            imageUrl={t.coverUrl}
            onClick={() => onSelectCourse(t)}
          />
        ))}
      </div>
    </div>
  );
}

