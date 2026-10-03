/** Browser-safe QR render via `uqr` (pure ESM — no Node canvas). */

import { encode } from 'uqr';

export async function paintQrCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  opts: { size?: number; dark?: string; light?: string; marginModules?: number } = {},
): Promise<void> {
  const text = String(payload || '').trim();
  if (!text) throw new Error('empty qr payload');

  const size = opts.size ?? 168;
  const dark = opts.dark ?? '#2c3441';
  const light = opts.light ?? '#ffffff';
  const marginModules = opts.marginModules ?? 2;

  const result = encode(text, { ecc: 'M', border: marginModules });
  const modules = result.size;
  const matrix = result.data;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no 2d context');

  canvas.width = size;
  canvas.height = size;
  const cell = size / modules;

  ctx.fillStyle = light;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = dark;
  for (let y = 0; y < modules; y++) {
    const row = matrix[y];
    for (let x = 0; x < modules; x++) {
      if (row?.[x]) {
        ctx.fillRect(Math.floor(x * cell), Math.floor(y * cell), Math.ceil(cell), Math.ceil(cell));
      }
    }
  }
}
