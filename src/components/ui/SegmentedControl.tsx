import { Pressable, Text, View } from 'react-native';

export type SegmentedControlOption<T extends string | number> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SegmentedControlProps<T extends string | number> = {
  accessibilityLabel: string;
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string | number>({
  accessibilityLabel,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      accessibilityState={{ disabled }}
      className={`flex-row gap-2 rounded-button bg-primarySoft p-1 dark:bg-dark-primarySoft ${className ?? ''}`.trim()}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const optionDisabled = disabled || option.disabled === true;

        return (
          <Pressable
            key={option.value}
            accessibilityLabel={option.label}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: optionDisabled }}
            className={`min-h-12 flex-1 items-center justify-center rounded-button px-3 ${
              selected
                ? 'bg-primary dark:bg-dark-primary'
                : 'bg-transparent dark:bg-transparent'
            }`}
            disabled={optionDisabled}
            onPress={() => {
              if (!optionDisabled) onChange(option.value);
            }}
          >
            <Text
              className={`font-inter text-button ${
                selected
                  ? 'text-surface dark:text-dark-text'
                  : 'text-text dark:text-dark-text'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
