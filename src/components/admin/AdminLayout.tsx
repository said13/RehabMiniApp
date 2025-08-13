import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import React, { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/categories', label: 'Categories' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

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
      <div className="flex min-h-screen bg-neutral-950 text-gray-100">
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 text-xl font-bold">Admin</div>
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  router.pathname.startsWith(item.href)
                    ? 'bg-neutral-800 text-white'
                    : 'text-gray-300 hover:bg-neutral-800'
                }`}
                onClick={closeSidebar}
              >
                {item.label}
              </Link>
            ))}
            <button
              className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-neutral-800"
              onClick={logout}
            >
              Logout
            </button>
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/50 md:hidden"
            onClick={closeSidebar}
          />
        )}

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
    </>
  );
}
