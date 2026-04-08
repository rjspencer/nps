# Architecture & Decision Log

Decisions recorded in the order they were made. Each entry captures what was decided and why, including constraints and trade-offs that aren't obvious from the code.

---

## 2026-04-03 — Initial scaffold

### 1. Monorepo: pnpm workspaces + Turborepo
A single `pnpm dev` at the repo root starts web, mobile, and server concurrently. Turborepo caches build, lint, and type-check outputs per package so unchanged packages don't rebuild.

### 2. Web framework: TanStack Start (not Next.js)
Next.js was ruled out by preference. TanStack Start was chosen for better TypeScript ergonomics, fully typed navigation via TanStack Router, and first-class Cloudflare Workers deployment support.

### 3. API server: Hono on Cloudflare Workers
Hono is lightweight, TypeScript-first, and runs natively on Workers without an adapter layer. Deployed as a standalone Cloudflare Worker (`packages/server`).

### 4. API protocol: tRPC v11 (not Hono RPC)
`@trpc/react-query` works identically on TanStack Start and Expo, enabling shared data-fetching hooks from `@acme/api`. Hono's native RPC client was ruled out because it has Metro bundler resolution issues with Expo.

**Constraint:** Do not use tRPC subscriptions. `@hono/trpc-server` does not support WebSocket/SSE. For real-time features use polling or Cloudflare Durable Objects.

### 5. Mobile: Expo SDK 55 + Expo Router + NativeWind
NativeWind provides a shared Tailwind class vocabulary between web and mobile, reducing context-switching. Expo Router gives file-based routing that mirrors the web app's conventions.

### 6. NPS API caching: Cloudflare KV
- Parks list: 5-minute TTL (data changes infrequently but can update)
- Stable endpoints (designations, images, lesson plans): 1-day TTL
- Stale-on-error fallback: a failed upstream request returns cached data rather than surfacing an error

### 7. oRPC noted as future alternative
If a public-facing OpenAPI spec or typed HTTP client is needed, oRPC is the preferred replacement for tRPC. No action for now.

---

## 2026-04-05 — Parks list UX

### 8. Client-side filtering with 1-day React Query cache
Filtering ~500 parks client-side is instant and eliminates round-trips for each filter change. Parks data is stable enough that a 1-day `staleTime` in React Query is appropriate.

### 9. Progressive loading: 4 parallel paginated queries (150 parks each)
The NPS API caps results per request. Four parallel queries of 150 parks (starts: 0, 150, 300, 450) load the full dataset faster than sequential pagination. Parks begin rendering as soon as the first query resolves.

### 10. Designation grouping: ~45 raw API values → 12 display groups
Raw NPS designation strings are too granular for a useful filter (e.g. "National Battlefield", "National Battlefield Park", "National Battlefield Site" are all one logical category). A static `DESIGNATION_GROUPS` map on the client collapses them into 12 groups. No server change required.

### 11. Dark mode: inline `<script>` before first paint (web)
A React effect runs after the first paint, causing a visible flash of the wrong theme. An inline `<script>` in `<head>` reads `localStorage` and `prefers-color-scheme` synchronously and sets `class="dark"` on `<html>` before any pixel is painted.

### 12. Theming: CSS custom properties on the `html` element (web)
Swapping a single set of CSS variables on the root element re-skins every component without per-component JavaScript. Six themes are defined as CSS variable sets: light, dark, desert, tropical, forest, maritime. Neobrutalism utilities (`.neo-card`, `.neo-btn`, `.neo-input`) provide thick borders and hard offset shadows on top of the theme layer. Theme selection persists in `localStorage`.

---

## 2026-04-06 — Deployment + mobile theming

### 13. NPS_API_KEY as Wrangler secret, not `[vars]`
A `[vars]` entry — even a blank one like `NPS_API_KEY = ""` — shadows the Wrangler secret of the same name, resulting in an empty string at runtime. The `[vars]` entry was removed; the key lives only as a secret set via `wrangler secret put`.

### 14. `VITE_TRPC_URL` in `.env.production`, not `wrangler.toml [vars]`
Vite evaluates `import.meta.env.*` at build time and replaces them with string literals. Variables injected by Cloudflare Workers at request time are invisible to the already-compiled bundle. The production URL lives in `.env.production` (added to `.gitignore` allowlist with `!.env.production`).

### 15. Mobile theming: React Context + flat inline styles (not NativeWind CSS vars)
NativeWind v4's `vars()` API sets CSS custom properties on a root `View`, but React Native's `StyleSheet` does not resolve `var(--background)` at runtime — the colors simply don't change on theme switch. The approach was replaced with a `ThemeProvider` that exposes raw hex tokens via `useTheme()`. Screens write `style={{ color: styles.text }}` instead of `className="text-foreground"`.

### 16. No style arrays in Expo Router screens
`expo-router`'s `<Slot>` component (and underlying React Navigation primitives) rejects `style={[a, b]}` array props with a runtime warning. All styles use a single flat object, combining values via spread: `style={{ ...styles.divider, paddingHorizontal: 16 }}`.

### 17. Removed `nativewind vars()` from module-level initialization
`vars()` calls at module load time — before the React Native runtime is fully initialized — crash Android silently. The navigation tree never mounts and the splash screen never hides. The `themeVars` export (which called `vars()` for each theme on import) was removed entirely since NativeWind CSS vars are not used on mobile.

### 18. Removed `nativewind/babel` and `react-native-worklets/plugin` from babel.config.js
`@babel/core@7.29.0` tightened plugin validation and rejected both entries with "`.plugins` is not a valid Plugin property". NativeWind is handled at the Metro level via `withNativeWind(config)` in `metro.config.js`; the Babel plugin is not needed.

### 19. Android dev host: `10.0.2.2` instead of `localhost`
Android emulators route `localhost` back to the emulator itself, not the host machine. `10.0.2.2` is the standard Android emulator alias for the host. iOS simulators share the host's network stack so `localhost` works there. The tRPC client detects `Platform.OS` to pick the right host in dev.
