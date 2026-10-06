import { Pressable, Text } from 'react-native';
import type { PressableProps } from 'react-native';

export type ChipProps = PressableProps & {
  label: string;
  selected?: boolean;
};

export function Chip({
  label,
  selected = false,
  disabled = false,
  onPress,
  accessibilityState,
  className,
  ...props
}: ChipProps) {
  const isSelected = selected === true;
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        selected: isSelected,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      className={`min-h-12 items-center justify-center rounded-chip px-3 py-2 ${
        isSelected
          ? 'bg-primarySoft dark:bg-dark-primary'
          : 'bg-surface dark:bg-dark-surface'
      } ${className ?? ''}`}
    >
      <Text
        className={`font-inter text-button ${
          isSelected
            ? 'text-primary dark:text-dark-text'
            : 'text-text dark:text-dark-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
