import { useEffect, useMemo, useState } from 'react';
import { useEnvReady } from './hooks/useEnvReady';
import { safeLocalStorage } from './utils/localStorage';
import { placeholderThumb, placeholderProduct } from './utils/placeholders';
import { ContinueWatching } from './components/ContinueWatching';
import { VideoScreen } from './components/VideoScreen';
import { TabButton } from './components/TabButton';
import { ActivePill } from './components/ActivePill';
import { Modal } from './components/Modal';
import { DevTests } from './components/DevTests';
import { sampleCourse } from './data/sampleCourse';

export default function RehabMiniApp() {
  const envReady = useEnvReady();
  const ls = safeLocalStorage();

  const [tab, setTab] = useState<'home' | 'shop' | 'profile'>('home');
  const [viewer, setViewer] = useState<{ id: string; title: string } | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [subActive, setSubActive] = useState<boolean>(false);
  const [cart, setCart] = useState<{ id: string; title: string; price: number; image: string; qty: number }[]>([]);

  useEffect(() => {
    if (!envReady) return;
    const sub = ls.get('subActive', '0') === '1';
    const c = ls.get('cart', []);
    setSubActive(!!sub);
    setCart(Array.isArray(c) ? c : []);
  }, [envReady]);

  useEffect(() => { if (envReady) try { window.localStorage.setItem('subActive', subActive ? '1' : '0'); } catch {} }, [envReady, subActive]);
  useEffect(() => { if (envReady) try { window.localStorage.setItem('cart', JSON.stringify(cart)); } catch {} }, [envReady, cart]);

  const banners = useMemo(() => ([
    { id: 'sub', title: 'Go PRO', text: 'Unlock all courses & programs', cta: 'Subscribe', color: 'bg-gradient-to-r from-blue-600 to-indigo-700' },
    { id: 'spine', title: 'Healthy Back', text: '10‑min daily plan', cta: 'Explore', color: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  ]), []);

  const lessons = useMemo(() => ([
    { id: 'l1', title: 'Breathing & Mobility (Free)', thumb: placeholderThumb('#2563eb'), free: true },
    { id: 'l2', title: 'Neck Relief', thumb: placeholderThumb('#7c3aed'), free: false },
    { id: 'l3', title: 'Lower Back Care', thumb: placeholderThumb('#d97706'), free: false },
    { id: 'l4', title: 'Shoulder Mobility', thumb: placeholderThumb('#059669'), free: false },
  ]), []);

  const products = useMemo(() => ([
    { id: 'p1', title: 'Resistance Band — Small', price: 19.9, image: placeholderProduct('S') },
    { id: 'p2', title: 'Resistance Band — Medium', price: 22.9, image: placeholderProduct('M') },
    { id: 'p3', title: 'Resistance Band — Large', price: 25.9, image: placeholderProduct('L') },
  ]), []);

  const [bannerIdx, setBannerIdx] = useState(0);
  useEffect(() => {
    if (paywallOpen || viewer) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [paywallOpen, viewer, banners.length]);

  const ping = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1300); };

  const handleOpenLesson = (l: any) => {
    if (!l.free && !subActive) { setPaywallOpen(true); return; }
    setViewer({ id: l.id, title: l.title });
    if (envReady) try { window.localStorage.setItem('lastLesson', JSON.stringify(l)); } catch {}
  };

  const addToCart = (p: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      const next = ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
      return next;
    });
    ping('Added to cart');
  };

  return (
    <div className="w-full min-h-[100dvh] bg-neutral-950 text-gray-100 flex flex-col font-sans">
      <main className="flex-1 pb-20 animate-fadeIn">
        {tab === 'home' && (
          <div>
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
              <h4 className="text-lg font-bold mb-2">Continue watching</h4>
              <ContinueWatching onOpen={(l: any) => handleOpenLesson(l)} envReady={envReady} />

              <h4 className="text-lg font-bold mt-5 mb-3">Starter Course</h4>
              <div className="grid gap-3">
                {lessons.map((l) => (
                  <button key={l.id} className="relative text-left group active:scale-[.99] transition flex items-center gap-3 p-2 rounded-2xl bg-neutral-900 border border-neutral-800" onClick={() => handleOpenLesson(l)}>
                    <img src={l.thumb} alt="" className={`w-28 aspect-video rounded-xl object-cover ${!l.free && !subActive ? 'blur-[3px] brightness-90' : ''}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-snug line-clamp-2">{l.title}</div>
                      {!l.free && !subActive && (
                        <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">🔒 <span>Subscribe to unlock</span></div>
                      )}
                    </div>
                    <span className="text-gray-500">›</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'shop' && (
          <div className="px-4 pt-4">
            <h3 className="text-lg font-bold mb-4">Shop</h3>
            <div className="grid gap-3">
              {products.map((p) => (
                <div key={p.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <img src={p.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                      <div className="mt-1 text-sm font-bold">${p.price.toFixed(2)}</div>
                    </div>
                    <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition" onClick={() => addToCart(p)}>
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="h-3" />
            <div className="fixed left-0 right-0 bottom-20 px-4">
              <div className="bg-neutral-900 text-gray-100 rounded-2xl p-3 flex items-center justify-between shadow-xl max-w-lg mx-auto border border-neutral-800">
                <div className="text-sm">
                  <b>{cart.reduce((s, i) => s + i.qty, 0)}</b> items • <b>${cart.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2)}</b>
                </div>
                <button className="px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition" onClick={() => ping('Checkout complete (mock)')}>
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="px-4 pt-4 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-700 flex items-center justify-center text-xl shadow-md">🧑🏻‍💻</div>
              <div>
                <div className="text-base font-bold">Guest</div>
                <div className="text-xs text-gray-400 mt-0.5">Subscription: {subActive ? 'Active' : 'None'}</div>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition" onClick={() => { setSubActive(v => !v); ping(!subActive ? 'Subscription activated' : 'Subscription canceled'); }}>
                {subActive ? 'Cancel subscription' : 'Activate subscription'}
              </button>
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition">Restore purchases</button>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-3 left-0 right-0">
        <div className="max-w-lg mx-auto">
          <div className="mx-4 bg-black/70 backdrop-blur border border-neutral-800 shadow-lg rounded-2xl">
            <div className="grid grid-cols-3 h-16 text-xs relative">
              <ActivePill index={['home','shop','profile'].indexOf(tab)} />
              <TabButton label="Home" active={tab==='home'} onClick={()=>setTab('home')} icon="🏠" />
              <TabButton label="Shop" active={tab==='shop'} onClick={()=>setTab('shop')} icon="🛍️" />
              <TabButton label="Profile" active={tab==='profile'} onClick={()=>setTab('profile')} icon="👤" />
            </div>
          </div>
        </div>
      </nav>

      {viewer && (
        <VideoScreen course={sampleCourse} title={viewer.title} onClose={() => setViewer(null)} />
      )}

      <Modal open={paywallOpen} onClose={() => setPaywallOpen(false)}>
        <div className="p-4">
          <h3 className="text-base font-semibold mb-1">Go PRO</h3>
          <p className="text-sm text-gray-400 mb-3">Unlock all lessons and weekly updates. Cancel anytime.</p>
          <div className="rounded-2xl bg-white/5 p-3 mb-3">
            <div className="flex items-center justify-between text-sm"><span>Monthly</span><b>$7.99</b></div>
          </div>
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm active:opacity-90 hover:bg-blue-500" onClick={() => { setSubActive(true); setPaywallOpen(false); ping('Subscription activated'); }}>Subscribe</button>
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
