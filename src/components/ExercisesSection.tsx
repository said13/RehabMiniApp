import Image from 'next/image';
import type { Training, Exercise, ComplexWithExercises } from '../types';

interface ExercisesSectionProps {
  course: Training;
  complexes: ComplexWithExercises[];
  onBack: () => void;
  onStartCourse: () => void;
  onStartExercise: (ex: Exercise) => void;
}

export function ExercisesSection({ course, complexes, onBack, onStartCourse, onStartExercise }: ExercisesSectionProps) {
  return (
    <div>
      <div className="relative h-48 w-full">
        <Image src={course.coverUrl} alt={course.title} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <button
          aria-label="Back"
          className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white text-sm"
          onClick={onBack}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <h4 className="text-lg font-bold text-white">{course.title}</h4>
          <button
            aria-label="Start workout"
            className="p-4 bg-blue-600 text-white rounded-full text-2xl hover:bg-blue-500 transition"
            onClick={onStartCourse}
          >
            <i className="fa-solid fa-play"></i>
          </button>
        </div>
      </div>
      <div className="px-4 pt-4">
        <div className="grid gap-4">
          {complexes.map((l, idx) => (
            <div key={l.id} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="font-medium mb-2">
                {`Complex ${idx + 1}`}
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
                      {e.title} — {e.performDurationSec ? `${e.performDurationSec}s` : `${e.repetitions} reps`}
                    </span>
                    <i className="fa-solid fa-play text-blue-400 text-sm"></i>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

