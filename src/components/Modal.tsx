import { useEffect, useRef } from 'react';

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const sheet = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const dy = useRef(0);

  useEffect(() => { dy.current = 0; if (sheet.current) sheet.current.style.transform = ''; }, [open]);

  const onTouchStart = (e: React.TouchEvent) => { startY.current = e.touches[0].clientY; };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;
    dy.current = Math.max(0, e.touches[0].clientY - startY.current);
    if (sheet.current) sheet.current.style.transform = `translateY(${dy.current}px)`;
  };
  const onTouchEnd = () => {
    if (dy.current > 80) onClose();
    else if (sheet.current) sheet.current.style.transform = 'translateY(0)';
    startY.current = null; dy.current = 0;
  };

  return (
    <div className={`fixed inset-0 z-50 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div ref={sheet} className={`absolute left-0 right-0 bottom-0 bg-neutral-900 text-gray-100 rounded-t-3xl shadow-2xl max-w-lg mx-auto transition-transform ${open ? 'translate-y-0' : 'translate-y-full'}`} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <div className="h-5 flex items-center justify-center"><div className="mt-2 h-1 w-10 bg-neutral-700 rounded-full" /></div>
        <div>{children}</div>
        <div className="h-4" />
      </div>
    </div>
  );
}
