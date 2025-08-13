import type { NextApiRequest, NextApiResponse } from 'next';
import { db, users } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const allUsers = await db.select().from(users);
      res.status(200).json(allUsers);
      break;
    }
    case 'POST': {
      const userData = req.body;
      const inserted = await db.insert(users).values(userData).returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
