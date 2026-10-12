import { Pressable, Text, View } from 'react-native';
import { formatBRL } from '@/lib/format';
import type { Plan } from '@/services/payments';

const BEST_VALUE: Plan['id'] = 'annual';
const MONTHS_PER_YEAR = 12;

export type PlanOptionProps = {
  plan: Plan;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

export function PlanOption({
  plan,
  selected,
  disabled = false,
  onSelect,
}: PlanOptionProps) {
  const isBestValue = plan.id === BEST_VALUE;
  const price = formatBRL(plan.price);
  const monthly = isBestValue
    ? `≈ ${formatBRL(Math.floor((plan.price / MONTHS_PER_YEAR) * 100) / 100)}/mês`
    : null;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={[plan.label, price, monthly, isBestValue && 'Melhor preço']
        .filter(Boolean)
        .join(', ')}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      onPress={onSelect}
      className={`min-h-12 flex-row items-center justify-between rounded-card border-2 bg-surface p-4 dark:bg-dark-surface ${
        selected
          ? 'border-primary dark:border-dark-secondary'
          : 'border-border dark:border-dark-border'
      }`}
    >
      <View className="gap-1">
        <Text className="font-inter text-bodyStrong text-text dark:text-dark-text">
          {plan.label}
        </Text>
        {monthly ? (
          <Text className="font-inter text-caption text-text dark:text-dark-text">
            {monthly}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1">
        {isBestValue ? (
          <Text className="rounded-chip bg-cta px-2 py-1 font-inter text-tag text-text dark:text-dark-bg">
            MELHOR PREÇO
          </Text>
        ) : null}
        <Text className="font-nunito text-h2 text-text dark:text-dark-text">
          {price}
        </Text>
      </View>
    </Pressable>
  );
}
