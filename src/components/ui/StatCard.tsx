import { Text } from 'react-native';
import { Card } from './Card';
export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text className="text-textMuted">{label}</Text>
      <Text className="font-nunito text-2xl text-text">{value}</Text>
    </Card>
  );
}
