import { View } from 'react-native';

export type WaterBarProps = {
  value: number;
  total: number;
  label?: string;
};

export function WaterBar({ value, total, label }: WaterBarProps) {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safeValue =
    safeTotal > 0 && Number.isFinite(value)
      ? Math.min(safeTotal, Math.max(0, value))
      : 0;
  const percentage = safeTotal > 0 ? Math.round((safeValue / safeTotal) * 100) : 0;

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{
        min: 0,
        max: safeTotal,
        now: safeValue,
        text: `${percentage}%`,
      }}
      className="h-3 overflow-hidden rounded-chip bg-primarySoft dark:bg-dark-primarySoft"
    >
      <View
        testID="water-bar-fill"
        className="h-full bg-water"
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}
