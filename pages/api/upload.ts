import type { NextApiRequest, NextApiResponse } from 'next';
import { deleteMuxAsset } from '../../src/utils/mux';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
    res.status(500).json({ message: 'Mux credentials are not configured' });
    return;
  }

  const auth = Buffer.from(
    `${process.env.MUX_TOKEN_ID}:${process.env.MUX_TOKEN_SECRET}`
  ).toString('base64');

  if (req.method === 'DELETE') {
    const { assetId } = req.query as { assetId?: string };
    if (!assetId) {
      res.status(400).json({ message: 'assetId is required' });
      return;
    }
    try {
      await deleteMuxAsset(assetId);
      res.status(204).end();
    } catch (e: any) {
      res
        .status(500)
        .json({ message: 'Mux asset deletion failed', details: e.message });
    }
    return;
  }

  if (req.method === 'GET') {
    const { uploadId } = req.query as { uploadId?: string };
    if (!uploadId) {
      res.status(400).json({ message: 'uploadId is required' });
      return;
    }
    try {
      const upRes = await fetch(
        `https://api.mux.com/video/v1/uploads/${uploadId}`,
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );
      if (!upRes.ok) {
        const err = await upRes.text();
        res.status(upRes.status).send(err);
        return;
      }
      const upData = await upRes.json();
      const assetId = upData.data.asset_id;
      if (!assetId) {
        res.status(202).json({ status: 'pending' });
        return;
      }
      const assetRes = await fetch(
        `https://api.mux.com/video/v1/assets/${assetId}`,
        {
          headers: { Authorization: `Basic ${auth}` },
        }
      );
      if (!assetRes.ok) {
        const err = await assetRes.text();
        res.status(assetRes.status).send(err);
        return;
      }
      const assetData = await assetRes.json();
      const playbackId = assetData.data.playback_ids?.[0]?.id;
      res.status(200).json({ assetId, playbackId });
    } catch (e: any) {
      res
        .status(500)
        .json({ message: 'Mux asset lookup failed', details: e.message });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const createUpload = async () => {
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
      throw new Error(err);
    }

    const data = await muxRes.json();
    return { uploadUrl: data.data.url, uploadId: data.data.id };
  };

  const { files } = req.body as { files?: { filename: string; contentType: string }[] };

  try {
    if (Array.isArray(files) && files.length > 0) {
      const uploads = [] as any[];
      for (let i = 0; i < files.length; i++) {
        uploads.push(await createUpload());
      }
      res.status(200).json({ uploads });
    } else {
      const single = await createUpload();
      res.status(200).json(single);
    }
  } catch (e: any) {
    res
      .status(500)
      .json({ message: 'Mux upload creation failed', details: e.message });
  }
}
