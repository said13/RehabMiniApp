import { useEffect, useRef, useState } from 'react';

export interface LoaderProps {
  active: boolean;
  mode?: 'global' | 'local';
}

// Reusable loader following Codex design guidelines.
// Shows with a small delay and keeps visible for a minimum duration
// to avoid flickering.
export function Loader({ active, mode = 'local' }: LoaderProps) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<NodeJS.Timeout | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const minVisibleUntil = useRef<number>(0);

  useEffect(() => {
    if (active) {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (!showTimer.current) {
        showTimer.current = setTimeout(() => {
          setVisible(true);
          minVisibleUntil.current = Date.now() + 300; // minimum duration 300ms
          showTimer.current = null;
        }, 150); // delay before showing 150ms
      }
    } else {
      if (showTimer.current) {
        clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      const remaining = minVisibleUntil.current - Date.now();
      if (remaining > 0) {
        hideTimer.current = setTimeout(() => {
          setVisible(false);
          hideTimer.current = null;
        }, remaining);
      } else {
        setVisible(false);
      }
    }
  }, [active]);

  useEffect(() => {
    return () => {
      if (showTimer.current) clearTimeout(showTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible) return null;

  const base = mode === 'global' ? 'fixed inset-0 z-50' : 'absolute inset-0';

  return (
    <div className={`${base} flex items-center justify-center bg-black/50 transition-opacity`}>
      <div className="h-10 w-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default Loader;

