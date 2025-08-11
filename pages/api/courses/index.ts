import type { NextApiRequest, NextApiResponse } from 'next';
import { categories, courses } from '../../../src/backend/data';
import type { Course } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(courses);
      break;
    case 'POST':
      const { categoryId, course } = req.body as { categoryId: string; course: Course };
      courses.push(course);
      const cat = categories.find(c => c.id === categoryId);
      if (cat) {
        cat.courses.push(course);
      }
      res.status(201).json(course);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
