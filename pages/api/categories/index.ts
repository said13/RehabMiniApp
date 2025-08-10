import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'categories.json');

async function readCategories() {
  try {
    const data = await fs.readFile(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const categories = await readCategories();
    res.status(200).json(categories);
    return;
  }

  if (req.method === 'POST') {
    const { title } = req.body as { title?: string };
    if (!title) {
      res.status(400).json({ message: 'Title required' });
      return;
    }
    const categories = await readCategories();
    const newCategory = { id: Date.now().toString(), title };
    categories.push(newCategory);
    await fs.writeFile(dataFile, JSON.stringify(categories, null, 2));
    res.status(201).json(newCategory);
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('Method Not Allowed');
}
