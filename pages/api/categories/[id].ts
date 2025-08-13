import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, categories, trainings } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      const cat = result[0];
      const ts = await db.select().from(trainings).where(eq(trainings.categoryId, id));
      res.status(200).json({ ...cat, trainings: ts });
      break;
    }
    case 'PUT': {
      const { name, coverUrl } = req.body as { name: string; coverUrl: string };
      const updated = await db
        .update(categories)
        .set({ name, coverUrl })
        .where(eq(categories.id, id))
        .returning();
      if (!updated.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(updated[0]);
      break;
    }
    case 'DELETE': {
      const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();
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
