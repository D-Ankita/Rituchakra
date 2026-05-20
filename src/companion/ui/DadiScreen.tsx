import { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { AvatarFallback } from '../avatar/AvatarFallback';
import { BriefCard } from './BriefCard';
import { TranscriptView, TranscriptTurn } from './TranscriptView';
import { useCompanionStore } from '../../stores/useCompanionStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { bootstrapCompanion } from '../bootstrap';
import { ConversationEngine } from '../dadi/ConversationEngine';
import { buildContextPacket } from '../context/ContextBuilder';
import { generateMorningBrief, GeneratedBrief } from '../oracle/MorningBriefGenerator';
import { getCachedBrief } from '../oracle/briefCache';
import { getCycleHistory } from '../../db/helpers/cycleHelpers';
import { getAllLogs } from '../../db/helpers/dailyLogHelpers';
import { DailyLogData } from '../../types/log';
import { useRouter } from 'expo-router';

export function DadiScreen() {
  const router = useRouter();
  const personaName = useCompanionStore((s) => s.personaName);
  const language = useCompanionStore((s) => s.language);
  const region = useCompanionStore((s) => s.region);
  const cloudOptIn = useCompanionStore((s) => s.cloudOptIn);
  const setCloudOptIn = useCompanionStore((s) => s.setCloudOptIn);

  const cycleDay = useCycleStore((s) => s.currentCycleDay);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const phase = useCycleStore((s) => s.currentPhase);
  const completedCycleCount = useCycleStore((s) => s.completedCycleCount);

  const [brief, setBrief] = useState<GeneratedBrief | null>(null);
  const [briefGeneratedAt, setBriefGeneratedAt] = useState<number | undefined>();
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const runtime = useMemo(
    () => bootstrapCompanion({ isDev: __DEV__ }),
    []
  );
  const engineRef = useRef<ConversationEngine | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await getCachedBrief();
      if (cached && !cancelled) {
        setBrief({ text: cached.text, isFallback: cached.isFallback, citations: [], providerUsed: 'cache' });
        setBriefGeneratedAt(cached.generatedAt);
      }

      const cycles = await getCycleHistory(12);
      const logs = (await getAllLogs(60)) as DailyLogData[];
      const packet = await buildContextPacket({
        cycleDay: cycleDay,
        cycleLength,
        phase: phase ?? null,
        cycles,
        logs,
        completedCycleCount,
        language,
        personaName,
        addressAs: 'beta',
        region: region,
        today: new Date(),
        allowScreeningSurface: true,
      });

      if (!engineRef.current) {
        engineRef.current = new ConversationEngine({
          cloudBoundary: runtime.cloudBoundary,
          buildPacket: async (topics) => {
            const refreshedLogs = (await getAllLogs(60)) as DailyLogData[];
            const refreshedCycles = await getCycleHistory(12);
            return buildContextPacket({
              cycleDay,
              cycleLength,
              phase: phase ?? null,
              cycles: refreshedCycles,
              logs: refreshedLogs,
              completedCycleCount,
              language,
              personaName,
              addressAs: 'beta',
              region,
              today: new Date(),
              allowScreeningSurface: false,
              memoryTopics: topics,
            });
          },
        });
      }

      const fresh = await generateMorningBrief({ packet, cloudBoundary: runtime.cloudBoundary });
      if (!cancelled) {
        setBrief(fresh);
        setBriefGeneratedAt(Date.now());
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSend = async () => {
    const text = input.trim();
    if (!text || !engineRef.current) return;
    setSending(true);
    setInput('');
    setTurns((prev) => [...prev, { role: 'user', text }]);
    try {
      const reply = await engineRef.current.send(text);
      setTurns((prev) => [...prev, { role: 'assistant', text: reply.text }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <AvatarFallback personaName={personaName} isSpeaking={sending} />
          {!cloudOptIn ? (
            <TouchableOpacity
              style={styles.optInBanner}
              onPress={() => setCloudOptIn(true)}
              activeOpacity={0.7}
            >
              <Feather name="cloud" size={16} color={colors.text.primary} />
              <Text style={styles.optInText}>
                Tap to let {personaName} speak fully — uses cloud, see Privacy.
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={() => router.push('/dadi-privacy' as any)}>
            <Text style={styles.privacyLink}>What leaves my device →</Text>
          </TouchableOpacity>
        </View>

        {brief ? (
          <View style={{ paddingHorizontal: spacing.md }}>
            <BriefCard text={brief.text} isFallback={brief.isFallback} generatedAt={briefGeneratedAt} />
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <TranscriptView turns={turns} />
        </View>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={`Tell ${personaName} what's going on…`}
            placeholderTextColor={colors.text.tertiary}
            editable={!sending}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={sending}>
            <Feather name="send" size={18} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', paddingTop: spacing.md, gap: spacing.sm },
  optInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
  },
  optInText: { ...typography.bodySmall, color: colors.text.primary, flex: 1 },
  privacyLink: {
    ...typography.caption,
    color: colors.phase.menstrual,
    paddingBottom: spacing.sm,
  },
  composer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.phase.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
