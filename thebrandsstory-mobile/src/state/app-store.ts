import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AppState = {
  recentSearches: string[];
  savedCreatorIds: string[];
  notificationsEnabled: boolean;
  addRecentSearch: (value: string) => void;
  toggleSavedCreator: (id: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
};

export const useAppStore = create<AppState>()(persist((set) => ({
  recentSearches: [],
  savedCreatorIds: [],
  notificationsEnabled: false,
  addRecentSearch: (value) => {
    const query = value.trim();
    if (!query) return;
    set((state) => ({ recentSearches: [query, ...state.recentSearches.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 8) }));
  },
  toggleSavedCreator: (id) => set((state) => ({
    savedCreatorIds: state.savedCreatorIds.includes(id)
      ? state.savedCreatorIds.filter((savedId) => savedId !== id)
      : [...state.savedCreatorIds, id],
  })),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}), {
  name: 'tbs-mobile-preferences',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({
    recentSearches: state.recentSearches,
    savedCreatorIds: state.savedCreatorIds,
    notificationsEnabled: state.notificationsEnabled,
  }),
}));
