import type { Course } from '../types';

export const muxVideos = [
  'https://player.mux.com/nw0001NHe7ZpvmnTBhd6AH5oUl2biWrBwA00SNkgJAt5lY',
  'https://player.mux.com/7QQ8Gwxui4ZnCP7C00shpGZfKBdyz028bz02BMS01DvzFN8',
  'https://player.mux.com/s7ue8GS5mSVDMfo01mjIPsbwwXFqCrYdU02hbwE8dZ02dM',
  'https://player.mux.com/vOmxI8tsGBggPKdhs9xJ00SqAwgzWyszRbKy8YVmdxOU'
];

export const sampleCourse: Course = {
  id: 'core-01',
  title: 'Core Stability — Beginner',
  laps: [
    {
      id: 'warm',
      title: 'Warm‑up',
      exercises: [
        { id: 'cat', title: 'Cat–Cow', video: muxVideos[0], mode: 'time', durationSec: 30, restSec: 10, cues: [{ atSec: 5, text: 'Slow and smooth', tts: true }] },
        { id: 'hinge', title: 'Hip Hinge', video: muxVideos[1], mode: 'reps', reps: 12, restSec: 15 }
      ]
    },
    {
      id: 'main',
      title: 'Main set',
      repeat: 2,
      exercises: [
        { id: 'plank', title: 'Elbow Plank', video: muxVideos[2], mode: 'time', durationSec: 45, restSec: 20, cues: [{ atSec: 10, text: 'Engage core', tts: true }, { atSec: 35, text: '10 seconds', tts: true }] },
        { id: 'bird', title: 'Bird Dog', video: muxVideos[3], mode: 'reps', reps: 10, restSec: 15 }
      ]
    }
  ]
};
