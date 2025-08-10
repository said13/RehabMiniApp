import type { NextApiRequest, NextApiResponse } from 'next';
import Mux from '@mux/mux-node';

const tokenId = process.env.MUX_TOKEN_ID;
const tokenSecret = process.env.MUX_TOKEN_SECRET;

const mux = tokenId && tokenSecret ? new Mux({ tokenId, tokenSecret }) : null;
const video = mux ? mux.video : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!video) {
    res.status(500).json({ message: 'Mux credentials not configured' });
    return;
  }

  if (req.method === 'GET') {
    const assets = await video.assets.list();
    res.status(200).json(assets);
    return;
  }

  if (req.method === 'POST') {
    const { url } = req.body as { url?: string };
    if (!url) {
      res.status(400).json({ message: 'url is required' });
      return;
    }
    const asset = await video.assets.create({ input: url, playback_policy: 'public' });
    res.status(201).json(asset);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('Method Not Allowed');
}
