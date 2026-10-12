import { useQuery } from '@tanstack/react-query';
import { getStageForDays } from '@/features/streak';
import { localDayKey } from '@/lib/date';
import type { SelectedApp } from '@/services/blocking';
import { appStateRepository, blockedAppsRepository, getDatabase } from '@/services/db';

export type HomeState = {
  blockActive: boolean;
  focusMinutes: number;
  streakDays: number;
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  apps: SelectedApp[];
};

export const homeQueryKey = ['home'] as const;

// Lê apenas dados locais reais; sem registros, tudo zero.
export async function loadHomeState(today = new Date()): Promise<HomeState> {
  const [active, apps, db] = await Promise.all([
    appStateRepository.get('block.active'),
    blockedAppsRepository.list(),
    getDatabase(),
  ]);
  const todayRow = await db.getFirstAsync<{ focus_minutes: number }>(
    'SELECT focus_minutes FROM day_log WHERE date = ?',
    localDayKey(today),
  );
  const watered = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM day_log WHERE watered = 1 ORDER BY date DESC',
  );
  let streakDays = 0;
  const cursor = new Date(today);
  // O dia de hoje ainda pode ser regado: só conta a partir de ontem se não for.
  if (!watered.some((row) => row.date === localDayKey(cursor)))
    cursor.setDate(cursor.getDate() - 1);
  while (watered.some((row) => row.date === localDayKey(cursor))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    blockActive: active === 'true',
    focusMinutes: Math.max(0, todayRow?.focus_minutes ?? 0),
    streakDays,
    stage: getStageForDays(streakDays, 0) as HomeState['stage'],
    apps,
  };
}

export function useHomeState() {
  return useQuery({ queryKey: homeQueryKey, queryFn: () => loadHomeState() });
}
