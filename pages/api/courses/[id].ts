import type { NextApiRequest, NextApiResponse } from 'next';
import { categories, courses } from '../../../src/backend/data';
import type { Course } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idx = courses.findIndex(c => c.id === id);

  if (idx === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  switch (req.method) {
    case 'GET':
      res.status(200).json(courses[idx]);
      break;
    case 'PUT':
      const updated = req.body as Course;
      courses[idx] = updated;
      categories.forEach(cat => {
        const ci = cat.courses.findIndex(c => c.id === id);
        if (ci !== -1) {
          cat.courses[ci] = updated;
        }
      });
      res.status(200).json(updated);
      break;
    case 'DELETE':
      const removed = courses.splice(idx, 1)[0];
      categories.forEach(cat => {
        cat.courses = cat.courses.filter(c => c.id !== id);
      });
      res.status(200).json(removed);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
