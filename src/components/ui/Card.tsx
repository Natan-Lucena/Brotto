import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import type { PressableProps, ViewProps } from 'react-native';

export type CardVariant = 'surface' | 'soft' | 'outlined';

export type CardProps = PropsWithChildren<
  ViewProps & {
    variant?: CardVariant;
    onPress?: PressableProps['onPress'];
  }
>;

const variantClasses: Record<CardVariant, string> = {
  surface: 'bg-surface dark:bg-dark-surface',
  soft: 'bg-primarySoft dark:bg-dark-surface',
  outlined:
    'border border-border bg-surface dark:border-dark-border dark:bg-dark-surface',
};

export function Card({
  children,
  variant = 'surface',
  onPress,
  className,
  ...props
}: CardProps) {
  const classes = `rounded-card p-4 ${variantClasses[variant]} ${className ?? ''}`;

  if (onPress) {
    return (
      <Pressable
        {...props}
        accessibilityRole="button"
        onPress={onPress}
        className={`min-h-12 ${classes}`}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View {...props} className={classes}>
      {children}
    </View>
  );
}
