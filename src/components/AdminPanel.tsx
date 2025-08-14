import { useEffect, useState } from 'react';
import { CategoriesSection } from './admin/CategoriesSection';
import { UsersSection } from './admin/UsersSection';

type Section = 'dashboard' | 'subscriptions' | 'users' | 'categories';

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState<Section>('dashboard');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthed(window.localStorage.getItem('admin-token') === '1');
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
    setAuthed(false);
    setSection('dashboard');
  };

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  let content: JSX.Element | null = null;
  if (section === 'users') content = <UsersSection />;
  else if (section === 'categories') content = <CategoriesSection />;
  else if (section === 'subscriptions') content = <SubscriptionsSection />;
  else content = <DashboardSection onNavigate={setSection} />;

  return (
    <AdminShell
      section={section}
      onBack={() => setSection('dashboard')}
      onLogout={handleLogout}
    >
      {content}
    </AdminShell>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (password === pwd) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin-token', '1');
      }
      onSuccess();
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex items-center justify-center bg-neutral-950 text-gray-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xs bg-neutral-900 p-6 rounded-xl space-y-4">
        <h1 className="text-xl font-bold text-center">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none"
        />
        <button type="submit" className="w-full py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500">
          Login
        </button>
      </form>
    </div>
  );
}

function AdminShell({
  section,
  onBack,
  onLogout,
  children,
}: {
  section: Section;
  onBack: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-neutral-950 text-gray-100">
      <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2">
          {section !== 'dashboard' && (
            <button
              className="text-sm text-gray-300 hover:text-white"
              onClick={onBack}
            >
              Back
            </button>
          )}
          <span className="font-semibold">Admin Panel</span>
        </div>
        <button
          className="text-sm text-gray-300 hover:text-white"
          onClick={onLogout}
        >
          Logout
        </button>
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
}

function DashboardSection({
  onNavigate,
}: {
  onNavigate: (s: 'subscriptions' | 'categories' | 'users') => void;
}) {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-4 max-w-xs">
        <button
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
          onClick={() => onNavigate('subscriptions')}
        >
          Subscription Settings
        </button>
        <button
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
          onClick={() => onNavigate('categories')}
        >
          Categories Settings
        </button>
        <button
          className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
          onClick={() => onNavigate('users')}
        >
          Users Settings
        </button>
      </div>
    </>
  );
}

function SubscriptionsSection() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Subscription Settings</h1>
      <p className="text-gray-300">Manage subscription plans here.</p>
    </>
  );
}

