import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

export type BrottoMood =
  'normal' | 'guarding' | 'focused' | 'waiting' | 'watered' | 'wilted' | 'happy';

export type BrottoPlantSize = 'sm' | 'md' | 'lg' | number;

export type BrottoPlantProps = {
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  mood?: BrottoMood;
  size?: BrottoPlantSize;
  accessibilityLabel?: string;
};

const colors = tokens.colors.light;
const leafCounts = [2, 3, 5, 7, 8, 9] as const;
const leaves = [
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

const namedSizes = {
  sm: { width: 64, height: 72 },
  md: { width: 140, height: 158 },
  lg: { width: 210, height: 236 },
} as const;

function PlantFace({ mood }: { mood: BrottoMood }) {
  const faceTestID = `brotto-face-${mood}`;

  if (mood === 'happy' || mood === 'watered') {
    return (
      <G testID={faceTestID}>
        <Path
          d="M64 149l5-4 5 4M87 149l5-4 5 4M69 158c7 7 15 7 22 0"
          fill="none"
          stroke={colors.text}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.4}
        />
      </G>
    );
  }

  if (mood === 'focused') {
    return (
      <G testID={faceTestID}>
        <Path
          d="M64 149h10M87 149h10M73 161h14"
          fill="none"
          stroke={colors.text}
          strokeLinecap="round"
          strokeWidth={2.4}
        />
      </G>
    );
  }

  const isSad = mood === 'wilted';
  const isWaiting = mood === 'waiting';

  return (
    <G testID={faceTestID}>
      <Circle cx={69} cy={150} fill={colors.text} r={4.5} />
      <Circle cx={91} cy={150} fill={colors.text} r={4.5} />
      <Circle cx={67.5} cy={148.5} fill={colors.surface} r={1.2} />
      <Circle cx={89.5} cy={148.5} fill={colors.surface} r={1.2} />
      <Path
        d={
          isSad
            ? 'M72 164c5-5 11-5 16 0'
            : isWaiting
              ? 'M75 161c3 2 7 2 10 0'
              : 'M72 158c5 6 11 6 16 0'
        }
        fill="none"
        stroke={colors.text}
        strokeLinecap="round"
        strokeWidth={2.4}
      />
      {mood === 'guarding' ? (
        <G testID="brotto-eyebrow-guarding">
          <Path
            d="M62 141l12 3M98 141l-12 3"
            fill="none"
            stroke={colors.text}
            strokeLinecap="round"
            strokeWidth={2.4}
          />
        </G>
      ) : null}
    </G>
  );
}

export function BrottoPlant({
  stage,
  mood = 'normal',
  size = 'md',
  accessibilityLabel,
}: BrottoPlantProps) {
  const dimensions =
    typeof size === 'number'
      ? Number.isFinite(size) && size > 0
        ? { width: size, height: (size * 180) / 160 }
        : namedSizes.md
      : namedSizes[size];
  const leafFill = mood === 'wilted' ? colors.wilted : colors.secondary;
  const leafOffset = mood === 'wilted' ? 12 : 0;
  const rotationOffset = mood === 'wilted' ? 22 : 0;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? `Brotto estágio ${stage} humor ${mood}`}
      accessibilityRole="image"
    >
      <Svg
        testID="brotto-plant-svg"
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 160 180"
      >
        {mood === 'watered' ? (
          <G>
            <Path
              testID="brotto-water-drop-1"
              d="M34 25c6 8 6 12 0 16-6-4-6-8 0-16Z"
              fill={colors.water}
            />
            <Path
              testID="brotto-water-drop-2"
              d="M132 36c6 8 6 12 0 16-6-4-6-8 0-16Z"
              fill={colors.water}
            />
          </G>
        ) : null}

        <Path
          testID="brotto-stem"
          d={
            stage >= 3
              ? 'M80 125C76 92 85 61 80 31M78 80 52 54M82 68l28-28'
              : 'M80 126C78 100 83 81 80 61'
          }
          fill="none"
          stroke={colors.primary}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={7}
        />

        {leaves.slice(0, leafCounts[stage]).map((leaf, index) => {
          const cy = leaf.cy + leafOffset;
          const rotation = leaf.rotation + rotationOffset;

          return (
            <Ellipse
              key={`${leaf.cx}-${leaf.cy}`}
              testID={`brotto-leaf-${index + 1}`}
              cx={leaf.cx}
              cy={cy}
              rx={leaf.radius}
              ry={leaf.radius * 0.58}
              fill={leafFill}
              stroke={colors.primary}
              strokeWidth={1.4}
              transform={`rotate(${rotation} ${leaf.cx} ${leaf.cy})`}
            />
          );
        })}

        {stage >= 4 ? (
          <G>
            <Circle
              testID="brotto-flower-1"
              cx={49}
              cy={31}
              r={5}
              fill={colors.cta}
              stroke={colors.ctaSoft}
              strokeWidth={3}
            />
            <Circle
              testID="brotto-flower-2"
              cx={113}
              cy={22}
              r={5}
              fill={colors.cta}
              stroke={colors.ctaSoft}
              strokeWidth={3}
            />
            <Circle
              testID="brotto-flower-3"
              cx={83}
              cy={7}
              r={5}
              fill={colors.cta}
              stroke={colors.ctaSoft}
              strokeWidth={3}
            />
          </G>
        ) : null}

        <Ellipse
          testID="brotto-soil"
          cx={80}
          cy={129}
          rx={37}
          ry={11}
          fill={colors.text}
        />
        <Path
          testID="brotto-pot"
          d="M42 128h76l-9 43c-2 7-7 9-14 9H65c-7 0-12-2-14-9Z"
          fill={colors.pot}
          stroke={colors.primary}
          strokeLinejoin="round"
          strokeWidth={1.4}
        />
        <Path
          testID="brotto-pot-rim"
          d="M38 124c0-4 3-7 7-7h70c4 0 7 3 7 7v12H38Z"
          fill={colors.pot}
          stroke={colors.primary}
          strokeLinejoin="round"
          strokeWidth={1.4}
        />

        <PlantFace mood={mood} />
      </Svg>
    </View>
  );
}
