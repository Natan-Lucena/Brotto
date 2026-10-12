/* eslint-disable import/first */
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockingService } from '@/services/blocking';
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

import Index from '@/app/index';
import Paywall from '@/app/(onboarding)/paywall';
import Setup from '@/app/(onboarding)/setup';
import Home from '@/app/(tabs)/index';
import { useOnboardingStore } from '@/features/onboarding/store';

const active = { active: true, planId: 'annual', expiresAt: null } as const;
const inactive = { active: false, planId: null, expiresAt: null } as const;

function mockEntitlement(value: typeof active | typeof inactive) {
  vi.spyOn(paymentProvider, 'getEntitlement').mockResolvedValue(value);
  vi.spyOn(paymentProvider, 'restore').mockResolvedValue(value);
}

beforeEach(() => {
  resetMemory();
  Object.values(nav.router).forEach((fn) => fn.mockClear());
  nav.params = {};
  nav.redirects.length = 0;
  useOnboardingStore.setState({ answers: {}, hydrated: false, ready: false });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('app entry routing', () => {
  it('opens the tabs when onboarding is completed', async () => {
    memory.state.set('onboarding.completed', 'true');
    await renderWithQuery(<Index />);
    await waitFor(() => expect(nav.redirects).toEqual(['/(tabs)']));
  });

  it.each([
    ['an empty database', () => undefined],
    ['another value', () => memory.state.set('onboarding.completed', 'false')],
    ['a read failure', () => (memory.failReads = true)],
  ])('goes to the splash with %s', async (_name, arrange) => {
    arrange();
    await renderWithQuery(<Index />);
    await waitFor(() => expect(nav.redirects).toEqual(['/(onboarding)/splash']));
  });
});

describe('Paywall', () => {
  it('lists the three plans in BRL with the annual one selected and no trial, store or Pix', async () => {
    mockEntitlement(inactive);
    await renderWithQuery(<Paywall />);
    expect(await screen.findByText('R$ 9,90')).toBeTruthy();
    expect(screen.getByText('R$ 19,90')).toBeTruthy();
    expect(screen.getByText('R$ 99,90')).toBeTruthy();
    expect(screen.getByText('≈ R$ 8,32/mês')).toBeTruthy();
    expect(screen.getByText('MELHOR PREÇO')).toBeTruthy();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    expect(radios.map((radio) => radio.props.accessibilityState.selected)).toEqual([
      false,
      false,
      true,
    ]);
    expect(
      screen.queryByText(/grátis|trial|teste|app store|google play|pix/i),
    ).toBeNull();
    expect(screen.queryByRole('switch')).toBeNull();
  });

  it('changes the selected plan', async () => {
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByText('Mensal'));
    expect(
      screen.getByRole('radio', { name: /Mensal/ }).props.accessibilityState.selected,
    ).toBe(true);
  });

  it('shows a recoverable error and keeps the plan when checkout does not activate', async () => {
    mockEntitlement(inactive);
    const checkout = vi.spyOn(paymentProvider, 'startCheckout');
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByText('Semanal'));
    await fireEvent.press(screen.getByText('Começar meu Brotto'));
    expect(
      await screen.findByText('Não conseguimos concluir sua assinatura agora.'),
    ).toBeTruthy();
    expect(checkout).toHaveBeenCalledWith('weekly');
    expect(nav.router.replace).not.toHaveBeenCalled();
    expect(
      screen.getByRole('radio', { name: /Semanal/ }).props.accessibilityState.selected,
    ).toBe(true);
    await fireEvent.press(screen.getByText('Tentar de novo'));
    await waitFor(() => expect(checkout).toHaveBeenCalledTimes(2));
  });

  it('goes to the setup after an active entitlement', async () => {
    mockEntitlement(active);
    await renderWithQuery(<Paywall />);
    await screen.findByText('R$ 99,90');
    await fireEvent.press(screen.getByText('Começar meu Brotto'));
    await waitFor(() =>
      expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/setup'),
    );
  });

  it('exposes busy state while preparing', async () => {
    mockEntitlement(active);
    let release: () => void = () => undefined;
    vi.spyOn(paymentProvider, 'startCheckout').mockImplementation(
      () =>
        new Promise((resolve) => {
          release = () =>
            resolve({ id: 'x', qrCode: '', copyPaste: '', expiresAt: '' });
        }),
    );
    await renderWithQuery(<Paywall />);
    await screen.findByText('R$ 99,90');
    await fireEvent.press(screen.getByText('Começar meu Brotto'));
    const busy = await screen.findByText('Preparando...');
    expect(busy).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Preparando...' }).props.accessibilityState,
    ).toMatchObject({ busy: true, disabled: true });
    release();
  });

  it('restores: active, inactive and failure', async () => {
    mockEntitlement(inactive);
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByText('Restaurar compra'));
    expect(await screen.findByText('Não encontramos uma compra ativa.')).toBeTruthy();

    vi.spyOn(paymentProvider, 'restore').mockRejectedValue(new Error('offline'));
    await fireEvent.press(screen.getByText('Restaurar compra'));
    expect(await screen.findByText(/Não deu pra verificar/)).toBeTruthy();

    vi.spyOn(paymentProvider, 'restore').mockResolvedValue(active);
    await fireEvent.press(screen.getByText('Restaurar compra'));
    await waitFor(() =>
      expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/setup'),
    );
  });

  it('shows a retry when plans fail to load', async () => {
    const plans = vi
      .spyOn(paymentProvider, 'getPlans')
      .mockRejectedValueOnce(new Error('x'));
    await renderWithQuery(<Paywall />);
    expect(
      await screen.findByText('Não consegui carregar os planos agora.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Tentar de novo'));
    await waitFor(() => expect(plans).toHaveBeenCalledTimes(2));
  });

  it('closing completes onboarding and opens the demo home', async () => {
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByLabelText('Fechar'));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalled());
    expect(memory.state.get('onboarding.completed')).toBe('true');
    expect(nav.router.replace).toHaveBeenCalledWith({
      pathname: '/(tabs)',
      params: { aviso: 'plano' },
    });
  });

  it('closing still works when persistence fails', async () => {
    memory.failWrites = true;
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByLabelText('Fechar'));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalled());
  });

  it('dismisses the onboarding history before entering the app', async () => {
    nav.router.canDismiss.mockReturnValue(true);
    await renderWithQuery(<Paywall />);
    await fireEvent.press(await screen.findByLabelText('Fechar'));
    await waitFor(() => expect(nav.router.dismissAll).toHaveBeenCalled());
  });
});

describe('Setup', () => {
  it('redirects to the paywall without an entitlement', async () => {
    mockEntitlement(inactive);
    await renderWithQuery(<Setup />);
    await waitFor(() => expect(nav.redirects).toContain('/(onboarding)/paywall'));
    expect(screen.queryByText('Bloquear e começar')).toBeNull();
  });

  it('pre-selects TikTok and Instagram when P2 is empty', async () => {
    mockEntitlement(active);
    await renderWithQuery(<Setup />);
    expect(await screen.findByText('Seu Brotto nasceu! 🌱')).toBeTruthy();
    const on = screen
      .getAllByRole('switch')
      .filter((item) => item.props.accessibilityState.checked)
      .map((item) => item.props.accessibilityLabel);
    expect(on).toEqual(['TikTok', 'Instagram']);
  });

  it('pre-selects the P2 answers', async () => {
    mockEntitlement(active);
    memory.state.set('onboarding.answers', '{"apps":["youtube","kwai"]}');
    await renderWithQuery(<Setup />);
    await waitFor(() =>
      expect(
        screen
          .getAllByRole('switch')
          .filter((item) => item.props.accessibilityState.checked)
          .map((item) => item.props.accessibilityLabel),
      ).toEqual(['YouTube', 'Kwai']),
    );
  });

  it('disables the action with nothing selected', async () => {
    mockEntitlement(active);
    await renderWithQuery(<Setup />);
    await fireEvent(await screen.findByLabelText('TikTok'), 'valueChange', false);
    await fireEvent(screen.getByLabelText('Instagram'), 'valueChange', false);
    expect(screen.getByText('Marca pelo menos um pra começar')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Bloquear e começar' }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it('activates the block, persists and enters the app', async () => {
    mockEntitlement(active);
    const block = vi.spyOn(blockingService, 'blockNow');
    await renderWithQuery(<Setup />);
    await fireEvent.press(await screen.findByText('Bloquear e começar'));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalled());
    expect(block).toHaveBeenCalledOnce();
    expect(memory.blocked.map((app) => app.id)).toEqual(['tiktok', 'instagram']);
    expect(memory.state.get('block.active')).toBe('true');
    expect(memory.state.get('onboarding.completed')).toBe('true');
    expect(nav.router.replace).toHaveBeenCalledWith({
      pathname: '/(tabs)',
      params: { aviso: 'bloqueio' },
    });
  });

  it('keeps the selection and allows retry after a service error', async () => {
    mockEntitlement(active);
    const block = vi
      .spyOn(blockingService, 'blockNow')
      .mockRejectedValueOnce(new Error('native'));
    await renderWithQuery(<Setup />);
    await fireEvent(await screen.findByLabelText('Kwai'), 'valueChange', true);
    await fireEvent.press(screen.getByText('Bloquear e começar'));
    expect(
      await screen.findByText(/Não consegui ativar o bloqueio agora/),
    ).toBeTruthy();
    expect(screen.getByLabelText('Kwai').props.accessibilityState.checked).toBe(true);
    expect(nav.router.replace).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByText('Tentar de novo'));
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalled());
    expect(block).toHaveBeenCalledTimes(2);
  });

  it('undoes the service when persistence fails', async () => {
    mockEntitlement(active);
    memory.failBlockedReplace = true;
    const unblock = vi.spyOn(blockingService, 'unblock');
    await renderWithQuery(<Setup />);
    await fireEvent.press(await screen.findByText('Bloquear e começar'));
    expect(
      await screen.findByText(/Não consegui ativar o bloqueio agora/),
    ).toBeTruthy();
    expect(unblock).toHaveBeenCalledOnce();
    expect(memory.state.has('onboarding.completed')).toBe(false);
    expect(nav.router.replace).not.toHaveBeenCalled();
  });
});

describe('Home', () => {
  function setClock(iso: string) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(iso));
  }

  it('greets by time without a name', async () => {
    mockEntitlement(active);
    for (const [iso, greeting] of [
      ['2026-10-12T11:59:00', 'Bom dia'],
      ['2026-10-12T12:00:00', 'Boa tarde'],
      ['2026-10-12T18:00:00', 'Boa noite'],
    ] as const) {
      setClock(iso);
      const view = await renderWithQuery(<Home />);
      expect(await screen.findByText(greeting)).toBeTruthy();
      await view.unmount();
    }
  });

  it('shows the first-day state for subscribers with real zeros', async () => {
    mockEntitlement(active);
    await renderWithQuery(<Home />);
    expect(await screen.findByText('Dá o primeiro passo hoje.')).toBeTruthy();
    expect(screen.getByText('0 dias')).toBeTruthy();
    expect(screen.getAllByText('0 min').length).toBeGreaterThan(0);
    expect(screen.getByText('0 de 25 min de foco hoje')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: 'Meta de foco do dia' }),
    ).toBeTruthy();
    expect(screen.queryByText(/Escolha um plano/)).toBeNull();
    expect(screen.getByText('Bloquear agora')).toBeTruthy();
  });

  it('reads local day_log records', async () => {
    mockEntitlement(active);
    const today = new Date().toLocaleDateString('en-CA');
    memory.dayLog = [{ date: today, focus_minutes: 10, watered: 0 }];
    await renderWithQuery(<Home />);
    expect(await screen.findByText('10 de 25 min de foco hoje')).toBeTruthy();
  });

  it('shows the demo state and opens the paywall from the banner and actions', async () => {
    mockEntitlement(inactive);
    await renderWithQuery(<Home />);
    await fireEvent.press(
      await screen.findByLabelText('Escolha um plano pra liberar todos os recursos'),
    );
    expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/paywall');
    await fireEvent.press(screen.getByText('Bloquear agora'));
    expect(nav.router.push).toHaveBeenCalledWith({
      pathname: '/(onboarding)/paywall',
      params: { motivo: 'bloquear' },
    });
    await fireEvent.press(screen.getByText('Iniciar foco'));
    expect(nav.router.push).toHaveBeenCalledWith({
      pathname: '/(onboarding)/paywall',
      params: { motivo: 'foco' },
    });
  });

  it('starts focus on the Foco tab when subscribed', async () => {
    mockEntitlement(active);
    await renderWithQuery(<Home />);
    await fireEvent.press(await screen.findByText('Iniciar foco'));
    expect(nav.router.push).toHaveBeenCalledWith('/(tabs)/foco');
  });

  it('warns when there are no blocked apps', async () => {
    mockEntitlement(active);
    const block = vi.spyOn(blockingService, 'blockNow');
    await renderWithQuery(<Home />);
    await fireEvent.press(await screen.findByText('Bloquear agora'));
    expect(await screen.findByText(/Escolha as distrações/)).toBeTruthy();
    expect(block).not.toHaveBeenCalled();
  });

  it('toggles the block and reflects block.active', async () => {
    mockEntitlement(active);
    memory.blocked = [
      { id: 'tiktok', platformRef: 'p', label: 'TikTok', enabled: true },
    ];
    const block = vi.spyOn(blockingService, 'blockNow');
    const unblock = vi.spyOn(blockingService, 'unblock');
    await renderWithQuery(<Home />);
    await fireEvent.press(await screen.findByText('Bloquear agora'));
    expect(await screen.findByText('Bloqueio ativo · Desativar')).toBeTruthy();
    expect(block).toHaveBeenCalledOnce();
    expect(memory.state.get('block.active')).toBe('true');
    await fireEvent.press(screen.getByText('Bloqueio ativo · Desativar'));
    expect(await screen.findByText('Bloquear agora')).toBeTruthy();
    expect(unblock).toHaveBeenCalledOnce();
    expect(memory.state.get('block.active')).toBe('false');
  });

  it('shows a skeleton while loading and the post-setup notice honestly', async () => {
    mockEntitlement(active);
    nav.params = { aviso: 'bloqueio' };
    await renderWithQuery(<Home />);
    expect(screen.getByLabelText('Carregando')).toBeTruthy();
    expect(await screen.findByText(/ainda não está disponível/)).toBeTruthy();
  });

  it('shows the paywall-closed notice on the demo home', async () => {
    mockEntitlement(inactive);
    nav.params = { aviso: 'plano' };
    await renderWithQuery(<Home />);
    expect(
      (await screen.findAllByText('Escolha um plano pra liberar todos os recursos.'))
        .length,
    ).toBeGreaterThan(0);
  });
});
