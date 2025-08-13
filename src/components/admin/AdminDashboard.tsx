import Link from 'next/link';

const sections = [
  { href: '/admin/videos', label: 'Videos', icon: 'fa-video' },
  { href: '/admin/courses', label: 'Courses', icon: 'fa-book' },
  { href: '/admin/exercises', label: 'Exercises', icon: 'fa-dumbbell' },
  { href: '/admin/complexes', label: 'Complexes', icon: 'fa-layer-group' },
  { href: '/admin/trainings', label: 'Trainings', icon: 'fa-person-running' },
  { href: '/admin/categories', label: 'Categories', icon: 'fa-tags' },
  { href: '/admin/users', label: 'Users', icon: 'fa-users' },
];

export default function AdminDashboard() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="flex items-center p-6 bg-neutral-900 rounded-lg border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            <i className={`fa-solid ${section.icon} text-2xl mr-4`} />
            <span className="text-lg font-medium">{section.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
