import { useEffect, useState } from 'react';
import type { Course } from '../types';

export function useSequenceRunner(course: Course) {
  const [lapIdx, setLapIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [mode, setMode] = useState<'playing' | 'rest' | 'paused' | 'complete'>('paused');
  const [remaining, setRemaining] = useState<number | null>(null);

  const lap = course.laps[lapIdx];
  const ex = lap?.exercises[exIdx];

  useEffect(() => {
    if (mode !== 'playing' || !ex || ex.mode !== 'time') return;
    if (remaining == null) setRemaining(ex.durationSec ?? 0);
    if (remaining == null) return;
    const t = setInterval(() => setRemaining(v => (v! > 0 ? v! - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [mode, ex, remaining]);
  useEffect(() => { if (ex?.mode === 'time' && remaining === 0) next(); }, [remaining]);

  function play() { setMode('playing'); }
  function pause() { setMode('paused'); }
  function skipRest() { if (mode === 'rest') { setMode('playing'); setRemaining(null); next(); } }
  function addRest(delta: number) { if (mode === 'rest') setRemaining(v => Math.max(0, (v ?? 0) + delta)); }
  function resetTimers() { setRemaining(null); }

  function next() {
    const cur = ex;
    if (cur?.restSec && mode !== 'rest') { setMode('rest'); setRemaining(cur.restSec); return; }
    if (exIdx + 1 < (lap?.exercises.length || 0)) { setExIdx(exIdx + 1); resetTimers(); setMode('playing'); return; }
    if (lapIdx + 1 < course.laps.length) { setLapIdx(lapIdx + 1); setExIdx(0); resetTimers(); setMode('playing'); return; }
    setMode('complete');
  }
  function prev() {
    if (exIdx > 0) { setExIdx(exIdx - 1); resetTimers(); return; }
    if (lapIdx > 0) { const prevLap = course.laps[lapIdx - 1]; setLapIdx(lapIdx - 1); setExIdx(prevLap.exercises.length - 1); resetTimers(); }
  }

  return { lapIdx, exIdx, lap, ex, mode, remaining, play, pause, next, prev, skipRest, addRest };
}
