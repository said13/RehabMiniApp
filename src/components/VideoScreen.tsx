import { useEffect, useMemo, useState } from 'react';
import { useSequenceRunner } from '../hooks/useSequenceRunner';
import type { TrainingWithComplexes } from '../types';
import { PlaylistPlayer, type PlaylistItem } from './PlaylistPlayer';

export function VideoScreen({ training, onClose, title }: { training: TrainingWithComplexes; onClose: () => void; title?: string }) {
  const s = useSequenceRunner(training);

  const [muted, setMuted] = useState(true);

  useEffect(() => {
    s.play();
  }, []);

  // Flat list of all exercises for playlist support
  const playlist: PlaylistItem[] = useMemo(() => {
    return training.complexes.flatMap(c =>
      c.exercises.map(ex => {
        // Support full .m3u8 URL or Mux playback ID
        if (/\.m3u8($|\?)/.test(ex.video)) {
          return { url: ex.video, title: ex.title };
        }
        const m = ex.video.match(/(?:player|stream)\.mux\.com\/([^\.?]+)/);
        return { id: m ? m[1] : ex.video, title: ex.title };
      })
    );
  }, [training]);

  const totalExercises = training.complexes.reduce((sum, l) => sum + l.exercises.length, 0);
  const beforeCurrent = training.complexes.slice(0, s.complexIdx).reduce((sum, l) => sum + l.exercises.length, 0);
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
            <button
              aria-label="Skip rest"
              className="mt-2 p-2 bg-white/20 rounded-full text-xl"
              onClick={s.skipRest}
            >
              <i className="fa-solid fa-forward"></i>
            </button>
          </div>
        </div>
      )}
      <div className="absolute left-4" style={{ top: topSafe }}>
        <button
          aria-label="Exit"
          className="p-2 bg-black/60 text-white rounded-full text-xl"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div
        className="absolute right-4 text-right text-white bg-black/60 px-3 py-2 rounded-lg"
        style={{ top: topSafe }}
      >
        {title && <div className="text-sm mb-1">{title}</div>}
        <div className="text-sm">{s.ex?.title}</div>
        <div className="text-xs opacity-70">{idxLabel}</div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-white">
        <button
          aria-label="Previous"
          className="p-3 bg-white/10 rounded-full text-xl"
          onClick={handlePrev}
        >
          <i className="fa-solid fa-backward-step"></i>
        </button>
        <button
          aria-label={s.mode === 'playing' ? 'Pause' : 'Play'}
          className="p-3 bg-blue-600 rounded-full text-xl"
          onClick={handlePlayPause}
        >
          <i className={`fa-solid ${s.mode === 'playing' ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
        <button
          aria-label="Next"
          className="p-3 bg-white/10 rounded-full text-xl"
          onClick={handleNext}
        >
          <i className="fa-solid fa-forward-step"></i>
        </button>
        <button
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="p-3 bg-white/10 rounded-full text-xl"
          onClick={handleMute}
        >
          <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
        </button>
      </div>
    </div>
  );
}

