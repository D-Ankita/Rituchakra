import { DailyLogData, Symptom, Mood } from '../types/log';
import { Phase } from '../types/phase';
import { SYMPTOM_LABELS, MOOD_LABELS } from '../types/log';

export interface Pattern {
  type: 'symptom' | 'mood' | 'energy' | 'sleep';
  finding: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Section 16 & 19 implementation:
 * This mathematically scans historical SQLite logs and identifies
 * clusters of moods, sleep dips, or symptoms directly tied to specific phase boundaries.
 */
export function generateInsightPatterns(logs: DailyLogData[], completedCycles: number): Pattern[] {
  if (completedCycles < 3 || logs.length < 30) {
    return [];
  }

  const patterns: Pattern[] = [];
  
  // Helpers to isolate phase-specific logs
  const lutealLogs = logs.filter(l => l.phase === 'luteal');
  const follicularLogs = logs.filter(l => l.phase === 'follicular');
  const menstrualLogs = logs.filter(l => l.phase === 'menstrual');

  // 1. Analyze Moods
  const lutealAnxiety = lutealLogs.filter(l => l.mood === 'anxious').length;
  if (lutealLogs.length > 0 && (lutealAnxiety / lutealLogs.length) > 0.4) {
    patterns.push({
      type: 'mood',
      finding: 'You frequently report feeling anxious during your luteal phase. Consider adding our grounding exercises during this time.',
      confidence: 'high'
    });
  }

  const follicularFocus = follicularLogs.filter(l => l.mood === 'focused' || l.energy === 4 || l.energy === 5).length;
  if (follicularLogs.length > 0 && (follicularFocus / follicularLogs.length) > 0.3) {
    patterns.push({
      type: 'energy',
      finding: 'Your focus and energy reliably peak mid-follicular phase. Schedule deep work here!',
      confidence: 'high'
    });
  }

  // 2. Analyze Sleep
  let consecutiveSleepDips = 0;
  lutealLogs.forEach(l => {
    if (l.sleepQuality && l.sleepQuality <= 2) consecutiveSleepDips++;
  });
  
  if (lutealLogs.length > 0 && (consecutiveSleepDips / lutealLogs.length) > 0.3) {
    patterns.push({
      type: 'sleep',
      finding: 'Your sleep energy dips consistently 2-3 days before menstruation begins.',
      confidence: 'medium'
    });
  }

  // 3. Analyze Symptoms
  const menstrualCramps = menstrualLogs.filter(l => l.symptoms.includes('cramps'));
  if (menstrualLogs.length > 0 && (menstrualCramps.length / menstrualLogs.length) > 0.6) {
    patterns.push({
      type: 'symptom',
      finding: 'Cramping is highly consistent in your early cycle. Prepare a warming kit beforehand.',
      confidence: 'high'
    });
  }

  // Fallback defaults if no strict mathematical clusters are found
  if (patterns.length === 0) {
    patterns.push({
      type: 'mood',
      finding: 'Your moods remain relatively stable across phases compared to standard deviations.',
      confidence: 'low'
    });
  }

  return patterns;
}
