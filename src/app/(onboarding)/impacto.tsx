import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Screen, StatCard } from '@/components/ui';
import { impactDaysPerYear, impactPhrase } from '@/features/onboarding/impact';
import { nextStepHref } from '@/features/onboarding/steps';
import { useOnboardingStore } from '@/features/onboarding/store';
import { BackButton, Body, Title, useHydrateAnswers } from '@/features/onboarding/ui';

export default function Impacto() {
  const router = useRouter();
  useHydrateAnswers();
  const answers = useOnboardingStore((state) => state.answers);
  return (
    <Screen>
      <View className="items-start">
        <BackButton />
      </View>
      <View className="flex-1 justify-center gap-6">
        <Title>Olha quanto tempo pode voltar pra você</Title>
        <StatCard
          size="hero"
          tag="Seu impacto potencial"
          value={`~${impactDaysPerYear(answers.dailyUsage)} dias por ano`}
          caption="dias por ano que você pode recuperar"
        />
        <Body>{impactPhrase(answers.goal)}</Body>
      </View>
      <View className="pb-6">
        <Button
          label="Quero recuperar meu tempo"
          variant="cta"
          fullWidth
          onPress={() => router.push(nextStepHref('impacto'))}
        />
      </View>
    </Screen>
  );
}
