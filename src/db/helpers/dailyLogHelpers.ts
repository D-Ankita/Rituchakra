import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '../database';
import { dailyLogs } from '../schema';
import { FlowLevel, Mood, Symptom } from '../../types/log';
import { Phase } from '../../types/phase';

interface CreateLogInput {
  date: Date;
  cycleId: number;
  cycleDay: number;
  phase: Phase;
  flowLevel: FlowLevel;
  symptoms: Symptom[];
  mood?: Mood | null;
  energy?: number | null;
  sleepQuality?: number | null;
  sleepHours?: number | null;
  notes?: string | null;
  medications?: string[] | null;
}

function getMidnight(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export async function getLogForDate(date: Date) {
  const midnight = getMidnight(date);
  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.date, midnight))
    .get() ?? null;
}

export async function getLogsForCycle(cycleId: number) {
  return db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.cycleId, cycleId))
    .orderBy(dailyLogs.date)
    .all();
}

export async function getLogsInRange(startDate: Date, endDate: Date) {
  return db
    .select()
    .from(dailyLogs)
    .where(
      and(
        gte(dailyLogs.date, getMidnight(startDate)),
        lte(dailyLogs.date, getMidnight(endDate))
      )
    )
    .orderBy(dailyLogs.date)
    .all();
}

export async function createOrUpdateLog(input: CreateLogInput) {
  const midnight = getMidnight(input.date);
  const now = Date.now();

  const existing = await getLogForDate(input.date);

  if (existing) {
    return db
      .update(dailyLogs)
      .set({
        cycleDay: input.cycleDay,
        phase: input.phase,
        flowLevel: input.flowLevel,
        symptoms: JSON.stringify(input.symptoms),
        mood: input.mood ?? null,
        energy: input.energy ?? null,
        sleepQuality: input.sleepQuality ?? null,
        sleepHours: input.sleepHours ?? null,
        notes: input.notes ?? null,
        medications: input.medications ? JSON.stringify(input.medications) : null,
        updatedAt: now,
      })
      .where(eq(dailyLogs.id, existing.id))
      .returning()
      .get();
  }

  return db
    .insert(dailyLogs)
    .values({
      date: midnight,
      cycleId: input.cycleId,
      cycleDay: input.cycleDay,
      phase: input.phase,
      flowLevel: input.flowLevel,
      symptoms: JSON.stringify(input.symptoms),
      mood: input.mood ?? null,
      energy: input.energy ?? null,
      sleepQuality: input.sleepQuality ?? null,
      sleepHours: input.sleepHours ?? null,
      notes: input.notes ?? null,
      medications: input.medications ? JSON.stringify(input.medications) : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();
}

export async function getAllLogs(limit = 365) {
  return db
    .select()
    .from(dailyLogs)
    .orderBy(desc(dailyLogs.date))
    .limit(limit)
    .all();
}
