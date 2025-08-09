import { useEffect, useState } from 'react';

export function ContinueWatching({ onOpen, envReady }: { onOpen: (l: any) => void; envReady: boolean }) {
  const [last, setLast] = useState<any | null>(null);
  useEffect(() => {
    if (!envReady) return;
    try { const raw = window.localStorage.getItem('lastLesson'); if (raw) setLast(JSON.parse(raw)); } catch {}
  }, [envReady]);
  if (!last) return <div className="text-sm text-gray-400">No recent lessons</div>;
  return (
    <button className="w-full flex items-center gap-3 active:opacity-90" onClick={() => onOpen(last)}>
      <img src={last.thumb} className="w-24 aspect-video rounded-lg object-cover" />
      <div className="flex-1 text-left">
        <div className="text-sm font-medium line-clamp-2">{last.title}</div>
        <div className="text-xs text-gray-500">Tap to resume</div>
      </div>
    </button>
  );
}
