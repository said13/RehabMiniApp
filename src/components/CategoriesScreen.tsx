import { BannerCarousel } from './BannerCarousel';
import type { Category } from '../types';
import type { NextRouter } from 'next/router';

export function CategoriesScreen({
  categories,
  banners,
  activeBannerIndex,
  onSelectBanner,
  onSelectCategory,
  router,
}: {
  categories: Category[];
  banners: { id: string; title: string; text: string; cta: string; color: string }[];
  activeBannerIndex: number;
  onSelectBanner: (index: number) => void;
  onSelectCategory: (categoryId: string) => void;
  router: NextRouter;
}) {
  return (
    <>
      <BannerCarousel
        banners={banners}
        activeIndex={activeBannerIndex}
        onSelect={onSelectBanner}
        router={router}
      />
      <section className="px-4 mt-6">
        <h4 className="text-lg font-bold mb-3">Категории</h4>
        <div className="grid gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800"
              onClick={() => onSelectCategory(cat.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug line-clamp-2">{cat.title}</div>
              </div>
              <span className="text-gray-500"><i className="fa-solid fa-chevron-right"></i></span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
