import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { User } from 'src/types';

const LIMIT = 10;

const emptyForm = { userID: '', name: '', username: '', email: '' };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (p: number) => {
    const res = await fetch(`/api/users?page=${p}&limit=${LIMIT}`);
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
    setForm(emptyForm);
    fetchUsers(page);
  };

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <AdminLayout>
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
    </AdminLayout>
  );
}

