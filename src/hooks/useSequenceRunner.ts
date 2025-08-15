import { useEffect, useState } from 'react';
import type { TrainingWithComplexes } from '../types';

export function useSequenceRunner(training: TrainingWithComplexes) {
  const [complexIdx, setComplexIdx] = useState(0);
  const [exIdx, setExIdx] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [mode, setMode] = useState<'playing' | 'rest' | 'paused' | 'complete'>('paused');
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, setPending] = useState<'exercise' | 'round' | 'complex' | 'complete' | null>(null);

  const complex = training.complexes[complexIdx];
  const ex = complex?.exercises[exIdx];

  useEffect(() => {
    if (mode !== 'playing' || !ex || !ex.performDurationSec) return;
    if (remaining == null) setRemaining(ex.performDurationSec ?? 0);
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
    if (mode === 'playing' && ex?.performDurationSec && remaining === 0) next();
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
      else if (pending === 'complex') { setComplexIdx(l => l + 1); setRoundIdx(0); setExIdx(0); }
      else if (pending === 'complete') setMode('complete');
      setPending(null);
      return;
    }

    const curComplex = complex;
    const curEx = ex;
    if (!curComplex || !curEx) { setMode('complete'); return; }

    const nextExIdx = exIdx + 1;
      if (curEx.restSec) {
        setMode('rest');
        setRemaining(curEx.restSec);
        if (nextExIdx < curComplex.exercises.length) setPending('exercise');
        else if (roundIdx + 1 < (curComplex.rounds || 1)) setPending('round');
        else if (complexIdx + 1 < training.complexes.length) setPending('complex');
        else setPending('complete');
        return;
      }

    if (nextExIdx < curComplex.exercises.length) {
      setExIdx(nextExIdx);
      resetTimers();
      return;
    }

      if (roundIdx + 1 < (curComplex.rounds || 1)) {
        setRoundIdx(r => r + 1);
        setExIdx(0);
        resetTimers();
        return;
      }

    if (complexIdx + 1 < training.complexes.length) {
      setComplexIdx(l => l + 1);
      setRoundIdx(0);
      setExIdx(0);
      resetTimers();
      return;
    }

    setMode('complete');
  }

  function prev() {
    if (exIdx > 0) { setExIdx(i => i - 1); resetTimers(); return; }
    if (roundIdx > 0) { setRoundIdx(r => r - 1); setExIdx(complex.exercises.length - 1); resetTimers(); return; }
    if (complexIdx > 0) {
      const prevComplex = training.complexes[complexIdx - 1];
      setComplexIdx(complexIdx - 1);
      setRoundIdx((prevComplex.rounds || 1) - 1);
      setExIdx(prevComplex.exercises.length - 1);
      resetTimers();
    }
  }

  return { complexIdx, exIdx, roundIdx, complex, ex, mode, remaining, play, pause, next, prev, skipRest, addRest };
}
