import { vars } from 'nativewind'

export type ThemeName = 'light' | 'dark' | 'desert' | 'tropical' | 'forest' | 'maritime'

const tokens: Record<ThemeName, {
  background: string
  foreground: string
  muted: string
  mutedForeground: string
  border: string
  ring: string
}> = {
  light:    { background: '#ffffff', foreground: '#1f1f1f', muted: '#f7f7f7', mutedForeground: '#737373', border: '#e8e8e8', ring: '#b0b0b0' },
  dark:     { background: '#2d2d2d', foreground: '#fafafa', muted: '#2d2d2d', mutedForeground: '#9e9e9e', border: '#3d3d3d', ring: '#666666' },
  desert:   { background: '#f0e6c8', foreground: '#3a5c38', muted: '#e0d0a8', mutedForeground: '#7a6548', border: '#b89a6a', ring: '#a06030' },
  tropical: { background: '#e8f5e0', foreground: '#2d6b55', muted: '#d8eec8', mutedForeground: '#3d7a60', border: '#58a870', ring: '#d06820' },
  forest:   { background: '#0e2d1f', foreground: '#e8eedd', muted: '#1e4a2d', mutedForeground: '#aac888', border: '#8a6030', ring: '#a07028' },
  maritime: { background: '#0e1e3a', foreground: '#e8f0f5', muted: '#1a2e4a', mutedForeground: '#a8c8d8', border: '#b85030', ring: '#a84828' },
}

export const themeVars = Object.fromEntries(
  Object.entries(tokens).map(([name, t]) => [
    name,
    vars({
      '--background': t.background,
      '--foreground': t.foreground,
      '--muted': t.muted,
      '--muted-foreground': t.mutedForeground,
      '--border': t.border,
      '--ring': t.ring,
    }),
  ])
) as Record<ThemeName, ReturnType<typeof vars>>

export const THEMES: ThemeName[] = ['light', 'dark', 'desert', 'tropical', 'forest', 'maritime']

export const themeTokens = tokens
