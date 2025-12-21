import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subDays, format, addDays } from 'date-fns';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useCycleStore } from '../../src/stores/useCycleStore';

export default function LastPeriodScreen() {
  const router = useRouter();
  const setLastPeriodStart = useCycleStore((s) => s.setLastPeriodStart);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(subDays(today, 14));

  // Generate last 45 days as options
  const dateOptions = Array.from({ length: 45 }, (_, i) => subDays(today, i));

  const handleContinue = () => {
    setLastPeriodStart(selectedDate);
    router.push('/onboarding/cycle-length');
  };

  const handleNotSure = () => {
    setLastPeriodStart(today);
    router.push('/onboarding/cycle-length');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '50%' }]} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 2</Text>
          <Text style={styles.title}>
            When did your last{'\n'}period start?
          </Text>
          <Text style={styles.subtitle}>
            This helps us understand where you are in your cycle.
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <View style={styles.selectedCard}>
            <Text style={styles.selectedLabel}>
              {format(selectedDate, 'EEEE, MMMM d')}
            </Text>
          </View>

          <View style={styles.dateGrid}>
            {dateOptions.slice(0, 35).map((date, index) => {
              const isSelected =
                format(date, 'yyyy-MM-dd') ===
                format(selectedDate, 'yyyy-MM-dd');
              const isToday =
                format(date, 'yyyy-MM-dd') ===
                format(today, 'yyyy-MM-dd');

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCell,
                    isSelected && styles.dateCellSelected,
                    isToday && !isSelected && styles.dateCellToday,
                  ]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateDaySelected,
                    ]}
                  >
                    {format(date, 'd')}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateMonthSelected,
                    ]}
                  >
                    {format(date, 'MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Continue" onPress={handleContinue} />
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleNotSure}
          >
            <Text style={styles.skipText}>
              I don't remember
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
  },
  dateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  selectedLabel: {
    ...typography.h3,
    color: colors.phase.menstrual,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dateCell: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0.06,
    elevation: 1,
  },
  dateCellSelected: {
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
    shadowColor: colors.phase.menstrual,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  dateCellToday: {
    borderColor: colors.phase.follicular,
    borderWidth: 2,
  },
  dateDay: {
    ...typography.label,
    color: colors.text.primary,
    fontSize: 16,
  },
  dateDaySelected: {
    color: colors.text.inverse,
  },
  dateMonth: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontSize: 10,
  },
  dateMonthSelected: {
    color: colors.text.inverse,
    opacity: 0.8,
  },
  footer: {
    marginBottom: spacing.xl,
    gap: spacing.md,
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
