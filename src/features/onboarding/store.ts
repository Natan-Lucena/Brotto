import { create } from 'zustand';
import { appStateRepository } from '@/services/db';
import { parseStoredAnswers, type QuizAnswers } from './quiz';

export const ANSWERS_KEY = 'onboarding.answers';

type OnboardingState = {
  answers: QuizAnswers;
  hydrated: boolean;
  // Leitura inicial concluída (com sucesso ou não).
  ready: boolean;
  hydrate: () => Promise<void>;
  setAnswers: (patch: QuizAnswers) => void;
  persist: () => Promise<void>;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  answers: {},
  hydrated: false,
  ready: false,
  async hydrate() {
    if (get().hydrated) return;
    set({ hydrated: true });
    try {
      const stored = parseStoredAnswers(await appStateRepository.get(ANSWERS_KEY));
      // Respostas dadas nesta sessão vencem as salvas.
      set((state) => ({ answers: { ...stored, ...state.answers } }));
    } catch {
      // Falha de leitura equivale a "sem respostas salvas".
    }
    set({ ready: true });
  },
  setAnswers(patch) {
    set((state) => ({ answers: { ...state.answers, ...patch } }));
  },
  async persist() {
    try {
      await appStateRepository.set(ANSWERS_KEY, JSON.stringify(get().answers));
    } catch {
      // O fluxo continua em memória.
    }
  },
}));
