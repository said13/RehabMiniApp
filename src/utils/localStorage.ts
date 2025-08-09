export function safeLocalStorage() {
  const get = (k: string, fallback: any) => {
    try {
      if (typeof window === 'undefined' || !('localStorage' in window)) return fallback;
      const v = window.localStorage.getItem(k);
      return v == null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  };
  const set = (k: string, v: any) => {
    try {
      if (typeof window === 'undefined' || !('localStorage' in window)) return;
      window.localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };
  return { get, set };
}
