import type { NextApiRequest, NextApiResponse } from 'next';
import { db, exercises } from '../../../src/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
