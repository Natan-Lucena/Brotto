import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Button, Card, Screen, StatCard, Toast, WaterBar } from '@/components/ui';
import { setBlockActive } from '@/features/blocking';
import { homeQueryKey, useHomeState } from '@/features/home/useHomeState';
import { Body, Title } from '@/features/onboarding/ui';
import { useEntitlement } from '@/features/paywall';
import { DAILY_FOCUS_GOAL_MINUTES } from '@/lib/constants';
import { greetingForHour } from '@/lib/date';
import { formatMinutes } from '@/lib/format';

const notices: Record<string, { message: string; tone: 'default' | 'success' }> = {
  plano: {
    message: 'Escolha um plano pra liberar todos os recursos.',
    tone: 'default',
  },
  bloqueio: {
    message:
      'Bloqueio ativado no app. O bloqueio real dos apps ainda não está disponível.',
    tone: 'success',
  },
};

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { aviso } = useLocalSearchParams<{ aviso?: string }>();
  const home = useHomeState();
  const entitlement = useEntitlement();
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const subscribed = entitlement.data?.active === true;
  const notice = aviso ? notices[aviso] : undefined;

  if (home.isLoading || entitlement.isLoading) {
    return (
      <Screen>
        <View accessibilityLabel="Carregando" className="flex-1 justify-center gap-4">
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              className="h-24 rounded-card bg-primarySoft dark:bg-dark-surface"
            />
          ))}
        </View>
      </Screen>
    );
  }

  const state = home.data ?? {
    blockActive: false,
    focusMinutes: 0,
    streakDays: 0,
    stage: 0 as const,
    apps: [],
  };

  const openPaywall = (motivo: string) =>
    router.push({ pathname: '/(onboarding)/paywall', params: { motivo } } as Href);

  async function toggleBlock() {
    if (!subscribed) return openPaywall('bloquear');
    if (state.apps.length === 0) {
      return setToast(
        'Escolha as distrações que quer bloquear para ativar o bloqueio.',
      );
    }
    setBusy(true);
    try {
      await setBlockActive(!state.blockActive, state.apps);
      await queryClient.invalidateQueries({ queryKey: homeQueryKey });
    } catch {
      setToast('Não consegui mudar o bloqueio agora. Tente de novo em instantes.');
    }
    setBusy(false);
  }

  const message = toast ?? notice?.message;
  const tone = toast ? 'default' : (notice?.tone ?? 'default');

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-5 py-6" className="flex-1">
        <Title>{greetingForHour(new Date().getHours())}</Title>
        <View className="items-center">
          <BrottoPlant
            stage={state.stage}
            mood="happy"
            size="md"
            accessibilityLabel="Seu Brotto"
          />
        </View>
        {subscribed ? (
          state.streakDays === 0 && state.focusMinutes === 0 ? (
            <Body className="text-center">Dá o primeiro passo hoje.</Body>
          ) : null
        ) : (
          <Card
            variant="soft"
            onPress={() => router.push('/(onboarding)/paywall')}
            accessibilityLabel="Escolha um plano pra liberar todos os recursos"
          >
            <Body>Escolha um plano pra liberar todos os recursos</Body>
          </Card>
        )}
        <View className="flex-row gap-3">
          <StatCard
            size="compact"
            className="flex-1"
            tag="Sequência"
            value={`${state.streakDays} ${state.streakDays === 1 ? 'dia' : 'dias'}`}
            caption="regando seu Brotto"
          />
          <StatCard
            size="compact"
            className="flex-1"
            tag="Tempo protegido"
            value={formatMinutes(state.focusMinutes)}
            caption="hoje"
          />
        </View>
        <View className="gap-2">
          <Body>{`${state.focusMinutes} de ${DAILY_FOCUS_GOAL_MINUTES} min de foco hoje`}</Body>
          <WaterBar
            value={state.focusMinutes}
            total={DAILY_FOCUS_GOAL_MINUTES}
            label="Meta de foco do dia"
          />
        </View>
        <Button
          label={state.blockActive ? 'Bloqueio ativo · Desativar' : 'Bloquear agora'}
          variant={state.blockActive ? 'secondary' : 'primary'}
          fullWidth
          loading={busy}
          loadingLabel="Aguarde..."
          onPress={() => void toggleBlock()}
        />
        <Button
          label="Iniciar foco"
          variant="cta"
          fullWidth
          onPress={() =>
            subscribed ? router.push('/(tabs)/foco') : openPaywall('foco')
          }
        />
      </ScrollView>
      {message ? <Toast message={message} tone={tone} /> : null}
    </Screen>
  );
}
