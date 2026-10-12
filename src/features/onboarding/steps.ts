import type { Href } from 'expo-router';

// D-01: sem conteúdo real de prova social, a etapa fica fora do fluxo.
export const SOCIAL_PROOF_ENABLED = false;

const allSteps = [
  'splash',
  'boas-vindas',
  'quiz',
  'calculando',
  'impacto',
  'conheca',
  'prova-social',
  'permissoes',
  'paywall',
  'setup',
] as const;

export type OnboardingStep = (typeof allSteps)[number];

export const onboardingSteps: readonly OnboardingStep[] = allSteps.filter(
  (step) => step !== 'prova-social' || SOCIAL_PROOF_ENABLED,
);

export const AUTO_ADVANCE_MS = 1500;

export function stepHref(step: OnboardingStep): Href {
  return (step === 'quiz' ? '/(onboarding)/quiz/1' : `/(onboarding)/${step}`) as Href;
}

export function nextStep(step: OnboardingStep): OnboardingStep | null {
  return onboardingSteps[onboardingSteps.indexOf(step) + 1] ?? null;
}

export function previousStep(step: OnboardingStep): OnboardingStep | null {
  const index = onboardingSteps.indexOf(step);
  return index > 0 ? onboardingSteps[index - 1]! : null;
}

export function nextStepHref(step: OnboardingStep): Href {
  const next = nextStep(step);
  if (!next) throw new Error(`Sem próximo passo depois de ${step}`);
  return stepHref(next);
}
