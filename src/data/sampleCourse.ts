import type { Course } from '../types';

export const muxVideos = [
  'https://player.mux.com/6ndHuwoLUZl36fI00EiZap9gt02vGFTxZx3IDLSGfXC700',
  'https://player.mux.com/bgecsZbv01aIkOCRJXZJcuSA8crx5JbTgQkD7QYfomLg',
  'https://player.mux.com/c9tAOav7YMXvCWfm1X9whepwxt9lPE4t01X022XobmrFU',
  'https://player.mux.com/voo02Gtd6Iw8i1c69sZgnA0293MnP3yH4RVS4Gt5tAl5I'
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
      rounds: 2,
      restBetweenSec: 30,
      exercises: [
        { id: 'plank', title: 'Elbow Plank', video: muxVideos[2], mode: 'time', durationSec: 45, restSec: 20, cues: [{ atSec: 10, text: 'Engage core', tts: true }, { atSec: 35, text: '10 seconds', tts: true }] },
        { id: 'bird', title: 'Bird Dog', video: muxVideos[3], mode: 'reps', reps: 10, restSec: 15 }
      ]
    }
  ]
};
