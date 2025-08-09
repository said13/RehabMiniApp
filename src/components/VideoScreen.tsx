import { useEffect, useState } from 'react';
import { useSequenceRunner } from '../hooks/useSequenceRunner';
import type { Course } from '../types';
import { EmbedPlayer } from './EmbedPlayer';

export function VideoScreen({ course, envReady, onClose, title }: { course: Course; envReady: boolean; onClose: () => void; title?: string }) {
  const s = useSequenceRunner(course);
  const idxLabel = s.lap ? `${s.exIdx + 1}/${s.lap.exercises.length}` : '';
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
    <div className="fixed inset-0 bg-black z-50">
      <EmbedPlayer key={playTick} src={s.ex?.video || ''} placeholderTitle={s.ex?.title || 'Ready'} />
      <div className="absolute top-4 left-4">
        <button className="px-4 py-2 bg-black/60 text-white rounded-lg" onClick={onClose}>Exit</button>
      </div>
      <div className="absolute top-4 right-4 text-right text-xs text-gray-300">
        {title && <div className="text-sm mb-1">{title}</div>}
        <div>{s.lap?.title}</div>
        <div>{idxLabel}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-black/20 text-white">
        {s.mode === 'rest' ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">Rest</div>
            <div className="text-xl tabular-nums">{s.remaining ?? 0}s</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-white/10 rounded-lg" onClick={() => s.addRest(-5)}>-5s</button>
              <button className="px-3 py-2 bg-white/10 rounded-lg" onClick={() => s.addRest(5)}>+5s</button>
              <button className="px-3 py-2 bg-blue-600 rounded-lg" onClick={s.skipRest}>Skip</button>
            </div>
          </div>
        ) : s.ex?.mode === 'time' ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">{s.ex.title}</div>
            <div className="text-2xl tabular-nums">{s.remaining ?? s.ex.durationSec}s</div>
            <button className="px-3 py-2 bg-white/10 rounded-lg" onClick={s.next}>Next</button>
          </div>
        ) : s.ex ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">{s.ex.title}</div>
            <div className="text-xs text-gray-400">{s.ex.reps} reps</div>
            <button className="px-3 py-2 bg-blue-600 rounded-lg" onClick={s.next}>Mark done →</button>
          </div>
        ) : (
          <button className="w-full px-4 py-3 bg-blue-600 rounded-xl" onClick={onPlayPress}>Start workout</button>
        )}

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="px-4 py-3 bg-white/10 rounded-xl" onClick={s.prev}>◀︎ Prev</button>
          <button className="px-4 py-3 bg-blue-600 rounded-xl" onClick={s.mode === 'playing' ? s.pause : onPlayPress}>
            {s.mode === 'playing' ? 'Pause' : 'Play'}
          </button>
          <button className="px-4 py-3 bg-white/10 rounded-xl" onClick={s.next}>Next ▶︎</button>
        </div>
      </div>
    </div>
  );
}
