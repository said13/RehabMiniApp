import type { NextApiRequest, NextApiResponse } from 'next';
import { db, exercises } from '../../../src/db';
import { handleCors } from '../../../src/utils/cors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  switch (req.method) {
    case 'GET': {
      const all = await db.select().from(exercises);
      res.status(200).json(all);
      break;
    }
    case 'POST': {
      const {
        title,
        complexId,
        videoUrl,
        muxId,
        videoDurationSec,
        performDurationSec,
        repetitions,
        restSec,
        notes,
      } = req.body as any;
      const inserted = await db
        .insert(exercises)
        .values({
          title,
          complexId,
          videoUrl,
          muxId,
          videoDurationSec,
          performDurationSec,
          repetitions,
          restSec,
          notes,
        })
        .returning();
      res.status(201).json(inserted[0]);
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
