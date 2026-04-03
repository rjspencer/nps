// NOTE: When deploying to Cloudflare Workers, TanStack Start uses the
// @cloudflare/vite-plugin approach. The primary build config lives in
// vite.config.ts which uses `tanstackStart()` + `cloudflare()` plugins.
//
// This file is retained as a reference for alternative deployment targets
// (e.g. Vercel, Netlify, Node.js) using the Vinxi/Nitro preset system.
// To switch targets, update vite.config.ts and adjust the plugins below.

import { defineConfig } from '@tanstack/react-start/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Alternative non-Cloudflare config (e.g. for local Node.js dev without wrangler):
export default defineConfig({
  vite: {
    plugins: [tsconfigPaths()],
  },
  // For Cloudflare Workers, this is handled by @cloudflare/vite-plugin in vite.config.ts
  // server: {
  //   preset: 'cloudflare-workers',
  // },
})
