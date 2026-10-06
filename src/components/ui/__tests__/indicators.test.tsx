import { render, screen } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { tokens } from '@/theme/tokens';
import { ProgressLeaves } from '../ProgressLeaves';
import { StatCard } from '../StatCard';
import { WaterBar } from '../WaterBar';

describe('StatCard', () => {
  it.each([
    { size: 'hero', valueClass: 'text-[31px]' },
    { size: 'compact', valueClass: 'text-[25px]' },
  ] as const)(
    'renders the $size Figma treatment and a composed accessible label',
    async ({ size, valueClass }) => {
      await render(
        <StatCard
          tag="Tempo protegido"
          value="2h 15min"
          caption="Hoje"
          size={size}
          className="test-card"
        />,
      );

      const card = screen.getByLabelText('Tempo protegido, 2h 15min, Hoje');
      expect(card.props.className).toContain('test-card');
      expect(card.props.className).toContain('rounded-card');
      expect(card.props.className).toContain('gap-[5px]');
      expect(card.props.className).toContain('dark:bg-');

      const tag = screen.getByText('Tempo protegido');
      expect(tag.props.className).toContain('text-tag');
      expect(tag.props.className).toContain('dark:text-');
      const tagClasses = String(tag.props.className).split(/\s+/);
      expect(tagClasses).toContain('font-inter');
      expect(tagClasses).toContain('font-semibold');
      expect(tagClasses).not.toContain('font-inter-semibold');
      expect(screen.getByText('2h 15min').props.className).toContain(valueClass);
      expect(screen.getByText('2h 15min').props.className).toContain('dark:text-');
      expect(screen.getByText('Hoje').props.className).toContain('dark:text-');
    },
  );

  it('omits the caption from both the view and accessible label when absent', async () => {
    await render(<StatCard tag="Sequência" value="7 dias" />);

    expect(screen.getByLabelText('Sequência, 7 dias')).toBeTruthy();
    expect(screen.queryByText('Hoje')).toBeNull();
  });
});

describe('ProgressLeaves', () => {
  function expectLeafState(index: number, filled: boolean) {
    const leaf = screen.getByTestId(`progress-leaf-${index}`);

    if (filled) {
      expect(leaf.props.fill).toBe(tokens.colors.light.secondary);
      expect(leaf.props.stroke).toBe(tokens.colors.light.primary);
    } else {
      expect(leaf.props.fill).toBe('none');
      expect(leaf.props.stroke).toBe(tokens.colors.light.border);
    }
  }

  it('renders five vector leaves by default and exposes progress semantics', async () => {
    const view = await render(
      <ProgressLeaves current={2} accessibilityLabel="Progresso da semana" />,
    );

    const progress = screen.getByTestId('leaves-progress');
    expect(progress.props.accessibilityRole).toBe('progressbar');
    expect(progress.props.accessibilityLabel).toBe('Progresso da semana');
    expect(progress.props.accessibilityValue).toMatchObject({ min: 0, max: 5, now: 2 });
    expect(progress.props.className).toContain('gap-[11px]');

    for (let index = 0; index < 5; index += 1) {
      expectLeafState(index, index < 2);
    }
    expect(screen.queryByTestId('progress-leaf-5')).toBeNull();
    expect(JSON.stringify(view.toJSON())).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });

  it('uses the requested total as the exact number of 18 dp leaves', async () => {
    await render(<ProgressLeaves current={1} total={3} />);

    expect(
      screen.getByTestId('leaves-progress').props.accessibilityValue,
    ).toMatchObject({
      min: 0,
      max: 3,
      now: 1,
    });
    for (let index = 0; index < 3; index += 1) {
      expect(screen.getByTestId(`progress-leaf-${index}`).props).toMatchObject({
        width: 18,
        height: 18,
      });
    }
    expect(screen.queryByTestId('progress-leaf-3')).toBeNull();
  });

  it.each([
    { current: -2, expected: 0 },
    { current: 2.9, expected: 2 },
    { current: 8, expected: 5 },
    { current: Number.NaN, expected: 0 },
    { current: Number.POSITIVE_INFINITY, expected: 0 },
  ])('safely clamps $current to $expected', async ({ current, expected }) => {
    await render(<ProgressLeaves current={current} />);

    expect(screen.getByRole('progressbar').props.accessibilityValue).toMatchObject({
      min: 0,
      max: 5,
      now: expected,
    });
    for (let index = 0; index < 5; index += 1) {
      expectLeafState(index, index < expected);
    }
  });
});

describe('WaterBar', () => {
  it('announces its label and percentage and uses the Figma token classes', async () => {
    await render(<WaterBar value={2} total={8} label="Água da planta" />);

    const progress = screen.getByRole('progressbar', { name: 'Água da planta' });
    expect(progress.props.accessibilityValue).toEqual({
      min: 0,
      max: 8,
      now: 2,
      text: '25%',
    });
    expect(progress.props.className).toContain('h-3');
    expect(progress.props.className).toContain('bg-primarySoft');
    expect(progress.props.className).toContain('dark:bg-dark-primarySoft');

    const fill = screen.getByTestId('water-bar-fill');
    expect(fill.props.className).toContain('bg-water');
    expect(fill.props.style).toMatchObject({ width: '25%' });
  });

  it.each([
    { value: -4, total: 10, now: 0, max: 10, percentage: '0%' },
    { value: 12, total: 10, now: 10, max: 10, percentage: '100%' },
    { value: Number.NaN, total: 10, now: 0, max: 10, percentage: '0%' },
    { value: 4, total: 0, now: 0, max: 0, percentage: '0%' },
    { value: 4, total: Number.NaN, now: 0, max: 0, percentage: '0%' },
    { value: 4, total: Number.POSITIVE_INFINITY, now: 0, max: 0, percentage: '0%' },
  ])(
    'normalizes value=$value and total=$total without an invalid percentage',
    async ({ value, total, now, max, percentage }) => {
      await render(<WaterBar value={value} total={total} />);

      expect(screen.getByRole('progressbar').props.accessibilityValue).toEqual({
        min: 0,
        max,
        now,
        text: percentage,
      });
      expect(screen.getByTestId('water-bar-fill').props.style).toMatchObject({
        width: percentage,
      });
    },
  );
});
