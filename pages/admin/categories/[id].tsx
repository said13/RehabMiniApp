import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { Category, Course } from 'src/types';
import AdminLayout from 'src/components/admin/AdminLayout';

const emptyCourse = { id: '', title: '' };

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [category, setCategory] = useState<Category | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState(emptyCourse);
  const [editId, setEditId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!id) return;
    if (typeof window !== 'undefined' && !window.localStorage.getItem('admin-token')) {
      router.replace('/admin/login');
      return;
    }
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    const res = await fetch(`/api/categories/${id}`);
    const data = await res.json();
    setCategory(data);
    setCourses(data.courses || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    if (editId && editingCourse) {
      const updated: Course = { ...editingCourse, title: form.title };
      await fetch(`/api/courses/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } else {
      const newCourse: Course = {
        id: form.id,
        title: form.title,
        laps: [{ id: 'main', title: 'Main', exercises: [] }],
      };
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id, course: newCourse }),
      });
    }
    setForm(emptyCourse);
    setEditId(null);
    setEditingCourse(null);
    fetchCategory();
  };

  const handleEdit = (course: Course) => {
    setEditId(course.id);
    setEditingCourse(course);
    setForm({ id: course.id, title: course.title });
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete?')) return;
    await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    fetchCategory();
  };

  return (
    <AdminLayout>
      <button onClick={() => router.push('/admin/categories')}>Back</button>
      <h1>Category: {category?.title}</h1>
      <ul className="space-y-2 mb-8">
        {courses.map((c) => (
          <li
            key={c.id}
            onClick={() => router.push(`/admin/courses/${c.id}`)}
            className="group flex items-center justify-between bg-neutral-900 hover:bg-neutral-800 px-4 py-2 rounded-lg cursor-pointer"
          >
            <span className="font-medium group-hover:underline">{c.title}</span>
            <div className="flex items-center gap-3 text-sm">
              <button
                className="text-blue-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(c);
                }}
              >
                Edit
              </button>
              <button
                className="text-red-400 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c.id);
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h2 style={{ marginTop: 30 }}>{editId ? 'Edit' : 'Add'} Training</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={form.id}
          onChange={(e) => setForm({ ...form, id: e.target.value })}
          placeholder="id"
          disabled={!!editId}
        />
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="title"
        />
        <button type="submit">{editId ? 'Update' : 'Create'}</button>
      </form>
    </AdminLayout>
  );
}
