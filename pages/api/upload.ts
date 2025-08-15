import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { filename, contentType } = req.body as { filename: string; contentType: string };
  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    res.status(500).json({ message: 'Mux credentials are not configured' });
    return;
  }

  const auth = Buffer.from(`${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`).toString('base64');
  const muxRes = await fetch('https://api.mux.com/video/v1/uploads', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      new_asset_settings: { playback_policy: ['public'] },
      cors_origin: req.headers.origin || '*',
    }),
  });

  if (!muxRes.ok) {
    const err = await muxRes.text();
    res.status(500).json({ message: 'Mux upload creation failed', details: err });
    return;
  }

  const data = await muxRes.json();
  res.status(200).json({ uploadUrl: data.data.url, uploadId: data.data.id, assetId: data.data.asset_id });
}
