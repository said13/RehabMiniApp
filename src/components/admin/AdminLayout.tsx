import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './AdminLayout.module.css';
import React from 'react';

const navItems = [
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/trainings', label: 'Trainings' },
  { href: '/admin/complexes', label: 'Complexes' },
  { href: '/admin/exercises', label: 'Exercises' },
  { href: '/admin/videos', label: 'Videos' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('admin-token');
    }
    router.replace('/admin/login');
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Admin</div>
        <nav>
          <ul className={styles.navList}>
            {navItems.map(item => (
              <li key={item.href} className={styles.navItem}>
                <Link href={item.href} className={styles.navLink}>{item.label}</Link>
              </li>
            ))}
            <li className={styles.navItem}>
              <button onClick={logout}>Logout</button>
            </li>
          </ul>
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
