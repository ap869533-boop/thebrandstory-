import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000, // 5 minutes fresh cache
      gcTime: 30 * 60_000, // 30 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export function attachQueryFocusListener() {
  return AppState.addEventListener('change', (state) => {
    if (Platform.OS !== 'web') focusManager.setFocused(state === 'active');
  });
}
