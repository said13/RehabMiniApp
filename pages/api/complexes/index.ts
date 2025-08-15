import type { NextApiRequest, NextApiResponse } from 'next';
import { db, complexes } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(complexes);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const { trainingId, order, rounds } = req.body as {
        trainingId: string;
        order: number;
        rounds: number;
      };
      const inserted = await db
        .insert(complexes)
        .values({ trainingId, order, rounds })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
