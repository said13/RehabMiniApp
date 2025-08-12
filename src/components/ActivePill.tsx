import { useEffect, useRef } from 'react';

export function ActivePill({ index, count }: { index: number; count: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (ref.current) ref.current.style.transform = `translateX(${index * 100}%)`; }, [index]);
  return (
    <div
      ref={ref}
      className="absolute inset-y-1 left-1 rounded-xl bg-blue-900/30 transition-transform duration-300"
      style={{ width: `${100 / count}%` }}
      aria-hidden
    />
  );
}
