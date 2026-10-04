import { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView className="flex-1 bg-bg px-page">{children}</SafeAreaView>;
}
