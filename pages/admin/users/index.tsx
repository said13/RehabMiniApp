import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { User } from 'src/types';

const LIMIT = 10;

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
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

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <AdminLayout>
      <h1>Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} ({u.userID})
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 20 }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Prev
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {page} / {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </AdminLayout>
  );
}

