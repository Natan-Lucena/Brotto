import { Pressable, Text, View } from 'react-native';

export type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit: string;
  disabled?: boolean;
  className?: string;
};

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  unit,
  disabled = false,
  className,
}: StepperProps) {
  const finiteMin = Number.isFinite(min) ? min : 0;
  const finiteMax = Number.isFinite(max) ? max : Number.MAX_SAFE_INTEGER;
  const safeMin = Math.min(finiteMin, finiteMax);
  const safeMax = Math.max(finiteMin, finiteMax);
  const finiteValue = Number.isFinite(value) ? value : safeMin;
  const safeValue = Math.min(safeMax, Math.max(safeMin, finiteValue));
  const validStep = Number.isFinite(step) && step > 0;
  const decreaseDisabled = disabled || !validStep || safeValue <= safeMin;
  const increaseDisabled = disabled || !validStep || safeValue >= safeMax;
  const valueText = `${safeValue} ${unit}`;

  return (
    <View className={className}>
      <Text className="mb-2 font-inter text-bodyStrong text-text dark:text-dark-text">
        {label}
      </Text>
      <View className="flex-row items-center justify-between rounded-button border border-border bg-surface dark:border-dark-border dark:bg-dark-surface">
        <Pressable
          accessibilityLabel={`Diminuir ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: decreaseDisabled }}
          className="min-h-12 min-w-12 items-center justify-center rounded-button active:bg-primarySoft dark:active:bg-dark-primarySoft"
          disabled={decreaseDisabled}
          onPress={() => {
            if (!decreaseDisabled) onChange(Math.max(safeMin, safeValue - step));
          }}
        >
          <Text className="font-inter text-h2 text-primary dark:text-dark-primary">
            -
          </Text>
        </Pressable>
        <View
          accessible
          accessibilityLabel={label}
          accessibilityRole="adjustable"
          accessibilityState={{ disabled }}
          accessibilityValue={{
            min: safeMin,
            max: safeMax,
            now: safeValue,
            text: valueText,
          }}
          className="min-h-12 flex-1 items-center justify-center bg-surface dark:bg-dark-surface"
        >
          <Text className="font-inter text-bodyStrong text-text dark:text-dark-text">
            {valueText}
          </Text>
        </View>
        <Pressable
          accessibilityLabel={`Aumentar ${label}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: increaseDisabled }}
          className="min-h-12 min-w-12 items-center justify-center rounded-button active:bg-primarySoft dark:active:bg-dark-primarySoft"
          disabled={increaseDisabled}
          onPress={() => {
            if (!increaseDisabled) onChange(Math.min(safeMax, safeValue + step));
          }}
        >
          <Text className="font-inter text-h2 text-primary dark:text-dark-primary">
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
