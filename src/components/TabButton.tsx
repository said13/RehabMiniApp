import React from 'react';

export function TabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button aria-pressed={active} className={`relative z-10 flex flex-col items-center justify-center ${active ? 'text-blue-400' : 'text-gray-400'} active:opacity-80 transition`} onClick={onClick}>
      <div className="text-xl leading-none">{icon}</div>
      <div className="mt-0.5 font-medium">{label}</div>
    </button>
  );
}
