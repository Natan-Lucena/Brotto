import { Text, View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Screen } from '@/components/ui';
import { useAutoAdvance } from '@/features/onboarding/navigation';
import { Body } from '@/features/onboarding/ui';

export default function Splash() {
  useAutoAdvance('splash');
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-6">
        <BrottoPlant stage={0} mood="happy" size="lg" accessibilityLabel="Brotto" />
        <Text
          accessibilityRole="header"
          className="font-nunito text-display text-primary dark:text-dark-text"
        >
          brotto
        </Text>
        <Body accessibilityLiveRegion="polite" className="text-center">
          Seu foco. Seu tempo. Sua planta.
        </Body>
      </View>
    </Screen>
  );
}
