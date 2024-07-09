import { bot, secretToken } from '@/utils/bot';
import { webhookCallback } from 'grammy';

export const config = { runtime: 'edge' };

// Default grammY handler for incoming updates via webhooks
export default async function handler(req) {
  console.log('webhook call', req, secretToken);
  if (req.method === 'POST') {
    const callback = webhookCallback(bot, 'std/http', {
      timeoutMilliseconds: 24_000,
      secretToken,
    });

    return await callback(req);
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}
