import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
    router.replace('/admin/login');
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
      <div className="min-h-screen bg-neutral-950 text-gray-100">
        <header className="h-14 flex items-center justify-between px-4 border-b border-neutral-800 bg-neutral-950">
          <span className="font-semibold">Admin Panel</span>
          <button
            className="text-sm text-gray-300 hover:text-white"
            onClick={logout}
          >
            Logout
          </button>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </>
  );
}
