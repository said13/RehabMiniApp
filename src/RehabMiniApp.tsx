import { useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk';
import { useEnvReady } from './hooks/useEnvReady';
import { safeLocalStorage } from './utils/localStorage';
import { VideoScreen } from './components/VideoScreen';
import { TabButton } from './components/TabButton';
import { ActivePill } from './components/ActivePill';
import { DevTests } from './components/DevTests';
import { DebugConsole } from './components/DebugConsole';
import { AdminPanel } from './components/AdminPanel';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeTab } from './components/HomeTab';
import { useErrorLogger } from './hooks/useErrorLogger';
import type { TrainingWithComplexes } from './types';
import { useRouter } from 'next/router';

export default function RehabMiniApp() {
  const envReady = useEnvReady();
  const ls = safeLocalStorage();
  const router = useRouter();

  const [tab, setTab] = useState<'home' | 'profile' | 'debug' | 'admin'>('home');
  const [viewerCourse, setViewerCourse] = useState<TrainingWithComplexes | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [subActive, setSubActive] = useState<boolean>(false);
  const [tgUser, setTgUser] = useState<any | null>(null);
  const { logs, addLog } = useErrorLogger();

  useEffect(() => {
    if (!envReady) return;
    const sub = ls.get('subActive', '0') === '1';
    setSubActive(!!sub);
  }, [envReady]);

  useEffect(() => { if (envReady) try { window.localStorage.setItem('subActive', subActive ? '1' : '0'); } catch {} }, [envReady, subActive]);

  useEffect(() => {
    try {
      if (!(window as any).TelegramGameProxy) {
        (window as any).TelegramGameProxy = { receiveEvent: () => {} };
      }
      const lp = retrieveLaunchParams();
      // lp.initData?.user contains Telegram user info if available
      const u = lp?.initData?.user as any;
      if (u) setTgUser(u);
    } catch {}
  }, []);

  useEffect(() => {
    if (!tgUser) return;
    const body = {
      userID: String(tgUser.id),
      name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
      username: tgUser.username,
      email: '',
    };
    console.log(`Attempting to register user ${body.userID}`);
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (res.ok) {
          console.log(`Successfully registered user ${body.userID}`);
        } else {
          console.error(
            `Failed to register user ${body.userID}: ${res.status} ${res.statusText}`,
          );
        }
      })
      .catch((err) => {
        console.error(`Error registering user ${body.userID}`, err);
      });
  }, [tgUser]);

  useEffect(() => {
    if (!envReady) return;
    try {
      const wa = (window as any).Telegram?.WebApp;
      wa?.requestFullscreen?.();
      wa?.disableVerticalSwipe?.();
    } catch {}
  }, [envReady]);

  const ping = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1300); };

  return (
    <ErrorBoundary addLog={addLog}>
    <div
      className="w-full min-h-[100dvh] bg-neutral-950 text-gray-100 flex flex-col font-sans"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <main className="flex-1 pb-20 animate-fadeIn">
        {tab === 'home' && (
          <HomeTab viewerCourse={viewerCourse} setViewerCourse={setViewerCourse} />
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
                <button
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition flex items-center justify-center gap-2"
                  onClick={() => router.push('/pay')}
                >
                  <i className="fa-solid fa-crown"></i>
                  <span>Activate subscription</span>
                </button>
              )}
              <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition flex items-center justify-center gap-2">
                <i className="fa-solid fa-rotate-left"></i>
                <span>Restore purchases</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'debug' && <DebugConsole logs={logs} />}

        {tab === 'admin' && <AdminPanel />}
      </main>

      <nav className="fixed bottom-3 left-0 right-0">
        <div className="max-w-lg mx-auto">
          <div className="mx-4 bg-black/70 backdrop-blur border border-neutral-800 shadow-lg rounded-2xl">
            <div className="grid grid-cols-4 h-16 text-xs relative gap-1 p-1">
              <ActivePill index={['home','profile','debug','admin'].indexOf(tab)} count={4} />
              <TabButton label="Home" active={tab==='home'} onClick={()=>setTab('home')} icon={<i className="fa-solid fa-house"></i>} />
              <TabButton label="Profile" active={tab==='profile'} onClick={()=>setTab('profile')} icon={<i className="fa-solid fa-user"></i>} />
              <TabButton label="Debug" active={tab==='debug'} onClick={()=>setTab('debug')} icon={<i className="fa-solid fa-bug"></i>} />
              <TabButton label="Admin" active={tab==='admin'} onClick={()=>setTab('admin')} icon={<i className="fa-solid fa-lock"></i>} />
            </div>
          </div>
        </div>
      </nav>

      {viewerCourse && (
        <VideoScreen training={viewerCourse} title={viewerCourse.title} onClose={() => setViewerCourse(null)} />
      )}

      {toast && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center animate-fadeIn">
          <div className="bg-white/10 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toast}</div>
        </div>
      )}

      <DevTests />
    </div>
    </ErrorBoundary>
  );
}
