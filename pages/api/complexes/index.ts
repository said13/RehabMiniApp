import type { NextApiRequest, NextApiResponse } from 'next';
import { db, complexes } from '../../../src/db';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const { trainingId } = req.query as { trainingId?: string };
      const query = trainingId
        ? db.select().from(complexes).where(eq(complexes.trainingId, trainingId))
        : db.select().from(complexes);
      const result = await query;
      res.status(200).json(result);
      break;
    }
    case 'POST': {
      const { title, trainingId, rounds, restBetweenSec } = req.body as {
        title: string;
        trainingId: string;
        rounds?: number;
        restBetweenSec?: number;
      };
      const inserted = await db
        .insert(complexes)
        .values({ title, trainingId, rounds, restBetweenSec })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
