import { Pressable, Text, View } from 'react-native';

export type ToastTone = 'default' | 'success' | 'error';

export type ToastProps = {
  message: string;
  visible?: boolean;
  tone?: ToastTone;
  actionLabel?: string;
  onAction?: () => void;
};

const toneClasses: Record<ToastTone, { background: string; foreground: string }> = {
  default: {
    background: 'bg-text dark:bg-dark-bg',
    foreground: 'text-surface dark:text-dark-text',
  },
  success: {
    background: 'bg-success dark:bg-dark-success',
    foreground: 'text-dark-bg dark:text-dark-bg',
  },
  error: {
    background: 'bg-error dark:bg-dark-error',
    foreground: 'text-dark-bg dark:text-dark-bg',
  },
};

export function Toast({
  message,
  visible = true,
  tone = 'default',
  actionLabel,
  onAction,
}: ToastProps) {
  if (!visible) {
    return null;
  }

  const isError = tone === 'error';

  return (
    <View
      className={`absolute bottom-[102px] left-5 right-5 flex-row items-center gap-3 rounded-[14px] px-4 py-[14px] ${toneClasses[tone].background}`}
    >
      <Text
        accessible
        accessibilityLiveRegion={isError ? 'assertive' : 'polite'}
        accessibilityRole={isError ? 'alert' : undefined}
        className={`flex-1 text-center font-inter text-caption ${toneClasses[tone].foreground}`}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          className="min-h-12 justify-center px-2"
        >
          <Text
            className={`font-inter text-caption font-semibold ${toneClasses[tone].foreground}`}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
