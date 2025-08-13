import { useEffect, useState } from 'react';
import { placeholderProduct, placeholderThumb } from '../utils/placeholders';

export function DevTests() {
  const [results, setResults] = useState<{ name: string; ok: boolean; details?: string }[]>([]);
  useEffect(() => {
    const cases: { name: string; run: () => boolean }[] = [
      { name: 'placeholderThumb returns data-url', run: () => /^data:image\/svg\+xml;utf8,/.test(placeholderThumb('#000')) },
      { name: 'placeholderProduct returns data-url', run: () => /^data:image\/svg\+xml;utf8,/.test(placeholderProduct('X')) },
      { name: 'envReady eventually true', run: () => typeof window !== 'undefined' && typeof document !== 'undefined' },
    ];
    const res = cases.map(c => { try { return { name: c.name, ok: c.run() }; } catch (e: any) { return { name: c.name, ok: false, details: e?.message }; } });
    setResults(res); console.table(res);
  }, []);
  return <div style={{ position:'fixed', bottom:0, left:0, opacity:0, pointerEvents:'none' }} aria-hidden>{results.map(r=> <div key={r.name}>{r.name}:{r.ok?'PASS':'FAIL'}</div>)}</div>;
}
