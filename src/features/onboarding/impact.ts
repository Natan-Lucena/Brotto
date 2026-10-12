import type { QuizAnswers } from './quiz';

const HOURS_BY_USAGE: Record<string, number> = {
  lt1: 0.75,
  '1to3': 2,
  '3to5': 4,
  gt5: 6,
};
const DEFAULT_HOURS = 4;

export function impactDaysPerYear(dailyUsage?: string) {
  const known =
    dailyUsage !== undefined && Object.hasOwn(HOURS_BY_USAGE, dailyUsage)
      ? HOURS_BY_USAGE[dailyUsage]
      : undefined;
  const hours = known !== undefined && Number.isFinite(known) ? known : DEFAULT_HOURS;
  return Math.round((hours * 365) / 24);
}

const phrases: Record<string, string> = {
  study: 'Tempo de sobra para estudar sem pressa.',
  work: 'Mais fôlego para o que importa no trabalho.',
  sleep: 'Noites mais calmas e sono de verdade.',
  free: 'Tempo livre de verdade, só seu.',
};

export function impactPhrase(goal?: QuizAnswers['goal']) {
  const key = goal ?? 'free';
  return (Object.hasOwn(phrases, key) ? phrases[key] : undefined) ?? phrases.free!;
}
