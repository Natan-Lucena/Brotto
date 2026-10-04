import { View } from 'react-native';
export function WaterBar({ value, total }: { value: number; total: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: value }}
      className="h-3 overflow-hidden rounded-chip bg-primarySoft"
    >
      <View
        className="h-full bg-water"
        style={{ width: `${Math.min(100, (value / total) * 100)}%` }}
      />
    </View>
  );
}
