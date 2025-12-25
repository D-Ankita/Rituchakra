import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/common/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useAppStore } from '../../src/stores/useAppStore';
import { PHASE_LABELS, PHASE_DESCRIPTIONS } from '../../src/types/phase';
import { getInsightForDay } from '../../src/utils/insightMessages';
import { PredictionEngine } from '../../src/engine/PredictionEngine';
import { useEffect, useState, useCallback } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { getCycleHistory, startNewCycle, endCycle, getCycleCount } from '../../src/db/helpers/cycleHelpers';
import { createOrUpdateLog } from '../../src/db/helpers/dailyLogHelpers';
import { formatShortDate } from '../../src/utils/dateUtils';
import { differenceInDays } from 'date-fns';
import { getCycleDay, calculatePhase } from '../../src/engine/phaseCalculator';
  const router = useRouter();
export default function HomeScreen() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const currentCycleDay = useCycleStore((s) => s.currentCycleDay);
  const currentCycleId = useCycleStore((s) => s.currentCycleId);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const completedCycleCount = useCycleStore((s) => s.completedCycleCount);
  const setCurrentCycle = useCycleStore((s) => s.setCurrentCycle);
  const setLastPeriodStart = useCycleStore((s) => s.setLastPeriodStart);
  const setCompletedCycleCount = useCycleStore((s) => s.setCompletedCycleCount);

  const predictionMode = useAppStore((s) => s.predictionMode);
  const manualCycleLength = useAppStore((s) => s.manualCycleLength);
  const manualPeriodLength = useAppStore((s) => s.manualPeriodLength);

  const [nextPeriod, setNextPeriod] = useState<string>('');
  const [daysUntilPeriod, setDaysUntilPeriod] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<string>('');

  const ayurvedaEnabled = useAppStore((s) => s.ayurvedaEnabled);

  const phaseColor = colors.phase[currentPhase];
  const phaseLightColor = colors.phaseLight[currentPhase];
  const insight = getInsightForDay(currentPhase, currentCycleDay, ayurvedaEnabled);
  const isMenstrual = currentPhase === 'menstrual';

  const loadPrediction = useCallback(async () => {
    const history = await getCycleHistory();
    if (history.length > 0) {
      const engine = new PredictionEngine();
      const prediction = engine.predict(history, {
        mode: predictionMode,
        manualCycleLength,
        manualPeriodLength,
      });
      setNextPeriod(formatShortDate(prediction.predictedStart));
      setDaysUntilPeriod(
        differenceInDays(prediction.predictedStart, new Date())
      );
      setConfidence(prediction.confidence);
    } else {
      const daysLeft = cycleLength - currentCycleDay;
      setDaysUntilPeriod(daysLeft > 0 ? daysLeft : 0);
      setConfidence('low');
    }
  }, [currentCycleDay, cycleLength, predictionMode, manualCycleLength, manualPeriodLength]);

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  const handlePeriodStarted = () => {
    Alert.alert(
      'Period Started?',
      'This will mark today as the start of a new cycle.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Started',
          onPress: async () => {
            const today = new Date();

            // End previous cycle if one exists
            if (currentCycleId) {
              await endCycle(currentCycleId, today);
            }

            // Start new cycle
            const newCycle = await startNewCycle(today);
            const count = await getCycleCount();
            setCompletedCycleCount(count);
            setCurrentCycle(newCycle.id, 1, 'menstrual');
            setLastPeriodStart(today);

            // Log today with moderate flow
            await createOrUpdateLog({
              date: today,
              cycleId: newCycle.id,
              cycleDay: 1,
              phase: 'menstrual',
              flowLevel: 'medium',
              symptoms: [],
            });

            loadPrediction();
          },
        },
      ]
    );
  };

  const handlePeriodEnded = () => {
    Alert.alert(
      'Period Ended?',
      'This will mark that your bleeding has stopped.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Ended',
          onPress: async () => {
            if (!currentCycleId) return;

            // Log today with no flow
            const today = new Date();
            const day = getCycleDay(
              useCycleStore.getState().lastPeriodStart ?? today,
              today
            );
            const { phase } = calculatePhase(day, cycleLength);

            await createOrUpdateLog({
              date: today,
              cycleId: currentCycleId,
              cycleDay: day,
              phase,
              flowLevel: 'none',
              symptoms: [],
            });

            // Update phase display
            setCurrentCycle(currentCycleId, day, phase);
          },
        },
      ]
    );
  };

  const getConfidenceBadgeStyle = () => {
    if (confidence === 'high') {
      return { backgroundColor: '#E8F5E9' };
    }
    if (confidence === 'moderate') {
      return { backgroundColor: colors.phaseLight.ovulation };
    }
    return { backgroundColor: colors.surfaceAlt };
  };

  const getConfidenceTextColor = () => {
    if (confidence === 'high') {
      return { color: '#2E7D32' };
    }
    if (confidence === 'moderate') {
      return { color: '#8B6914' };
    }
    return { color: colors.text.tertiary };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.appTitle}>RituChakra</Text>
          <TouchableOpacity onPress={() => router.push('/learn' as any)} style={styles.learnButton} activeOpacity={0.7}>
            <View style={styles.learnIconContainer}>
              <Feather name="book-open" size={18} color={colors.phase.menstrual} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Phase Card */}
        <Card style={[styles.phaseCard, { backgroundColor: phaseLightColor, borderColor: phaseColor + '33', borderWidth: 1 }]}>
          <View style={styles.phaseCardInner}>
            <View style={styles.phaseCardLeft}>
              <View style={styles.phaseHeader}>
                <View
                  style={[styles.phaseDot, { backgroundColor: phaseColor }]}
                />
                <Text style={[styles.phaseLabel, { color: phaseColor }]}>
                  {PHASE_LABELS[currentPhase]} Phase
                </Text>
              </View>
              <Text style={styles.phaseDescription}>
                {PHASE_DESCRIPTIONS[currentPhase]}
              </Text>
            </View>
            <View style={styles.phaseCardRight}>
              <View style={[styles.cycleDayCircle, { backgroundColor: phaseColor + '26' }]}>
                <Text style={[styles.cycleDayNumber, { color: phaseColor }]}>
                  {currentCycleDay}
                </Text>
                <Text style={[styles.cycleDayLabel, { color: phaseColor }]}>day</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Period Started / Ended Button */}
        <TouchableOpacity
          style={[
            styles.periodButton,
            isMenstrual
              ? { backgroundColor: colors.phaseLight.follicular, borderColor: colors.phase.follicular }
              : { backgroundColor: colors.phaseLight.menstrual, borderColor: colors.phase.menstrual },
          ]}
          activeOpacity={0.7}
          onPress={isMenstrual ? handlePeriodEnded : handlePeriodStarted}
        >
          <View style={styles.periodButtonContent}>
            <View
              style={[
                styles.periodDot,
                { backgroundColor: isMenstrual ? colors.phase.follicular : colors.phase.menstrual },
              ]}
            />
            <Text
              style={[
                styles.periodButtonText,
                { color: isMenstrual ? colors.phase.follicular : colors.phase.menstrual },
              ]}
            >
              {isMenstrual ? 'Period Ended' : 'Period Started'}
            </Text>
          </View>
          <Text style={styles.periodButtonSub}>
            {isMenstrual ? 'Mark bleeding as stopped' : 'Start a new cycle'}
          </Text>
        </TouchableOpacity>

        {/* Prediction Card */}
        {daysUntilPeriod !== null && (
          <Card style={styles.predictionCard}>
            <Text style={styles.cardTitle}>Next Period</Text>
            <Text style={styles.predictionHero}>
              {daysUntilPeriod > 0 ? `in ${daysUntilPeriod} days` : 'Expected today'}
            </Text>
            {nextPeriod ? (
              <View style={styles.predictionDateRow}>
                <Feather name="calendar" size={14} color={colors.text.tertiary} />
                <Text style={styles.predictionDate}>~{nextPeriod}</Text>
              </View>
            ) : null}
            <View style={[styles.confidenceBadge, getConfidenceBadgeStyle()]}>
              <Text style={[styles.confidenceText, getConfidenceTextColor()]}>
                {confidence} confidence
                {predictionMode === 'manual' ? ' (manual)' : ''}
              </Text>
            </View>
          </Card>
        )}

        {/* Daily Insight */}
        <Card style={[styles.insightCard, { borderLeftColor: phaseColor, borderLeftWidth: 3 }]}>
          <View style={styles.insightTitleRow}>
            <Feather name="zap" size={14} color={phaseColor} />
            <Text style={styles.cardTitle}>Today's Insight</Text>
          </View>
          <Text style={styles.insightText}>{insight}</Text>
        </Card>

        {/* Quick Log */}
        <TouchableOpacity
          style={[
            styles.logButton,
            {
              backgroundColor: phaseColor,
              shadowColor: phaseColor,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            // Navigate to calendar for today's log
          }}
        >
          <View style={styles.logButtonRow}>
            <Feather name="edit-3" size={18} color={colors.text.inverse} />
            <Text style={styles.logButtonText}>Log Today</Text>
          </View>
          <Text style={styles.logButtonSub}>
            Track how you're feeling
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  appTitle: {
    ...typography.h2,
    color: colors.phase.menstrual,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  learnButton: {
    padding: spacing.xs,
  },
  learnIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.phaseLight.menstrual,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Phase Card
  phaseCard: {
    padding: spacing.lg,
  },
  phaseCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phaseCardLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  phaseCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  phaseLabel: {
    ...typography.label,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  cycleDayCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleDayNumber: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 60,
  },
  cycleDayLabel: {
    ...typography.caption,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: -4,
  },
  phaseDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Period Button
  periodButton: {
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.md + spacing.xs,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  periodButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  periodButtonText: {
    ...typography.h3,
    marginBottom: 2,
  },
  periodButtonSub: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Prediction Card
  predictionCard: {},
  cardTitle: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  predictionHero: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  predictionDateRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  predictionDate: {
    ...typography.body,
    color: colors.text.tertiary,
  },
  confidenceBadge: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  confidenceText: {
    ...typography.caption,
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  // Insight Card
  insightCard: {
    borderLeftWidth: 3,
  },
  insightTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  insightText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },

  // Log Button
  logButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logButtonRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  logButtonText: {
    ...typography.h3,
    color: colors.text.inverse,
    marginBottom: spacing.xs,
  },
  logButtonSub: {
    ...typography.bodySmall,
    color: colors.text.inverse,
    opacity: 0.8,
  },
});
