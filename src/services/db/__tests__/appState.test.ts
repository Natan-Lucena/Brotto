/* eslint-disable import/first */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rows = new Map<string, string>();
const db = {
  getFirstAsync: vi.fn(async (_sql: string, key: string) =>
    rows.has(key) ? { value: rows.get(key) } : null,
  ),
  runAsync: vi.fn(async (_sql: string, key: string, value: string) => {
    rows.set(key, value);
  }),
  getAllAsync: vi.fn(async () => [
    { id: 'tiktok', platform_ref: 'provisional:tiktok', label: 'TikTok', enabled: 1 },
  ]),
};

vi.mock('../database', () => ({ getDatabase: async () => db }));

import { appStateRepository, blockedAppsRepository } from '../repositories';

describe('appStateRepository', () => {
  beforeEach(() => rows.clear());

  it('returns null for missing keys, stores and overwrites values', async () => {
    expect(await appStateRepository.get('onboarding.completed')).toBeNull();
    await appStateRepository.set('onboarding.completed', 'false');
    await appStateRepository.set('onboarding.completed', 'true');
    expect(await appStateRepository.get('onboarding.completed')).toBe('true');
    expect(db.runAsync.mock.calls[0]![0]).toContain('INSERT OR REPLACE INTO app_state');
  });

  it('lists blocked apps mapped to the service shape', async () => {
    expect(await blockedAppsRepository.list()).toEqual([
      {
        id: 'tiktok',
        platformRef: 'provisional:tiktok',
        label: 'TikTok',
        enabled: true,
      },
    ]);
  });
});
