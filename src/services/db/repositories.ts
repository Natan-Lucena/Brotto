import { getDatabase } from './database';
import { Schedule, SelectedApp } from '@/services/blocking';
export interface FocusSessionRecord {
  id: string;
  startedAt: string;
  endedAt: string | null;
  plannedMinutes: number;
  completedMinutes: number;
  mode: string;
  status: string;
}
export const blockedAppsRepository = {
  async replace(apps: SelectedApp[]) {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.execAsync('DELETE FROM blocked_apps');
      for (const app of apps)
        await db.runAsync(
          'INSERT INTO blocked_apps (id, platform_ref, label, enabled) VALUES (?, ?, ?, ?)',
          app.id,
          app.platformRef,
          app.label,
          Number(app.enabled),
        );
    });
  },
};
export const schedulesRepository = {
  async replace(schedules: Schedule[]) {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.execAsync('DELETE FROM schedules');
      for (const schedule of schedules)
        await db.runAsync(
          'INSERT INTO schedules (id, name, days, start_min, end_min, enabled, apps_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
          schedule.id,
          schedule.name,
          JSON.stringify(schedule.days),
          schedule.startMin,
          schedule.endMin,
          Number(schedule.enabled),
          JSON.stringify(schedule.apps),
        );
    });
  },
};
export const focusSessionsRepository = {
  async save(session: FocusSessionRecord) {
    const db = await getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO focus_sessions (id, started_at, ended_at, planned_minutes, completed_minutes, mode, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      session.id,
      session.startedAt,
      session.endedAt,
      session.plannedMinutes,
      session.completedMinutes,
      session.mode,
      session.status,
    );
  },
};
