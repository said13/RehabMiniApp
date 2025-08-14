import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Training } from 'src/types';

export function TrainingsSection() {
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    const res = await fetch('/api/trainings');
    const data = await res.json();
    setTrainings(data);
  };

  return (
    <>
      <h1>Trainings</h1>
      <ul>
        {trainings.map((t) => (
          <li key={t.id}>
            {t.title}
            <Link href={`/admin/trainings/${t.id}`} style={{ marginLeft: 10 }}>
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

