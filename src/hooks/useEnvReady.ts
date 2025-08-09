import { useEffect, useState } from 'react';

export function useEnvReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(typeof window !== 'undefined' && typeof document !== 'undefined'));
    return () => cancelAnimationFrame(id);
  }, []);
  return ready;
}
