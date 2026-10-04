import { Pressable, PressableProps, Text } from 'react-native';

export type ButtonVariant = 'primary' | 'cta' | 'secondary';
export function Button({
  label,
  variant = 'primary',
  ...props
}: PressableProps & { label: string; variant?: ButtonVariant }) {
  const color =
    variant === 'cta'
      ? 'bg-cta'
      : variant === 'secondary'
        ? 'bg-primarySoft'
        : 'bg-primary';
  const text = variant === 'secondary' ? 'text-primary' : 'text-surface';
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-button px-4 py-3 ${color}`}
      {...props}
    >
      <Text className={`text-center font-inter ${text}`}>{label}</Text>
    </Pressable>
  );
}
