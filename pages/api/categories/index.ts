import type { NextApiRequest, NextApiResponse } from 'next';
import { db, categories } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(categories);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const { title, coverUrl } = req.body as { title: string; coverUrl: string };
      const inserted = await db
        .insert(categories)
        .values({ title, coverUrl })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
