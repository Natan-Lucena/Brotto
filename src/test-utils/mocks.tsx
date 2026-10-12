import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { createElement, useEffect } from 'react';
import type { ReactElement } from 'react';
import { View } from 'react-native';
import { vi } from 'vitest';
import { tokens } from '@/theme/tokens';

// Estado compartilhado dos mocks (hoisted nos testes via vi.hoisted).
export function createRouterMock() {
  return {
    router: {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      dismissAll: vi.fn(),
      canDismiss: vi.fn(() => false),
    },
    params: {} as Record<string, string>,
    redirects: [] as string[],
  };
}

export function expoRouterFactory(state: ReturnType<typeof createRouterMock>) {
  return {
    useRouter: () => state.router,
    useLocalSearchParams: () => state.params,
    useFocusEffect: (effect: () => void | (() => void)) => useEffect(effect, [effect]),
    Redirect: ({ href }: { href: string }) => {
      state.redirects.push(href);
      return null;
    },
    Stack: Object.assign(() => null, { Screen: () => null }),
    Link: ({ children }: { children: unknown }) => children,
  };
}

export const memory = {
  state: new Map<string, string>(),
  blocked: [] as {
    id: string;
    platformRef: string;
    label: string;
    enabled: boolean;
  }[],
  dayLog: [] as { date: string; focus_minutes: number; watered: number }[],
  failReads: false,
  failWrites: false,
  failBlockedReplace: false,
};

export function resetMemory() {
  memory.state.clear();
  memory.blocked = [];
  memory.dayLog = [];
  memory.failReads = false;
  memory.failWrites = false;
  memory.failBlockedReplace = false;
}

export function dbFactory() {
  return {
    appStateRepository: {
      get: vi.fn(async (key: string) => {
        if (memory.failReads) throw new Error('read failed');
        return memory.state.get(key) ?? null;
      }),
      set: vi.fn(async (key: string, value: string) => {
        if (memory.failWrites) throw new Error('write failed');
        memory.state.set(key, value);
      }),
    },
    blockedAppsRepository: {
      list: vi.fn(async () => memory.blocked),
      replace: vi.fn(async (apps: typeof memory.blocked) => {
        if (memory.failBlockedReplace) throw new Error('replace failed');
        memory.blocked = apps;
      }),
    },
    getDatabase: vi.fn(async () => ({
      getFirstAsync: async (_sql: string, day: string) =>
        memory.dayLog.find((row) => row.date === day) ?? null,
      getAllAsync: async () => memory.dayLog.filter((row) => row.watered === 1),
    })),
  };
}

export const themeState = { theme: 'light' as 'light' | 'dark' };

export function themeFactory() {
  return {
    ThemeProvider: ({ children }: { children: unknown }) => children,
    useTheme: () => ({
      theme: themeState.theme,
      setTheme: vi.fn(),
      colors: tokens.colors[themeState.theme],
    }),
  };
}

export function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

export function safeAreaFactory() {
  return {
    SafeAreaView: ({ children, ...props }: Record<string, unknown>) =>
      createElement(View, props, children as never),
    SafeAreaProvider: ({ children }: { children: unknown }) => children,
  };
}
