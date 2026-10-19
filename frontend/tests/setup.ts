// The single global shade over the native/Expo boundary, applied to every test
// file. Mirrors the API's rule: fake only what leaves the process. Individual
// tests never re-stub the device.

// Expo secure store -> in-memory map. Prefixed with `mock` so jest's hoisting
// lets the mock factories below close over it.
const mockSecureStore = new Map<string, string>();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(
    async (key: string) => mockSecureStore.get(key) ?? null,
  ),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStore.delete(key);
  }),
}));

// MMKV (the query cache's KV store) -> in-memory map.
type MockMmkvValue = boolean | string | number | ArrayBuffer;

const mockKv = new Map<string, MockMmkvValue>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    set: (key: string, value: MockMmkvValue) => {
      mockKv.set(key, value);
    },
    getString: (key: string) => {
      const value = mockKv.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getNumber: (key: string) => {
      const value = mockKv.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean: (key: string) => {
      const value = mockKv.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    getBuffer: (key: string) => {
      const value = mockKv.get(key);
      return value instanceof ArrayBuffer ? value : undefined;
    },
    contains: (key: string) => mockKv.has(key),
    remove: (key: string) => mockKv.delete(key),
    getAllKeys: () => Array.from(mockKv.keys()),
    clearAll: () => {
      mockKv.clear();
    },
  })),
}));

// Expo constants -> a stable dev-like stub, so the client's base-url fallback
// resolves without a real manifest.
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      hostUri: 'localhost:8081',
      extra: { eas: { projectId: 'test-project-id' } },
    },
  },
}));

// Expo notifications -> stubs for the calls the app makes at module and hook
// time.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  setNotificationChannelAsync: jest.fn(async () => null),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'expo-push-token' })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  addNotificationResponseReceivedListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  AndroidImportance: { MAX: 5 },
}));

// Expo device -> claim to be a device, so push registration proceeds.
jest.mock('expo-device', () => ({
  isDevice: true,
}));
