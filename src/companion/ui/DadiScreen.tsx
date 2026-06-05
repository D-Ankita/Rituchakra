import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { AvatarView } from '../avatar/AvatarView';
import { BriefCard } from './BriefCard';
import { TranscriptView, TranscriptTurn } from './TranscriptView';
import { DadiIntro } from './DadiIntro';
import { useCompanionStore } from '../../stores/useCompanionStore';
import { useCycleStore } from '../../stores/useCycleStore';
import { bootstrapCompanion, CompanionRuntime } from '../bootstrap';
import { ConversationEngine } from '../dadi/ConversationEngine';
import { buildContextPacket } from '../context/ContextBuilder';
import { generateMorningBrief, GeneratedBrief } from '../oracle/MorningBriefGenerator';
import { getCachedBrief } from '../oracle/briefCache';
import { getCycleHistory } from '../../db/helpers/cycleHelpers';
import { getAllLogs } from '../../db/helpers/dailyLogHelpers';
import { DailyLogData } from '../../types/log';
import { useAmplitudePulse } from '../avatar/useAmplitudePulse';
import { voiceIdForLanguage } from '../voice/voiceMapping';
import { ExpoSpeechTTSProvider } from '../cloud/providers/expoSpeechTTS';
import { getKey } from '../cloud/keyStore';
import * as Speech from 'expo-speech';

export function DadiScreen() {
  const router = useRouter();
  const personaName = useCompanionStore((s) => s.personaName);
  const language = useCompanionStore((s) => s.language);
  const region = useCompanionStore((s) => s.region);
  const cloudOptIn = useCompanionStore((s) => s.cloudOptIn);
  const voiceEnabled = useCompanionStore((s) => s.voiceEnabled);
  const llmChoice = useCompanionStore((s) => s.llmChoice);
  const hasSeenIntro = useCompanionStore((s) => s.hasSeenIntro);
  const setHasSeenIntro = useCompanionStore((s) => s.setHasSeenIntro);
  const anthropicConnected = useCompanionStore((s) => s.anthropicConnected);
  const openAIConnected = useCompanionStore((s) => s.openAIConnected);
  const elevenLabsConnected = useCompanionStore((s) => s.elevenLabsConnected);
  const lastScreeningCycleId = useCompanionStore((s) => s.lastScreeningCycleId);
  const setLastScreeningCycleId = useCompanionStore((s) => s.setLastScreeningCycleId);

  const currentCycleId = useCycleStore((s) => s.currentCycleId);
  const cycleDay = useCycleStore((s) => s.currentCycleDay);
  const cycleLength = useCycleStore((s) => s.cycleLength);
  const phase = useCycleStore((s) => s.currentPhase);
  const completedCycleCount = useCycleStore((s) => s.completedCycleCount);

  const [brief, setBrief] = useState<GeneratedBrief | null>(null);
  const [briefGeneratedAt, setBriefGeneratedAt] = useState<number | undefined>();
  const [briefLoading, setBriefLoading] = useState(false);
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<CompanionRuntime | null>(null);

  const { amplitude, isSpeaking, start: startPulse, pulseWord, stop: stopPulse } =
    useAmplitudePulse();

  const engineRef = useRef<ConversationEngine | null>(null);
  const stopListenRef = useRef<(() => void) | null>(null);

  // Bootstrap runtime with keys loaded from secure store. Re-runs
  // when relevant toggles flip.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [anthropicKey, openaiKey, elKey, elVoiceEn, elVoiceHi, elVoiceMr] = await Promise.all([
        cloudOptIn && anthropicConnected ? getKey('anthropic') : Promise.resolve(null),
        cloudOptIn && openAIConnected ? getKey('openai') : Promise.resolve(null),
        voiceEnabled && elevenLabsConnected ? getKey('elevenlabs') : Promise.resolve(null),
        getKey('elevenlabs-voice-en'),
        getKey('elevenlabs-voice-hi'),
        getKey('elevenlabs-voice-mr'),
      ]);
      if (cancelled) return;
      const rt = bootstrapCompanion({
        anthropicApiKey: anthropicKey,
        openAIApiKey: openaiKey,
        elevenLabsApiKey: elKey,
        elevenLabsVoicePresets: {
          'en-IN': elVoiceEn ?? undefined,
          'hi-IN': elVoiceHi ?? undefined,
          'mr-IN': elVoiceMr ?? undefined,
        },
        llmChoice,
        isDev: __DEV__,
      });
      setRuntime(rt);
      engineRef.current = null;
    })();
    return () => {
      cancelled = true;
    };
  }, [
    voiceEnabled,
    cloudOptIn,
    anthropicConnected,
    openAIConnected,
    elevenLabsConnected,
    llmChoice,
  ]);

  const speakWithPulse = useCallback(
    async (text: string) => {
      if (!voiceEnabled || !text || !runtime) return;
      const estimateMs = Math.max(1500, text.split(/\s+/).length * 400);
      startPulse(estimateMs);
      try {
        if (runtime.ttsProvider instanceof ExpoSpeechTTSProvider) {
          await runtime.ttsProvider.speakWithCallbacks(
            text,
            voiceIdForLanguage(language),
            { onWord: () => pulseWord() }
          );
        } else {
          await runtime.cloudBoundary.speak(text, voiceIdForLanguage(language));
        }
      } finally {
        stopPulse();
      }
    },
    [voiceEnabled, runtime, language, startPulse, pulseWord, stopPulse]
  );

  const stopSpeaking = () => {
    Speech.stop();
    stopPulse();
  };

  const loadBrief = useCallback(
    async (opts: { speak?: boolean } = {}) => {
      if (!runtime) return;
      setBriefLoading(true);
      setErrorBanner(null);
      try {
        const cycles = await getCycleHistory(12);
        const logs = (await getAllLogs(60)) as DailyLogData[];
        const packet = await buildContextPacket({
          cycleDay,
          cycleLength,
          phase: phase ?? null,
          cycles,
          logs,
          completedCycleCount,
          language,
          personaName,
          addressAs: 'beta',
          region,
          today: new Date(),
          allowScreeningSurface: true,
        });

        const fresh = await generateMorningBrief({
          packet,
          cloudBoundary: runtime.cloudBoundary,
          currentCycleId: currentCycleId ?? null,
          screeningState: { lastSurfacedCycleId: lastScreeningCycleId },
          onScreeningSurfaced: (id) => setLastScreeningCycleId(id),
        });
        setBrief(fresh);
        setBriefGeneratedAt(Date.now());
        if (opts.speak !== false) speakWithPulse(fresh.text);
      } catch (err) {
        setErrorBanner(`Couldn't reach ${personaName}. Showing your local brief instead.`);
      } finally {
        setBriefLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runtime, cycleDay, cycleLength, phase, completedCycleCount, language, personaName, region]
  );

  useEffect(() => {
    if (!runtime) return;
    let cancelled = false;
    (async () => {
      const cached = await getCachedBrief();
      if (cached && !cancelled) {
        setBrief({
          text: cached.text,
          isFallback: cached.isFallback,
          citations: [],
          providerUsed: 'cache',
          screeningSurfaced: false,
        });
        setBriefGeneratedAt(cached.generatedAt);
      }

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

      if (!cancelled) await loadBrief({ speak: true });
    })();
    return () => {
      cancelled = true;
      stopPulse();
      stopListenRef.current?.();
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runtime]);

  const sendText = async (text: string) => {
    if (!text.trim() || !engineRef.current) return;
    setSending(true);
    setInput('');
    setInterimText('');
    setTurns((prev) => [...prev, { role: 'user', text }]);
    try {
      const reply = await engineRef.current.send(text);
      setTurns((prev) => [...prev, { role: 'assistant', text: reply.text }]);
      speakWithPulse(reply.text);
    } catch {
      setTurns((prev) => [
        ...prev,
        { role: 'assistant', text: `Something went wrong — try again in a moment.` },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onSend = () => sendText(input.trim());

  const onMicPress = async () => {
    if (listening) {
      stopListenRef.current?.();
      stopListenRef.current = null;
      setListening(false);
      return;
    }
    if (!runtime?.stt) {
      Alert.alert('Voice off', `Turn on Voice in Settings → ${personaName} first.`);
      return;
    }
    const granted = await runtime.stt.requestPermissions();
    if (!granted) {
      Alert.alert(
        'Microphone access needed',
        `Allow microphone access to talk to ${personaName}.`
      );
      return;
    }
    setListening(true);
    setInterimText('');
    try {
      const stopFn = await runtime.stt.startListening({
        language: voiceIdForLanguage(language),
        onPartial: (text) => setInterimText(text),
        onFinal: (text) => {
          stopListenRef.current = null;
          setListening(false);
          setInterimText('');
          sendText(text);
        },
        onError: (err) => {
          stopListenRef.current = null;
          setListening(false);
          setInterimText('');
          Alert.alert('Could not hear you', err);
        },
      });
      stopListenRef.current = stopFn;
    } catch (err) {
      setListening(false);
      Alert.alert('Could not start mic', String(err));
    }
  };

  if (!hasSeenIntro) {
    return (
      <DadiIntro
        personaName={personaName}
        onContinue={() => setHasSeenIntro(true)}
        onPickName={() => {
          setHasSeenIntro(true);
          router.push('/(tabs)/settings');
        }}
      />
    );
  }

  const hasCloudBrain = anthropicConnected || openAIConnected;
  const brainLabel = !cloudOptIn
    ? 'Local only'
    : !hasCloudBrain
    ? 'No brain connected'
    : runtime?.llmName === 'anthropic-claude'
    ? 'Claude'
    : runtime?.llmName === 'openai-gpt'
    ? 'ChatGPT'
    : 'Local';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <View style={styles.brainBadge}>
            <View
              style={[
                styles.brainDot,
                hasCloudBrain && cloudOptIn ? styles.brainDotOn : null,
              ]}
            />
            <Text style={styles.brainLabel}>{brainLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/dadi-privacy' as any)} hitSlop={8}>
            <Feather name="shield" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <AvatarView
            personaName={personaName}
            isSpeaking={isSpeaking || sending}
            amplitude={amplitude}
          />
          {isSpeaking ? (
            <TouchableOpacity style={styles.stopBtn} onPress={stopSpeaking} activeOpacity={0.7}>
              <Feather name="square" size={12} color={colors.text.primary} />
              <Text style={styles.stopBtnText}>Stop speaking</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {errorBanner ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorBannerText}>{errorBanner}</Text>
          </View>
        ) : null}

        {brief ? (
          <View style={styles.briefRow}>
            <View style={{ flex: 1 }}>
              <BriefCard
                text={brief.text}
                isFallback={brief.isFallback}
                generatedAt={briefGeneratedAt}
              />
            </View>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => loadBrief({ speak: true })}
              disabled={briefLoading}
              activeOpacity={0.7}
            >
              {briefLoading ? (
                <ActivityIndicator size="small" color={colors.phase.menstrual} />
              ) : (
                <Feather name="refresh-cw" size={16} color={colors.phase.menstrual} />
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <TranscriptView turns={turns} />
        </View>

        {listening ? (
          <View style={styles.listeningBanner}>
            <View style={styles.listeningDot} />
            <Text style={styles.listeningText}>{interimText || 'Listening…'}</Text>
          </View>
        ) : null}

        <View style={styles.composer}>
          <TouchableOpacity
            style={[styles.micBtn, listening && styles.micBtnActive]}
            onPress={onMicPress}
            disabled={sending}
            activeOpacity={0.7}
          >
            <Feather
              name={listening ? 'square' : 'mic'}
              size={18}
              color={listening ? colors.text.inverse : colors.text.primary}
            />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={`Tell ${personaName} what's going on…`}
            placeholderTextColor={colors.text.tertiary}
            editable={!sending && !listening}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={onSend}
            disabled={sending || !input.trim()}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator color={colors.text.inverse} size="small" />
            ) : (
              <Feather name="send" size={18} color={colors.text.inverse} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  brainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
  },
  brainDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.text.tertiary },
  brainDotOn: { backgroundColor: '#1f6b3a' },
  brainLabel: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  header: { alignItems: 'center', gap: spacing.sm },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
  },
  stopBtnText: { ...typography.caption, color: colors.text.primary, fontWeight: '500' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#fde2e2',
    borderRadius: borderRadius.md,
  },
  errorBannerText: { ...typography.bodySmall, color: colors.error, flex: 1 },
  briefRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.phaseLight.menstrual,
  },
  listeningDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.phase.menstrual },
  listeningText: { ...typography.bodySmall, color: colors.text.primary, flex: 1 },
  composer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: { backgroundColor: colors.phase.menstrual },
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
  sendBtnDisabled: { opacity: 0.4 },
});
