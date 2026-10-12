import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Screen, Toast, Toggle } from '@/components/ui';
import {
  activateInitialBlock,
  defaultDistractionIds,
  distractionCatalog,
  toSelectedApps,
} from '@/features/blocking';
import { homeQueryKey } from '@/features/home/useHomeState';
import { enterApp, useBlockAndroidBack } from '@/features/onboarding/navigation';
import { useOnboardingStore } from '@/features/onboarding/store';
import { Body, Title, useHydrateAnswers } from '@/features/onboarding/ui';
import { EntitlementGuard } from '@/features/paywall';

function SetupContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useBlockAndroidBack();
  useHydrateAnswers();
  const ready = useOnboardingStore((state) => state.ready);
  const answerApps = useOnboardingStore((state) => state.answers.apps);
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // R-04: P2 pré-marca; sem escolha, TikTok e Instagram.
  const selection =
    chosen ??
    (answerApps && answerApps.length > 0 ? answerApps : defaultDistractionIds);

  function toggle(id: string, value: boolean) {
    setChosen(value ? [...selection, id] : selection.filter((item) => item !== id));
  }

  async function start() {
    setBusy(true);
    setFailed(false);
    try {
      await activateInitialBlock(toSelectedApps(selection));
      // A Home pode ter ficado em cache vazia antes do bloqueio inicial.
      await queryClient.invalidateQueries({ queryKey: homeQueryKey });
      enterApp(router, 'bloqueio');
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-6 py-6" className="flex-1">
        <Title>Seu Brotto nasceu! 🌱</Title>
        <Body>Escolha o que vai ficar de fora do seu caminho.</Body>
        <View className="gap-4">
          {(ready ? distractionCatalog : []).map(({ id, label }) => (
            <Toggle
              key={id}
              label={label}
              value={selection.includes(id)}
              disabled={busy}
              onValueChange={(value) => toggle(id, value)}
            />
          ))}
        </View>
      </ScrollView>
      <View className="gap-2 pb-6">
        {ready && selection.length === 0 ? (
          <Body accessibilityLiveRegion="polite" className="text-center">
            Marca pelo menos um pra começar
          </Body>
        ) : null}
        <Button
          label="Bloquear e começar"
          variant="cta"
          fullWidth
          disabled={!ready || selection.length === 0}
          loading={busy}
          loadingLabel="Ativando..."
          onPress={() => void start()}
        />
      </View>
      {failed ? (
        <Toast
          tone="error"
          message="Não consegui ativar o bloqueio agora. Sua escolha está guardada."
          actionLabel="Tentar de novo"
          onAction={() => void start()}
        />
      ) : null}
    </Screen>
  );
}

export default function Setup() {
  return (
    <EntitlementGuard>
      <SetupContent />
    </EntitlementGuard>
  );
}
