import type { NextApiRequest, NextApiResponse } from 'next';
import { db, exercises } from '../../../src/db';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const { complexId } = req.query as { complexId?: string };
      const query = complexId
        ? db.select().from(exercises).where(eq(exercises.complexId, complexId))
        : db.select().from(exercises);
      const result = await query;
      res.status(200).json(result);
      break;
    }
    case 'POST': {
      const { title, complexId, video, thumbnail, mode, durationSec, reps, restSec, cues } = req.body as any;
      const inserted = await db
        .insert(exercises)
        .values({ title, complexId, video, thumbnail, mode, durationSec, reps, restSec, cues })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
