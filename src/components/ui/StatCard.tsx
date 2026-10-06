import { Text, View } from 'react-native';

export type StatCardProps = {
  tag: string;
  value: string;
  caption?: string;
  size?: 'hero' | 'compact';
  className?: string;
};

export function StatCard({
  tag,
  value,
  caption,
  size = 'hero',
  className,
}: StatCardProps) {
  const accessibilityLabel = [tag, value, caption].filter(Boolean).join(', ');
  const valueSize = size === 'hero' ? 'text-[31px]' : 'text-[25px]';

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className={`gap-[5px] rounded-card bg-surface p-[18px] dark:bg-dark-surface ${className ?? ''}`.trim()}
    >
      <Text className="font-inter text-tag font-semibold text-primary dark:text-dark-secondary">
        {tag}
      </Text>
      <Text
        className={`font-nunito text-primary dark:text-dark-text ${valueSize}`}
        style={{ fontWeight: '800' }}
      >
        {value}
      </Text>
      {caption ? (
        <Text className="font-inter text-caption text-textMuted dark:text-dark-textMuted">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}
