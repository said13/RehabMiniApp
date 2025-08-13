import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, trainings } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(trainings).where(eq(trainings.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(result[0]);
      break;
    }
    case 'PUT': {
      const { title, categoryId } = req.body as { title: string; categoryId: string };
      const updated = await db
        .update(trainings)
        .set({ title, categoryId })
        .where(eq(trainings.id, id))
        .returning();
      if (!updated.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(updated[0]);
      break;
    }
    case 'DELETE': {
      const deleted = await db.delete(trainings).where(eq(trainings.id, id)).returning();
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
