import { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';
export function Card({ children, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View className="rounded-card bg-surface p-4" {...props}>
      {children}
    </View>
  );
}
