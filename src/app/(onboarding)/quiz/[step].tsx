import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Chip, ProgressLeaves, Screen } from '@/components/ui';
import {
  QUIZ_TOTAL,
  isAnswered,
  parseQuizStep,
  quizQuestions,
} from '@/features/onboarding/quiz';
import { stepHref } from '@/features/onboarding/steps';
import { useOnboardingStore } from '@/features/onboarding/store';
import { BackButton, Body, Title, useHydrateAnswers } from '@/features/onboarding/ui';

export default function Quiz() {
  const router = useRouter();
  const { step } = useLocalSearchParams<{ step: string }>();
  useHydrateAnswers();
  const answers = useOnboardingStore((state) => state.answers);
  const setAnswers = useOnboardingStore((state) => state.setAnswers);
  const persist = useOnboardingStore((state) => state.persist);
  // Ref bloqueia toques repetidos antes de o estado re-renderizar.
  const advancing = useRef(false);
  const [busy, setBusy] = useState(false);

  const current = parseQuizStep(step);
  if (current === null) return <Redirect href={stepHref('quiz')} />;

  const question = quizQuestions[current - 1]!;
  const selectedApps = answers.apps ?? [];
  const answered = isAnswered(question, answers);

  function select(id: string) {
    if (question.multiple) {
      setAnswers({
        apps: selectedApps.includes(id)
          ? selectedApps.filter((appId) => appId !== id)
          : [...selectedApps, id],
      });
    } else {
      setAnswers({ [question.key]: id });
    }
  }

  async function proceed() {
    if (advancing.current) return;
    advancing.current = true;
    setBusy(true);
    try {
      await persist();
      router.push(
        (current === QUIZ_TOTAL
          ? '/(onboarding)/calculando'
          : `/(onboarding)/quiz/${current! + 1}`) as Href,
      );
    } finally {
      advancing.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <BackButton />
        <ProgressLeaves
          current={current}
          total={QUIZ_TOTAL}
          accessibilityLabel={`Pergunta ${current} de ${QUIZ_TOTAL}`}
        />
      </View>
      <ScrollView contentContainerClassName="gap-6 py-6" className="flex-1">
        <Title>{question.title}</Title>
        <View
          accessibilityRole={question.multiple ? undefined : 'radiogroup'}
          className="flex-row flex-wrap gap-3"
        >
          {question.options.map((option) => {
            const selected = question.multiple
              ? selectedApps.includes(option.id)
              : answers[question.key] === option.id;
            return (
              <Chip
                key={option.id}
                label={option.label}
                selected={selected}
                onPress={() => select(option.id)}
              />
            );
          })}
        </View>
        {question.multiple ? (
          <Body>{`Selecionados: ${selectedApps.length}`}</Body>
        ) : null}
      </ScrollView>
      <View className="gap-2 pb-6">
        {!answered ? (
          <Body accessibilityLiveRegion="polite" className="text-center">
            Escolhe uma pra eu te conhecer
          </Body>
        ) : null}
        <Button
          label="Continuar"
          variant="cta"
          fullWidth
          disabled={!answered || busy}
          onPress={() => void proceed()}
        />
        {question.multiple ? (
          <Button
            label="Pular essa"
            variant="ghost"
            fullWidth
            disabled={busy}
            onPress={() => {
              if (advancing.current) return;
              setAnswers({ apps: [] });
              void proceed();
            }}
          />
        ) : null}
      </View>
    </Screen>
  );
}
