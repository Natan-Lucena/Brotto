/* eslint-disable import/first */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { BackHandler } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockingService } from '@/services/blocking';
import { paymentProvider } from '@/services/payments';
import { memory, renderWithQuery, resetMemory, themeState } from '@/test-utils/mocks';

const nav = vi.hoisted(() => ({
  router: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    dismissAll: vi.fn(),
    canDismiss: vi.fn(() => false),
  },
  params: {} as Record<string, string>,
  redirects: [] as string[],
}));

vi.mock('expo-router', async () =>
  (await import('@/test-utils/mocks')).expoRouterFactory(nav),
);
vi.mock('@/services/db', async () => (await import('@/test-utils/mocks')).dbFactory());
vi.mock('@/theme/ThemeProvider', async () =>
  (await import('@/test-utils/mocks')).themeFactory(),
);
vi.mock('react-native-safe-area-context', async () =>
  (await import('@/test-utils/mocks')).safeAreaFactory(),
);

import Index from '@/app/index';
import BoasVindas from '@/app/(onboarding)/boas-vindas';
import Calculando from '@/app/(onboarding)/calculando';
import Quiz from '@/app/(onboarding)/quiz/[step]';
import Setup from '@/app/(onboarding)/setup';
import Home from '@/app/(tabs)/index';
import { activateInitialBlock, toSelectedApps } from '@/features/blocking';
import { impactDaysPerYear, impactPhrase } from '@/features/onboarding/impact';
import { useOnboardingStore } from '@/features/onboarding/store';
import { EntitlementGuard } from '@/features/paywall';
import { appStateRepository } from '@/services/db';

const active = { active: true, planId: 'annual', expiresAt: null } as const;
const inactive = { active: false, planId: null, expiresAt: null } as const;

// restoreAllMocks não desfaz mockImplementation de vi.fn(): guarda as originais.
const originalGet = vi.mocked(appStateRepository.get).getMockImplementation()!;
const originalSet = vi.mocked(appStateRepository.set).getMockImplementation()!;

beforeEach(() => {
  vi.mocked(appStateRepository.get).mockImplementation(originalGet);
  vi.mocked(appStateRepository.set).mockImplementation(originalSet);
  resetMemory();
  themeState.theme = 'light';
  Object.values(nav.router).forEach((fn) => fn.mockClear());
  nav.params = {};
  nav.redirects.length = 0;
  nav.router.canDismiss.mockReturnValue(false);
  useOnboardingStore.setState({ answers: {}, hydrated: false, ready: false });
  vi.spyOn(paymentProvider, 'getEntitlement').mockResolvedValue(active);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('Android back button', () => {
  function stubBackHandler() {
    const remove = vi.fn();
    let handler: (() => boolean) | undefined;
    const add = vi.fn((_event: string, callback: () => boolean) => {
      handler = callback;
      return { remove };
    });
    (BackHandler as unknown as { addEventListener: unknown }).addEventListener = add;
    return { add, remove, press: () => handler?.() };
  }

  it('is consumed on onboarding steps and released on unmount', async () => {
    const back = stubBackHandler();
    const view = await render(<BoasVindas />);
    expect(back.add).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
    expect(back.press()).toBe(true);
    await view.unmount();
    expect(back.remove).toHaveBeenCalled();
  });

  it('is consumed on transient screens', async () => {
    const back = stubBackHandler();
    await render(<Calculando />);
    expect(back.press()).toBe(true);
  });

  it('is left to the system on quiz questions', async () => {
    nav.params = { step: '2' };
    const back = stubBackHandler();
    await render(<Quiz />);
    expect(back.add).not.toHaveBeenCalled();
  });
});

describe('impact', () => {
  it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
    'rejects inherited key %s and never returns NaN',
    (key) => {
      expect(impactDaysPerYear(key)).toBe(61);
      expect(Number.isNaN(impactDaysPerYear(key))).toBe(false);
      expect(impactPhrase(key as never)).toBe(impactPhrase('free'));
    },
  );
});

describe('activateInitialBlock rollback', () => {
  const previous = [
    { id: 'youtube', platformRef: 'p:youtube', label: 'YouTube', enabled: true },
  ];

  function arrange() {
    memory.state.set('block.active', 'false');
    memory.blocked = previous;
    vi.mocked(appStateRepository.set).mockImplementation(async (key, value) => {
      if (key === 'onboarding.completed') throw new Error('write failed');
      return originalSet(key, value);
    });
  }

  it('restores block.active and the previous apps after a partial failure', async () => {
    arrange();
    const unblock = vi.spyOn(blockingService, 'unblock');
    await expect(activateInitialBlock(toSelectedApps(['tiktok']))).rejects.toThrow(
      'write failed',
    );
    expect(memory.state.get('block.active')).toBe('false');
    expect(memory.blocked).toEqual(previous);
    expect(memory.state.has('onboarding.completed')).toBe(false);
    expect(unblock).toHaveBeenCalledOnce();
  });

  it('restores the previous active block in the service', async () => {
    arrange();
    memory.state.set('block.active', 'true');
    const block = vi.spyOn(blockingService, 'blockNow');
    await expect(activateInitialBlock(toSelectedApps(['tiktok']))).rejects.toThrow();
    expect(memory.state.get('block.active')).toBe('true');
    expect(block).toHaveBeenLastCalledWith({ apps: previous });
  });
});

describe('Setup', () => {
  it('invalidates the home cache before entering the app', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(client, 'invalidateQueries');
    await render(
      <QueryClientProvider client={client}>
        <Setup />
      </QueryClientProvider>,
    );
    await fireEvent.press(await screen.findByText('Bloquear e começar'));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalled());
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['home'] });
  });

  it('does not flash the default selection before the answers load', async () => {
    let release: (value: string) => void = () => undefined;
    vi.mocked(appStateRepository.get).mockImplementation((key) =>
      key === 'onboarding.answers'
        ? new Promise<string>((resolve) => (release = resolve))
        : Promise.resolve(memory.state.get(key) ?? null),
    );
    await renderWithQuery(<Setup />);
    await screen.findByText('Seu Brotto nasceu! 🌱');
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
    expect(
      screen.getByRole('button', { name: 'Bloquear e começar' }).props
        .accessibilityState.disabled,
    ).toBe(true);
    release('{"apps":["youtube"]}');
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('switch')
          .filter((item) => item.props.accessibilityState.checked)
          .map((item) => item.props.accessibilityLabel),
      ).toEqual(['YouTube']),
    );
  });
});

describe('Quiz double advance', () => {
  it('pushes only once while the answers are being persisted', async () => {
    nav.params = { step: '1' };
    useOnboardingStore.setState({ answers: { dailyUsage: '1to3' } });
    const originalPersist = useOnboardingStore.getState().persist;
    let release: () => void = () => undefined;
    const slow = new Promise<void>((resolve) => (release = resolve));
    useOnboardingStore.setState({ persist: () => slow });
    await renderWithQuery(<Quiz />);
    const next = screen.getByRole('button', { name: 'Continuar' });
    // Dois toques antes de qualquer re-render, como num duplo toque real.
    await act(async () => {
      next.props.onPress();
      next.props.onPress();
    });
    release();
    await waitFor(() => expect(nav.router.push).toHaveBeenCalledTimes(1));
    expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/quiz/2');
    useOnboardingStore.setState({ persist: originalPersist });
  });
});

describe('EntitlementGuard', () => {
  it('shows the loading state inside the themed Screen', async () => {
    themeState.theme = 'dark';
    vi.spyOn(paymentProvider, 'getEntitlement').mockReturnValue(new Promise(() => {}));
    await renderWithQuery(
      <EntitlementGuard>
        <></>
      </EntitlementGuard>,
    );
    expect(screen.getByText('Carregando...').props.className).toContain(
      'dark:text-dark-text',
    );
  });

  it('redirects to the paywall without an entitlement', async () => {
    vi.spyOn(paymentProvider, 'getEntitlement').mockResolvedValue(inactive);
    await renderWithQuery(
      <EntitlementGuard>
        <></>
      </EntitlementGuard>,
    );
    await waitFor(() => expect(nav.redirects).toEqual(['/(onboarding)/paywall']));
  });
});

describe('Home first-step copy', () => {
  it('is hidden once there is progress', async () => {
    const today = new Date().toLocaleDateString('en-CA');
    memory.dayLog = [{ date: today, focus_minutes: 10, watered: 0 }];
    await renderWithQuery(<Home />);
    await screen.findByText('10 de 25 min de foco hoje');
    expect(screen.queryByText('Dá o primeiro passo hoje.')).toBeNull();
  });

  it('is hidden with a streak even without focus today', async () => {
    const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA');
    memory.dayLog = [{ date: yesterday, focus_minutes: 30, watered: 1 }];
    await renderWithQuery(<Home />);
    await screen.findByText('1 dia');
    expect(screen.queryByText('Dá o primeiro passo hoje.')).toBeNull();
  });
});

describe('app entry with absent or failing state', () => {
  it('renders nothing and does not redirect while reading', async () => {
    vi.mocked(appStateRepository.get).mockReturnValue(new Promise(() => {}));
    await render(<Index />);
    expect(nav.redirects).toEqual([]);
  });

  it('ignores a read that resolves after unmount', async () => {
    let release: (value: string | null) => void = () => undefined;
    vi.mocked(appStateRepository.get).mockReturnValue(
      new Promise((resolve) => (release = resolve)),
    );
    const view = await render(<Index />);
    await view.unmount();
    release('true');
    await Promise.resolve();
    expect(nav.redirects).toEqual([]);
  });

  it('sends a null value to the onboarding', async () => {
    await render(<Index />);
    await waitFor(() => expect(nav.redirects).toEqual(['/(onboarding)/splash']));
  });
});
