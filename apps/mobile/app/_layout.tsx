import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { TRPCProvider, makeTRPCClient, makeQueryClient } from '@/lib/trpc'

export default function RootLayout() {
  const [queryClient] = useState(() => makeQueryClient())
  const [trpcClient] = useState(() => makeTRPCClient())

  return (
    <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider mode="light">
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#000',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen name="index" options={{ title: 'National Parks' }} />
          </Stack>
          <StatusBar style="auto" />
        </GluestackUIProvider>
      </QueryClientProvider>
    </TRPCProvider>
  )
}
