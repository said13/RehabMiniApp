import { useState } from 'react';
import { useSequenceRunner } from '../hooks/useSequenceRunner';
import type { Course } from '../types';
import { EmbedPlayer } from './EmbedPlayer';

export function VideoScreen({ course, onClose, title }: { course: Course; onClose: () => void; title?: string }) {
  const s = useSequenceRunner(course);

  const [playTick, setPlayTick] = useState(0);
  const [muted, setMuted] = useState(true);

  const totalExercises = course.laps.reduce((sum, l) => sum + l.exercises.length, 0);
  const beforeCurrent = course.laps.slice(0, s.lapIdx).reduce((sum, l) => sum + l.exercises.length, 0);
  const idxLabel = s.ex ? `${beforeCurrent + s.exIdx + 1}/${totalExercises}` : '';

  const handlePlayPause = () => {
    if (s.mode === 'playing') s.pause(); else s.play();
    setPlayTick(t => t + 1);
  };
  const handlePrev = () => { s.prev(); setPlayTick(t => t + 1); };
  const handleNext = () => { s.next(); setPlayTick(t => t + 1); };
  const handleMute = () => { setMuted(m => !m); setPlayTick(t => t + 1); };

  const topSafe = 'calc(env(safe-area-inset-top) + 1rem)';

  return (
    <div className="fixed inset-0 bg-black z-50">
      <EmbedPlayer
        key={`${s.ex?.id}-${playTick}-${muted}-${s.mode}`}
        src={s.ex?.video || ''}
        placeholderTitle={s.ex?.title || 'Video'}
        autoplay={s.mode === 'playing'}
        muted={muted}
        showControls={false}
      />
      {s.mode === 'rest' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/70 text-white px-4 py-3 rounded-xl text-center">
            <div>Rest</div>
            <div className="text-xl tabular-nums">{s.remaining ?? 0}s</div>
            <button className="mt-2 px-3 py-1 bg-white/20 rounded" onClick={s.skipRest}>Skip</button>
          </div>
        </div>
      )}
      <div className="absolute left-4" style={{ top: topSafe }}>
        <button className="px-4 py-2 bg-black/60 text-white rounded-lg" onClick={onClose}>Exit</button>
      </div>
      <div className="absolute right-4 text-right text-white" style={{ top: topSafe }}>
        {title && <div className="text-sm mb-1">{title}</div>}
        <div className="text-sm">{s.ex?.title}</div>
        <div className="text-xs opacity-70">{idxLabel}</div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 text-white">
        <button className="px-4 py-2 bg-white/10 rounded-lg" onClick={handlePrev}>◀︎</button>
        <button className="px-4 py-2 bg-blue-600 rounded-lg" onClick={handlePlayPause}>{s.mode === 'playing' ? 'Pause' : 'Play'}</button>
        <button className="px-4 py-2 bg-white/10 rounded-lg" onClick={handleNext}>▶︎</button>
        <button className="px-4 py-2 bg-white/10 rounded-lg" onClick={handleMute}>{muted ? 'Unmute' : 'Mute'}</button>
      </div>
    </div>
  );
}

