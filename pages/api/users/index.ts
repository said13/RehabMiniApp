import type { NextApiRequest, NextApiResponse } from 'next';
import { eq, sql } from 'drizzle-orm';
import { db, users } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const { page = '1', limit = '10' } = req.query;
      const p = parseInt(Array.isArray(page) ? page[0] : page as string, 10) || 1;
      const l = parseInt(Array.isArray(limit) ? limit[0] : limit as string, 10) || 10;
      const offset = (p - 1) * l;

      const pageUsers = await db.select().from(users).limit(l).offset(offset);
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      const total = Number(totalResult[0]?.count || 0);

      res.status(200).json({ users: pageUsers, total });
      break;
    }
    case 'POST': {
      const userData = req.body;
      if (!userData?.userID) {
        res.status(400).json({ error: 'userID required' });
        break;
      }
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.userID, userData.userID))
        .limit(1);
      if (existing.length) {
        res.status(200).json(existing[0]);
        break;
      }
      const inserted = await db.insert(users).values(userData).returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
