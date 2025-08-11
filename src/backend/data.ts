import type { Category, Course, Video } from '../types';
import { sampleCategories } from '../data/sampleCategories';
import { muxVideos } from '../data/sampleCourse';

export const categories: Category[] = [...sampleCategories];

export const courses: Course[] = sampleCategories.flatMap(c => c.courses);

export const videos: Video[] = muxVideos.map((url, i) => ({
  id: `video-${i + 1}`,
  title: `Sample Video ${i + 1}`,
  url,
}));
