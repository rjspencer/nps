import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Pressable, Text, View, Modal, FlatList } from 'react-native'
import { QueryClientProvider } from '@tanstack/react-query'
import { TRPCProvider, makeTRPCClient, makeQueryClient } from '@/lib/trpc'
import { ThemeProvider, useTheme, THEMES } from '@acme/ui-native'
import type { ThemeName } from '@acme/ui-native'

const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  desert: 'Desert',
  tropical: 'Tropical',
  forest: 'Forest',
  maritime: 'Maritime',
}

function ThemeSwitcher() {
  const { theme, setTheme, colors, styles } = useTheme()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={{ borderColor: styles.border, marginRight: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1 }}
      >
        <Text style={{ color: styles.text, fontSize: 12 }}>{THEME_LABELS[theme]}</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, backgroundColor: styles.bg }}>
          <View style={{ ...styles.divider, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: styles.text, fontSize: 16, fontWeight: '600' }}>Choose Theme</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Text style={{ color: colors.ring, fontSize: 14 }}>Done</Text>
            </Pressable>
          </View>
          <FlatList
            data={THEMES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { setTheme(item); setVisible(false) }}
                style={{ ...styles.divider, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Text style={{ color: styles.text, fontSize: 14 }}>{THEME_LABELS[item]}</Text>
                {theme === item && <Text style={{ color: colors.ring, fontSize: 14 }}>✓</Text>}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  )
}

function AppNavigator() {
  const { theme, styles } = useTheme()
  const isDark = theme === 'dark' || theme === 'forest' || theme === 'maritime'

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: styles.bg },
          headerTransparent: false,
          headerTintColor: styles.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => <ThemeSwitcher />,
        }}
      >
        <Stack.Screen name="index" options={{ title: 'National Parks' }} />
        <Stack.Screen name="parks/[parkCode]" options={{ title: '' }} />
        <Stack.Screen name="parks/[parkCode]/lesson-plans/[lessonPlanId]" options={{ title: '' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  )
}

export default function RootLayout() {
  const [queryClient] = useState(() => makeQueryClient())
  const [trpcClient] = useState(() => makeTRPCClient())

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </TRPCProvider>
  )
}
