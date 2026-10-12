import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Button, Screen } from '@/components/ui';
import { useBlockAndroidBack } from '@/features/onboarding/navigation';
import { nextStepHref } from '@/features/onboarding/steps';
import { Body, Title } from '@/features/onboarding/ui';

export default function BoasVindas() {
  const router = useRouter();
  useBlockAndroidBack();
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-6">
        <BrottoPlant stage={0} mood="happy" size="lg" accessibilityLabel="Brotto" />
        <Title className="text-center">Menos scroll. Mais você.</Title>
        <Body className="text-center">
          Cuide de uma plantinha enquanto cuida do seu tempo. Sem culpa, no seu ritmo.
        </Body>
      </View>
      <View className="pb-6">
        <Button
          label="Começar"
          variant="cta"
          fullWidth
          onPress={() => router.push(nextStepHref('boas-vindas'))}
        />
      </View>
    </Screen>
  );
}
