import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ flex: 1 }} />

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="flower-tulip" size={40} color={colors.phase.menstrual} />
          </View>
          <Text style={styles.title}>RituChakra</Text>
          <Text style={styles.subtitle}>
            The rhythm of seasons within you
          </Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.description}>
            Understand your cycle with clarity and care.
            Track patterns, discover insights, and tune into
            your body's natural rhythm.
          </Text>

          <View style={styles.phaseDots}>
            <View style={[styles.dot, { backgroundColor: colors.phase.menstrual }]} />
            <View style={[styles.dot, { backgroundColor: colors.phase.follicular }]} />
            <View style={[styles.dot, { backgroundColor: colors.phase.ovulation }]} />
            <View style={[styles.dot, { backgroundColor: colors.phase.luteal }]} />
          </View>

          <View style={styles.privacyBox}>
            <Feather name="shield" size={18} color={colors.phase.menstrual} style={styles.privacyIcon} />
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Your privacy matters</Text>
              <Text style={styles.privacyText}>
                Everything stays on your device. No accounts,
                no cloud, no tracking. Your data is yours alone.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <Button
            title="Begin Your Journey"
            onPress={() => router.push('/onboarding/last-period')}
            style={styles.ctaButton}
          />
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
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.phaseLight.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    // Icon size controlled via size prop
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    color: colors.phase.menstrual,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  body: {
    gap: spacing.lg,
    alignItems: 'center',
  },
  description: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
  },
  phaseDots: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  privacyBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    width: '100%',
  },
  privacyIcon: {
    marginTop: 2,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  privacyText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  footer: {
    marginBottom: spacing.xl,
  },
  ctaButton: {
    shadowColor: '#C7556F',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.25,
    elevation: 6,
  },
});
