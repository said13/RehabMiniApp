import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.localStorage.getItem('admin-token')) {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin';
    if (password === pwd) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin-token', '1');
      }
      router.replace('/admin');
    } else {
      alert('Invalid password');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
