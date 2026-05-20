import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

/**
 * "What leaves my device" screen. Plain language, no hedging.
 * Shown from Settings → Dadi → Privacy.
 */
export function PrivacyExplainer() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What leaves my device</Text>
        <Text style={styles.body}>
          Dadi works two ways: locally, and (if you turn it on) with help from
          a cloud model. Here's exactly what travels where.
        </Text>

        <Card>
          <Text style={styles.section}>Always local · never sent anywhere</Text>
          <Text style={styles.bullet}>• Your daily logs, notes, medications.</Text>
          <Text style={styles.bullet}>• Your full cycle history and dates.</Text>
          <Text style={styles.bullet}>• Your conversations with Dadi.</Text>
          <Text style={styles.bullet}>• Your name (if you ever entered one).</Text>
        </Card>

        <Card>
          <Text style={styles.section}>Sent to the cloud only if you opt in</Text>
          <Text style={styles.bullet}>• Your current cycle day and phase.</Text>
          <Text style={styles.bullet}>• Up to 2 pattern summaries (never raw notes).</Text>
          <Text style={styles.bullet}>• Up to 5 derived memory summaries (never raw conversations).</Text>
          <Text style={styles.bullet}>• Today's cultural flag, if any.</Text>
          <Text style={styles.bullet}>• Your message in the moment you send it.</Text>
        </Card>

        <Card>
          <Text style={styles.section}>What we strip before it leaves</Text>
          <Text style={styles.bullet}>• Email addresses, phone numbers, URLs.</Text>
          <Text style={styles.bullet}>• Long numeric IDs (Aadhaar-shaped).</Text>
          <Text style={styles.bullet}>• Address fragments.</Text>
          <Text style={styles.bullet}>• Free-text "notes" from your daily log.</Text>
          <Text style={styles.bullet}>• Medication names.</Text>
        </Card>

        <Card>
          <Text style={styles.section}>You can erase Dadi's memory anytime</Text>
          <Text style={styles.body}>
            Settings → Data → "Clear Dadi's Memory" erases her conversation
            memory while leaving your cycle data intact. "Delete All Data"
            erases everything.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: 100 },
  title: { ...typography.h1, color: colors.text.primary, marginBottom: spacing.xs },
  body: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.md },
  section: { ...typography.label, color: colors.text.primary, marginBottom: spacing.sm, fontSize: 14 },
  bullet: { ...typography.body, color: colors.text.primary, marginBottom: 4 },
});
