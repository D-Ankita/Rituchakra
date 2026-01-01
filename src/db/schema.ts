import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const cycles = sqliteTable('cycles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  startDate: integer('start_date').notNull(), // timestamp ms
  endDate: integer('end_date'),
  length: integer('length'),
  isPredicted: integer('is_predicted', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const dailyLogs = sqliteTable('daily_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: integer('date').notNull(), // timestamp ms (midnight)
  cycleId: integer('cycle_id').notNull().references(() => cycles.id),
  cycleDay: integer('cycle_day').notNull(),
  phase: text('phase').notNull(), // menstrual|follicular|ovulation|luteal
  flowLevel: text('flow_level').notNull().default('none'), // none|light|medium|heavy
  symptoms: text('symptoms').notNull().default('[]'), // JSON array
  mood: text('mood'),
  energy: integer('energy'), // 1-5
  sleepQuality: integer('sleep_quality'), // 1-5
  sleepHours: real('sleep_hours'),
  notes: text('notes'),
  medications: text('medications'), // JSON array
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const predictions = sqliteTable('predictions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cycleId: integer('cycle_id').references(() => cycles.id),
  predictedStart: integer('predicted_start').notNull(), // timestamp ms
  predictedEnd: integer('predicted_end').notNull(),
  confidence: text('confidence').notNull(), // low|moderate|high
  factors: text('factors').notNull().default('[]'), // JSON array
  createdAt: integer('created_at').notNull(),
});

export const phaseInsights = sqliteTable('phase_insights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phase: text('phase').notNull(),
  avgDuration: real('avg_duration').notNull(),
  commonSymptoms: text('common_symptoms').notNull().default('[]'), // JSON array
  commonMoods: text('common_moods').notNull().default('[]'), // JSON array
  personalizedMessage: text('personalized_message'),
  cycleCount: integer('cycle_count').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
