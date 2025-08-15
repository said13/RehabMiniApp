import type { NextApiRequest, NextApiResponse } from 'next';
import { db, users } from '../../../src/db';
import { eq } from 'drizzle-orm';
import { handleCors } from '../../../src/utils/cors';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (handleCors(req, res)) return;

  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  try {
    switch (req.method) {
      case 'GET': {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.userID, id))
          .limit(1);
        if (!result.length) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        res.status(200).json(result[0]);
        break;
      }
      case 'PUT': {
        const data = req.body;
        const updated = await db
          .update(users)
          .set(data)
          .where(eq(users.userID, id))
          .returning();
        if (!updated.length) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        res.status(200).json(updated[0]);
        break;
      }
      case 'DELETE': {
        const deleted = await db
          .delete(users)
          .where(eq(users.userID, id))
          .returning();
        if (!deleted.length) {
          res.status(404).json({ error: 'Not found' });
          return;
        }
        res.status(200).json(deleted[0]);
        break;
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error('Error in /api/users/[id]', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

