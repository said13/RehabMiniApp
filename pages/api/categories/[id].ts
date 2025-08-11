import type { NextApiRequest, NextApiResponse } from 'next';
import { categories } from '../../../src/backend/data';
import type { Category } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idx = categories.findIndex(c => c.id === id);

  if (idx === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  switch (req.method) {
    case 'GET':
      res.status(200).json(categories[idx]);
      break;
    case 'PUT':
      categories[idx] = req.body as Category;
      res.status(200).json(categories[idx]);
      break;
    case 'DELETE':
      const deleted = categories.splice(idx, 1);
      res.status(200).json(deleted[0]);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
