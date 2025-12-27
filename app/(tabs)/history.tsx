import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { Card } from '../../src/components/common/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { getAllLogs } from '../../src/db/helpers/dailyLogHelpers';
import { getCompletedCycles } from '../../src/db/helpers/cycleHelpers';
import { Symptom, SYMPTOM_LABELS, MOOD_LABELS } from '../../src/types/log';
import { format } from 'date-fns';

interface SymptomFrequency {
  symptom: string;
  label: string;
  count: number;
  percentage: number;
}

const BAR_COLORS = [
  '#A83350',
  '#C7556F',
  '#D46E85',
  '#E0899B',
  '#E8A3B1',
  '#F0BDC7',
  '#F5D1D9',
  '#FAE5EA',
];

export default function HistoryScreen() {
  const router = useRouter();
  const [symptomFreqs, setSymptomFreqs] = useState<SymptomFrequency[]>([]);
  const [cycleHistory, setCycleHistory] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const logs = await getAllLogs();
    setTotalLogs(logs.length);

    // Compute symptom frequencies
    const symptomCounts: Record<string, number> = {};
    logs.forEach((log) => {
      const symptoms: string[] = JSON.parse(log.symptoms);
      symptoms.forEach((s) => {
        symptomCounts[s] = (symptomCounts[s] || 0) + 1;
      });
    });

    const freqs = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({
        symptom,
        label: SYMPTOM_LABELS[symptom as Symptom] || symptom,
        count,
        percentage: logs.length > 0 ? (count / logs.length) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    setSymptomFreqs(freqs);

    const completed = await getCompletedCycles();
    setCycleHistory(completed);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Feather name="bar-chart-2" size={22} color={colors.phase.menstrual} />
          <Text style={styles.title}>Symptom History</Text>
        </View>

        {totalLogs === 0 ? (
          <Card>
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Feather name="calendar" size={48} color={colors.text.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Your story starts here</Text>
              <Text style={styles.emptyText}>
                Begin logging your daily symptoms on the Calendar tab.
                After a few entries, beautiful patterns and insights will appear right here.
              </Text>
              <TouchableOpacity
                style={styles.emptyCta}
                onPress={() => router.push('/(tabs)/calendar')}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyCtaText}>
                  Go to Calendar
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <>
            {/* Symptom Frequency */}
            <Card>
              <Text style={styles.cardTitle}>
                Most Common Symptoms
              </Text>
              <Text style={styles.cardSubtitle}>
                Based on {totalLogs} logged days
              </Text>
              {symptomFreqs.length === 0 ? (
                <Text style={styles.emptyText}>
                  No symptoms logged yet.
                </Text>
              ) : (
                symptomFreqs.slice(0, 8).map((freq, index) => (
                  <View key={freq.symptom} style={styles.freqRow}>
                    <Text style={styles.freqRank}>#{index + 1}</Text>
                    <Text style={styles.freqLabel}>{freq.label}</Text>
                    <View style={styles.freqBarContainer}>
                      <View
                        style={[
                          styles.freqBar,
                          {
                            width: `${Math.min(freq.percentage, 100)}%`,
                            backgroundColor: BAR_COLORS[index] || BAR_COLORS[BAR_COLORS.length - 1],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.freqCount}>
                      {Math.round(freq.percentage)}%
                    </Text>
                  </View>
                ))
              )}
            </Card>

            {/* Cycle History */}
            <Card>
              <Text style={styles.cardTitle}>Cycle History</Text>
              {cycleHistory.length === 0 ? (
                <Text style={styles.emptyText}>
                  Complete your first cycle to see history.
                </Text>
              ) : (
                cycleHistory.map((cycle, index) => (
                  <View
                    key={cycle.id}
                    style={[
                      styles.cycleRow,
                      index < cycleHistory.length - 1 && styles.cycleRowBorder,
                    ]}
                  >
                    <View style={styles.cycleDot} />
                    <View style={styles.cycleInfo}>
                      <View style={styles.cycleHeader}>
                        <Text style={styles.cycleNumber}>
                          Cycle {cycleHistory.length - index}
                        </Text>
                        <Text style={styles.cycleLength}>
                          {cycle.length ? `${cycle.length} days` : 'In progress'}
                        </Text>
                      </View>
                      <Text style={styles.cycleDate}>
                        {format(new Date(cycle.startDate), 'MMM d, yyyy')} {' \u2014 '}
                        {cycle.endDate
                          ? format(new Date(cycle.endDate), 'MMM d, yyyy')
                          : 'Ongoing'}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
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
    paddingBottom: 100,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  cardTitle: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIconContainer: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  emptyCta: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.phase.menstrual,
  },
  emptyCtaText: {
    ...typography.label,
    color: colors.phase.menstrual,
  },
  // Symptom frequency
  freqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 2,
    gap: spacing.sm,
  },
  freqRank: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '600',
    width: 24,
  },
  freqLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    width: 90,
  },
  freqBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: 5,
    overflow: 'hidden',
  },
  freqBar: {
    height: '100%',
    backgroundColor: colors.phase.menstrual,
    borderRadius: 5,
  },
  freqCount: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '600',
    width: 38,
    textAlign: 'right',
  },
  // Cycle history
  cycleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    gap: spacing.sm + 2,
  },
  cycleRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  cycleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.phase.menstrual,
  },
  cycleInfo: {
    flex: 1,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cycleNumber: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  cycleDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  cycleLength: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});
