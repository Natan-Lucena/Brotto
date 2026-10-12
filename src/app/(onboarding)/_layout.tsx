import { Stack } from 'expo-router';

// Gesto de voltar só onde o contrato oferece voltar (quiz e impacto).
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="quiz/[step]" options={{ gestureEnabled: true }} />
      <Stack.Screen name="impacto" options={{ gestureEnabled: true }} />
    </Stack>
  );
}
