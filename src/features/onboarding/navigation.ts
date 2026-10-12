import { useFocusEffect, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { AUTO_ADVANCE_MS, nextStepHref, type OnboardingStep } from './steps';

type Router = ReturnType<typeof useRouter>;

// Descarta o histórico do onboarding antes de abrir as abas.
export function enterApp(router: Router, notice?: string) {
  if (router.canDismiss?.()) router.dismissAll();
  router.replace({
    pathname: '/(tabs)',
    params: notice ? { aviso: notice } : {},
  } as Href);
}

// Android: o botão voltar não atravessa telas transitórias nem o onboarding.
// Só vale com a tela em foco, para não bloquear telas abertas por cima dela.
export function useBlockAndroidBack(enabled = true) {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );
      return () => subscription.remove();
    }, [enabled]),
  );
}

export function useAutoAdvance(step: OnboardingStep) {
  const router = useRouter();
  useBlockAndroidBack();
  useEffect(() => {
    const timer = setTimeout(() => router.replace(nextStepHref(step)), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [router, step]);
}
