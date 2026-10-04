import { Pressable, Text, View } from 'react-native';
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityState={{ selected: option === value }}
          onPress={() => onChange(option)}
          className="rounded-chip bg-surface px-3 py-2"
        >
          <Text>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}
