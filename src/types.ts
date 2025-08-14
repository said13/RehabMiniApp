export type Cue = { atSec: number; text: string; tts?: boolean };

export type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
};

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

export type Complex = {
  id: string;
  title: string;
  exercises: Exercise[];
  rounds?: number;
  restBetweenSec?: number;
};

export type Training = {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  categoryId?: string;
};

export type TrainingWithComplexes = Training & { complexes: Complex[] };

export type Category = {
  id: string;
  name: string;
  coverUrl: string;
  trainings?: Training[];
};

export type User = {
  id: number;
  userID: string;
  name: string;
  username?: string | null;
  email: string;
  contactNumber?: string | null;
  subscriptionPlan?: string | null;
  isSubscribed: boolean;
  subscriptionExpiresAt?: string | null;
};
