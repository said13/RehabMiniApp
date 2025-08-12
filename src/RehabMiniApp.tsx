import { useEffect, useMemo, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { useEnvReady } from './hooks/useEnvReady';
import { safeLocalStorage } from './utils/localStorage';
import { VideoScreen } from './components/VideoScreen';
import { TabButton } from './components/TabButton';
import { ActivePill } from './components/ActivePill';
import { Modal } from './components/Modal';
import { DevTests } from './components/DevTests';
import { sampleCategories } from './data/sampleCategories';
import type { Category, Course, Exercise } from './types';
import { TinkoffPayForm } from './components/TinkoffPayForm';

export default function RehabMiniApp() {
  const envReady = useEnvReady();
  const ls = safeLocalStorage();

  const [tab, setTab] = useState<'home' | 'profile'>('home');
  const [viewerCourse, setViewerCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [subActive, setSubActive] = useState<boolean>(false);
  const [tgUser, setTgUser] = useState<any | null>(null);

  useEffect(() => {
    if (!envReady) return;
    const sub = ls.get('subActive', '0') === '1';
    setSubActive(!!sub);
  }, [envReady]);

  useEffect(() => { if (envReady) try { window.localStorage.setItem('subActive', subActive ? '1' : '0'); } catch {} }, [envReady, subActive]);

  useEffect(() => {
    try {
      const lp = retrieveLaunchParams();
      // lp.initData?.user contains Telegram user info if available
      const u = lp?.initData?.user as any;
      if (u) setTgUser(u);
    } catch {}
  }, []);

  useEffect(() => {
    if (!envReady) return;
    try {
      const wa = (window as any).Telegram?.WebApp;
      wa?.requestFullscreen?.();
      wa?.disableVerticalSwipe?.();
    } catch {}
  }, [envReady]);

  const banners = useMemo(() => ([
    { id: 'sub', title: 'Go PRO', text: 'Unlock all courses & programs', cta: 'Subscribe', color: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
    { id: 'spine', title: 'Healthy Back', text: '10‑min daily plan', cta: 'Explore', color: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  ]), []);

  const categories = useMemo(() => sampleCategories, []);

  const SUB_PRICE = 799; // subscription price in RUB

  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    if (paywallOpen || viewerCourse) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [paywallOpen, viewerCourse, banners.length]);

  const ping = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1300); };

  const startExercise = (ex: Exercise) => {
    if (!selectedCourse) return;
    const single: Course = {
      id: `${selectedCourse.id}-${ex.id}`,
      title: ex.title,
      laps: [{ id: ex.id, title: ex.title, exercises: [ex] }],
    };
    setViewerCourse(single);
  };

  return (
    <div
      className="w-full min-h-[100dvh] bg-neutral-950 text-gray-100 flex flex-col font-sans"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <main className="flex-1 pb-20 animate-fadeIn">
        {tab === 'home' && (
          <div>
            {!selectedCategory && !selectedCourse && (
              <>
                <div className="px-4 pt-4">
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                    {banners.map((b, idx) => (
                      <article key={b.id} className={`min-w-[85%] ${b.color} text-white rounded-3xl p-5 snap-start shadow-lg hover:scale-[1.02] transition-transform`} onClick={() => (idx === 0 ? setPaywallOpen(true) : setBannerIdx(idx))}>
                        <h3 className="text-xl font-bold tracking-tight">{b.title}</h3>
                        <p className="text-sm opacity-90 mt-1">{b.text}</p>
                        <button className="mt-4 px-5 py-2 bg-white/90 text-gray-900 rounded-xl text-sm font-semibold shadow-sm hover:bg-white transition">{b.cta}</button>
                      </article>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3 justify-center">
                    {banners.map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full cursor-pointer ${bannerIdx === i ? 'bg-blue-400' : 'bg-gray-600'}`} onClick={() => setBannerIdx(i)} />
                    ))}
                  </div>
                </div>
                <section className="px-4 mt-6">
                  <h4 className="text-lg font-bold mb-3">Категории</h4>
                  <div className="grid gap-3">
                    {categories.map((cat) => (
                      <button key={cat.id} className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800" onClick={() => setSelectedCategory(cat)}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium leading-snug line-clamp-2">{cat.title}</div>
                        </div>
                        <span className="text-gray-500"><i className="fa-solid fa-chevron-right"></i></span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
            {selectedCategory && !selectedCourse && (
              <div className="px-4 pt-4">
                <button className="mb-4 text-sm text-gray-400 flex items-center gap-1" onClick={() => setSelectedCategory(null)}>
                  <i className="fa-solid fa-chevron-left"></i>
                  <span>Back</span>
                </button>
                <h4 className="text-lg font-bold mb-3">{selectedCategory.title}</h4>
                <div className="grid gap-3">
                  {selectedCategory.courses.map((c) => (
                    <button key={c.id} className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800" onClick={() => setSelectedCourse(c)}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug line-clamp-2">{c.title}</div>
                      </div>
                      <span className="text-gray-500"><i className="fa-solid fa-chevron-right"></i></span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedCourse && (
              <div className="px-4 pt-4">
                <button className="mb-4 text-sm text-gray-400 flex items-center gap-1" onClick={() => setSelectedCourse(null)}>
                  <i className="fa-solid fa-chevron-left"></i>
                  <span>Back</span>
                </button>
                <button
                  className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition"
                  onClick={() => setViewerCourse(selectedCourse)}
                >
                  Start workout
                </button>
                <h4 className="text-lg font-bold mb-3">{selectedCourse.title}</h4>
                <div className="grid gap-4">
                  {selectedCourse.laps.map((l) => (
                    <div key={l.id} className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
                      <div className="font-medium mb-2">{l.title}{l.rounds ? ` ×${l.rounds}` : ''}</div>
                      <div className="grid gap-2">
                        {l.exercises.map((e) => (
                          <button
                            key={e.id}
                            className="w-full text-left p-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-between"
                            onClick={() => startExercise(e)}
                          >
                            <span className="text-sm">
                              {e.title} — {e.mode === 'time' ? `${e.durationSec}s` : `${e.reps} reps`}
                            </span>
                            <i className="fa-solid fa-play text-blue-400 text-sm"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <div className="px-4 pt-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              {tgUser?.photo_url ? (
                <img src={tgUser.photo_url} alt="" className="w-14 h-14 rounded-full object-cover shadow-md" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center text-xl shadow-md">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
              <div>
                <div className="text-base font-bold">
                  {tgUser ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || tgUser.username || 'User' : 'Guest'}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Subscription: {subActive ? 'Active' : 'None'}</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {subActive ? (
                <button
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition flex items-center justify-center gap-2"
                  onClick={() => { setSubActive(false); ping('Subscription canceled'); }}
                >
                  <i className="fa-solid fa-crown"></i>
                  <span>Cancel subscription</span>
                </button>
              ) : (
                <TinkoffPayForm
                  amount={SUB_PRICE}
                  description="Subscription"
                  onPaid={() => { setSubActive(true); ping('Subscription activated'); }}
                />
              )}
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition flex items-center justify-center gap-2">
                <i className="fa-solid fa-rotate-left"></i>
                <span>Restore purchases</span>
              </button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-3 left-0 right-0">
        <div className="max-w-lg mx-auto">
          <div className="mx-4 bg-black/70 backdrop-blur border border-neutral-800 shadow-lg rounded-2xl">
            <div className="grid grid-cols-2 h-16 text-xs relative">
              <ActivePill index={['home','profile'].indexOf(tab)} count={2} />
              <TabButton label="Home" active={tab==='home'} onClick={()=>setTab('home')} icon={<i className="fa-solid fa-house"></i>} />
              <TabButton label="Profile" active={tab==='profile'} onClick={()=>setTab('profile')} icon={<i className="fa-solid fa-user"></i>} />
            </div>
          </div>
        </div>
      </nav>

      {viewerCourse && (
        <VideoScreen course={viewerCourse} title={viewerCourse.title} onClose={() => setViewerCourse(null)} />
      )}

      <Modal open={paywallOpen} onClose={() => setPaywallOpen(false)}>
        <div className="p-4">
          <h3 className="text-base font-semibold mb-1">Go PRO</h3>
          <p className="text-sm text-gray-400 mb-3">Unlock all lessons and weekly updates. Cancel anytime.</p>
          <div className="rounded-2xl bg-white/5 p-3 mb-3">
            <div className="flex items-center justify-between text-sm"><span>Monthly</span><b>{SUB_PRICE} ₽</b></div>
          </div>
          <TinkoffPayForm
            amount={SUB_PRICE}
            description="Subscription"
            onPaid={() => { setSubActive(true); setPaywallOpen(false); ping('Subscription activated'); }}
          />
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center animate-fadeIn">
          <div className="bg-white/10 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toast}</div>
        </div>
      )}

      <DevTests />
    </div>
  );
}
