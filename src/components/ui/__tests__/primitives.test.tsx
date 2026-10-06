import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { describe, expect, it, vi } from 'vitest';
import { Text } from 'react-native';
import { Button } from '../Button';
import { Card } from '../Card';
import { Chip } from '../Chip';
import { SegmentedControl } from '../SegmentedControl';
import { Stepper } from '../Stepper';
import { Toggle } from '../Toggle';

const touchTargetClasses = /(?:^|\s)(?:min-)?h-(?:12|\[48px\])(?:\s|$)/;
type TestElement = ReturnType<typeof screen.getByRole>;

function expectMinimumTouchTarget(element: TestElement) {
  const className = element.props.className as string | undefined;
  const styles = [element.props.style].flat(Infinity).filter(Boolean) as {
    height?: number;
    minHeight?: number;
  }[];
  const hasMinimumStyle = styles.some(
    ({ height, minHeight }) => (height ?? 0) >= 48 || (minHeight ?? 0) >= 48,
  );

  expect(touchTargetClasses.test(className ?? '') || hasMinimumStyle).toBe(true);
}

function getByAccessibilityProps(root: TestElement, role: string, label: string) {
  const pending = [root];

  while (pending.length > 0) {
    const element = pending.shift()!;
    if (
      element.props.accessibilityRole === role &&
      element.props.accessibilityLabel === label
    ) {
      return element;
    }

    pending.push(
      ...element.children.filter(
        (child): child is TestElement => typeof child !== 'string',
      ),
    );
  }

  throw new Error(
    `Unable to find accessibilityRole=${role} accessibilityLabel=${label}`,
  );
}

describe('Button', () => {
  it.each(['primary', 'cta', 'secondary', 'ghost'] as const)(
    'renders the %s variant as an accessible 48 dp button',
    async (variant) => {
      await render(<Button label="Continuar" variant={variant} />);

      const button = screen.getByRole('button', { name: 'Continuar' });
      expectMinimumTouchTarget(button);
      const variantClass = {
        primary: 'bg-primary',
        cta: 'bg-cta',
        secondary: 'bg-primarySoft',
        ghost: 'bg-transparent',
      }[variant];
      expect(button.props.className).toContain(variantClass);
      expect(button.props.className).toContain('dark:');
      expect(screen.getByText('Continuar').props.className).toContain('dark:text-');
    },
  );

  it('supports size, full width and an optional React node icon', async () => {
    await render(
      <Button
        label="Continuar"
        size="large"
        fullWidth
        icon={<Text testID="button-icon">+</Text>}
      />,
    );

    expect(screen.getByRole('button').props.className).toMatch(/w-full/);
    expect(screen.getByTestId('button-icon')).toBeTruthy();
  });

  it('announces loading, uses its loading label and blocks the action', async () => {
    const onPress = vi.fn();
    await render(
      <Button
        label="Continuar"
        loading
        loadingLabel="Preparando foco"
        onPress={onPress}
      />,
    );

    const button = screen.getByRole('button');
    expect(button.props.accessibilityState).toMatchObject({
      busy: true,
      disabled: true,
    });
    expect(screen.getByText('Preparando foco')).toBeTruthy();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('announces disabled and blocks the action', async () => {
    const onPress = vi.fn();
    await render(<Button label="Continuar" disabled onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Continuar' });
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Card', () => {
  it.each(['surface', 'soft', 'outlined'] as const)(
    'renders the %s visual variant',
    async (variant) => {
      await render(
        <Card variant={variant} testID="card">
          <Text>Pomodoro</Text>
        </Card>,
      );

      const variantClass = {
        surface: 'bg-surface',
        soft: 'bg-primarySoft',
        outlined: 'border-border',
      }[variant];
      expect(screen.getByTestId('card').props.className).toContain(variantClass);
      expect(screen.getByTestId('card').props.className).toContain('dark:');
    },
  );

  it('becomes an accessible touch target when onPress is provided', async () => {
    const onPress = vi.fn();
    await render(
      <Card accessibilityLabel="Abrir Pomodoro" onPress={onPress}>
        <Text>Pomodoro</Text>
      </Card>,
    );

    const card = screen.getByRole('button', { name: 'Abrir Pomodoro' });
    expectMinimumTouchTarget(card);
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledOnce();
  });
});

describe('Chip', () => {
  it('announces selection and forwards Pressable props', async () => {
    await render(
      <Chip
        label="Pomodoro"
        selected
        accessibilityHint="Seleciona este modo"
        testID="pomodoro-chip"
      />,
    );

    const chip = screen.getByTestId('pomodoro-chip');
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
    expect(chip.props.accessibilityHint).toBe('Seleciona este modo');
    expectMinimumTouchTarget(chip);
    expect(chip.props.className).toContain('dark:bg-');
    expect(screen.getByText('Pomodoro').props.className).toContain('dark:text-');
  });

  it('announces disabled and blocks selection', async () => {
    const onPress = vi.fn();
    await render(<Chip label="Pomodoro" disabled onPress={onPress} />);

    const chip = screen.getByRole('button', { name: 'Pomodoro' });
    expect(chip.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(chip);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Toggle', () => {
  it('exposes its label, optional description and checked state', async () => {
    const onValueChange = vi.fn();
    await render(
      <Toggle
        label="Bloquear distrações"
        description="Mantém o foco durante a sessão"
        value
        onValueChange={onValueChange}
      />,
    );

    const toggle = screen.getByRole('switch', { name: 'Bloquear distrações' });
    expect(toggle.props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getByText('Bloquear distrações').props.className).toContain(
      'dark:text-',
    );
    expect(
      screen.getByText('Mantém o foco durante a sessão').props.className,
    ).toContain('dark:text-');
    expectMinimumTouchTarget(toggle);
    await fireEvent(toggle, 'valueChange', false);
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('announces disabled and blocks changes', async () => {
    const onValueChange = vi.fn();
    await render(
      <Toggle
        label="Bloquear distrações"
        value={false}
        disabled
        onValueChange={onValueChange}
      />,
    );

    const toggle = screen.getByRole('switch', { name: 'Bloquear distrações' });
    expect(toggle.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent(toggle, 'valueChange', true);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('Stepper', () => {
  it('labels and announces its value with the unit', async () => {
    await render(
      <Stepper
        label="Duração"
        value={25}
        onChange={vi.fn()}
        min={5}
        max={90}
        step={5}
        unit="minutos"
      />,
    );

    expect(screen.getByText('Duração').props.className).toContain('dark:text-');
    expect(screen.getByText('25 minutos').props.className).toContain('dark:text-');
    expect(screen.getByText('-').props.className).toContain('dark:text-');
    expect(screen.getByText('+').props.className).toContain('dark:text-');
    const adjustable = screen.getByRole('adjustable', { name: 'Duração' });
    expect(adjustable.props.accessibilityValue).toMatchObject({
      min: 5,
      max: 90,
      now: 25,
      text: '25 minutos',
    });
    expect(adjustable.props.className).toContain('dark:bg-');
    expect(
      within(adjustable).queryByRole('button', { name: 'Diminuir Duração' }),
    ).toBeNull();
    expect(
      within(adjustable).queryByRole('button', { name: 'Aumentar Duração' }),
    ).toBeNull();
    expectMinimumTouchTarget(screen.getByRole('button', { name: 'Diminuir Duração' }));
    expectMinimumTouchTarget(screen.getByRole('button', { name: 'Aumentar Duração' }));
  });

  it('clamps changes to min and max and disables controls at the limits', async () => {
    const onChange = vi.fn();
    const view = await render(
      <Stepper
        label="Duração"
        value={235}
        onChange={onChange}
        min={15}
        max={240}
        step={15}
        unit="minutos"
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Aumentar Duração' }));
    expect(onChange).toHaveBeenLastCalledWith(240);

    await view.rerender(
      <Stepper
        label="Duração"
        value={15}
        onChange={onChange}
        min={15}
        max={240}
        step={15}
        unit="minutos"
      />,
    );
    const decrease = screen.getByRole('button', { name: 'Diminuir Duração' });
    expect(decrease.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(decrease);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it.each([
    { value: 250, limitedValue: 240, disabledControl: 'Aumentar Duração' },
    { value: 5, limitedValue: 15, disabledControl: 'Diminuir Duração' },
  ])(
    'renders and announces $value as the limited value $limitedValue',
    async ({ value, limitedValue, disabledControl }) => {
      const onChange = vi.fn();
      const view = await render(
        <Stepper
          label="Duração"
          value={value}
          onChange={onChange}
          min={15}
          max={240}
          step={15}
          unit="minutos"
        />,
      );

      expect(view.getByText(`${limitedValue} minutos`)).toBeTruthy();
      expect(
        view.getByRole('adjustable', { name: 'Duração' }).props.accessibilityValue,
      ).toMatchObject({ now: limitedValue, text: `${limitedValue} minutos` });
      expect(
        view.getByRole('button', { name: disabledControl }).props.accessibilityState,
      ).toMatchObject({ disabled: true });
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it.each([0, -5, Number.NaN])('safely rejects the invalid step %s', async (step) => {
    const onChange = vi.fn();
    const view = await render(
      <Stepper
        label="Duração"
        value={25}
        onChange={onChange}
        min={5}
        max={90}
        step={step}
        unit="minutos"
      />,
    );

    await fireEvent.press(view.getByRole('button', { name: 'Aumentar Duração' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('SegmentedControl', () => {
  const options = [
    { label: 'Pomodoro', value: 'pomodoro' },
    { label: 'Foco livre', value: 'livre' },
    { label: 'Indisponível', value: 'indisponivel', disabled: true },
  ] as const;

  it('labels the group, announces selection and changes enabled options', async () => {
    const onChange = vi.fn();
    const view = await render(
      <SegmentedControl
        accessibilityLabel="Modo de foco"
        options={options}
        value="pomodoro"
        onChange={onChange}
      />,
    );

    const group = getByAccessibilityProps(view.container, 'radiogroup', 'Modo de foco');
    expect(group.props.accessible).not.toBe(true);
    expect(group.props.className).toContain('dark:bg-');
    expect(within(group).getAllByRole('radio')).toHaveLength(options.length);
    const pomodoro = within(group).getByRole('radio', { name: 'Pomodoro' });
    const freeFocus = within(group).getByRole('radio', { name: 'Foco livre' });
    expect(pomodoro.props.accessibilityState).toMatchObject({ selected: true });
    expect(freeFocus.props.accessibilityState).toMatchObject({ selected: false });
    expect(pomodoro.props.className).toContain('dark:bg-');
    expect(freeFocus.props.className).toContain('dark:bg-');
    expect(view.getByText('Pomodoro').props.className).toContain('dark:text-');
    expect(view.getByText('Foco livre').props.className).toContain('dark:text-');
    expectMinimumTouchTarget(pomodoro);
    await fireEvent.press(freeFocus);
    expect(onChange).toHaveBeenCalledWith('livre');
  });

  it('blocks an option disabled individually', async () => {
    const onChange = vi.fn();
    const view = await render(
      <SegmentedControl
        accessibilityLabel="Modo de foco"
        options={options}
        value="pomodoro"
        onChange={onChange}
      />,
    );

    const option = view.getByRole('radio', { name: 'Indisponível' });
    expect(option.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(option);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('announces and blocks the whole control when disabled', async () => {
    const onChange = vi.fn();
    const view = await render(
      <SegmentedControl
        accessibilityLabel="Modo de foco"
        options={options}
        value="pomodoro"
        onChange={onChange}
        disabled
      />,
    );

    expect(
      getByAccessibilityProps(view.container, 'radiogroup', 'Modo de foco').props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
    const option = view.getByRole('radio', { name: 'Foco livre' });
    expect(option.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(option);
    expect(onChange).not.toHaveBeenCalled();
  });
});
