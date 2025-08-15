import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Applies permissive CORS headers and handles preflight requests.
 * Returns true if the request has been handled (e.g. an OPTIONS preflight).
 */
export function handleCors(req: NextApiRequest, res: NextApiResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
