import { z } from 'zod';
import { distractionCatalog } from '@/features/blocking/catalog';

export const QUIZ_TOTAL = 5;

export type QuizKey = 'dailyUsage' | 'apps' | 'goal' | 'worstTime' | 'recoverTarget';

export type QuizQuestion = {
  key: QuizKey;
  title: string;
  multiple: boolean;
  required: boolean;
  options: readonly { id: string; label: string }[];
};

// P1 e P3 vêm do mapa do protótipo; P2 usa o catálogo provisório e P4/P5 têm
// opções provisórias (D-06).
export const quizQuestions: readonly QuizQuestion[] = [
  {
    key: 'dailyUsage',
    title: 'Quanto tempo você passa no celular por dia?',
    multiple: false,
    required: true,
    options: [
      { id: 'lt1', label: 'Menos de 1h' },
      { id: '1to3', label: '1 a 3h' },
      { id: '3to5', label: '3 a 5h' },
      { id: 'gt5', label: '5h ou mais' },
    ],
  },
  {
    key: 'apps',
    title: 'Quais apps mais prendem sua atenção?',
    multiple: true,
    required: false,
    options: distractionCatalog,
  },
  {
    key: 'goal',
    title: 'O que você quer ganhar com mais tempo?',
    multiple: false,
    required: true,
    options: [
      { id: 'study', label: 'Estudar' },
      { id: 'work', label: 'Trabalhar' },
      { id: 'sleep', label: 'Dormir' },
      { id: 'free', label: 'Tempo livre' },
    ],
  },
  {
    key: 'worstTime',
    title: 'Em que momento do dia você mais se distrai?',
    multiple: false,
    required: true,
    options: [
      { id: 'morning', label: 'De manhã' },
      { id: 'afternoon', label: 'À tarde' },
      { id: 'night', label: 'À noite' },
      { id: 'dawn', label: 'De madrugada' },
    ],
  },
  {
    key: 'recoverTarget',
    title: 'Quanto tempo você quer proteger por dia?',
    multiple: false,
    required: true,
    options: [
      { id: 'one', label: 'Cerca de 1h' },
      { id: 'two', label: 'Cerca de 2h' },
      { id: 'three', label: '3h ou mais' },
    ],
  },
];

const optionIds = (key: QuizKey) =>
  quizQuestions.find((question) => question.key === key)!.options.map(({ id }) => id);
const oneOf = (key: QuizKey) => z.enum(optionIds(key) as [string, ...string[]]);

export const quizAnswersSchema = z.object({
  dailyUsage: oneOf('dailyUsage').optional(),
  apps: z.array(oneOf('apps')).optional(),
  goal: oneOf('goal').optional(),
  worstTime: oneOf('worstTime').optional(),
  recoverTarget: oneOf('recoverTarget').optional(),
});

export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

export function parseStoredAnswers(raw: string | null): QuizAnswers {
  if (!raw) return {};
  try {
    const parsed = quizAnswersSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function parseQuizStep(step: unknown): number | null {
  const value = Array.isArray(step) ? step[0] : step;
  if (typeof value !== 'string' || !/^[1-5]$/.test(value)) return null;
  return Number(value);
}

export function isAnswered(question: QuizQuestion, answers: QuizAnswers) {
  return !question.required || answers[question.key] !== undefined;
}
