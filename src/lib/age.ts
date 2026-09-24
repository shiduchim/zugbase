import type { Age } from '../types';

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/* Ages are stored with the date they were entered and counted forward from there.
   Never invent asOf — callers pass the real date the value became true. */
export function currentAge(age: Age | undefined, now = Date.now()): number | undefined {
  if (!age) return undefined;
  return age.value + Math.floor((now - age.asOf) / YEAR_MS);
}
