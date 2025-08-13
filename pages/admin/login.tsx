import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';

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
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </Head>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-gray-100 p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xs bg-neutral-900 p-6 rounded-xl space-y-4"
        >
          <h1 className="text-xl font-bold text-center">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 rounded-lg font-semibold hover:bg-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}
