import { Pressable, Text } from 'react-native';
export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-chip px-3 py-2 ${selected ? 'bg-primarySoft' : 'bg-surface'}`}
    >
      <Text className="text-text">{label}</Text>
    </Pressable>
  );
}
