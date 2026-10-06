import type { ReactNode } from 'react';
import {
  Modal as NativeModal,
  type ModalProps,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '../../theme/tokens';

export type BottomSheetVariant = 'sheet' | 'dialog';

export type BottomSheetProps = Omit<
  ModalProps,
  'visible' | 'onRequestClose' | 'children'
> & {
  visible: boolean;
  onClose: () => void;
  variant?: BottomSheetVariant;
  title?: string;
  eyebrow?: string;
  showCloseButton?: boolean;
  children: ReactNode;
};

export function BottomSheet({
  visible,
  onClose,
  variant = 'sheet',
  title,
  eyebrow,
  showCloseButton = false,
  children,
  ...modalProps
}: BottomSheetProps) {
  const colorScheme = useColorScheme();
  const closeIconStroke =
    colorScheme === 'dark' ? tokens.colors.dark.text : tokens.colors.light.text;

  if (!visible) {
    return null;
  }

  const isDialog = variant === 'dialog';

  return (
    <NativeModal
      {...modalProps}
      transparent
      visible
      animationType={isDialog ? 'fade' : 'slide'}
      onRequestClose={onClose}
    >
      <View className="flex-1">
        <Pressable
          accessible={false}
          testID="bottom-sheet-backdrop"
          onPress={onClose}
          className={`absolute inset-0 bg-text/30 dark:bg-dark-bg/70 ${
            isDialog ? 'items-center justify-center px-5' : 'justify-end'
          }`}
        >
          <Pressable
            accessible={false}
            testID="bottom-sheet-content"
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            className={`max-h-[88%] w-full bg-surface px-5 pb-9 pt-3 dark:bg-dark-surface ${
              isDialog ? 'rounded-sheet' : 'rounded-t-sheet'
            }`}
          >
            <View
              accessible={false}
              className="mx-auto h-[5px] w-[42px] rounded-chip bg-border dark:bg-dark-border"
            />
            {eyebrow || title || showCloseButton ? (
              <View className="mt-3 flex-row items-start gap-3">
                <View className="flex-1 gap-1">
                  {eyebrow ? (
                    <Text className="font-inter text-tag uppercase text-textMuted dark:text-dark-textMuted">
                      {eyebrow}
                    </Text>
                  ) : null}
                  {title ? (
                    <Text
                      accessibilityRole="header"
                      className="font-nunito text-h2 text-text dark:text-dark-text"
                    >
                      {title}
                    </Text>
                  ) : null}
                </View>
                {showCloseButton ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                    onPress={onClose}
                    className="min-h-12 min-w-12 items-center justify-center rounded-button"
                  >
                    <Svg
                      testID="bottom-sheet-close-icon"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <Path
                        d="M6 6l12 12M18 6 6 18"
                        fill="none"
                        stroke={closeIconStroke}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
            <View className={eyebrow || title || showCloseButton ? 'mt-4' : 'mt-3'}>
              {children}
            </View>
          </Pressable>
        </Pressable>
      </View>
    </NativeModal>
  );
}
