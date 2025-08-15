import type { NextApiRequest, NextApiResponse } from 'next';
import { db, categories } from '../../../src/db';
import { handleCors } from '../../../src/utils/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    const all = await db.select().from(categories);
    res.status(200).json(all);
    return;
  }

  if (req.method === 'POST') {
    const { title, coverUrl } = req.body as {
      title: string;
      coverUrl: string;
    };

    const inserted = await db
      .insert(categories)
      .values({ title, coverUrl })
      .returning();

    res.status(201).json(inserted[0]);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
