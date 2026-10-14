import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import '@/global.css';
import { AuthProvider } from '@/context/auth';
import { attachQueryFocusListener, queryClient } from '@/lib/query-client';
import { colors } from '@/theme';



const appTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.gold,
  },
};

export default function RootLayout() {
  useEffect(() => {
    const subscription = attachQueryFocusListener();
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={appTheme}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" options={{ presentation: 'modal' }} />
            <Stack.Screen name="creator/[username]" />
            <Stack.Screen name="support" />
            <Stack.Screen name="messages" />
            <Stack.Screen name="chat/[id]" />
            <Stack.Screen name="wallet" />
            <Stack.Screen name="brands" />
            <Stack.Screen name="brand/[id]" />
            <Stack.Screen name="my-campaigns" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
