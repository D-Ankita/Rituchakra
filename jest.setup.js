jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (k) => store.get(k) ?? null),
      setItem: jest.fn(async (k, v) => {
        store.set(k, v);
      }),
      removeItem: jest.fn(async (k) => {
        store.delete(k);
      }),
      clear: jest.fn(async () => store.clear()),
      getAllKeys: jest.fn(async () => [...store.keys()]),
      multiGet: jest.fn(async (keys) => keys.map((k) => [k, store.get(k) ?? null])),
      multiSet: jest.fn(async (pairs) => {
        for (const [k, v] of pairs) store.set(k, v);
      }),
      multiRemove: jest.fn(async (keys) => {
        for (const k of keys) store.delete(k);
      }),
    },
  };
});

jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
    addListener: jest.fn(() => ({ remove: () => {} })),
    start: jest.fn(),
    stop: jest.fn(),
  },
}));
