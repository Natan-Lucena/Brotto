import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
export async function getDatabase() {
  connection ??= SQLite.openDatabaseAsync('brotto.db');
  const db = await connection;
  await runMigrations(db);
  return db;
}
