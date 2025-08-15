import type { Training, Exercise } from '../types';

interface Complex {
  id: string;
  title: string;
  rounds?: number;
  exercises: Exercise[];
}

interface ExercisesSectionProps {
  course: Training;
  complexes: Complex[];
  onBack: () => void;
  onStartCourse: () => void;
  onStartExercise: (ex: Exercise) => void;
}

export function ExercisesSection({ course, complexes, onBack, onStartCourse, onStartExercise }: ExercisesSectionProps) {
  return (
    <div className="px-4 pt-4">
      <button
        className="mb-4 text-sm text-gray-400 flex items-center gap-1"
        onClick={onBack}
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
      <h4 className="text-lg font-bold mb-3">{course.title}</h4>
      <div className="grid gap-4">
        {complexes.map((l) => (
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
  );
}

