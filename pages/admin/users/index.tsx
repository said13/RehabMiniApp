import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from 'src/components/admin/AdminLayout';
import type { User } from 'src/types';

const limit = 10;

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
    const res = await fetch(`/api/users?page=${p}&limit=${limit}`);
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <AdminLayout>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Subscription</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                {u.subscriptionPlan ? `${u.subscriptionPlan} (${u.subscriptionStatus || 'status unknown'})` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 20 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </AdminLayout>
  );
}

