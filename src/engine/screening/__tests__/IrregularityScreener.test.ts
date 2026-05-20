import { screenForIrregularity } from '../IrregularityScreener';
import { validateScreeningText } from '../outputValidator';
import { CycleHistory } from '../../../types/cycle';
import { DailyLogData } from '../../../types/log';

function buildCycles(lengths: number[]): CycleHistory[] {
  return lengths.map((length, i) => ({
    length,
    startDate: new Date(2026, 0, 1 + i * 30),
    endDate: new Date(2026, 0, 1 + i * 30 + length),
  }));
}

function buildLogs(
  count: number,
  options: { acne?: boolean; cramps?: boolean } = {}
): DailyLogData[] {
  const symptoms: string[] = [];
  if (options.acne) symptoms.push('acne');
  if (options.cramps) symptoms.push('cramps');
  const symptomsJson = JSON.stringify(symptoms);

  const logs: DailyLogData[] = [];
  for (let i = 0; i < count; i++) {
    logs.push({
      id: i + 1,
      date: Date.now() - i * 86_400_000,
      cycleId: 1,
      cycleDay: (i % 28) + 1,
      phase: 'follicular',
      flowLevel: 'none',
      symptoms: symptomsJson,
      mood: null,
      energy: null,
      sleepQuality: null,
      sleepHours: null,
      notes: null,
      medications: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  return logs;
}

describe('IrregularityScreener', () => {
  describe('minimum data gate', () => {
    it('returns signal=none with "still learning" reason when <3 cycles', () => {
      const r = screenForIrregularity({ cycles: buildCycles([28, 29]) });
      expect(r.signal).toBe('none');
      expect(r.suggestSeeingDoctor).toBe(false);
      expect(r.confidence).toBe('low');
      expect(r.reasons[0]).toMatch(/still learning/i);
    });

    it('returns signal=none with zero cycles', () => {
      const r = screenForIrregularity({ cycles: [] });
      expect(r.signal).toBe('none');
      expect(r.suggestSeeingDoctor).toBe(false);
    });
  });

  describe('regular cycles', () => {
    it('signal=none for tight regular history', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([28, 29, 28, 27, 28, 29]),
      });
      expect(r.signal).toBe('none');
      expect(r.suggestSeeingDoctor).toBe(false);
      expect(r.confidence).toBe('high');
    });

    it('signal=none for mild variation within normal range', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([26, 30, 28, 27, 31, 29]),
      });
      expect(r.signal).toBe('none');
      expect(r.suggestSeeingDoctor).toBe(false);
    });
  });

  describe('irregular cycles', () => {
    it('signal=notable for consistently long cycles', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([42, 45, 38, 50, 40, 44]),
      });
      expect(r.signal).toBe('notable');
      expect(r.suggestSeeingDoctor).toBe(true);
      expect(r.confidence).toBe('high');
      expect(r.reasons.length).toBeGreaterThan(0);
    });

    it('signal=notable for high variability', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([21, 45, 28, 50, 22, 40]),
      });
      expect(r.signal).toBe('notable');
      expect(r.suggestSeeingDoctor).toBe(true);
    });

    it('signal=gentle for borderline pattern', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([28, 36, 29, 37, 30, 28]),
      });
      // 2 of 6 out-of-range → 1pt; sd is moderate → 0–1pt
      expect(['gentle', 'none']).toContain(r.signal);
    });
  });

  describe('suggestSeeingDoctor confidence floor', () => {
    it('does NOT suggest doctor when only 3 cycles even if notable pattern', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([45, 50, 42]),
      });
      expect(r.confidence).toBe('low');
      expect(r.suggestSeeingDoctor).toBe(false);
    });

    it('DOES suggest doctor when 6+ cycles and notable pattern', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([45, 50, 42, 48, 40, 46]),
      });
      expect(r.confidence).toBe('high');
      expect(r.signal).toBe('notable');
      expect(r.suggestSeeingDoctor).toBe(true);
    });
  });

  describe('symptom cluster scoring', () => {
    it('factors persistent acne with variable cycles', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([24, 38, 26, 40, 22, 36]),
        logs: buildLogs(30, { acne: true }),
      });
      expect(['notable', 'gentle']).toContain(r.signal);
      const hasAcneReason = r.reasons.some((x) =>
        /acne/i.test(x)
      );
      expect(hasAcneReason).toBe(true);
    });

    it('ignores symptoms with too few logs', () => {
      const r = screenForIrregularity({
        cycles: buildCycles([28, 29, 28, 27, 28, 29]),
        logs: buildLogs(5, { acne: true, cramps: true }),
      });
      const hasSymptomReason = r.reasons.some(
        (x) => /acne/i.test(x) || /cramp/i.test(x)
      );
      expect(hasSymptomReason).toBe(false);
    });
  });

  describe('guardrail invariant', () => {
    it('every reason from every code path passes the output validator', () => {
      const inputs = [
        { cycles: [] },
        { cycles: buildCycles([28]) },
        { cycles: buildCycles([28, 29, 28, 27, 28, 29]) },
        { cycles: buildCycles([42, 45, 38, 50, 40, 44]) },
        { cycles: buildCycles([21, 45, 28, 50, 22, 40]) },
        {
          cycles: buildCycles([24, 38, 26, 40, 22, 36]),
          logs: buildLogs(30, { acne: true, cramps: true }),
        },
      ];

      for (const input of inputs) {
        const r = screenForIrregularity(input);
        for (const reason of r.reasons) {
          expect(() => validateScreeningText(reason)).not.toThrow();
        }
      }
    });

    it('disclaimerRequired is always true', () => {
      expect(screenForIrregularity({ cycles: [] }).disclaimerRequired).toBe(true);
      expect(
        screenForIrregularity({ cycles: buildCycles([42, 45, 38, 50, 40, 44]) })
          .disclaimerRequired
      ).toBe(true);
    });
  });
});
