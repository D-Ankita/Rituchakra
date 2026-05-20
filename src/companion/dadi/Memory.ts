import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/database';
import { companionMemory } from '../../db/schema';
import { MemorySnippet } from '../context/ContextPacket';

export interface MemoryRecord {
  id: number;
  createdAt: number;
  cycleId: number | null;
  cycleDay: number | null;
  phase: string | null;
  summary: string;
  salientTopics: string[];
  sentiment: string | null;
  source: 'conversation' | 'morning_brief' | 'screening';
}

export interface MemoryInsert {
  cycleId?: number | null;
  cycleDay?: number | null;
  phase?: string | null;
  summary: string;
  salientTopics: string[];
  sentiment?: string | null;
  source?: MemoryRecord['source'];
}

/**
 * On-device memory store for Dadi.
 *
 * Retrieval is intentionally simple: keyword overlap + recency
 * decay. No vector DB on-device in v1.
 */

export async function recordMemory(entry: MemoryInsert): Promise<number> {
  const now = Date.now();
  const result = db
    .insert(companionMemory)
    .values({
      createdAt: now,
      cycleId: entry.cycleId ?? null,
      cycleDay: entry.cycleDay ?? null,
      phase: entry.phase ?? null,
      summary: entry.summary,
      salientTopics: JSON.stringify(entry.salientTopics),
      sentiment: entry.sentiment ?? null,
      source: entry.source ?? 'conversation',
      redacted: true,
    })
    .returning()
    .get();
  return result.id;
}

export async function listRecentMemories(limit = 50): Promise<MemoryRecord[]> {
  const rows = db
    .select()
    .from(companionMemory)
    .orderBy(desc(companionMemory.createdAt))
    .limit(limit)
    .all();
  return rows.map(rowToRecord);
}

export async function retrieveRelevantMemories(
  topics: string[],
  limit = 5
): Promise<MemorySnippet[]> {
  const recent = await listRecentMemories(50);
  const now = Date.now();
  const scored = recent.map((m) => ({
    memory: m,
    score: scoreMemory(m, topics, now),
  }));
  scored.sort((a, b) => b.score - a.score);

  return scored
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map(({ memory }) => ({
      ageDays: Math.floor((now - memory.createdAt) / 86_400_000),
      summary: memory.summary,
      topics: memory.salientTopics,
    }));
}

function scoreMemory(m: MemoryRecord, topics: string[], now: number): number {
  const ageDays = (now - m.createdAt) / 86_400_000;
  const recency = Math.exp(-ageDays / 30); // 30-day half-life-ish decay
  const topicOverlap = m.salientTopics.filter((t) =>
    topics.some((q) => q.toLowerCase() === t.toLowerCase())
  ).length;
  if (topics.length === 0) return recency;
  return recency * (1 + topicOverlap * 2);
}

function rowToRecord(row: typeof companionMemory.$inferSelect): MemoryRecord {
  let topics: string[] = [];
  try {
    const parsed = JSON.parse(row.salientTopics);
    if (Array.isArray(parsed)) topics = parsed.map(String);
  } catch {
    /* ignore */
  }
  return {
    id: row.id,
    createdAt: row.createdAt,
    cycleId: row.cycleId,
    cycleDay: row.cycleDay,
    phase: row.phase,
    summary: row.summary,
    salientTopics: topics,
    sentiment: row.sentiment,
    source: (row.source as MemoryRecord['source']) ?? 'conversation',
  };
}
