import type { NextApiRequest, NextApiResponse } from 'next';
import { init, query } from '../../../src/backend/db';
import type { User } from '../../../src/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await init();

  switch (req.method) {
    case 'GET':
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const usersRes = await query<User>(
        'SELECT id, full_name as "fullName", email, phone, subscription_plan as "subscriptionPlan", subscription_status as "subscriptionStatus", subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt" FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
      const countRes = await query<{ count: string }>('SELECT COUNT(*) FROM users');
      res.status(200).json({
        users: usersRes.rows,
        total: Number(countRes.rows[0].count),
        page,
        limit,
      });
      break;
    case 'POST':
      const {
        fullName,
        email,
        phone,
        subscriptionPlan,
        subscriptionStatus,
        subscriptionExpiresAt,
      } = req.body as Partial<User>;

      const insertRes = await query<User>(
        'INSERT INTO users (full_name, email, phone, subscription_plan, subscription_status, subscription_expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name as "fullName", email, phone, subscription_plan as "subscriptionPlan", subscription_status as "subscriptionStatus", subscription_expires_at as "subscriptionExpiresAt", created_at as "createdAt"',
        [
          fullName,
          email,
          phone,
          subscriptionPlan,
          subscriptionStatus,
          subscriptionExpiresAt,
        ]
      );
      res.status(201).json(insertRes.rows[0]);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

