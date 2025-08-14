import { useEffect, useState } from 'react';
import type { User } from '../../types';

const USERS_LIMIT = 10;

export function UsersSection() {
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

