import type { ExpoConfig } from 'expo/config';

type BrottoExpoConfig = ExpoConfig & { splash: { backgroundColor: string } };

const config: BrottoExpoConfig = {
  name: 'Brotto',
  slug: 'brotto',
  scheme: 'brotto',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.brotto.app',
    // Future entitlement: com.apple.developer.family-controls; an App Group; and
    // the Device Activity Monitor, Shield Configuration and Shield Action iOS extensions.
  },
  android: {
    package: 'com.brotto.app',
    // Future: PACKAGE_USAGE_STATS, Accessibility service, SYSTEM_ALERT_WINDOW and
    // REQUEST_IGNORE_BATTERY_OPTIMIZATIONS require native implementation and are not enabled.
  },
  splash: { backgroundColor: '#FBF7F0' },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { backgroundColor: '#FBF7F0' }],
    'expo-secure-store',
    'expo-sqlite',
    'expo-notifications',
    'expo-build-properties',
  ],
  experiments: { typedRoutes: true },
};

export default config;
