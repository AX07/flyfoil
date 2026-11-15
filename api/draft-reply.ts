import { handleDraftRequest } from './_lib/assistant.js';

// Vercel serverless function: POST /api/draft-reply
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { status, json } = await handleDraftRequest(req.headers.authorization, req.body);
  res.status(status).json(json);
}
