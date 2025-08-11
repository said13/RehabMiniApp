import type { NextApiRequest, NextApiResponse } from 'next';
import { categories } from '../../../src/backend/data';
import type { Category } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(categories);
      break;
    case 'POST':
      const category: Category = req.body;
      categories.push(category);
      res.status(201).json(category);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
