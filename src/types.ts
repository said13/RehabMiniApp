export type Exercise = {
  id: string;
  complexId: string;
  title: string;
  videoUrl?: string;
  muxId?: string;
  videoDurationSec: number;
  performDurationSec: number;
  repetitions?: number;
  restSec?: number;
  notes?: string;
};

export type Complex = {
  id: string;
  trainingId: string;
  order: number;
  rounds: number;
};

export type ComplexWithExercises = Complex & {
  title: string;
  exercises: Exercise[];
};

export type Training = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  coverUrl: string;
};

export type Category = {
  id: string;
  title: string;
  coverUrl: string;
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
