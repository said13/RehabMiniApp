import type { NextRouter } from 'next/router';

type Banner = {
  id: string;
  title: string;
  text: string;
  cta: string;
  color: string;
};

export function BannerCarousel({ banners, activeIndex, onSelect, router }: {
  banners: Banner[];
  activeIndex: number;
  onSelect: (index: number) => void;
  router?: NextRouter;
}) {
  return (
    <div className="px-4 pt-4">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {banners.map((b, idx) => (
          <article
            key={b.id}
            className={`min-w-[85%] ${b.color} text-white rounded-3xl p-5 snap-start shadow-lg hover:scale-[1.02] transition-transform`}
            onClick={() => (idx === 0 ? router?.push('/pay') : onSelect(idx))}
          >
            <h3 className="text-xl font-bold tracking-tight">{b.title}</h3>
            <p className="text-sm opacity-90 mt-1">{b.text}</p>
            <button className="mt-4 px-5 py-2 bg-white/90 text-gray-900 rounded-xl text-sm font-semibold shadow-sm hover:bg-white transition">{b.cta}</button>
          </article>
        ))}
      </div>
      <div className="flex gap-2 mt-3 justify-center">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full cursor-pointer ${activeIndex === i ? 'bg-blue-400' : 'bg-gray-600'}`}
            onClick={() => onSelect(i)}
          />
        ))}
      </div>
    </div>
  );
}
