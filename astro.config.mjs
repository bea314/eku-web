// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';

/** Vercel sets VERCEL=1. Local/preview keeps the Node adapter for `astro preview`. */
const useVercel = Boolean(process.env.VERCEL);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: useVercel
    ? vercel()
    : node({
        mode: 'standalone',
      }),
  server: {
    port: 4321,
    host: true,
  },
  // QA shots must not include the Astro floating toolbar
  devToolbar: {
    enabled: false,
  },
});
