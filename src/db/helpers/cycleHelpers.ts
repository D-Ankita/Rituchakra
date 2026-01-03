import { eq, isNull, desc, isNotNull, sql } from 'drizzle-orm';
import { db } from '../database';
import { cycles } from '../schema';
import { CycleHistory } from '../../types/cycle';

export async function getCurrentCycle() {
  const result = db
    .select()
    .from(cycles)
    .where(isNull(cycles.endDate))
    .orderBy(desc(cycles.startDate))
    .limit(1)
    .get();
  return result ?? null;
}

export async function getCompletedCycles(limit = 12) {
  return db
    .select()
    .from(cycles)
    .where(isNotNull(cycles.endDate))
    .orderBy(desc(cycles.startDate))
    .limit(limit)
    .all();
}

export async function getCycleHistory(limit = 12): Promise<CycleHistory[]> {
  const completed = await getCompletedCycles(limit);
  return completed
    .filter((c) => c.endDate !== null && c.length !== null)
    .map((c) => ({
      length: c.length!,
      startDate: new Date(c.startDate),
      endDate: new Date(c.endDate!),
    }));
}

export async function startNewCycle(startDate: Date) {
  const now = Date.now();
  const result = db
    .insert(cycles)
    .values({
      startDate: startDate.getTime(),
      isPredicted: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
  return result;
}

export async function endCycle(cycleId: number, endDate: Date) {
  const cycle = db.select().from(cycles).where(eq(cycles.id, cycleId)).get();
  if (!cycle) return null;

  const lengthDays = Math.round(
    (endDate.getTime() - cycle.startDate) / (1000 * 60 * 60 * 24)
  );

  return db
    .update(cycles)
    .set({
      endDate: endDate.getTime(),
      length: lengthDays,
      updatedAt: Date.now(),
    })
    .where(eq(cycles.id, cycleId))
    .returning()
    .get();
}

export async function getCycleCount(): Promise<number> {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(cycles)
    .where(isNotNull(cycles.endDate))
    .get();
  return result?.count ?? 0;
}
