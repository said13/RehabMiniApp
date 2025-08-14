import { useEffect, useState } from 'react';
import { useSequenceRunner } from '../hooks/useSequenceRunner';
import type { TrainingWithComplexes } from '../types';
import { EmbedPlayer } from './EmbedPlayer';

export function SequenceOverlay({ training, envReady }: { training: TrainingWithComplexes; envReady: boolean }) {
  const s = useSequenceRunner(training);
  const idxLabel = s.complex ? `${s.exIdx + 1}/${s.complex.exercises.length}` : '';
  const [ttsEnabled, setTtsEnabled] = useState(false);

  useEffect(() => {
    if (!envReady || !ttsEnabled || !s.ex) return;
    const cues = s.ex.cues?.filter(c => c.tts) || [];
    if (cues.length === 0) return;
    const timers = cues.map(c => setTimeout(() => {
      try {
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(c.text);
          window.speechSynthesis.speak(u);
        }
      } catch {}
    }, (c.atSec || 0) * 1000));
    return () => timers.forEach(clearTimeout);
  }, [envReady, ttsEnabled, s.ex?.id]);

  const [playTick, setPlayTick] = useState(0);
  const onPlayPress = () => { setTtsEnabled(true); setPlayTick(t => t + 1); s.play(); };

  return (
    <div className="p-2 -mx-2">
      <div className="flex items-center justify-between text-xs text-gray-400 px-2">
        <div>{s.complex?.title}</div>
        <div>{idxLabel}</div>
      </div>

      <div className="relative rounded-xl overflow-hidden my-3 bg-black aspect-video">
        <EmbedPlayer src={s.ex?.video || ''} placeholderTitle={s.ex?.title || 'Ready'} />
      </div>

      {s.mode === 'rest' ? (
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="text-sm">Rest</div>
          <div className="text-xl tabular-nums">{s.remaining ?? 0}s</div>
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-white/10 rounded-lg" onClick={() => s.addRest(-5)}>-5s</button>
            <button className="px-3 py-2 bg-white/10 rounded-lg" onClick={() => s.addRest(5)}>+5s</button>
            <button className="px-3 py-2 bg-blue-600 rounded-lg" onClick={s.skipRest}>Skip</button>
          </div>
        </div>
      ) : s.ex?.mode === 'time' ? (
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="text-sm">{s.ex.title}</div>
          <div className="text-2xl tabular-nums">{s.remaining ?? s.ex.durationSec}s</div>
          <button className="px-3 py-2 bg-white/10 rounded-lg flex items-center gap-2" onClick={s.next}>
            <span>Next</span>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      ) : s.ex ? (
        <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div className="text-sm">{s.ex.title}</div>
          <div className="text-xs text-gray-400">{s.ex.reps} reps</div>
          <button className="px-3 py-2 bg-blue-600 rounded-lg flex items-center gap-2" onClick={s.next}>
            <span>Mark done</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      ) : (
        <button className="w-full px-4 py-3 bg-blue-600 rounded-xl" onClick={onPlayPress}>Start workout</button>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button className="px-4 py-3 bg-white/10 rounded-xl flex items-center justify-center gap-2" onClick={s.prev}>
          <i className="fa-solid fa-chevron-left"></i>
          <span>Prev</span>
        </button>
        <button className="px-4 py-3 bg-blue-600 rounded-xl" onClick={s.mode === 'playing' ? s.pause : onPlayPress}>{s.mode === 'playing' ? 'Pause' : 'Play'}</button>
        <button className="px-4 py-3 bg-white/10 rounded-xl flex items-center justify-center gap-2" onClick={s.next}>
          <span>Next</span>
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
