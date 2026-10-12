import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { BrottoPlant } from '@/components/brotto';
import { Button, Card, Screen, Toast } from '@/components/ui';
import { enterApp, useBlockAndroidBack } from '@/features/onboarding/navigation';
import { stepHref } from '@/features/onboarding/steps';
import { Body, CheckIcon, Title } from '@/features/onboarding/ui';
import { PlanOption, usePlans } from '@/features/paywall';
import { paymentProvider } from '@/services/payments';
import type { Entitlement, PlanId } from '@/services/payments';
import { appStateRepository } from '@/services/db';
import { useTheme } from '@/theme/ThemeProvider';
import Svg, { Path } from 'react-native-svg';

const benefits = [
  'Bloqueio dos apps que distraem',
  'Sessões de foco que regam seu Brotto',
  'Agenda de bloqueios para sua rotina',
  'Seu progresso e sua sequência sempre com você',
];

const motives: Record<string, string> = {
  bloquear: 'Para bloquear seus apps, escolha um plano.',
  foco: 'Para iniciar uma sessão de foco, escolha um plano.',
};

type Notice = { message: string; tone: 'default' | 'error'; retry?: boolean };

export default function Paywall() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const { motivo } = useLocalSearchParams<{ motivo?: string }>();
  const plans = usePlans();
  const [selected, setSelected] = useState<PlanId>('annual');
  const [busy, setBusy] = useState<'checkout' | 'restore' | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  // Aberto pela Home (onboarding já concluído), voltar deve funcionar.
  const [fromApp, setFromApp] = useState(false);
  useBlockAndroidBack(!fromApp);
  useEffect(() => {
    let active = true;
    appStateRepository
      .get('onboarding.completed')
      .then((value) => active && setFromApp(value === 'true'))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function run(kind: 'checkout' | 'restore') {
    setBusy(kind);
    setNotice(null);
    try {
      let entitlement: Entitlement;
      if (kind === 'checkout') {
        await paymentProvider.startCheckout(selected);
        entitlement = await paymentProvider.getEntitlement();
      } else {
        entitlement = await paymentProvider.restore();
      }
      if (entitlement.active) {
        queryClient.setQueryData(['entitlement'], entitlement);
        router.replace(stepHref('setup'));
        return;
      }
      setNotice(
        kind === 'checkout'
          ? {
              message: 'Não conseguimos concluir sua assinatura agora.',
              tone: 'error',
              retry: true,
            }
          : { message: 'Não encontramos uma compra ativa.', tone: 'default' },
      );
    } catch {
      setNotice({
        message:
          kind === 'checkout'
            ? 'Não conseguimos concluir sua assinatura agora.'
            : 'Não deu pra verificar sua compra agora. Tenta de novo?',
        tone: 'error',
        retry: kind === 'checkout',
      });
    }
    setBusy(null);
  }

  async function close() {
    try {
      await appStateRepository.set('onboarding.completed', 'true');
    } catch {
      // Fechar nunca fica preso a uma falha de gravação.
    }
    enterApp(router, 'plano');
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          disabled={busy !== null}
          onPress={() => void close()}
          className="h-12 w-12 items-center justify-center"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6L6 18"
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
        <Button
          label="Restaurar compra"
          variant="ghost"
          disabled={busy !== null}
          loading={busy === 'restore'}
          loadingLabel="Verificando..."
          onPress={() => void run('restore')}
        />
      </View>
      <ScrollView contentContainerClassName="gap-5 pb-6" className="flex-1">
        <Title>Dê ao seu tempo um lugar para crescer</Title>
        {motivo && motives[motivo] ? <Body>{motives[motivo]}</Body> : null}
        <View className="flex-row gap-3">
          <Card variant="outlined" className="flex-1 items-center gap-2">
            <BrottoPlant
              stage={2}
              mood="wilted"
              size="sm"
              accessibilityLabel="Planta murcha"
            />
            <Body className="font-inter text-bodyStrong">Sem o Brotto</Body>
            <Body className="text-center text-caption">
              Os dias passam sem você notar
            </Body>
          </Card>
          <Card variant="soft" className="flex-1 items-center gap-2">
            <BrottoPlant
              stage={4}
              mood="happy"
              size="sm"
              accessibilityLabel="Planta florida"
            />
            <Body className="font-inter text-bodyStrong">Com o Brotto</Body>
            <Body className="text-center text-caption">Seu tempo vira crescimento</Body>
          </Card>
        </View>
        <View className="gap-2">
          {benefits.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-3">
              <CheckIcon />
              <Body className="flex-1">{benefit}</Body>
            </View>
          ))}
        </View>
        {plans.isLoading ? (
          <View accessibilityLabel="Carregando planos" className="gap-3">
            {[0, 1, 2].map((item) => (
              <View
                key={item}
                className="h-16 rounded-card bg-primarySoft dark:bg-dark-surface"
              />
            ))}
          </View>
        ) : plans.isError || !plans.data ? (
          <Card variant="outlined" className="gap-3">
            <Body>Não consegui carregar os planos agora.</Body>
            <Button label="Tentar de novo" onPress={() => void plans.refetch()} />
          </Card>
        ) : (
          <View accessibilityRole="radiogroup" className="gap-3">
            {plans.data.map((plan) => (
              <PlanOption
                key={plan.id}
                plan={plan}
                selected={plan.id === selected}
                disabled={busy !== null}
                onSelect={() => setSelected(plan.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <View className="pb-6">
        <Button
          label="Começar meu Brotto"
          variant="cta"
          size="large"
          fullWidth
          disabled={!plans.data || busy !== null}
          loading={busy === 'checkout'}
          loadingLabel="Preparando..."
          onPress={() => void run('checkout')}
        />
      </View>
      {notice ? (
        <Toast
          message={notice.message}
          tone={notice.tone}
          actionLabel={notice.retry ? 'Tentar de novo' : undefined}
          onAction={notice.retry ? () => void run('checkout') : undefined}
        />
      ) : null}
    </Screen>
  );
}
