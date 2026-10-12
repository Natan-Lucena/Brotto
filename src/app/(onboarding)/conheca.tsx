import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Button, Screen } from '@/components/ui';
import { useBlockAndroidBack } from '@/features/onboarding/navigation';
import { nextStepHref } from '@/features/onboarding/steps';
import { Body, Title } from '@/features/onboarding/ui';

const phases = [
  { name: 'Semente', when: 'Dia 1', stage: 0 },
  { name: 'Planta jovem', when: '7 dias', stage: 2 },
  { name: 'Planta cheia', when: '30 dias', stage: 3 },
  { name: 'Florida', when: '60 dias', stage: 4 },
  { name: 'Pequena árvore', when: '100 dias', stage: 5 },
] as const;

export default function Conheca() {
  const router = useRouter();
  useBlockAndroidBack();
  const [index, setIndex] = useState(0);
  const phase = phases[index]!;
  return (
    <Screen>
      <View className="flex-1 justify-center gap-6">
        <Title className="text-center">Conheça seu Brotto</Title>
        <View className="items-center gap-4">
          <BrottoPlant
            stage={phase.stage}
            mood="happy"
            size="lg"
            accessibilityLabel={`${phase.name}, ${phase.when}`}
          />
          <Body className="text-center font-nunito text-h2">{phase.name}</Body>
          <Body className="text-center">{phase.when}</Body>
        </View>
        <View className="flex-row items-center justify-between">
          <Button
            label="Anterior"
            variant="secondary"
            disabled={index === 0}
            onPress={() => setIndex(index - 1)}
          />
          <View
            accessible
            accessibilityLiveRegion="polite"
            accessibilityLabel={`Fase ${index + 1} de ${phases.length}`}
            className="flex-row gap-2"
          >
            {phases.map((item, dot) => (
              <View
                key={item.name}
                className={`h-2 w-2 rounded-chip ${
                  dot === index
                    ? 'bg-primary dark:bg-dark-secondary'
                    : 'bg-border dark:bg-dark-surface'
                }`}
              />
            ))}
          </View>
          <Button
            label="Próximo"
            variant="secondary"
            disabled={index === phases.length - 1}
            onPress={() => setIndex(index + 1)}
          />
        </View>
      </View>
      <View className="pb-6">
        <Button
          label="Cuidar do meu Brotto"
          variant="cta"
          fullWidth
          onPress={() => router.push(nextStepHref('conheca'))}
        />
      </View>
    </Screen>
  );
}
