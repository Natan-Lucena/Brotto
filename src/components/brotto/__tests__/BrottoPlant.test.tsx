import { render, screen } from '@testing-library/react-native';
import { describe, expect, it } from 'vitest';
import { tokens } from '@/theme/tokens';
import { BrottoPlant } from '../BrottoPlant';

const stages = [0, 1, 2, 3, 4, 5] as const;
const leafCounts = [2, 3, 5, 7, 8, 9] as const;
const leafGeometry = [
  { cx: 59, cy: 76, radius: 15, rotation: -28 },
  { cx: 101, cy: 69, radius: 17, rotation: 31 },
  { cx: 51, cy: 49, radius: 17, rotation: -35 },
  { cx: 110, cy: 42, radius: 18, rotation: 34 },
  { cx: 78, cy: 28, radius: 18, rotation: -5 },
  { cx: 83, cy: 55, radius: 19, rotation: 8 },
  { cx: 40, cy: 28, radius: 20, rotation: -25 },
  { cx: 120, cy: 21, radius: 20, rotation: 28 },
  { cx: 80, cy: 8, radius: 22, rotation: 0 },
] as const;
const moods = [
  'normal',
  'guarding',
  'focused',
  'waiting',
  'watered',
  'wilted',
  'happy',
] as const;

function leafTestIds(count: number) {
  return Array.from({ length: count }, (_, index) => `brotto-leaf-${index + 1}`);
}

describe('BrottoPlant', () => {
  it.each(stages)('renders the vector anatomy for stage %s', async (stage) => {
    await render(<BrottoPlant stage={stage} />);

    const svg = screen.getByTestId('brotto-plant-svg');
    expect(svg.props.viewBox).toBe('0 0 160 180');
    expect(screen.getByTestId('brotto-pot').props.fill).toBe(tokens.colors.light.pot);
    expect(screen.getByTestId('brotto-soil')).toBeTruthy();
    expect(screen.getByTestId('brotto-stem')).toBeTruthy();

    const leaves = screen.getAllByTestId(/^brotto-leaf-\d+$/);
    expect(leaves).toHaveLength(leafCounts[stage]);
    expect(leaves.map(({ props }) => props.testID)).toEqual(
      leafTestIds(leafCounts[stage]),
    );
    leaves.forEach((leaf) => {
      expect(leaf.props.fill).toBe(tokens.colors.light.secondary);
      expect(leaf.props.stroke).toBe(tokens.colors.light.primary);
    });

    const flowers = screen.queryAllByTestId(/^brotto-flower-\d+$/);
    expect(flowers.length > 0).toBe(stage >= 4);
  });

  it('uses the approved Figma geometry for every leaf', async () => {
    await render(<BrottoPlant stage={5} />);

    const leaves = screen.getAllByTestId(/^brotto-leaf-\d+$/);
    leaves.forEach((leaf, index) => {
      const geometry = leafGeometry[index];
      expect(leaf.props).toMatchObject({
        cx: geometry.cx,
        cy: geometry.cy,
        rx: geometry.radius,
        ry: geometry.radius * 0.58,
        transform: `rotate(${geometry.rotation} ${geometry.cx} ${geometry.cy})`,
      });
    });
  });

  it('uses the approved soil geometry', async () => {
    await render(<BrottoPlant stage={3} />);

    expect(screen.getByTestId('brotto-soil').props).toMatchObject({
      rx: 37,
      ry: 11,
    });
  });

  it('uses the approved pot rim geometry', async () => {
    await render(<BrottoPlant stage={3} />);

    expect(screen.getByTestId('brotto-pot-rim').props.d).toBe(
      'M38 124c0-4 3-7 7-7h70c4 0 7 3 7 7v12H38Z',
    );
  });

  it.each([
    ['sm', 64, 72],
    ['md', 140, 158],
    ['lg', 210, 236],
    [200, 200, 225],
  ] as const)(
    'supports size %s while preserving the viewBox ratio',
    async (size, width, height) => {
      await render(<BrottoPlant stage={3} size={size} />);

      expect(screen.getByTestId('brotto-plant-svg').props).toMatchObject({
        width,
        height,
        viewBox: '0 0 160 180',
      });
    },
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, -20])(
    'safely falls back from invalid numeric size %s to md',
    async (size) => {
      await render(<BrottoPlant stage={3} size={size} />);

      expect(screen.getByTestId('brotto-plant-svg').props).toMatchObject({
        width: 140,
        height: 158,
        viewBox: '0 0 160 180',
      });
    },
  );

  it.each(moods)('marks the face for the %s mood', async (mood) => {
    await render(<BrottoPlant stage={5} mood={mood} />);

    expect(screen.getByTestId(`brotto-face-${mood}`)).toBeTruthy();
  });

  it.each(moods)('only renders guarding eyebrows for the %s mood', async (mood) => {
    await render(<BrottoPlant stage={5} mood={mood} />);

    if (mood === 'guarding') {
      expect(screen.getByTestId('brotto-eyebrow-guarding')).toBeTruthy();
      return;
    }

    expect(screen.queryAllByTestId(/^brotto-eyebrow-/)).toHaveLength(0);
  });

  it('renders water-colored drops only when watered', async () => {
    const view = await render(<BrottoPlant stage={5} mood="normal" />);
    expect(screen.queryAllByTestId(/^brotto-water-drop-\d+$/)).toHaveLength(0);

    await view.rerender(<BrottoPlant stage={5} mood="watered" />);
    const drops = screen.getAllByTestId(/^brotto-water-drop-\d+$/);
    expect(drops.length).toBeGreaterThan(0);
    drops.forEach((drop) => {
      expect(drop.props.fill).toBe(tokens.colors.light.water);
    });
  });

  it('recolors and displaces leaves when wilted', async () => {
    const view = await render(<BrottoPlant stage={5} mood="normal" />);
    const normalLeaves = screen.getAllByTestId(/^brotto-leaf-\d+$/);
    const normalTransforms = normalLeaves.map(({ props }) => props.transform);

    await view.rerender(<BrottoPlant stage={5} mood="wilted" />);
    const wiltedLeaves = screen.getAllByTestId(/^brotto-leaf-\d+$/);
    expect(wiltedLeaves).toHaveLength(normalLeaves.length);
    wiltedLeaves.forEach((leaf, index) => {
      const geometry = leafGeometry[index];
      expect(leaf.props.fill).toBe(tokens.colors.light.wilted);
      expect(leaf.props.stroke).toBe(tokens.colors.light.primary);
      expect(leaf.props.cy).toBe(geometry.cy + 12);
      expect(leaf.props.transform).toBe(
        `rotate(${geometry.rotation + 22} ${geometry.cx} ${geometry.cy})`,
      );
    });
    expect(wiltedLeaves.map(({ props }) => props.transform)).not.toEqual(
      normalTransforms,
    );
  });

  it.each(moods)('announces stage and %s mood', async (mood) => {
    await render(<BrottoPlant stage={2} mood={mood} />);

    expect(screen.getByLabelText(`Brotto estágio 2 humor ${mood}`)).toBeTruthy();
  });

  it('uses an optional accessibility label verbatim', async () => {
    await render(
      <BrottoPlant
        stage={4}
        mood="happy"
        accessibilityLabel="Minha planta está feliz"
      />,
    );

    expect(screen.getByLabelText('Minha planta está feliz')).toBeTruthy();
  });

  it('does not use emoji as part of the illustration', async () => {
    await render(<BrottoPlant stage={5} mood="happy" />);

    expect(screen.queryByText(/\p{Extended_Pictographic}/u)).toBeNull();
  });
});
