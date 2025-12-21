import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useAppStore } from '../../src/stores/useAppStore';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { startNewCycle } from '../../src/db/helpers/cycleHelpers';
import {
  CYCLE_LENGTHS,
  DEFAULT_CYCLE_LENGTH,
} from '../../src/utils/constants';

export default function CycleLengthScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const lastPeriodStart = useCycleStore((s) => s.lastPeriodStart);
  const setCycleLength = useCycleStore((s) => s.setCycleLength);
  const setCurrentCycle = useCycleStore((s) => s.setCurrentCycle);

  const [selected, setSelected] = useState(DEFAULT_CYCLE_LENGTH);
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      setCycleLength(selected);

      const startDate = lastPeriodStart ?? new Date();
      const cycle = await startNewCycle(startDate);

      const { getCycleDay, calculatePhase } = require('../../src/engine/phaseCalculator');
      const day = getCycleDay(startDate);
      const { phase } = calculatePhase(day, selected);
      setCurrentCycle(cycle.id, day, phase);

      completeOnboarding();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleNotSure = async () => {
    setSelected(DEFAULT_CYCLE_LENGTH);
    await handleFinish();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '100%' }]} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>Step 2 of 2</Text>
          <Text style={styles.title}>
            How long is your{'\n'}typical cycle?
          </Text>
          <Text style={styles.subtitle}>
            Count from the first day of one period to the first day of the
            next. Most cycles are 21-35 days.
          </Text>
        </View>

        <View style={styles.selectorContainer}>
          <View style={styles.selectedCircle}>
            <Text style={styles.selectedValue}>
              {selected}
            </Text>
            <Text style={styles.selectedUnit}>days</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            snapToInterval={68}
          >
            {CYCLE_LENGTHS.map((length) => {
              const isSelected = length === selected;
              return (
                <TouchableOpacity
                  key={length}
                  style={[
                    styles.lengthCell,
                    isSelected && styles.lengthCellSelected,
                  ]}
                  onPress={() => setSelected(length)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.lengthText,
                      isSelected && styles.lengthTextSelected,
                    ]}
                  >
                    {length}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Button
            title="Start Tracking"
            onPress={handleFinish}
            loading={loading}
            style={styles.ctaButton}
          />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNotSure}
          >
            <Text style={styles.skipText}>
              I'm not sure (use 28 days)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    paddingTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.phase.menstrual,
    borderRadius: 2,
  },
  header: {
    marginTop: spacing.md,
  },
  step: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  selectorContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  selectedCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.phaseLight.menstrual,
    borderWidth: 2,
    borderColor: colors.phase.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedValue: {
    ...typography.number,
    color: colors.phase.menstrual,
    fontSize: 36,
    lineHeight: 40,
  },
  selectedUnit: {
    ...typography.caption,
    color: colors.phase.menstrual,
    fontSize: 13,
    marginTop: -2,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  lengthCell: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lengthCellSelected: {
    width: 60,
    height: 60,
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
    shadowColor: colors.phase.menstrual,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 0.3,
    elevation: 4,
  },
  lengthText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  lengthTextSelected: {
    color: colors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  ctaButton: {
    shadowColor: '#C7556F',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.25,
    elevation: 6,
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.text.tertiary,
  },
});
