import type { NextApiRequest, NextApiResponse } from 'next';
import { eq, sql } from 'drizzle-orm';
import { db, users } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`[${new Date().toISOString()}] ${req.method} /api/users`);
  try {
    switch (req.method) {
      case 'GET': {
        const { page = '1', limit = '10' } = req.query;
        const p = parseInt(Array.isArray(page) ? page[0] : (page as string), 10) || 1;
        const l = parseInt(Array.isArray(limit) ? limit[0] : (limit as string), 10) || 10;
        const offset = (p - 1) * l;

        console.log(`Fetching users page=${p} limit=${l}`);
        const pageUsers = await db.select().from(users).limit(l).offset(offset);
        const totalResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users);
        const total = Number(totalResult[0]?.count || 0);
        console.log(`Fetched ${pageUsers.length} users, total=${total}`);

        res.status(200).json({ users: pageUsers, total });
        break;
      }
      case 'POST': {
        const userData = req.body;
        if (!userData?.userID) {
          console.warn('userID required to create user', userData);
          res.status(400).json({ error: 'userID required' });
          break;
        }
        console.log(`Checking if user ${userData.userID} exists`);
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.userID, userData.userID))
          .limit(1);
        if (existing.length) {
          console.log(`User ${userData.userID} already exists`);
          res.status(200).json(existing[0]);
          break;
        }
        console.log(`Inserting user ${userData.userID}`);
        try {
          const inserted = await db.insert(users).values(userData).returning();
          console.log(`User ${userData.userID} inserted successfully`);
          res.status(201).json(inserted[0]);
        } catch (err) {
          console.error(`Failed to insert user ${userData.userID}`, err);
          throw err;
        }
        break;
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error in /api/users', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
