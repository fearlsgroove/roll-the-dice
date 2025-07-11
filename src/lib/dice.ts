export type RollRequest = Record<`d${4 | 6 | 8 | 12 | 20 | 100}`, number>;

export interface RollResponse {
  rolls: Record<string, number[]>;
  total: number;
}

export const SIDES = [4, 6, 8, 12, 20, 100] as const;

export function executeRolls(req: RollRequest): RollResponse {
  const rolls: Record<string, number[]> = {};
  let total = 0;

  for (const sides of SIDES) {
    const key = `d${sides}` as const;
    const count = req[key] ?? 0;
    if (count > 0) {
      rolls[key] = [];
      for (let i = 0; i < count; i++) {
        const face = 1 + Math.floor(Math.random() * sides);
        rolls[key].push(face);
        total += face;
      }
    }
  }

  return { rolls, total };
}
