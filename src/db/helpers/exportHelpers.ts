import { db } from '../database';
import { cycles, dailyLogs, predictions, phaseInsights } from '../schema';
import { initializeDatabase } from '../database';
import { sql } from 'drizzle-orm';

export async function exportAllData(): Promise<string> {
  const allCycles = db.select().from(cycles).all();
  const allLogs = db.select().from(dailyLogs).all();
  const allPredictions = db.select().from(predictions).all();
  const allInsights = db.select().from(phaseInsights).all();

  const data = {
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    cycles: allCycles,
    dailyLogs: allLogs,
    predictions: allPredictions,
    phaseInsights: allInsights,
  };

  return JSON.stringify(data, null, 2);
}

export async function deleteAllData() {
  db.delete(dailyLogs).run();
  db.delete(predictions).run();
  db.delete(phaseInsights).run();
  db.delete(cycles).run();
}
