import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Card } from '../../src/components/common/Card';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { useAppStore } from '../../src/stores/useAppStore';
import { useCycleStore } from '../../src/stores/useCycleStore';
import { useCompanionStore } from '../../src/stores/useCompanionStore';
import { exportAllData, deleteAllData } from '../../src/db/helpers/exportHelpers';
import { clearCompanionMemory } from '../../src/companion/wipe';
import { ConnectProviderModal, ProviderKind } from '../../src/companion/ui/ConnectProviderModal';
import { clearAllKeys } from '../../src/companion/cloud/keyStore';

export default function SettingsScreen() {
  const router = useRouter();
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotifications = useAppStore((s) => s.setNotifications);
  const ayurvedaEnabled = useAppStore((s) => s.ayurvedaEnabled);
  const toggleAyurveda = useAppStore((s) => s.toggleAyurveda);
  const predictionMode = useAppStore((s) => s.predictionMode);
  const setPredictionMode = useAppStore((s) => s.setPredictionMode);
  const manualCycleLength = useAppStore((s) => s.manualCycleLength);
  const setManualCycleLength = useAppStore((s) => s.setManualCycleLength);
  const manualPeriodLength = useAppStore((s) => s.manualPeriodLength);
  const setManualPeriodLength = useAppStore((s) => s.setManualPeriodLength);
  const resetAppStore = useAppStore((s) => s.resetAll);
  const resetCycleStore = useCycleStore((s) => s.reset);
  const resetCompanionStore = useCompanionStore((s) => s.reset);
  const personaName = useCompanionStore((s) => s.personaName);
  const setPersonaName = useCompanionStore((s) => s.setPersonaName);
  const language = useCompanionStore((s) => s.language);
  const setLanguage = useCompanionStore((s) => s.setLanguage);
  const proactiveMinutes = useCompanionStore((s) => s.proactiveMinutes);
  const setProactiveMinutes = useCompanionStore((s) => s.setProactiveMinutes);
  const cloudOptIn = useCompanionStore((s) => s.cloudOptIn);
  const setCloudOptIn = useCompanionStore((s) => s.setCloudOptIn);
  const voiceEnabled = useCompanionStore((s) => s.voiceEnabled);
  const setVoiceEnabled = useCompanionStore((s) => s.setVoiceEnabled);
  const llmChoice = useCompanionStore((s) => s.llmChoice);
  const setLlmChoice = useCompanionStore((s) => s.setLlmChoice);
  const anthropicConnected = useCompanionStore((s) => s.anthropicConnected);
  const openAIConnected = useCompanionStore((s) => s.openAIConnected);
  const elevenLabsConnected = useCompanionStore((s) => s.elevenLabsConnected);
  const cycleLength = useCycleStore((s) => s.cycleLength);

  const [exporting, setExporting] = useState(false);
  const [modalProvider, setModalProvider] = useState<ProviderKind | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportAllData();
      const file = new File(Paths.document, 'rituchakra-export.json');
      file.create({ overwrite: true });
      file.write(data);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Export RituChakra Data',
        });
      }
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently remove all your cycle data, logs, and preferences. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            await deleteAllData();
            await clearAllKeys();
            resetAppStore();
            resetCycleStore();
            resetCompanionStore();
          },
        },
      ]
    );
  };

  const handleClearCompanionMemory = () => {
    Alert.alert(
      "Clear Dadi's Memory",
      "This will erase your conversation history with Dadi. Your cycle data, logs, and settings will stay. This cannot be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "Clear Memory",
          style: 'destructive',
          onPress: async () => {
            await clearCompanionMemory();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Feather name="settings" size={22} color={colors.text.primary} />
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Cycle Preferences */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="refresh-cw" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Cycle</Text>
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Cycle Length</Text>
            <Text style={styles.settingValue}>{cycleLength} days</Text>
          </View>
        </Card>

        {/* Prediction Mode */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="trending-up" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Prediction</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Prediction</Text>
              <Text style={styles.settingDescription}>
                {predictionMode === 'auto'
                  ? 'Based on your logged cycle history'
                  : 'Using your manually set lengths'}
              </Text>
            </View>
            <Switch
              value={predictionMode === 'auto'}
              onValueChange={(isAuto) =>
                setPredictionMode(isAuto ? 'auto' : 'manual')
              }
              trackColor={{
                false: colors.border,
                true: colors.phaseLight.ovulation,
              }}
              thumbColor={
                predictionMode === 'auto'
                  ? colors.phase.ovulation
                  : colors.text.tertiary
              }
            />
          </View>

          {predictionMode === 'manual' && (
            <View style={styles.manualSettings}>
              <View style={styles.lengthPickerRow}>
                <Text style={styles.settingLabel}>Cycle Length</Text>
                <View style={styles.lengthPicker}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setManualCycleLength(Math.max(21, manualCycleLength - 1))}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.pickerButtonText}>{'\u2212'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{manualCycleLength} days</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setManualCycleLength(Math.min(45, manualCycleLength + 1))}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.pickerButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.lengthPickerRow}>
                <Text style={styles.settingLabel}>Period Length</Text>
                <View style={styles.lengthPicker}>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setManualPeriodLength(Math.max(2, manualPeriodLength - 1))}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.pickerButtonText}>{'\u2212'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.pickerValue}>{manualPeriodLength} days</Text>
                  <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => setManualPeriodLength(Math.min(10, manualPeriodLength + 1))}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.pickerButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Card>

        {/* Notifications */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="bell" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Notifications</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Text style={styles.settingDescription}>
                Get a gentle nudge to log your day
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotifications}
              trackColor={{
                false: colors.border,
                true: colors.phaseLight.menstrual,
              }}
              thumbColor={
                notificationsEnabled
                  ? colors.phase.menstrual
                  : colors.text.tertiary
              }
            />
          </View>
        </Card>

        {/* Wellness */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="leaf" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Wellness</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                Ayurvedic Wisdom
              </Text>
              <Text style={styles.settingDescription}>
                Optional traditional wellness suggestions
              </Text>
            </View>
            <Switch
              value={ayurvedaEnabled}
              onValueChange={toggleAyurveda}
              trackColor={{
                false: colors.border,
                true: colors.phaseLight.luteal,
              }}
              thumbColor={
                ayurvedaEnabled
                  ? colors.phase.luteal
                  : colors.text.tertiary
              }
            />
          </View>
        </Card>

        {/* Dadi · companion */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="heart" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>{personaName}</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Call her</Text>
              <Text style={styles.settingDescription}>
                Dadi, Aaji, Nani, Didi — whatever feels right.
              </Text>
            </View>
            <TextInput
              style={styles.nameInput}
              value={personaName}
              onChangeText={setPersonaName}
              maxLength={16}
              placeholder="Dadi"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <View style={styles.settingColumn}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.pillRow}>
              {(['en', 'hi-en', 'mr-en', 'hi', 'mr'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.pill, language === opt && styles.pillActive]}
                  onPress={() => setLanguage(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, language === opt && styles.pillTextActive]}>
                    {languageLabel(opt)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingColumn}>
            <Text style={styles.settingLabel}>Morning brief at</Text>
            <View style={styles.pillRow}>
              {[330, 360, 390, 420, 480].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pill, proactiveMinutes === m && styles.pillActive]}
                  onPress={() => setProactiveMinutes(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, proactiveMinutes === m && styles.pillTextActive]}>
                    {minutesLabel(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Voice</Text>
              <Text style={styles.settingDescription}>
                Hear {personaName} speak (on-device synthesis works offline).
              </Text>
            </View>
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
              trackColor={{ false: colors.divider, true: colors.phaseLight.menstrual }}
              thumbColor={voiceEnabled ? colors.phase.menstrual : colors.text.tertiary}
            />
          </View>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.push('/dadi-privacy' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>What leaves my device</Text>
              <Text style={styles.settingDescription}>
                A plain-language explanation of cloud features and redaction.
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Connections */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="link" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Connections</Text>
          </View>
          <Text style={styles.privacyNote}>
            Connect an LLM to give {personaName} a real brain. Keys are stored in your phone's
            keychain — never shared.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Cloud opt-in</Text>
              <Text style={styles.settingDescription}>
                Required for any LLM. Off by default.
              </Text>
            </View>
            <Switch
              value={cloudOptIn}
              onValueChange={setCloudOptIn}
              trackColor={{ false: colors.divider, true: colors.phaseLight.menstrual }}
              thumbColor={cloudOptIn ? colors.phase.menstrual : colors.text.tertiary}
            />
          </View>

          <ProviderRow
            title="Claude (Anthropic)"
            subtitle="Best for health conversations"
            connected={anthropicConnected}
            onPress={() => setModalProvider('anthropic')}
          />
          <ProviderRow
            title="ChatGPT (OpenAI)"
            subtitle="GPT-4o or any model on your account"
            connected={openAIConnected}
            onPress={() => setModalProvider('openai')}
          />
          <ProviderRow
            title="ElevenLabs voice"
            subtitle="Optional — upgrades the on-device voice"
            connected={elevenLabsConnected}
            onPress={() => setModalProvider('elevenlabs')}
          />

          {anthropicConnected && openAIConnected ? (
            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Use which brain?</Text>
              <View style={styles.pillRow}>
                {(['auto', 'anthropic', 'openai'] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pill, llmChoice === opt && styles.pillActive]}
                    onPress={() => setLlmChoice(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, llmChoice === opt && styles.pillTextActive]}>
                      {opt === 'auto' ? 'Auto' : opt === 'anthropic' ? 'Claude' : 'ChatGPT'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
        </Card>

        {/* Real Life / Cultural Intelligence */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="globe" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Lifestyle Integration</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => router.push('/cultural' as any)}
            activeOpacity={0.7}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Cultural Intelligence</Text>
              <Text style={styles.settingDescription}>
                Period & travel planning, festivals, and workplace tips
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="shield" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>Data & Privacy</Text>
          </View>
          <Text style={styles.privacyNote}>
            All your data is stored locally on this device. Nothing is sent
            to any server.
          </Text>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExport}
            disabled={exporting}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContentRow}>
              <Feather name="share-2" size={16} color={colors.phase.menstrual} />
              <Text style={styles.exportButtonText}>
                {exporting ? 'Exporting...' : 'Export Data (JSON)'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleClearCompanionMemory}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContentRow}>
              <Feather name="message-circle" size={16} color={colors.phase.menstrual} />
              <Text style={styles.exportButtonText}>Clear Dadi's Memory</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAll}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContentRow}>
              <Feather name="alert-triangle" size={16} color={colors.error} />
              <Text style={styles.deleteButtonText}>Delete All Data</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card>
          <View style={styles.sectionHeaderRow}>
            <Feather name="info" size={16} color={colors.text.secondary} />
            <Text style={styles.sectionHeader}>About</Text>
          </View>
          <View style={styles.aboutContainer}>
            <View style={styles.aboutIcon}>
              <Text style={styles.aboutIconText}>R</Text>
            </View>
            <Text style={styles.aboutAppName}>RituChakra</Text>
            <Text style={styles.aboutVersion}>v1.0.0</Text>
            <Text style={styles.aboutSubtext}>
              The rhythm of seasons within you.
            </Text>
          </View>
        </Card>
      </ScrollView>

      {modalProvider ? (
        <ConnectProviderModal
          visible={modalProvider !== null}
          provider={modalProvider}
          onClose={() => setModalProvider(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function ProviderRow({
  title,
  subtitle,
  connected,
  onPress,
}: {
  title: string;
  subtitle: string;
  connected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={providerRowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={providerRowStyles.info}>
        <Text style={providerRowStyles.title}>{title}</Text>
        <Text style={providerRowStyles.subtitle}>{subtitle}</Text>
      </View>
      {connected ? (
        <View style={providerRowStyles.connected}>
          <Feather name="check-circle" size={14} color="#1f6b3a" />
          <Text style={providerRowStyles.connectedText}>Connected</Text>
        </View>
      ) : (
        <View style={providerRowStyles.notConnected}>
          <Text style={providerRowStyles.notConnectedText}>Connect</Text>
          <Feather name="chevron-right" size={16} color={colors.phase.menstrual} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const providerRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  info: { flex: 1, gap: 2 },
  title: { ...typography.body, color: colors.text.primary, fontWeight: '500' },
  subtitle: { ...typography.bodySmall, color: colors.text.tertiary },
  connected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#e5f3e4',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  connectedText: { ...typography.caption, color: '#1f6b3a', fontWeight: '600' },
  notConnected: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  notConnectedText: { ...typography.bodySmall, color: colors.phase.menstrual, fontWeight: '500' },
});

function languageLabel(l: string): string {
  switch (l) {
    case 'en': return 'English';
    case 'hi-en': return 'Hinglish';
    case 'mr-en': return 'Marathi-Eng';
    case 'hi': return 'हिन्दी';
    case 'mr': return 'मराठी';
    default: return l;
  }
}

function minutesLabel(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}:${mm.toString().padStart(2, '0')}`;
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingColumn: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: {
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
  },
  pillText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  pillTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  nameInput: {
    ...typography.body,
    color: colors.text.primary,
    minWidth: 120,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceAlt,
    textAlign: 'right',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingDescription: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  settingValue: {
    ...typography.body,
    color: colors.text.secondary,
  },
  comingSoon: {
    ...typography.caption,
    color: colors.phase.luteal,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  privacyNote: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  // Export button
  exportButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exportButtonText: {
    ...typography.label,
    color: colors.phase.menstrual,
  },
  // Delete button
  deleteButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#F5C6C6',
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deleteButtonText: {
    ...typography.label,
    color: colors.error,
    fontWeight: '600',
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  // About section
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  aboutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.phaseLight.menstrual,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aboutIconText: {
    ...typography.h2,
    color: colors.phase.menstrual,
    fontWeight: '700',
  },
  aboutAppName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: 2,
  },
  aboutVersion: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  aboutSubtext: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Manual settings
  manualSettings: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  lengthPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  lengthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pickerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerButtonText: {
    ...typography.h3,
    color: colors.phase.menstrual,
    lineHeight: 22,
  },
  pickerValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'center',
  },
});
