import { useMemo, useState } from 'react';
import { useSequenceRunner } from '../hooks/useSequenceRunner';
import type { Course } from '../types';
import { PlaylistPlayer, type PlaylistItem } from './PlaylistPlayer';

export function VideoScreen({ course, onClose, title }: { course: Course; onClose: () => void; title?: string }) {
  const s = useSequenceRunner(course);

  const [muted, setMuted] = useState(true);

  // Flat list of all exercises for playlist support
  const playlist: PlaylistItem[] = useMemo(() => {
    return course.laps.flatMap(l =>
      l.exercises.map(ex => {
        // Support full .m3u8 URL or Mux playback ID
        if (/\.m3u8($|\?)/.test(ex.video)) {
          return { url: ex.video, title: ex.title };
        }
        const m = ex.video.match(/(?:player|stream)\.mux\.com\/([^\.?]+)/);
        return { id: m ? m[1] : ex.video, title: ex.title };
      })
    );
  }, [course]);

  const totalExercises = course.laps.reduce((sum, l) => sum + l.exercises.length, 0);
  const beforeCurrent = course.laps.slice(0, s.lapIdx).reduce((sum, l) => sum + l.exercises.length, 0);
  const currentIndex = beforeCurrent + s.exIdx;
  const idxLabel = s.ex ? `${currentIndex + 1}/${totalExercises}` : '';

  const handlePlayPause = () => {
    if (s.mode === 'playing') s.pause(); else s.play();
  };
  const handlePrev = () => { s.prev(); };
  const handleNext = () => { s.next(); };
  const handleMute = () => { setMuted(m => !m); };

  const topSafe = 'calc(env(safe-area-inset-top) + 1rem)';

  return (
    <div className="fixed inset-0 bg-black z-50">
      <PlaylistPlayer
        playlist={playlist}
        index={currentIndex}
        autoplay={s.mode === 'playing'}
        muted={muted}
        loop
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

