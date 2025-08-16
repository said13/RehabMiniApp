import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteMuxAsset } from '../../../src/utils/mux';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { id } = req.query as { id: string };
  try {
    await deleteMuxAsset(id);
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ message: 'Mux asset deletion failed', details: e.message });
  }
}
