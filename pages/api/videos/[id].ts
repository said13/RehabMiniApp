import type { NextApiRequest, NextApiResponse } from 'next';
import { videos } from '../../../src/backend/data';
import type { Video } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idx = videos.findIndex(v => v.id === id);

  if (idx === -1) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  switch (req.method) {
    case 'GET':
      res.status(200).json(videos[idx]);
      break;
    case 'PUT':
      videos[idx] = req.body as Video;
      res.status(200).json(videos[idx]);
      break;
    case 'DELETE':
      const removed = videos.splice(idx, 1)[0];
      res.status(200).json(removed);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
