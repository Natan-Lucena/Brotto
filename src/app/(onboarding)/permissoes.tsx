import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { useBlockAndroidBack } from '@/features/onboarding/navigation';
import { nextStepHref } from '@/features/onboarding/steps';
import { Body, CheckIcon, Title } from '@/features/onboarding/ui';
import { blockingService } from '@/services/blocking';
import type { PermissionStatus } from '@/services/blocking';

const benefits = [
  'Bloquear os apps que tiram seu foco',
  'Proteger seus horários de foco',
  'Regar seu Brotto com o tempo que você ganha',
];

export default function Permissoes() {
  const router = useRouter();
  useBlockAndroidBack();
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const isIos = Platform.OS === 'ios';

  useEffect(() => {
    let active = true;
    blockingService
      .getPermissionStatus()
      .catch((): PermissionStatus => 'unavailable')
      .then((next) => active && setStatus(next));
    return () => {
      active = false;
    };
  }, []);

  const goToPaywall = () => router.replace(nextStepHref('permissoes'));

  async function request() {
    setBusy(true);
    let result: PermissionStatus;
    try {
      result = await blockingService.requestPermissions();
    } catch {
      result = 'denied';
    }
    setBusy(false);
    if (result === 'granted' || result === 'denied') setStatus(result);
    else goToPaywall();
  }

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-6 py-6" className="flex-1">
        <Title>{isIos ? 'Deixa eu bloquear por você' : 'Só mais um passo'}</Title>
        <Body>
          {isIos
            ? 'O Brotto usa o Tempo de Uso do seu iPhone para esconder os apps que distraem.'
            : 'O Brotto precisa de duas permissões do Android: Acesso de uso, para saber qual app está aberto, e Acessibilidade, para bloquear os apps que distraem.'}
        </Body>
        <View className="gap-3">
          {benefits.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-3">
              <CheckIcon />
              <Body className="flex-1">{benefit}</Body>
            </View>
          ))}
        </View>
        <Card variant="soft">
          <Body>Seus dados ficam no seu aparelho.</Body>
        </Card>
        {status === 'granted' ? (
          <Card variant="outlined" accessibilityLiveRegion="polite">
            <Body>Permissão concedida. Tudo certo por aqui!</Body>
          </Card>
        ) : null}
        {status === 'denied' ? (
          <Card variant="outlined" accessibilityLiveRegion="polite">
            <Body>
              Tudo bem, sem pressa. Dá pra ativar depois em Você. Sem a permissão, o
              bloqueio fica pausado.
            </Body>
          </Card>
        ) : null}
      </ScrollView>
      <View className="gap-2 pb-6">
        {status === 'granted' ? (
          <Button label="Continuar" variant="cta" fullWidth onPress={goToPaywall} />
        ) : status === 'denied' ? (
          <>
            <Button
              label="Tentar novamente"
              variant="cta"
              fullWidth
              loading={busy}
              loadingLabel="Aguarde..."
              onPress={() => void request()}
            />
            <Button
              label="Continuar mesmo assim"
              variant="ghost"
              fullWidth
              onPress={goToPaywall}
            />
          </>
        ) : (
          <>
            <Button
              label="Permitir"
              variant="cta"
              fullWidth
              loading={busy}
              loadingLabel="Aguarde..."
              onPress={() => void request()}
            />
            <Button
              label="Ativar depois"
              variant="ghost"
              fullWidth
              onPress={goToPaywall}
            />
          </>
        )}
      </View>
    </Screen>
  );
}
