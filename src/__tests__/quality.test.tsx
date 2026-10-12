/// <reference types="vite/client" />
/* eslint-disable import/first */
import { fireEvent, screen } from '@testing-library/react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQuery, resetMemory, themeState } from '@/test-utils/mocks';

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
import Home from '@/app/(tabs)/index';
import { BackButton } from '@/features/onboarding/ui';

const raw = import.meta.glob<string>(
  ['/src/app/**/*.{ts,tsx}', '/src/features/**/*.{ts,tsx}', '!**/__tests__/**'],
  { query: '?raw', import: 'default', eager: true },
);

const sourceByFile = Object.entries(raw).filter(
  ([file]) => !/streak|focus|stats|schedules/.test(file),
);
const screenFiles = sourceByFile.map(([file]) => file);
const readFileSync = (file: string, _encoding?: string) => raw[file] as string;

beforeEach(() => {
  resetMemory();
  nav.params = { step: '1' };
  themeState.theme = 'light';
});

describe('content rules', () => {
  const text = sourceByFile;

  it('scans the real sources', () => {
    expect(text.length).toBeGreaterThan(15);
    expect(text.some(([file]) => file.endsWith('paywall.tsx'))).toBe(true);
  });

  it('has no blaming language, loss estimates or red for missed days', () => {
    for (const [file, source] of text) {
      expect(source, file).not.toMatch(/perdeu|perdido|perdi |falhou|fracass/i);
    }
  });

  it('keeps prices out of the screens (plans are the only source)', () => {
    for (const [file, source] of text) {
      expect(source, file).not.toMatch(/R\$\s?\d/);
    }
  });

  it('uses emoji only in the approved setup copy and never as icons', () => {
    for (const [file, source] of text) {
      const emoji = source.match(/\p{Extended_Pictographic}/gu) ?? [];
      expect(emoji, file).toEqual(/setup\.tsx$/.test(file) ? ['🌱'] : []);
    }
  });

  it('adds no backend, analytics or trial/store promises', () => {
    for (const [file, source] of text) {
      expect(source, file).not.toMatch(
        /axios|fetch\(|analytics|trialDays|toggle.*trial/i,
      );
    }
  });
});

describe('theme', () => {
  const lightTokens =
    /(?:^|\s)(?:bg|border)-(?:bg|surface|border|primarySoft)(?=\s|$)|(?:^|\s)text-(?:text|textMuted)(?=\s|$)/;

  it('pairs every light surface/text class with a dark: counterpart', () => {
    const literals = /(?:className=|\bclassName: |`|')([^`'\n]*)(?:`|')/g;
    for (const [file, source] of sourceByFile) {
      for (const match of source.matchAll(literals)) {
        const value = match[1]!;
        if (!lightTokens.test(value) || !/\b(?:bg|text|border)-/.test(value)) continue;
        expect(value, `${file}: ${value}`).toMatch(/dark:/);
      }
    }
  });

  it('renders every screen in light and dark', async () => {
    const screens = [
      Splash,
      BoasVindas,
      Calculando,
      Impacto,
      Conheca,
      Permissoes,
      Paywall,
      Quiz,
      Home,
    ];
    for (const theme of ['light', 'dark'] as const) {
      themeState.theme = theme;
      for (const Screen of screens) {
        const view = await renderWithQuery(<Screen />);
        expect(
          (await screen.findAllByRole('header')).length,
          Screen.name,
        ).toBeGreaterThan(0);
        await view.unmount();
      }
    }
  });
});

describe('accessibility', () => {
  it('gives every screen a header', async () => {
    for (const Screen of [
      Splash,
      BoasVindas,
      Calculando,
      Impacto,
      Conheca,
      Permissoes,
      Paywall,
      Quiz,
    ]) {
      const view = await renderWithQuery(<Screen />);
      expect(screen.getAllByRole('header').length, Screen.name).toBeGreaterThan(0);
      await view.unmount();
    }
  });

  it('keeps local controls at 48 dp and labelled', async () => {
    await renderWithQuery(<BackButton />);
    const back = screen.getByLabelText('Voltar');
    expect(back.props.className).toMatch(/h-12 w-12/);
    expect(back.props.accessibilityRole).toBe('button');
  });

  it('keeps the paywall close control at 48 dp and quiz chips selectable by role', async () => {
    await renderWithQuery(<Paywall />);
    expect(screen.getByLabelText('Fechar').props.className).toMatch(/h-12 w-12/);
    await renderWithQuery(<Quiz />);
    const chip = screen.getByRole('button', { name: 'Menos de 1h' });
    expect(chip.props.accessibilityState.selected).toBe(false);
    await fireEvent.press(chip);
    expect(
      screen.getByRole('button', { name: 'Menos de 1h' }).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it('does not animate (reduce motion has nothing to disable in this wave)', () => {
    for (const file of screenFiles) {
      expect(readFileSync(file, 'utf-8'), file).not.toMatch(
        /Animated\.|withTiming|withSpring|LayoutAnimation/,
      );
    }
  });
});
