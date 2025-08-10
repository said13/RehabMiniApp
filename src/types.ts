export type Cue = { atSec: number; text: string; tts?: boolean };

export type Exercise = {
  id: string;
  title: string;
  video: string;
  thumbnail?: string;
  mode: 'time' | 'reps' | 'demo';
  durationSec?: number;
  reps?: number;
  restSec?: number;
  cues?: Cue[];
};

export type Lap = {
  id: string;
  title: string;
  exercises: Exercise[];
  rounds?: number;
  restBetweenSec?: number;
};

export type Course = { id: string; title: string; laps: Lap[] };

export type Category = { id: string; title: string; courses: Course[] };
