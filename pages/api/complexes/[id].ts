import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, complexes } from '../../../src/db';
import { handleCors } from '../../../src/utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(complexes).where(eq(complexes.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(result[0]);
      break;
    }
    case 'PUT': {
      const { trainingId, order, rounds } = req.body as {
        trainingId: string;
        order: number;
        rounds: number;
      };
      const updated = await db
        .update(complexes)
        .set({ trainingId, order, rounds })
        .where(eq(complexes.id, id))
        .returning();
      if (!updated.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(updated[0]);
      break;
    }
    case 'DELETE': {
      const deleted = await db.delete(complexes).where(eq(complexes.id, id)).returning();
      if (!deleted.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(deleted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
