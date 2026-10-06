import { Switch, SwitchProps, Text, View } from 'react-native';
import { tokens } from '../../theme/tokens';

export type ToggleProps = Omit<SwitchProps, 'onValueChange'> & {
  label: string;
  description?: string;
  onValueChange?: (value: boolean) => void;
};

export function Toggle({
  label,
  description,
  value = false,
  disabled = false,
  onValueChange,
  className,
  ...props
}: ToggleProps) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1">
        <Text className="font-inter text-bodyStrong text-text dark:text-dark-text">
          {label}
        </Text>
        {description ? (
          <Text className="font-inter text-caption text-textMuted dark:text-dark-textMuted">
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        {...props}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        className={`min-h-12 min-w-12 ${className ?? ''}`.trim()}
        disabled={disabled}
        ios_backgroundColor={tokens.colors.light.border}
        onValueChange={(nextValue) => {
          if (!disabled) onValueChange?.(nextValue);
        }}
        thumbColor={tokens.colors.light.surface}
        trackColor={{
          false: tokens.colors.light.border,
          true: tokens.colors.light.primary,
        }}
        value={value}
      />
    </View>
  );
}
