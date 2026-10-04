import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="bloqueios" options={{ title: 'Bloqueios' }} />
      <Tabs.Screen
        name="foco"
        options={{ title: 'Foco', tabBarLabelStyle: { fontWeight: '700' } }}
      />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda' }} />
      <Tabs.Screen name="voce" options={{ title: 'Você' }} />
    </Tabs>
  );
}
