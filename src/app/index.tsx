import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { appStateRepository } from '@/services/db';

export default function Index() {
  const [completed, setCompleted] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    appStateRepository
      .get('onboarding.completed')
      .then((value) => value === 'true')
      // D-12: falha de leitura equivale a onboarding não concluído.
      .catch(() => false)
      .then((value) => active && setCompleted(value));
    return () => {
      active = false;
    };
  }, []);

  if (completed === null) return null;
  return <Redirect href={completed ? '/(tabs)' : '/(onboarding)/splash'} />;
}
