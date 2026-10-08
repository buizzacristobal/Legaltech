/** Chilean RUT (módulo 11). Returns the normalized RUT or null if invalid. */
export function normalizeRut(raw: string): string | null {
  const c = raw.replace(/[.\-\s]/g, "").toUpperCase();
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  if (!/^\d+$/.test(body) || !/^[\dK]$/.test(dv)) return null;
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rem = 11 - (sum % 11);
  const expected = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  if (dv !== expected) return null;
  return `${Number(body).toLocaleString("es-CL")}-${dv}`;
}
