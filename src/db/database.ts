import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expo = openDatabaseSync('rituchakra.db');

export const db = drizzle(expo, { schema });

export function initializeDatabase() {
  expo.execSync(`
    CREATE TABLE IF NOT EXISTS cycles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date INTEGER NOT NULL,
      end_date INTEGER,
      length INTEGER,
      is_predicted INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date INTEGER NOT NULL,
      cycle_id INTEGER NOT NULL REFERENCES cycles(id),
      cycle_day INTEGER NOT NULL,
      phase TEXT NOT NULL,
      flow_level TEXT NOT NULL DEFAULT 'none',
      symptoms TEXT NOT NULL DEFAULT '[]',
      mood TEXT,
      energy INTEGER,
      sleep_quality INTEGER,
      sleep_hours REAL,
      notes TEXT,
      medications TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cycle_id INTEGER REFERENCES cycles(id),
      predicted_start INTEGER NOT NULL,
      predicted_end INTEGER NOT NULL,
      confidence TEXT NOT NULL,
      factors TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS phase_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase TEXT NOT NULL,
      avg_duration REAL NOT NULL,
      common_symptoms TEXT NOT NULL DEFAULT '[]',
      common_moods TEXT NOT NULL DEFAULT '[]',
      personalized_message TEXT,
      cycle_count INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
    CREATE INDEX IF NOT EXISTS idx_daily_logs_cycle_id ON daily_logs(cycle_id);
    CREATE INDEX IF NOT EXISTS idx_predictions_cycle_id ON predictions(cycle_id);
  `);
}
