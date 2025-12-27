import { useState } from 'react';
import {
  View,
  Text,
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
import { exportAllData, deleteAllData } from '../../src/db/helpers/exportHelpers';

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
  const cycleLength = useCycleStore((s) => s.cycleLength);

  const [exporting, setExporting] = useState(false);

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
            resetAppStore();
            resetCycleStore();
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
