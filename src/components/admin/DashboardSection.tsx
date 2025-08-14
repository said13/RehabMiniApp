import Link from 'next/link';

type Section = 'subscriptions' | 'categories' | 'users';

export function DashboardSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const items: { key: Section; label: string; href: string }[] = [
    { key: 'subscriptions', label: 'Subscription Settings', href: '/admin/subscription' },
    { key: 'categories', label: 'Categories Settings', href: '/admin/categories' },
    { key: 'users', label: 'Users Settings', href: '/admin/users' },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-4 max-w-xs">
        {items.map((item) =>
          onNavigate ? (
            <button
              key={item.key}
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              className="block px-4 py-2 rounded-lg bg-neutral-800 text-center hover:bg-neutral-700"
            >
              {item.label}
            </Link>
          )
        )}
      </div>
    </>
  );
}
