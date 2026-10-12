import { beforeEach, describe, expect, it, vi } from 'vitest';
import { greetingForHour } from '@/lib/date';
import { formatBRL, formatMinutes } from '@/lib/format';
import { memory, resetMemory } from '@/test-utils/mocks';
import { impactDaysPerYear, impactPhrase } from '../impact';
import { isAnswered, parseQuizStep, parseStoredAnswers, quizQuestions } from '../quiz';
import {
  nextStep,
  nextStepHref,
  onboardingSteps,
  previousStep,
  SOCIAL_PROOF_ENABLED,
} from '../steps';
import { ANSWERS_KEY, useOnboardingStore } from '../store';

vi.mock('@/services/db', async () => (await import('@/test-utils/mocks')).dbFactory());

describe('impact', () => {
  it('maps the four usage ranges and the default to days per year', () => {
    expect(['lt1', '1to3', '3to5', 'gt5'].map(impactDaysPerYear)).toEqual([
      11, 30, 61, 91,
    ]);
    expect(impactDaysPerYear()).toBe(61);
    expect(impactDaysPerYear('invalid')).toBe(61);
    expect(Number.isNaN(impactDaysPerYear(undefined))).toBe(false);
  });

  it('uses gain language per goal and a default', () => {
    const phrases = ['study', 'work', 'sleep', 'free', undefined].map(impactPhrase);
    expect(new Set(phrases).size).toBe(4);
    expect(phrases[4]).toBe(phrases[3]);
    expect(phrases.join(' ')).not.toMatch(/perd/i);
  });
});

describe('steps', () => {
  it('keeps the order with calculando and without social proof (D-01)', () => {
    expect(SOCIAL_PROOF_ENABLED).toBe(false);
    expect(onboardingSteps).toEqual([
      'splash',
      'boas-vindas',
      'quiz',
      'calculando',
      'impacto',
      'conheca',
      'permissoes',
      'paywall',
      'setup',
    ]);
    expect(nextStep('conheca')).toBe('permissoes');
    expect(previousStep('impacto')).toBe('calculando');
    expect(previousStep('splash')).toBeNull();
    expect(nextStep('setup')).toBeNull();
    expect(nextStepHref('boas-vindas')).toBe('/(onboarding)/quiz/1');
  });
});

describe('quiz', () => {
  it('validates required questions and allows an empty P2', () => {
    const [p1, p2] = quizQuestions;
    expect(isAnswered(p1!, {})).toBe(false);
    expect(isAnswered(p1!, { dailyUsage: '1to3' })).toBe(true);
    expect(isAnswered(p2!, {})).toBe(true);
  });

  it('discards invalid stored answers', () => {
    expect(parseStoredAnswers(null)).toEqual({});
    expect(parseStoredAnswers('{not json')).toEqual({});
    expect(parseStoredAnswers('{"dailyUsage":"nope"}')).toEqual({});
    expect(parseStoredAnswers('{"dailyUsage":"gt5","apps":["tiktok"]}')).toEqual({
      dailyUsage: 'gt5',
      apps: ['tiktok'],
    });
  });

  it('parses the route step', () => {
    expect([1, 5].map((n) => parseQuizStep(String(n)))).toEqual([1, 5]);
    expect(['0', '6', 'a', undefined, '1.5'].map(parseQuizStep)).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
  });
});

describe('onboarding store', () => {
  beforeEach(() => {
    resetMemory();
    useOnboardingStore.setState({ answers: {}, hydrated: false, ready: false });
  });

  it('hydrates saved answers and keeps session answers on top', async () => {
    memory.state.set(ANSWERS_KEY, '{"goal":"study","dailyUsage":"lt1"}');
    useOnboardingStore.getState().setAnswers({ dailyUsage: 'gt5' });
    await useOnboardingStore.getState().hydrate();
    expect(useOnboardingStore.getState().answers).toEqual({
      goal: 'study',
      dailyUsage: 'gt5',
    });
  });

  it('persists answers and survives write and read failures', async () => {
    useOnboardingStore.getState().setAnswers({ goal: 'sleep' });
    await useOnboardingStore.getState().persist();
    expect(memory.state.get(ANSWERS_KEY)).toBe('{"goal":"sleep"}');
    memory.failWrites = true;
    await expect(useOnboardingStore.getState().persist()).resolves.toBeUndefined();
    memory.failReads = true;
    useOnboardingStore.setState({ hydrated: false, ready: false });
    await expect(useOnboardingStore.getState().hydrate()).resolves.toBeUndefined();
  });
});

describe('helpers', () => {
  it('greets by local hour boundaries', () => {
    expect([0, 11, 12, 17, 18, 23].map(greetingForHour)).toEqual([
      'Bom dia',
      'Bom dia',
      'Boa tarde',
      'Boa tarde',
      'Boa noite',
      'Boa noite',
    ]);
  });

  it('formats BRL and minutes', () => {
    expect(formatBRL(9.9)).toBe('R$ 9,90');
    expect(formatBRL(8.32)).toBe('R$ 8,32');
    expect(formatBRL(1234.5)).toBe('R$ 1.234,50');
    expect(formatBRL(Number.NaN)).toBe('R$ 0,00');
    expect(formatMinutes(0)).toBe('0 min');
    expect(formatMinutes(25)).toBe('25 min');
  });
});
