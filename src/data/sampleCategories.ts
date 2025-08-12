import type { Category } from '../types';
import { sampleCourse } from './sampleCourse';

export const sampleCategories: Category[] = [
  { id: 'strength', title: 'Силовые тренировки', courses: [sampleCourse] },
  { id: 'posture', title: 'Тренировки на выносливость', courses: [] }
];
