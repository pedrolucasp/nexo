import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { persistQueryClient }  from '@tanstack/react-query-persist-client';
import { createMMKV } from 'react-native-mmkv';

export const storage = new createMMKV({ id: 'query-cache' });

const mmkvStorage = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.remove(key)
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Show data by 5min before it is considered stale
      staleTime: 1000 * 60 * 5,
      // Keep inactive queries for 10min
      gcTime: 1000 * 60 * 10,
      // Retry on flaky connections
      retry: 1,
      // Don't switch just because the user switched apps
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1
    }
  }
});

const persister = createSyncStoragePersister({
  storage: mmkvStorage,
  // We don't want to hammer mmkv every keystroke
  throttleTime: 1000
});

persistQueryClient({
  queryClient,
  persister,
  // Queries survive for 24h on disk if not invalidated
  maxAge: 1000 * 60 * 60 * 24
});
