import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useAppStore } from '../../src/stores/useAppStore';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useCompanionStore, CompanionLanguage } from '../../src/stores/useCompanionStore';
import { startNewCycle } from '../../src/db/helpers/cycleHelpers';
import { AvatarView } from '../../src/companion/avatar/AvatarView';

const NAME_PRESETS = ['Dadi', 'Aaji', 'Nani', 'Didi'] as const;
const LANG_PRESETS: Array<{ code: CompanionLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'hi-en', label: 'Hinglish' },
  { code: 'mr-en', label: 'Marathi-English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
];
const TIME_PRESETS = [330, 360, 390, 420, 480];

export default function MeetDadiScreen() {
  const router = useRouter();

  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const lastPeriodStart = useCycleStore((s) => s.lastPeriodStart);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const setCurrentCycle = useCycleStore((s) => s.setCurrentCycle);

  const personaName = useCompanionStore((s) => s.personaName);
  const setPersonaName = useCompanionStore((s) => s.setPersonaName);
  const language = useCompanionStore((s) => s.language);
  const setLanguage = useCompanionStore((s) => s.setLanguage);
  const proactiveMinutes = useCompanionStore((s) => s.proactiveMinutes);
  const setProactiveMinutes = useCompanionStore((s) => s.setProactiveMinutes);
  const setHasSeenIntro = useCompanionStore((s) => s.setHasSeenIntro);

  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = async (skipIntro: boolean) => {
    setLoading(true);
    try {
      // First cycle setup — moved out of cycle-length so we land
      // here every time, even if the user skips Dadi setup.
      const startDate = lastPeriodStart ?? new Date();
      const cycle = await startNewCycle(startDate);
      const { getCycleDay, calculatePhase } = require('../../src/engine/phaseCalculator');
      const day = getCycleDay(startDate);
      const { phase } = calculatePhase(day, cycleLength);
      setCurrentCycle(cycle.id, day, phase);

      if (skipIntro) setHasSeenIntro(true);
      completeOnboarding();
      router.replace('/(tabs)/dadi' as any);
    } finally {
      setLoading(false);
    }
  };

  const onSetCustomName = () => {
    const trimmed = customName.trim();
    if (trimmed.length > 0 && trimmed.length <= 16) {
      setPersonaName(trimmed);
      setCustomName('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <AvatarView personaName={personaName} isSpeaking={false} amplitude={0} />
        </View>

        <Text style={styles.title}>One more thing — meet {personaName}.</Text>
        <Text style={styles.subtitle}>
          A warm elder voice who checks in with you each morning. You can change all of this
          later in Settings.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Call her</Text>
          <View style={styles.pillRow}>
            {NAME_PRESETS.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.pill, personaName === n && styles.pillActive]}
                onPress={() => setPersonaName(n)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    personaName === n && styles.pillTextActive,
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customRow}>
            <TextInput
              style={styles.customInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Or type a name…"
              placeholderTextColor={colors.text.tertiary}
              maxLength={16}
              onSubmitEditing={onSetCustomName}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.customSave}
              onPress={onSetCustomName}
              disabled={customName.trim().length === 0}
              activeOpacity={0.7}
            >
              <Feather
                name="check"
                size={16}
                color={customName.trim().length === 0 ? colors.text.tertiary : colors.text.inverse}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Talk to her in</Text>
          <View style={styles.pillRow}>
            {LANG_PRESETS.map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[styles.pill, language === l.code && styles.pillActive]}
                onPress={() => setLanguage(l.code)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    language === l.code && styles.pillTextActive,
                  ]}
                >
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Morning brief at</Text>
          <View style={styles.pillRow}>
            {TIME_PRESETS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.pill, proactiveMinutes === m && styles.pillActive]}
                onPress={() => setProactiveMinutes(m)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    proactiveMinutes === m && styles.pillTextActive,
                  ]}
                >
                  {minutesLabel(m)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button
          title={`Meet ${personaName}`}
          onPress={() => finish(false)}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => finish(true)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function minutesLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 60 },
  avatarWrap: { alignItems: 'center' },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
    lineHeight: 22,
  },
  section: { gap: spacing.sm },
  sectionLabel: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
  },
  pillText: { ...typography.bodySmall, color: colors.text.primary },
  pillTextActive: { color: colors.text.inverse, fontWeight: '600' },
  customRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  customInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  customSave: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.phase.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: { alignItems: 'center', paddingVertical: spacing.md },
  skipText: { ...typography.bodySmall, color: colors.text.tertiary },
});
