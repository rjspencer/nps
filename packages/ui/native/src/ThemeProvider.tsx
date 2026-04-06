import { createContext, useContext, useState, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import { ThemeName, themeTokens, THEMES } from './themes'

type ThemeTokens = typeof themeTokens['light']

function makeStyles(c: ThemeTokens) {
  const hw = StyleSheet.hairlineWidth
  return {
    // Single-property tokens — spread these into inline style objects
    bg:          c.background,
    muted:       c.muted,
    text:        c.foreground,
    textMuted:   c.mutedForeground,
    border:      c.border,
    // Pre-composed flat style objects — use directly as `style={}`
    screen:      { flex: 1, backgroundColor: c.background } as const,
    row:         { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
    divider:     { borderBottomColor: c.border, borderBottomWidth: hw } as const,
    inputBase:   { backgroundColor: c.muted, borderColor: c.border, borderWidth: 1, color: c.foreground, borderRadius: 8, height: 40, paddingHorizontal: 12, fontSize: 14 } as const,
    pillBase:    { backgroundColor: c.muted, borderColor: c.border, borderWidth: 1, borderRadius: 8, height: 36, paddingHorizontal: 12, justifyContent: 'center' as const } as const,
    card:        { backgroundColor: c.muted, borderColor: c.border, borderWidth: hw, borderRadius: 8 } as const,
  }
}

type ThemeStyles = ReturnType<typeof makeStyles>

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
  colors: ThemeTokens
  styles: ThemeStyles
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  colors: themeTokens['light'],
  styles: makeStyles(themeTokens['light']),
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('light')
  const colors = themeTokens[theme]
  const styles = useMemo(() => makeStyles(colors), [colors])
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, styles }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {children}
      </View>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export { THEMES }
export type { ThemeName, ThemeTokens, ThemeStyles }
