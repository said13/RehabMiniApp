import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, categories } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(result[0]);
      break;
    }
    case 'PUT': {
      const { title, coverUrl } = req.body as { title: string; coverUrl: string };
      const updated = await db
        .update(categories)
        .set({ title, coverUrl })
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
