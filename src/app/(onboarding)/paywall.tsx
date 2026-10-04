import { Text, View } from 'react-native';
import { plans } from '@/services/payments';
import { Button, Screen } from '@/components/ui';
export default function Paywall() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-4">
        <Text className="font-nunito text-3xl text-text">
          Volte a cuidar do seu Brotto
        </Text>
        {plans.map((plan) => (
          <Button key={plan.id} label={`${plan.label} · R$ ${plan.price.toFixed(2)}`} />
        ))}
      </View>
    </Screen>
  );
}
