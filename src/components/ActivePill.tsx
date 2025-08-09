import { useEffect, useRef } from 'react';

export function ActivePill({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (ref.current) ref.current.style.transform = `translateX(${index * 100}%)`; }, [index]);
  return <div ref={ref} className="absolute inset-y-1 left-1 w-1/3 rounded-xl bg-blue-900/30 transition-transform duration-300" aria-hidden />;
}
