import { useEffect, useRef } from 'react';

export function ActivePill({ index, count }: { index: number; count: number }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const parent = el.parentElement as HTMLElement | null;
    if (!parent) return;

    const styles = getComputedStyle(parent);
    const gap = parseFloat(styles.columnGap || '0');
    const paddingLeft = parseFloat(styles.paddingLeft || '0');
    const paddingRight = parseFloat(styles.paddingRight || '0');
    const available = parent.clientWidth - paddingLeft - paddingRight - gap * (count - 1);
    const itemWidth = available / count;

    el.style.width = `${itemWidth}px`;
    el.style.left = `${paddingLeft}px`;
    el.style.transform = `translateX(${index * (itemWidth + gap)}px)`;
  }, [index, count]);

  return (
    <div
      ref={ref}
      className="absolute top-1 bottom-1 rounded-xl bg-blue-900/30 transition-all duration-300"
      aria-hidden
    />
  );
}
