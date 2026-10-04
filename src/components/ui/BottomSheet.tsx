import { Modal as NativeModal, ModalProps, View } from 'react-native';
export function BottomSheet({ children, ...props }: ModalProps) {
  return (
    <NativeModal transparent animationType="slide" {...props}>
      <View className="flex-1 justify-end bg-text/30">
        <View className="rounded-t-sheet bg-surface p-5">{children}</View>
      </View>
    </NativeModal>
  );
}
