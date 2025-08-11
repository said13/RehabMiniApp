import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './AdminLayout.module.css';
import React, { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/trainings', label: 'Trainings' },
  { href: '/admin/complexes', label: 'Complexes' },
  { href: '/admin/exercises', label: 'Exercises' },
  { href: '/admin/videos', label: 'Videos' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
    router.replace('/admin/login');
  };

  return (
    <div className={styles.wrapper}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>Admin</div>
        <nav>
          <ul className={styles.navList}>
            {navItems.map(item => (
              <li
                key={item.href}
                className={`${styles.navItem} ${router.pathname.startsWith(item.href) ? styles.active : ''}`}
              >
                <Link href={item.href} className={styles.navLink} onClick={closeSidebar}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className={styles.navItem}>
              <button className={styles.navLink} onClick={logout}>Logout</button>
            </li>
          </ul>
        </nav>
      </aside>

      {sidebarOpen && <div className={styles.backdrop} onClick={closeSidebar} />}

      <div className={`${styles.content} ${sidebarOpen ? styles.contentShift : ''}`}>
        <header className={styles.header}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            &#9776;
          </button>
          <span className={styles.headerTitle}>Admin Panel</span>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
