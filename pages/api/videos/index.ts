import type { NextApiRequest, NextApiResponse } from 'next';
import { db, videos } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(videos);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const { title, url, thumbnail } = req.body as { title: string; url: string; thumbnail?: string };
      const inserted = await db.insert(videos).values({ title, url, thumbnail }).returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
