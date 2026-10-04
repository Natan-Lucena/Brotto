import { Text, View } from 'react-native';
export function ProgressLeaves({ value, total }: { value: number; total: number }) {
  return (
    <View accessibilityLabel={`${value} de ${total}`} className="flex-row gap-1">
      {Array.from({ length: total }, (_, index) => (
        <Text key={index}>{index < value ? '🌿' : '○'}</Text>
      ))}
    </View>
  );
}
