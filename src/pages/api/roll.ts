export const prerender = false;

import type { APIRoute } from 'astro';
import { executeRolls, SIDES } from '../../lib/dice';

export const POST: APIRoute = async ({ request, locals }) => {
  const body = (await request.json()) as Record<string, number>;
  const { rolls, total } = executeRolls(body as any);

  // Persist each face result to KV so we can audit fairness later
  const kv = locals?.runtime?.env?.KV_ROLLS as KVNamespace | undefined;
  if (kv) {
    await Promise.all(
      SIDES.flatMap((sides) => {
        const key = `d${sides}`;
        return (rolls[key] ?? []).map(async (face) => {
          const kvKey = `${key}:${face}`;
          const current = parseInt((await kv.get(kvKey)) || '0', 10);
          await kv.put(kvKey, String(current + 1));
        });
      })
    );
  }

  return new Response(JSON.stringify({ rolls, total }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
