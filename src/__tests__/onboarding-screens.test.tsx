/* eslint-disable import/first */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blockingService } from '@/services/blocking';
import {
  createRouterMock,
  expoRouterFactory,
  memory,
  resetMemory,
  themeState,
} from '@/test-utils/mocks';

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
void createRouterMock;
void expoRouterFactory;

import Splash from '@/app/(onboarding)/splash';
import BoasVindas from '@/app/(onboarding)/boas-vindas';
import Quiz from '@/app/(onboarding)/quiz/[step]';
import Calculando from '@/app/(onboarding)/calculando';
import Impacto from '@/app/(onboarding)/impacto';
import Conheca from '@/app/(onboarding)/conheca';
import Permissoes from '@/app/(onboarding)/permissoes';
import { useOnboardingStore } from '@/features/onboarding/store';

beforeEach(() => {
  resetMemory();
  Object.values(nav.router).forEach((fn) => fn.mockClear());
  nav.params = {};
  nav.redirects.length = 0;
  themeState.theme = 'light';
  useOnboardingStore.setState({ answers: {}, hydrated: false, ready: false });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Splash, Boas-vindas and Calculando', () => {
  it('auto-advances Splash after 1.5s with replace', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await render(<Splash />);
    expect(screen.getByText('Seu foco. Seu tempo. Sua planta.')).toBeTruthy();
    await act(() => vi.advanceTimersByTime(1499));
    expect(nav.router.replace).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTime(1));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/boas-vindas');
  });

  it('clears the Splash timer on unmount', async () => {
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    const view = await render(<Splash />);
    await view.unmount();
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
    expect(nav.router.replace).not.toHaveBeenCalled();
  });

  it('Boas-vindas starts the quiz and offers no skip', async () => {
    await render(<BoasVindas />);
    expect(screen.queryByText(/pular/i)).toBeNull();
    await fireEvent.press(screen.getByText('Começar'));
    expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/quiz/1');
  });

  it('Calculando moves to impacto after 1.5s', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await render(<Calculando />);
    expect(screen.getByText('Calculando seu tempo...')).toBeTruthy();
    expect(screen.getByLabelText('Carregando')).toBeTruthy();
    await act(() => vi.advanceTimersByTime(1500));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/impacto');
  });
});

describe('Quiz', () => {
  async function renderStep(step: string) {
    nav.params = { step };
    return render(<Quiz />);
  }

  it('redirects an invalid step to quiz/1', async () => {
    await renderStep('9');
    expect(new Set(nav.redirects)).toEqual(new Set(['/(onboarding)/quiz/1']));
  });

  it('disables Continuar without an answer and advances after choosing', async () => {
    await renderStep('1');
    expect(screen.getByText('Escolhe uma pra eu te conhecer')).toBeTruthy();
    const continuar = screen.getByRole('button', { name: 'Continuar' });
    expect(continuar.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByText('1 a 3h'));
    expect(
      screen.getByRole('button', { name: '1 a 3h' }).props.accessibilityState.selected,
    ).toBe(true);
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() =>
      expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/quiz/2'),
    );
    expect(JSON.parse(memory.state.get('onboarding.answers')!)).toEqual({
      dailyUsage: '1to3',
    });
  });

  it('lets P2 continue with zero, counts selections and skips', async () => {
    await renderStep('2');
    expect(screen.getByText('Selecionados: 0')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Continuar' }).props.accessibilityState
        .disabled,
    ).toBe(false);
    await fireEvent.press(screen.getByText('TikTok'));
    await fireEvent.press(screen.getByText('Kwai'));
    expect(screen.getByText('Selecionados: 2')).toBeTruthy();
    await fireEvent.press(screen.getByText('Kwai'));
    expect(screen.getByText('Selecionados: 1')).toBeTruthy();
    await fireEvent.press(screen.getByText('Pular essa'));
    await waitFor(() =>
      expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/quiz/3'),
    );
    expect(JSON.parse(memory.state.get('onboarding.answers')!).apps).toEqual([]);
  });

  it('goes to calculando after P5 and back with the router', async () => {
    useOnboardingStore.setState({ answers: { recoverTarget: 'two' }, hydrated: true });
    await renderStep('5');
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() =>
      expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/calculando'),
    );
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(nav.router.back).toHaveBeenCalled();
  });

  it('pre-fills saved answers and exposes progress semantics', async () => {
    memory.state.set('onboarding.answers', '{"goal":"sleep"}');
    await renderStep('3');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Dormir' }).props.accessibilityState
          .selected,
      ).toBe(true),
    );
    expect(screen.getByRole('header')).toBeTruthy();
    expect(screen.getByLabelText('Pergunta 3 de 5')).toBeTruthy();
  });

  it('keeps the flow going when saving fails', async () => {
    memory.failWrites = true;
    await renderStep('1');
    await fireEvent.press(screen.getByText('5h ou mais'));
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() =>
      expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/quiz/2'),
    );
  });
});

describe('Impacto', () => {
  it('shows days from P1, the P3 phrase and continues to conheca', async () => {
    useOnboardingStore.setState({
      answers: { dailyUsage: 'gt5', goal: 'study' },
      hydrated: true,
    });
    await render(<Impacto />);
    expect(screen.getByText('~91 dias por ano')).toBeTruthy();
    expect(screen.getByText('Tempo de sobra para estudar sem pressa.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Quero recuperar meu tempo'));
    expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/conheca');
    await fireEvent.press(screen.getByLabelText('Voltar'));
    expect(nav.router.back).toHaveBeenCalled();
  });

  it('uses the default 61 days without answers', async () => {
    await render(<Impacto />);
    expect(screen.getByText('~61 dias por ano')).toBeTruthy();
  });
});

describe('Conheça', () => {
  it('walks the five phases with announced position and leaves to permissões', async () => {
    await render(<Conheca />);
    expect(screen.getByLabelText('Fase 1 de 5')).toBeTruthy();
    expect(screen.getByLabelText('Semente, Dia 1')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Anterior' }).props.accessibilityState
        .disabled,
    ).toBe(true);
    const expected = ['Planta jovem', 'Planta cheia', 'Florida', 'Pequena árvore'];
    for (const [index, name] of expected.entries()) {
      await fireEvent.press(screen.getByText('Próximo'));
      expect(screen.getByLabelText(`Fase ${index + 2} de 5`)).toBeTruthy();
      expect(screen.getAllByText(name).length).toBeGreaterThan(0);
    }
    expect(
      screen.getByRole('button', { name: 'Próximo' }).props.accessibilityState.disabled,
    ).toBe(true);
    await fireEvent.press(screen.getByText('Cuidar do meu Brotto'));
    expect(nav.router.push).toHaveBeenCalledWith('/(onboarding)/permissoes');
  });
});

describe('Permissões', () => {
  const original = Platform.OS;
  const setOS = (os: 'ios' | 'android') => {
    Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
  };
  afterEach(() => {
    setOS(original as 'ios');
    vi.restoreAllMocks();
  });

  it('shows platform copy', async () => {
    setOS('ios');
    const ios = await render(<Permissoes />);
    expect(screen.getByText('Deixa eu bloquear por você')).toBeTruthy();
    await ios.unmount();
    setOS('android');
    await render(<Permissoes />);
    expect(screen.getByText('Só mais um passo')).toBeTruthy();
    expect(screen.getByText('Seus dados ficam no seu aparelho.')).toBeTruthy();
  });

  it('goes to the paywall when unavailable (mock state) and via "Ativar depois"', async () => {
    const view = await render(<Permissoes />);
    await fireEvent.press(await screen.findByText('Permitir'));
    await waitFor(() =>
      expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/paywall'),
    );
    nav.router.replace.mockClear();
    await view.unmount();
    await render(<Permissoes />);
    await fireEvent.press(screen.getByText('Ativar depois'));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/paywall');
  });

  it('reads the real status from the service every time (granted)', async () => {
    vi.spyOn(blockingService, 'getPermissionStatus').mockResolvedValue('granted');
    await render(<Permissoes />);
    expect(
      await screen.findByText('Permissão concedida. Tudo certo por aqui!'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Continuar'));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/paywall');
  });

  it('handles denied with retry and continue anyway', async () => {
    vi.spyOn(blockingService, 'getPermissionStatus').mockResolvedValue('denied');
    const request = vi
      .spyOn(blockingService, 'requestPermissions')
      .mockResolvedValue('denied');
    await render(<Permissoes />);
    expect(await screen.findByText(/ativar depois em Você/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Tentar novamente'));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await fireEvent.press(screen.getByText('Continuar mesmo assim'));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/paywall');
  });

  it('treats request errors as denied without blocking the flow', async () => {
    vi.spyOn(blockingService, 'getPermissionStatus').mockRejectedValue(new Error('x'));
    vi.spyOn(blockingService, 'requestPermissions').mockRejectedValue(new Error('x'));
    await render(<Permissoes />);
    await fireEvent.press(await screen.findByText('Permitir'));
    expect(await screen.findByText('Continuar mesmo assim')).toBeTruthy();
    await fireEvent.press(screen.getByText('Continuar mesmo assim'));
    expect(nav.router.replace).toHaveBeenCalledWith('/(onboarding)/paywall');
  });
});
