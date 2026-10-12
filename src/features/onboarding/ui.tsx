import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import type { TextProps } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { useOnboardingStore } from './store';

export function Title({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      accessibilityRole="header"
      className={`font-nunito text-h1 text-text dark:text-dark-text ${className ?? ''}`}
    />
  );
}

export function Body({ className, ...props }: TextProps) {
  return (
    <Text
      {...props}
      className={`font-inter text-body text-text dark:text-dark-text ${className ?? ''}`}
    />
  );
}

export function BackButton() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={() => router.back()}
      className="h-12 w-12 items-center justify-center"
    >
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 5l-7 7 7 7"
          stroke={colors.text}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

export function CheckIcon() {
  const { colors } = useTheme();
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={colors.success}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function useHydrateAnswers() {
  const hydrate = useOnboardingStore((state) => state.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
}
