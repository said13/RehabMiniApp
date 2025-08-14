import { useEffect, useState } from 'react';
import type { User } from '../types';
import { CategoriesSection } from './admin/CategoriesSection';

const USERS_LIMIT = 10;

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

function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({ userID: '', name: '', username: '', email: '' });

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (p: number) => {
    try {
      const res = await fetch(`/api/users?page=${p}&limit=${USERS_LIMIT}`);
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to fetch users: ${res.status} ${res.statusText}`, text);
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to delete user ${id}: ${res.status} ${res.statusText}`, text);
        return;
      }
      fetchUsers(page);
    } catch (err) {
      console.error(`Error deleting user ${id}`, err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(`Failed to create user: ${res.status} ${res.statusText}`, text);
        return;
      }
      setForm({ userID: '', name: '', username: '', email: '' });
      fetchUsers(page);
    } catch (err) {
      console.error('Error creating user', err);
    }
  };

  const totalPages = Math.ceil(total / USERS_LIMIT) || 1;

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul className="space-y-2 mb-8">
        {users.map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between bg-neutral-900 px-4 py-2 rounded-lg"
          >
            <span className="truncate">
              {u.name} ({u.userID})
            </span>
            <button
              className="text-sm text-red-400 hover:underline"
              onClick={() => handleDelete(u.userID)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1 bg-neutral-800 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1 bg-neutral-800 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <h2 className="text-xl font-semibold mb-2">Add User</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.userID}
          onChange={(e) => setForm({ ...form, userID: e.target.value })}
          placeholder="userID"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="name"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="username"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          Create
        </button>
      </form>
    </>
  );
}

