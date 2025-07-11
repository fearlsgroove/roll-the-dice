import type { APIRoute } from 'astro';
import { executeRolls, SIDES } from '../../lib/dice';

/**
 * Store face‑frequency counts in bulk to avoid KV sub‑request limits.
 * For each die type we keep a single key `${die}:counts` containing a JSON
 * array whose index (face ‑ 1) stores the cumulative count.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const body = (await request.json()) as Record<string, number>;
  const { rolls, total } = executeRolls(body as any);

  const kv = locals?.runtime?.env?.KV_ROLLS as KVNamespace | undefined;
  if (kv) {
    // For every die rolled, fetch its current counts array once, update, then put once.
    await Promise.all(
      SIDES.map(async (sides) => {
        const die = `d${sides}` as const;
        const facesRolled = rolls[die] ?? [];
        if (facesRolled.length === 0) return;

        const countsKey = `${die}:counts`;
        const current = (await kv.get(countsKey)) || null;
        let counts: number[] = current ? (JSON.parse(current) as number[]) : Array(sides).fill(0);

        for (const face of facesRolled) {
          counts[face - 1] += 1;
        }

        await kv.put(countsKey, JSON.stringify(counts));
      })
    );
  }

  return new Response(JSON.stringify({ rolls, total }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
