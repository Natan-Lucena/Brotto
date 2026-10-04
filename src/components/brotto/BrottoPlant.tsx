import { Text, View } from 'react-native';
export type BrottoMood =
  'healthy' | 'thirsty' | 'guarding' | 'focused' | 'resting' | 'wilted';
export function BrottoPlant({
  stage,
  mood = 'healthy',
  size = 120,
}: {
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  mood?: BrottoMood;
  size?: number;
}) {
  return (
    <View
      accessibilityLabel={`Brotto, estágio ${stage}, ${mood}`}
      style={{ height: size, width: size }}
      className="items-center justify-center rounded-full bg-secondary"
    >
      <Text style={{ fontSize: size * 0.35 }}>🌿</Text>
    </View>
  );
}
