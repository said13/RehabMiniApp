import type { Category } from '../types';
import { sampleCourse } from './sampleCourse';

export const sampleCategories: Category[] = [
  { id: 'strength', title: 'Силовые тренировки', courses: [sampleCourse] },
  { id: 'posture', title: 'Осанка', courses: [] },
  { id: 'recovery', title: 'Восстановление после операции', courses: [] },
  { id: 'acl', title: 'Реабилитация после ПКС', courses: [] },
];
