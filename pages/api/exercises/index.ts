import type { NextApiRequest, NextApiResponse } from 'next';
import { db, exercises } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(exercises);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const { title, complexId, video, thumbnail, mode, durationSec, reps, restSec } = req.body as any;
      const inserted = await db
        .insert(exercises)
        .values({ title, complexId, video, thumbnail, mode, durationSec, reps, restSec })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
