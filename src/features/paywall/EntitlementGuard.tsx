import { PropsWithChildren } from 'react';
import { Redirect } from 'expo-router';
import { Screen } from '@/components/ui';
import { Body } from '@/features/onboarding/ui';
import { useEntitlement } from './useEntitlement';
export function EntitlementGuard({ children }: PropsWithChildren) {
  const { data, isLoading } = useEntitlement();
  if (isLoading) {
    return (
      <Screen>
        <Body accessibilityLiveRegion="polite" className="flex-1 text-center">
          Carregando...
        </Body>
      </Screen>
    );
  }
  return data?.active ? children : <Redirect href="/(onboarding)/paywall" />;
}
