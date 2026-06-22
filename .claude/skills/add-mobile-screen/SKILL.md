Add a new screen to the Expo mobile app.

Steps:
1. Create a screen file at `apps/mobile/app/<path>.tsx` following Expo Router's file-based conventions.
2. Use NativeWind v5 for styling — apply Tailwind classes via the `className` prop.
3. Fetch data via the shared tRPC hooks from `@acme/api` — the same hooks used on web work here.
4. For shared UI primitives, import from `@acme/ui-native`; for screen-specific components, co-locate in `apps/mobile/components/`.
5. For navigation, use Expo Router's `<Link>` or `router.push()` — do not use React Navigation directly.
