import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, exercises } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(result[0]);
      break;
    }
    case 'PUT': {
      const { title, complexId, video, thumbnail, mode, durationSec, reps, restSec } = req.body as any;
      const updated = await db
        .update(exercises)
        .set({ title, complexId, video, thumbnail, mode, durationSec, reps, restSec })
        .where(eq(exercises.id, id))
        .returning();
      if (!updated.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(updated[0]);
      break;
    }
    case 'DELETE': {
      const deleted = await db.delete(exercises).where(eq(exercises.id, id)).returning();
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
