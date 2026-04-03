import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  secret: process.env['BETTER_AUTH_SECRET'] ?? 'dev-secret-change-in-production',
  baseURL: process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // 1 day
  },
})

export type Auth = typeof auth
export type Session = typeof auth.$Infer.Session
