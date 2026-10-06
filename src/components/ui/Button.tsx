import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PressableProps } from 'react-native';

export type ButtonVariant = 'primary' | 'cta' | 'secondary' | 'ghost';
export type ButtonSize = 'default' | 'large';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, { button: string; text: string }> = {
  primary: {
    button: 'bg-primary dark:bg-dark-primary',
    text: 'text-surface dark:text-dark-text',
  },
  cta: {
    button: 'bg-cta dark:bg-dark-cta',
    text: 'text-text dark:text-dark-bg',
  },
  secondary: {
    button: 'bg-primarySoft dark:bg-dark-surface',
    text: 'text-primary dark:text-dark-text',
  },
  ghost: {
    button: 'bg-transparent dark:bg-transparent',
    text: 'text-primary dark:text-dark-text',
  },
};

export function Button({
  label,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  loading = false,
  loadingLabel = 'Carregando',
  icon,
  disabled = false,
  onPress,
  accessibilityState,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = variantClasses[variant];

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        busy: loading,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      className={`min-h-12 flex-row items-center justify-center gap-2 rounded-button px-4 ${
        size === 'large' ? 'py-4' : 'py-3'
      } ${fullWidth ? 'w-full' : ''} ${classes.button} ${className ?? ''}`}
    >
      {icon ? <View>{icon}</View> : null}
      <Text className={`text-center font-inter text-button ${classes.text}`}>
        {loading ? loadingLabel : label}
      </Text>
    </Pressable>
  );
}
