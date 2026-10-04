import { PropsWithChildren } from 'react';
import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useEntitlement } from './useEntitlement';
export function EntitlementGuard({ children }: PropsWithChildren) {
  const { data, isLoading } = useEntitlement();
  if (isLoading) return <Text>Carregando...</Text>;
  return data?.active ? children : <Redirect href="/(onboarding)/paywall" />;
}
