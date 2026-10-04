import { defineConfig } from 'vitest/config';
import { reactNative } from 'vitest-native';

export default defineConfig({
  plugins: [reactNative({ engine: 'mock' })],
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  test: { globals: true },
});
