import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text, useColorScheme } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tokens } from '../../../theme/tokens';
import { BottomSheet } from '../BottomSheet';
import { Toast } from '../Toast';

vi.mock('react-native', async (importOriginal) => {
  const reactNative = await importOriginal<typeof import('react-native')>();

  return {
    ...reactNative,
    useColorScheme: vi.fn(() => 'light'),
  };
});

afterEach(() => {
  vi.mocked(useColorScheme).mockReset();
  vi.mocked(useColorScheme).mockReturnValue('light');
});

type TestElement = ReturnType<typeof screen.getByTestId>;

function expectMinimumTouchTarget(element: TestElement) {
  const className = element.props.className as string | undefined;
  const styles = [element.props.style].flat(Infinity).filter(Boolean) as {
    height?: number;
    minHeight?: number;
  }[];
  const hasMinimumStyle = styles.some(
    ({ height, minHeight }) => (height ?? 0) >= 48 || (minHeight ?? 0) >= 48,
  );

  expect(
    /(?:^|\s)(?:min-)?h-(?:12|\[48px\])(?:\s|$)/.test(className ?? '') ||
      hasMinimumStyle,
  ).toBe(true);
}

function getByProp(root: TestElement, prop: string, value: unknown) {
  const pending = [root];

  while (pending.length > 0) {
    const element = pending.shift()!;
    if (element.props[prop] === value) {
      return element;
    }

    pending.push(
      ...element.children.filter(
        (child): child is TestElement => typeof child !== 'string',
      ),
    );
  }

  throw new Error(`Unable to find ${prop}=${String(value)}`);
}

function getByClass(root: TestElement, expectedClass: string) {
  const pending = [root];

  while (pending.length > 0) {
    const element = pending.shift()!;
    const classes = String(element.props.className ?? '').split(/\s+/);
    if (classes.includes(expectedClass)) {
      return element;
    }

    pending.push(
      ...element.children.filter(
        (child): child is TestElement => typeof child !== 'string',
      ),
    );
  }

  throw new Error(`Unable to find className containing ${expectedClass}`);
}

function getByExistingProp(root: TestElement, prop: string) {
  const pending = [root];

  while (pending.length > 0) {
    const element = pending.shift()!;
    if (Object.prototype.hasOwnProperty.call(element.props, prop)) {
      return element;
    }

    pending.push(
      ...element.children.filter(
        (child): child is TestElement => typeof child !== 'string',
      ),
    );
  }

  throw new Error(`Unable to find prop ${prop}`);
}

function expectToastForeground(element: TestElement, tone: string) {
  const classes = String(element.props.className ?? '').split(/\s+/);

  if (tone === 'default') {
    expect(classes).toContain('text-surface');
    return;
  }

  expect(classes).toContain('text-dark-bg');
  expect(classes).toContain('dark:text-dark-bg');
  expect(classes).not.toContain('text-surface');
}

function expectNoAccessibleAncestor(element: TestElement) {
  let ancestor = element.parent;

  while (ancestor) {
    expect(ancestor.props.accessible).not.toBe(true);
    ancestor = ancestor.parent;
  }
}

describe('Toast', () => {
  it('renders nothing when it is not visible', async () => {
    const view = await render(<Toast message="Sessão iniciada" visible={false} />);

    expect(view.toJSON()).toBeNull();
  });

  it.each([
    { tone: 'default', background: 'bg-text', liveRegion: 'polite' },
    { tone: 'success', background: 'bg-success', liveRegion: 'polite' },
    { tone: 'error', background: 'bg-error', liveRegion: 'assertive' },
  ] as const)(
    'renders $tone feedback with tokenized dark styles and the correct announcement',
    async ({ tone, background, liveRegion }) => {
      const message = `${tone} feedback`;
      const view = await render(<Toast message={message} tone={tone} />);

      const announcement = getByProp(
        view.container,
        'accessibilityLiveRegion',
        liveRegion,
      );
      const toast = getByClass(view.container, background);
      expect(toast.props.className).toContain(background);
      expect(toast.props.className).toContain('dark:');
      expect(screen.getByText(message)).toBe(announcement);
      expectToastForeground(announcement, tone);

      if (tone === 'error') {
        expect(screen.getByRole('alert')).toBe(announcement);
      } else {
        expect(announcement.props.accessibilityRole).not.toBe('alert');
      }
    },
  );

  it('renders no action by default', async () => {
    await render(<Toast message="Tempo protegido" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('does not render an inoperable action without an onAction callback', async () => {
    await render(<Toast message="Tempo protegido" actionLabel="Desfazer" />);

    expect(screen.queryByRole('button', { name: 'Desfazer' })).toBeNull();
    expect(screen.queryByText('Desfazer')).toBeNull();
  });

  it.each(['default', 'success', 'error'] as const)(
    'renders an optional accessible %s action with a contrasting 48 dp target',
    async (tone) => {
      const onAction = vi.fn();
      const actionLabel = `Tentar ${tone}`;
      await render(
        <Toast
          message="Não foi possível salvar"
          tone={tone}
          actionLabel={actionLabel}
          onAction={onAction}
        />,
      );

      const action = screen.getByRole('button', { name: actionLabel });
      expectMinimumTouchTarget(action);
      expect(action.props.disabled).toBeUndefined();
      expect(action.props.accessibilityState?.disabled).toBeUndefined();
      expectToastForeground(screen.getByText(actionLabel), tone);
      await fireEvent.press(action);
      expect(onAction).toHaveBeenCalledOnce();
    },
  );

  it('keeps an error action separate from its assertive announcement', async () => {
    await render(
      <Toast
        message="Não foi possível salvar"
        tone="error"
        actionLabel="Tentar de novo"
        onAction={vi.fn()}
      />,
    );

    const message = screen.getByText('Não foi possível salvar');
    expect(message.props.accessibilityLiveRegion).toBe('assertive');
    expect(message.props.accessibilityRole).toBe('alert');
    expect(screen.getByRole('alert')).toBe(message);

    const action = screen.getByRole('button', { name: 'Tentar de novo' });
    expectNoAccessibleAncestor(action);
  });
});

describe('BottomSheet', () => {
  it('renders nothing when it is not visible', async () => {
    const view = await render(
      <BottomSheet visible={false} onClose={vi.fn()}>
        <Text>Conteúdo</Text>
      </BottomSheet>,
    );

    expect(view.toJSON()).toBeNull();
  });

  it.each([
    { variant: 'sheet', radiusClass: 'rounded-t-sheet' },
    { variant: 'dialog', radiusClass: 'rounded-sheet' },
  ] as const)(
    'renders the $variant variant with its header and contract styles',
    async ({ variant, radiusClass }) => {
      await render(
        <BottomSheet
          visible
          onClose={vi.fn()}
          variant={variant}
          eyebrow="Sua atenção"
          title="Pausa consciente"
        >
          <Text>Respire antes de continuar</Text>
        </BottomSheet>,
      );

      expect(screen.getByTestId('bottom-sheet-backdrop')).toBeTruthy();
      const content = screen.getByTestId('bottom-sheet-content');
      expect(content.props.className).toContain(radiusClass);
      expect(content.props.className).toContain('max-h-[88%]');
      expect(content.props.className).toContain('pt-3');
      expect(content.props.className).toContain('px-5');
      expect(content.props.className).toContain('pb-9');
      expect(content.props.className).toContain('dark:bg-');
      expect(content.props.accessibilityViewIsModal).toBe(true);
      expect(screen.getByText('Sua atenção').props.className).toContain('dark:text-');
      expect(screen.getByText('Pausa consciente').props.className).toContain(
        'dark:text-',
      );
      expect(screen.getByText('Respire antes de continuar')).toBeTruthy();
    },
  );

  it('closes from the backdrop and the native request-close event', async () => {
    const onClose = vi.fn();
    const view = await render(
      <BottomSheet visible onClose={onClose}>
        <Text>Conteúdo</Text>
      </BottomSheet>,
    );

    await fireEvent.press(screen.getByTestId('bottom-sheet-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();

    onClose.mockClear();
    await fireEvent(
      getByProp(view.container, 'onRequestClose', onClose),
      'requestClose',
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('preserves touches inside the content', async () => {
    const onClose = vi.fn();
    await render(
      <BottomSheet visible onClose={onClose}>
        <Text>Conteúdo interativo</Text>
      </BottomSheet>,
    );

    await fireEvent.press(screen.getByTestId('bottom-sheet-content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each([
    { colorScheme: 'light', expectedStroke: tokens.colors.light.text },
    { colorScheme: 'dark', expectedStroke: tokens.colors.dark.text },
  ] as const)(
    'offers an accessible 48 dp close button with the $colorScheme theme stroke',
    async ({ colorScheme, expectedStroke }) => {
      vi.mocked(useColorScheme).mockReturnValue(colorScheme);
      const onClose = vi.fn();
      await render(
        <BottomSheet visible onClose={onClose} showCloseButton title="Detalhes">
          <Text>Conteúdo</Text>
        </BottomSheet>,
      );

      const closeButton = screen.getByRole('button', { name: 'Fechar' });
      expectMinimumTouchTarget(closeButton);
      const closeIcon = screen.getByTestId('bottom-sheet-close-icon');
      expect(closeIcon.props.viewBox).toBeTruthy();
      const closePath = getByExistingProp(closeIcon, 'd');
      expect(closePath.props.stroke).toBe(expectedStroke);
      expect(screen.queryByText('\u00d7')).toBeNull();
      await fireEvent.press(closeButton);
      expect(onClose).toHaveBeenCalledOnce();
    },
  );
});
