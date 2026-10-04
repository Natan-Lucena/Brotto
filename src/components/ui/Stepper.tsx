import { Pressable, Text, View } from 'react-native';
export function Stepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        accessibilityLabel="Diminuir"
        onPress={() => onChange(Math.max(min, value - step))}
      >
        <Text>-</Text>
      </Pressable>
      <Text>{value}</Text>
      <Pressable
        accessibilityLabel="Aumentar"
        onPress={() => onChange(Math.min(max, value + step))}
      >
        <Text>+</Text>
      </Pressable>
    </View>
  );
}
