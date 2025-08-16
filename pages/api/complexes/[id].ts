import type { NextApiRequest, NextApiResponse } from 'next';
import { eq } from 'drizzle-orm';
import { db, complexes, exercises } from '../../../src/db';
import { handleCors } from '../../../src/utils/cors';
import { deleteMuxAsset } from '../../../src/utils/mux';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (handleCors(req, res)) return;

  const { id } = req.query as { id: string };

  switch (req.method) {
    case 'GET': {
      const result = await db.select().from(complexes).where(eq(complexes.id, id)).limit(1);
      if (!result.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(result[0]);
      break;
    }
    case 'PUT': {
      const { trainingId, order, rounds } = req.body as {
        trainingId: string;
        order: number;
        rounds: number;
      };
      const updated = await db
        .update(complexes)
        .set({ trainingId, order, rounds })
        .where(eq(complexes.id, id))
        .returning();
      if (!updated.length) {
        res.status(404).json({ message: 'Not found' });
        break;
      }
      res.status(200).json(updated[0]);
      break;
    }
    case 'DELETE': {
      const related = await db
        .select()
        .from(exercises)
        .where(eq(exercises.complexId, id));

      try {
        const muxPromises = related
          .filter((ex) => ex.muxId)
          .map((ex) => deleteMuxAsset(ex.muxId!));
        const deleteComplex = db
          .delete(complexes)
          .where(eq(complexes.id, id))
          .returning();
        const results = await Promise.all([...muxPromises, deleteComplex]);
        const deleted = results[results.length - 1] as Awaited<typeof deleteComplex>;
        if (!deleted.length) {
          res.status(404).json({ message: 'Not found' });
          break;
        }
        res.status(200).json(deleted[0]);
      } catch (e) {
        res.status(500).json({ message: 'Failed to delete complex' });
      }
      break;
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
