import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@/theme/tokens';

export type ProgressLeavesProps = {
  current: number;
  total?: number;
  accessibilityLabel?: string;
};

export function ProgressLeaves({
  current,
  total = 5,
  accessibilityLabel,
}: ProgressLeavesProps) {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const safeCurrent = Number.isFinite(current)
    ? Math.min(safeTotal, Math.max(0, Math.floor(current)))
    : 0;

  return (
    <View
      accessible
      testID="leaves-progress"
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `${safeCurrent} de ${safeTotal} folhas`}
      accessibilityValue={{ min: 0, max: safeTotal, now: safeCurrent }}
      className="flex-row gap-[11px]"
    >
      {Array.from({ length: safeTotal }, (_, index) => {
        const filled = index < safeCurrent;

        return (
          <Svg
            key={index}
            testID={`progress-leaf-${index}`}
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill={filled ? tokens.colors.light.secondary : 'none'}
            stroke={filled ? tokens.colors.light.primary : tokens.colors.light.border}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M20 4c-8 0-14 4-14 10 0 3 2 5 5 5 6 0 9-7 9-15Z" />
            <Path d="M4 21c2-5 6-9 12-12" fill="none" />
          </Svg>
        );
      })}
    </View>
  );
}
