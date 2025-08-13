import { useEffect, useState } from 'react';
import type { User, Category } from '../types';

const USERS_LIMIT = 10;
const navItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'users', label: 'Users' },
  { id: 'categories', label: 'Categories' },
];

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [section, setSection] = useState<'dashboard' | 'users' | 'categories'>('dashboard');

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
  else content = <DashboardSection />;

  return (
    <AdminShell section={section} onNavigate={setSection} onLogout={handleLogout}>
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
  onNavigate,
  onLogout,
  children,
}: {
  section: 'dashboard' | 'users' | 'categories';
  onNavigate: (s: 'dashboard' | 'users' | 'categories') => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] bg-neutral-950 text-gray-100">
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 text-xl font-bold">Admin</div>
        <nav className="px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                section === item.id ? 'bg-neutral-800 text-white' : 'text-gray-300 hover:bg-neutral-800'
              }`}
              onClick={() => {
                onNavigate(item.id as any);
                closeSidebar();
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-neutral-800"
            onClick={onLogout}
          >
            Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-10 bg-black/50 md:hidden" onClick={closeSidebar} />}

      <div className="flex-1 md:ml-64">
        <header className="h-14 flex items-center px-4 border-b border-neutral-800 bg-neutral-950">
          <button className="md:hidden mr-2" onClick={toggleSidebar}>
            <i className="fa-solid fa-bars" />
          </button>
          <span className="font-semibold">Admin Panel</span>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

function DashboardSection() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-300">Select a section from the menu to manage content.</p>
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
    const res = await fetch(`/api/users?page=${p}&limit=${USERS_LIMIT}`);
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    fetchUsers(page);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ userID: '', name: '', username: '', email: '' });
    fetchUsers(page);
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

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ id: '', title: '' });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setForm({ id: '', title: '' });
    setEditId(null);
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ id: cat.id, title: cat.title });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <ul className="space-y-2 mb-8">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center justify-between bg-neutral-900 px-4 py-2 rounded-lg"
          >
            <span className="font-medium">{cat.title}</span>
            <div className="flex items-center gap-3 text-sm">
              <button
                className="text-blue-400 hover:underline"
                onClick={() => handleEdit(cat)}
              >
                Edit
              </button>
              <button
                className="text-red-400 hover:underline"
                onClick={() => handleDelete(cat.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="text-xl font-semibold mb-2">{editId ? 'Edit' : 'Add'} Category</h2>
      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="id"
          disabled={!!editId}
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
          className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium hover:bg-blue-500"
        >
          {editId ? 'Update' : 'Create'}
        </button>
      </form>
    </>
  );
}

