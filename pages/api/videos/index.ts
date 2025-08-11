import type { NextApiRequest, NextApiResponse } from 'next';
import { videos } from '../../../src/backend/data';
import type { Video } from '../../../src/types';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json(videos);
      break;
    case 'POST':
      const video: Video = req.body;
      videos.push(video);
      res.status(201).json(video);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
