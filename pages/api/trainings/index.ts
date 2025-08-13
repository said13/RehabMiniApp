import type { NextApiRequest, NextApiResponse } from 'next';
import { db, trainings } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(trainings);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const { title, categoryId } = req.body as { title: string; categoryId: string };
      const inserted = await db
        .insert(trainings)
        .values({ title, categoryId })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
