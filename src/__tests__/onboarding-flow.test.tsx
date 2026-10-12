/* eslint-disable import/first */
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paymentProvider } from '@/services/payments';
import { memory, renderWithQuery, resetMemory } from '@/test-utils/mocks';

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

import Splash from '@/app/(onboarding)/splash';
import BoasVindas from '@/app/(onboarding)/boas-vindas';
import Quiz from '@/app/(onboarding)/quiz/[step]';
import Calculando from '@/app/(onboarding)/calculando';
import Impacto from '@/app/(onboarding)/impacto';
import Conheca from '@/app/(onboarding)/conheca';
import Permissoes from '@/app/(onboarding)/permissoes';
import Paywall from '@/app/(onboarding)/paywall';
import Setup from '@/app/(onboarding)/setup';
import Home from '@/app/(tabs)/index';
import { useOnboardingStore } from '@/features/onboarding/store';

const routes: Record<string, ComponentType> = {
  '/(onboarding)/splash': Splash,
  '/(onboarding)/boas-vindas': BoasVindas,
  '/(onboarding)/calculando': Calculando,
  '/(onboarding)/impacto': Impacto,
  '/(onboarding)/conheca': Conheca,
  '/(onboarding)/permissoes': Permissoes,
  '/(onboarding)/paywall': Paywall,
  '/(onboarding)/setup': Setup,
  '/(tabs)': Home,
};

// Pilha mínima com a semântica de push/replace/dismissAll do Expo Router.
let stack: string[] = [];
const href = (target: unknown) =>
  typeof target === 'string' ? target : (target as { pathname: string }).pathname;

function installStack() {
  stack = ['/(onboarding)/splash'];
  nav.params = {};
  nav.router.push.mockImplementation((target: unknown) => {
    stack.push(href(target));
  });
  nav.router.replace.mockImplementation((target: unknown) => {
    stack[stack.length - 1] = href(target);
  });
  nav.router.back.mockImplementation(() => stack.pop());
  nav.router.canDismiss.mockImplementation(() => stack.length > 1);
  nav.router.dismissAll.mockImplementation(() => stack.splice(1));
}

function Current() {
  const path = stack[stack.length - 1]!;
  const Screen = /\/quiz\/\d$/.test(path) ? Quiz : routes[path]!;
  return <Screen />;
}

async function show() {
  const quiz = stack[stack.length - 1]!.match(/\/quiz\/(\d)$/);
  nav.params = quiz ? { step: quiz[1]! } : {};
  return renderWithQuery(<Current />);
}

async function visit(label: string | RegExp, current: string) {
  const view = await show();
  await fireEvent.press(await screen.findByText(label));
  await waitFor(() => expect(stack[stack.length - 1]).not.toBe(current));
  await view.unmount();
}

beforeEach(() => {
  resetMemory();
  useOnboardingStore.setState({ answers: {}, hydrated: false, ready: false });
  Object.values(nav.router).forEach((fn) => fn.mockClear());
  installStack();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

async function runUntilPaywall() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const splash = await show();
  await act(() => vi.advanceTimersByTime(1500));
  await splash.unmount();
  vi.useRealTimers();
  expect(stack).toEqual(['/(onboarding)/boas-vindas']);

  await visit('Começar', stack[0]!);
  for (const answer of ['3 a 5h', undefined, 'Estudar', 'À noite', 'Cerca de 2h']) {
    const current = stack[stack.length - 1]!;
    const view = await show();
    if (answer) await fireEvent.press(screen.getByText(answer));
    await fireEvent.press(screen.getByText('Continuar'));
    await waitFor(() => expect(stack[stack.length - 1]).not.toBe(current));
    await view.unmount();
  }
  expect(stack[stack.length - 1]).toBe('/(onboarding)/calculando');

  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const calculando = await show();
  await act(() => vi.advanceTimersByTime(1500));
  await calculando.unmount();
  vi.useRealTimers();
  expect(stack[stack.length - 1]).toBe('/(onboarding)/impacto');

  await visit('Quero recuperar meu tempo', '/(onboarding)/impacto');
  await visit('Cuidar do meu Brotto', '/(onboarding)/conheca');
  await visit('Ativar depois', '/(onboarding)/permissoes');
  expect(stack[stack.length - 1]).toBe('/(onboarding)/paywall');
  // Telas transitórias foram substituídas, não empilhadas.
  expect(stack).not.toContain('/(onboarding)/splash');
  expect(stack).not.toContain('/(onboarding)/calculando');
}

describe('onboarding end to end (mocked services)', () => {
  it('subscriber: Splash to Home without social proof, discarding the history', async () => {
    vi.spyOn(paymentProvider, 'getEntitlement').mockResolvedValue({
      active: true,
      planId: 'annual',
      expiresAt: null,
    });
    await runUntilPaywall();
    expect(stack).not.toContain('/(onboarding)/prova-social');

    const paywall = await show();
    await screen.findByText('R$ 99,90');
    await fireEvent.press(screen.getByText('Começar meu Brotto'));
    await waitFor(() => expect(stack[stack.length - 1]).toBe('/(onboarding)/setup'));
    await paywall.unmount();

    await visit('Bloquear e começar', '/(onboarding)/setup');
    expect(stack).toEqual(['/(tabs)']);
    expect(memory.state.get('onboarding.completed')).toBe('true');
    expect(JSON.parse(memory.state.get('onboarding.answers')!)).toMatchObject({
      dailyUsage: '3to5',
      goal: 'study',
      worstTime: 'night',
      recoverTarget: 'two',
    });
  });

  it('without entitlement: closing the paywall lands on the demo home', async () => {
    await runUntilPaywall();
    const paywall = await show();
    await fireEvent.press(await screen.findByLabelText('Fechar'));
    await waitFor(() => expect(stack).toEqual(['/(tabs)']));
    await paywall.unmount();
    expect(memory.state.get('onboarding.completed')).toBe('true');
    await show();
    expect(
      (await screen.findAllByText('Escolha um plano pra liberar todos os recursos'))
        .length,
    ).toBeGreaterThan(0);
  });
});
