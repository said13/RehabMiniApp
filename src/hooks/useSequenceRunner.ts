import { useEffect, useState } from 'react';
import type { Course } from '../types';

export function useSequenceRunner(course: Course) {
  const [lapIdx, setLapIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [mode, setMode] = useState<'playing' | 'rest' | 'paused' | 'complete'>('paused');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, setPending] = useState<'exercise' | 'round' | 'lap' | 'complete' | null>(null);

  const lap = course.laps[lapIdx];
  const ex = lap?.exercises[exIdx];

  useEffect(() => {
    if (mode !== 'playing' || !ex || ex.mode !== 'time') return;
    if (remaining == null) setRemaining(ex.durationSec ?? 0);
    if (remaining == null) return;
    const t = setInterval(() => setRemaining(v => (v! > 0 ? v! - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [mode, ex, remaining]);

  useEffect(() => {
    if (mode !== 'rest' || remaining == null) return;
    const t = setInterval(() => setRemaining(v => (v! > 0 ? v! - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [mode, remaining]);

  useEffect(() => {
    if (mode === 'playing' && ex?.mode === 'time' && remaining === 0) next();
    if (mode === 'rest' && remaining === 0) next();
  }, [mode, ex?.id, remaining]);

  function play() { setMode('playing'); }
  function pause() { setMode('paused'); }
  function skipRest() { if (mode === 'rest') { setRemaining(0); } }
  function addRest(delta: number) { if (mode === 'rest') setRemaining(v => Math.max(0, (v ?? 0) + delta)); }
  function resetTimers() { setRemaining(null); }

  function next() {
    if (mode === 'rest') {
      setMode('playing');
      resetTimers();
      if (pending === 'exercise') setExIdx(i => i + 1);
      else if (pending === 'round') { setRoundIdx(r => r + 1); setExIdx(0); }
      else if (pending === 'lap') { setLapIdx(l => l + 1); setRoundIdx(0); setExIdx(0); }
      else if (pending === 'complete') setMode('complete');
      setPending(null);
      return;
    }

    const curLap = lap;
    const curEx = ex;
    if (!curLap || !curEx) { setMode('complete'); return; }

    const nextExIdx = exIdx + 1;
    if (curEx.restSec) {
      setMode('rest');
      setRemaining(curEx.restSec);
      if (nextExIdx < curLap.exercises.length) setPending('exercise');
      else if (roundIdx + 1 < (curLap.rounds || 1)) setPending('round');
      else if (lapIdx + 1 < course.laps.length) setPending('lap');
      else setPending('complete');
      return;
    }

    if (nextExIdx < curLap.exercises.length) {
      setExIdx(nextExIdx);
      resetTimers();
      return;
    }

    if (roundIdx + 1 < (curLap.rounds || 1)) {
      if (curLap.restBetweenSec) {
        setMode('rest');
        setRemaining(curLap.restBetweenSec);
        setPending('round');
      } else {
        setRoundIdx(r => r + 1);
        setExIdx(0);
        resetTimers();
      }
      return;
    }

    if (lapIdx + 1 < course.laps.length) {
      setLapIdx(l => l + 1);
      setRoundIdx(0);
      setExIdx(0);
      resetTimers();
      return;
    }

    setMode('complete');
  }

  function prev() {
    if (exIdx > 0) { setExIdx(i => i - 1); resetTimers(); return; }
    if (roundIdx > 0) { setRoundIdx(r => r - 1); setExIdx(lap.exercises.length - 1); resetTimers(); return; }
    if (lapIdx > 0) {
      const prevLap = course.laps[lapIdx - 1];
      setLapIdx(lapIdx - 1);
      setRoundIdx((prevLap.rounds || 1) - 1);
      setExIdx(prevLap.exercises.length - 1);
      resetTimers();
    }
  }

  return { lapIdx, exIdx, roundIdx, lap, ex, mode, remaining, play, pause, next, prev, skipRest, addRest };
}
