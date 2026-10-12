import { ActivityIndicator, View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Screen } from '@/components/ui';
import { useAutoAdvance } from '@/features/onboarding/navigation';
import { Title } from '@/features/onboarding/ui';
import { useTheme } from '@/theme/ThemeProvider';

export default function Calculando() {
  useAutoAdvance('calculando');
  const { theme, colors } = useTheme();
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-6">
        <BrottoPlant stage={0} size="md" accessibilityLabel="Brotto" />
        <ActivityIndicator
          accessibilityLabel="Carregando"
          color={theme === 'dark' ? colors.secondary : colors.primary}
        />
        <Title accessibilityLiveRegion="polite" className="text-center text-h2">
          Calculando seu tempo...
        </Title>
      </View>
    </Screen>
  );
}
