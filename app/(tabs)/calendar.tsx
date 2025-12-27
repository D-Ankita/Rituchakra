import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  differenceInDays,
} from 'date-fns';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useLogStore } from '../../src/stores/useLogStore';
import { calculatePhase } from '../../src/engine/phaseCalculator';
import { createOrUpdateLog, getLogForDate, getLogsInRange } from '../../src/db/helpers/dailyLogHelpers';
import { Button } from '../../src/components/common/Button';
import { ChipSelector } from '../../src/components/common/ChipSelector';
import { RatingSelector } from '../../src/components/common/RatingSelector';
import { FlowLevel, Symptom, Mood, SYMPTOM_LABELS, MOOD_LABELS, FLOW_LABELS } from '../../src/types/log';
import { Phase } from '../../src/types/phase';
import { Card } from '../../src/components/common/Card';
import Feather from '@expo/vector-icons/Feather';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SYMPTOM_OPTIONS = Object.entries(SYMPTOM_LABELS).map(([value, label]) => ({
  value: value as Symptom,
  label,
}));

const MOOD_OPTIONS = Object.entries(MOOD_LABELS).map(([value, label]) => ({
  value: value as Mood,
  label,
}));

const FLOW_OPTIONS: { value: FlowLevel; label: string }[] = Object.entries(FLOW_LABELS).map(
  ([value, label]) => ({ value: value as FlowLevel, label })
);

export default function CalendarScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [markPeriodMode, setMarkPeriodMode] = useState(false);
  const [periodDays, setPeriodDays] = useState<Set<string>>(new Set());
  const [notesFocused, setNotesFocused] = useState(false);

  const currentCycleId = useCycleStore((s) => s.currentCycleId);
  const lastPeriodStart = useCycleStore((s) => s.lastPeriodStart);
  const cycleLength = useCycleStore((s) => s.cycleLength);

  const logStore = useLogStore();

  // Load period days for the visible month
  const loadPeriodDays = useCallback(async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const logs = await getLogsInRange(monthStart, monthEnd);
    const days = new Set<string>();
    for (const log of logs) {
      if (log.flowLevel && log.flowLevel !== 'none') {
        days.add(format(new Date(log.date), 'yyyy-MM-dd'));
      }
    }
    setPeriodDays(days);
  }, [currentMonth]);

  useEffect(() => {
    loadPeriodDays();
  }, [loadPeriodDays]);

  const getPhaseForDate = useCallback(
    (date: Date): Phase | null => {
      if (!lastPeriodStart) return null;
      const dayDiff = differenceInDays(date, lastPeriodStart) + 1;
      if (dayDiff < 1) return null;
      const cycleDayMod = ((dayDiff - 1) % cycleLength) + 1;
      return calculatePhase(cycleDayMod, cycleLength).phase;
    },
    [lastPeriodStart, cycleLength]
  );

  const handleDayPress = async (date: Date) => {
    if (markPeriodMode) {
      await handleTogglePeriodDay(date);
      return;
    }

    setSelectedDate(date);
    logStore.resetLog();

    const existing = await getLogForDate(date);
    if (existing) {
      logStore.loadFromExisting({
        flowLevel: existing.flowLevel as FlowLevel,
        symptoms: JSON.parse(existing.symptoms) as Symptom[],
        mood: existing.mood as Mood | null,
        energy: existing.energy,
        sleepQuality: existing.sleepQuality,
        sleepHours: existing.sleepHours,
        notes: existing.notes ?? '',
        medications: existing.medications ? JSON.parse(existing.medications) : [],
      });
    }

    setShowLogSheet(true);
  };

  const handleTogglePeriodDay = async (date: Date) => {
    if (!currentCycleId || !lastPeriodStart) return;

    const dateKey = format(date, 'yyyy-MM-dd');
    const existing = await getLogForDate(date);
    const hasPeriod = existing?.flowLevel && existing.flowLevel !== 'none';

    const dayDiff = differenceInDays(date, lastPeriodStart) + 1;
    const cycleDayMod = ((dayDiff - 1) % cycleLength) + 1;
    const { phase } = calculatePhase(cycleDayMod, cycleLength);

    await createOrUpdateLog({
      date,
      cycleId: currentCycleId,
      cycleDay: cycleDayMod,
      phase,
      flowLevel: hasPeriod ? 'none' : 'medium',
      symptoms: existing ? JSON.parse(existing.symptoms) : [],
      mood: existing?.mood as Mood | null ?? null,
      energy: existing?.energy ?? null,
      sleepQuality: existing?.sleepQuality ?? null,
      sleepHours: existing?.sleepHours ?? null,
      notes: existing?.notes ?? null,
      medications: existing?.medications ? JSON.parse(existing.medications) : null,
    });

    // Update local state
    const newDays = new Set(periodDays);
    if (hasPeriod) {
      newDays.delete(dateKey);
    } else {
      newDays.add(dateKey);
    }
    setPeriodDays(newDays);
  };

  const handleSaveLog = async () => {
    if (!selectedDate || !currentCycleId) return;
    setSaving(true);

    try {
      const dayDiff = lastPeriodStart
        ? differenceInDays(selectedDate, lastPeriodStart) + 1
        : 1;
      const cycleDayMod = ((dayDiff - 1) % cycleLength) + 1;
      const { phase } = calculatePhase(cycleDayMod, cycleLength);

      await createOrUpdateLog({
        date: selectedDate,
        cycleId: currentCycleId,
        cycleDay: cycleDayMod,
        phase,
        flowLevel: logStore.flowLevel,
        symptoms: logStore.symptoms,
        mood: logStore.mood,
        energy: logStore.energy,
        sleepQuality: logStore.sleepQuality,
        sleepHours: logStore.sleepHours,
        notes: logStore.notes || null,
        medications: logStore.medications.length > 0 ? logStore.medications : null,
      });

      setShowLogSheet(false);
      logStore.resetLog();
    } finally {
      setSaving(false);
    }
  };

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const today = new Date();

  return (
    <SafeAreaView style={styles.container}>
      {/* Month header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
          style={styles.navArrowButton}
        >
          <Feather name="chevron-left" size={22} color={colors.phase.menstrual} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
          style={styles.navArrowButton}
        >
          <Feather name="chevron-right" size={22} color={colors.phase.menstrual} />
        </TouchableOpacity>
      </View>

      {/* Mark Period Toggle */}
      <View style={styles.markPeriodRow}>
        <TouchableOpacity
          style={[
            styles.markPeriodButton,
            markPeriodMode && styles.markPeriodButtonActive,
          ]}
          onPress={() => setMarkPeriodMode(!markPeriodMode)}
          activeOpacity={0.7}
        >
          <View style={[styles.markPeriodDot, markPeriodMode && styles.markPeriodDotActive]} />
          <Text
            style={[
              styles.markPeriodText,
              markPeriodMode && styles.markPeriodTextActive,
            ]}
          >
            Mark Period Days
          </Text>
        </TouchableOpacity>
        {markPeriodMode && (
          <Text style={styles.markPeriodHint}>Tap days to toggle</Text>
        )}
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekdayText}>
            {wd}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((d, i) => {
          const isCurrentMonth = isSameMonth(d, currentMonth);
          const isToday = isSameDay(d, today);
          const phase = getPhaseForDate(d);
          const phaseColor = phase ? colors.phaseLight[phase] : undefined;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.dayCell,
                isCurrentMonth && phaseColor
                  ? { backgroundColor: phaseColor }
                  : undefined,
                isToday && styles.dayCellToday,
              ]}
              onPress={() => isCurrentMonth && handleDayPress(d)}
              disabled={!isCurrentMonth}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextDimmed,
                  isToday && styles.dayTextToday,
                ]}
              >
                {format(d, 'd')}
              </Text>
              {isCurrentMonth && periodDays.has(format(d, 'yyyy-MM-dd')) && (
                <View style={styles.periodDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Phase legend */}
      <Card style={styles.legendCard}>
        <View style={styles.legend}>
          {(['menstrual', 'follicular', 'ovulation', 'luteal'] as Phase[]).map(
            (p) => (
              <View key={p} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.phase[p] },
                  ]}
                />
                <Text style={styles.legendText}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </View>
            )
          )}
        </View>
      </Card>

      {/* Daily Log Sheet Modal */}
      <Modal
        visible={showLogSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLogSheet(false)}
      >
        <SafeAreaView style={styles.sheetContainer}>
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetContent}
          >
            {/* Drag handle */}
            <View style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowLogSheet(false)}>
                <Text style={styles.sheetClose}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Flow Level */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Flow</Text>
              <View style={styles.flowRow}>
                {FLOW_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.flowChip,
                      logStore.flowLevel === option.value &&
                        styles.flowChipSelected,
                    ]}
                    onPress={() => logStore.setFlowLevel(option.value)}
                  >
                    <Text
                      style={[
                        styles.flowChipText,
                        logStore.flowLevel === option.value &&
                          styles.flowChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Symptoms */}
            <View style={styles.sectionCard}>
              <ChipSelector
                label="Symptoms"
                options={SYMPTOM_OPTIONS}
                selected={logStore.symptoms}
                onToggle={logStore.toggleSymptom}
              />
            </View>

            {/* Mood */}
            <View style={styles.sectionCard}>
              <ChipSelector
                label="Mood"
                options={MOOD_OPTIONS}
                selected={logStore.mood ? [logStore.mood] : []}
                onToggle={(mood) =>
                  logStore.setMood(
                    logStore.mood === mood ? null : (mood as Mood)
                  )
                }
              />
            </View>

            {/* Energy & Sleep */}
            <View style={styles.sectionCard}>
              <RatingSelector
                label="Energy Level"
                value={logStore.energy}
                onChange={logStore.setEnergy}
                lowLabel="Low"
                highLabel="High"
              />

              <View style={styles.sectionDivider} />

              <RatingSelector
                label="Sleep Quality"
                value={logStore.sleepQuality}
                onChange={logStore.setSleepQuality}
                lowLabel="Poor"
                highLabel="Great"
              />
            </View>

            {/* Medications */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Medications</Text>
              <TouchableOpacity
                style={[
                  styles.medicationButton,
                  logStore.medications.includes('emergency_contraception') && styles.medicationButtonActive,
                ]}
                onPress={() => logStore.toggleMedication('emergency_contraception')}
                activeOpacity={0.7}
              >
                <Feather 
                  name="alert-circle" 
                  size={18} 
                  color={logStore.medications.includes('emergency_contraception') ? colors.surface : colors.phase.menstrual} 
                />
                <Text style={[
                  styles.medicationText,
                  logStore.medications.includes('emergency_contraception') && styles.medicationTextActive
                ]}>
                  Emergency Contraception (Plan B)
                </Text>
              </TouchableOpacity>
              {logStore.medications.includes('emergency_contraception') && (
                <Text style={styles.medicationWarning}>
                  Logging this will likely delay your next ovulation and may cause irregularity in upcoming cycles.
                </Text>
              )}
            </View>

            {/* Notes */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TextInput
                style={[
                  styles.notesInput,
                  notesFocused && styles.notesInputFocused,
                ]}
                value={logStore.notes}
                onChangeText={logStore.setNotes}
                placeholder="How are you feeling today?"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                onFocus={() => setNotesFocused(true)}
                onBlur={() => setNotesFocused(false)}
              />
            </View>

            <Button
              title="Save Log"
              onPress={handleSaveLog}
              loading={saving}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navArrowButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  monthTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingVertical: spacing.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: colors.phase.menstrual,
    shadowColor: colors.phase.menstrual,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    ...typography.body,
    color: colors.text.primary,
  },
  dayTextDimmed: {
    color: colors.text.tertiary,
    opacity: 0.4,
  },
  dayTextToday: {
    fontWeight: '700',
    color: colors.phase.menstrual,
  },
  legendCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  // Sheet styles
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.tertiary,
    opacity: 0.4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  sheetClose: {
    ...typography.label,
    color: colors.phase.menstrual,
    fontSize: 16,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  medicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.phaseLight.menstrual,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  medicationButtonActive: {
    backgroundColor: colors.phase.menstrual,
  },
  medicationText: {
    ...typography.body,
    color: colors.phase.menstrual,
    fontWeight: '500',
  },
  medicationTextActive: {
    color: colors.surface,
  },
  medicationWarning: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  flowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flowChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  flowChipSelected: {
    backgroundColor: colors.phaseLight.menstrual,
    borderColor: colors.phase.menstrual,
  },
  flowChipText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  flowChipTextSelected: {
    color: colors.phase.menstrual,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesInputFocused: {
    borderColor: colors.phase.menstrual,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  markPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  markPeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  markPeriodButtonActive: {
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
  },
  markPeriodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  markPeriodDotActive: {
    backgroundColor: colors.surface,
  },
  markPeriodText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  markPeriodTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  markPeriodHint: {
    ...typography.caption,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  periodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.phase.menstrual,
    position: 'absolute',
    bottom: 4,
  },
});
