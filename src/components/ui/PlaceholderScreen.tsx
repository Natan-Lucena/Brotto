import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Button } from './Button';
import { Screen } from './Screen';
export function PlaceholderScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="font-nunito text-3xl text-text">{title}</Text>
        <Text className="text-center text-textMuted">{description}</Text>
        <Link href="/(tabs)" asChild>
          <Button label="Voltar ao início" />
        </Link>
      </View>
    </Screen>
  );
}
