import { Text, View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Card, Screen } from '@/components/ui';
export default function Home() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <Text className="font-nunito text-3xl text-text">Bom dia</Text>
        <BrottoPlant stage={0} />
        <Card>
          <Text className="font-inter text-text">
            Seu tempo protegido começa com um passo.
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
