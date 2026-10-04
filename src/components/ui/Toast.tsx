import { Text, View } from 'react-native';
export function Toast({
  message,
  visible = true,
}: {
  message: string;
  visible?: boolean;
}) {
  return visible ? (
    <View accessibilityLiveRegion="polite" className="rounded-button bg-text p-3">
      <Text className="text-surface">{message}</Text>
    </View>
  ) : null;
}
