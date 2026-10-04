import type { SQLiteDatabase } from 'expo-sqlite';

export const migrations = [
  `CREATE TABLE IF NOT EXISTS focus_sessions (id TEXT PRIMARY KEY NOT NULL, started_at TEXT NOT NULL, ended_at TEXT, planned_minutes INTEGER NOT NULL, completed_minutes INTEGER NOT NULL, mode TEXT NOT NULL, status TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS schedules (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, days TEXT NOT NULL, start_min INTEGER NOT NULL, end_min INTEGER NOT NULL, enabled INTEGER NOT NULL, apps_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS blocked_apps (id TEXT PRIMARY KEY NOT NULL, platform_ref TEXT NOT NULL, label TEXT NOT NULL, enabled INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS releases (app_id TEXT PRIMARY KEY NOT NULL, released_until TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS day_log (date TEXT PRIMARY KEY NOT NULL, focus_minutes INTEGER NOT NULL DEFAULT 0, schedules_kept INTEGER NOT NULL DEFAULT 0, watered INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);`,
];

export async function runMigrations(db: SQLiteDatabase) {
  await db.execAsync(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY NOT NULL, applied_at TEXT NOT NULL)',
  );
  for (const [index, sql] of migrations.entries()) {
    const version = index + 1;
    const applied = await db.getFirstAsync<{ version: number }>(
      'SELECT version FROM schema_migrations WHERE version = ?',
      version,
    );
    if (applied) continue;
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
      await db.runAsync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        version,
        new Date().toISOString(),
      );
    });
  }
}
