import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { AvatarView } from '../avatar/AvatarView';

interface Props {
  personaName: string;
  onContinue: () => void;
  onPickName: () => void;
}

/**
 * First-time intro for the companion. Shown until
 * useCompanionStore.hasSeenIntro flips to true.
 */
export function DadiIntro({ personaName, onContinue, onPickName }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarWrap}>
          <AvatarView personaName={personaName} isSpeaking={false} amplitude={0} />
        </View>

        <Text style={styles.title}>Meet {personaName}.</Text>
        <Text style={styles.subtitle}>
          The wise elder every woman wishes she still had. In your language. On your phone.
        </Text>

        <View style={styles.bulletCard}>
          <Bullet icon="sun">Quiet morning brief based on your real cycle.</Bullet>
          <Bullet icon="message-circle">
            Talk back in English, Hindi, Marathi — she switches with you.
          </Bullet>
          <Bullet icon="heart">She remembers what you told her last time.</Bullet>
          <Bullet icon="shield">Local-first. Nothing leaves your phone unless you say so.</Bullet>
        </View>

        <View style={styles.boundaryCard}>
          <Feather name="info" size={16} color={colors.text.secondary} />
          <Text style={styles.boundaryText}>
            She is a companion, not a doctor. She'll never diagnose — but she'll gently point you
            to a doctor if a pattern looks worth asking about.
          </Text>
        </View>

        <TouchableOpacity style={styles.primary} onPress={onContinue} activeOpacity={0.7}>
          <Text style={styles.primaryText}>Say hello</Text>
          <Feather name="arrow-right" size={16} color={colors.text.inverse} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={onPickName} activeOpacity={0.7}>
          <Text style={styles.secondaryText}>Call her something else (Aaji, Nani, Didi…)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Bullet({ children, icon }: { children: React.ReactNode; icon: React.ComponentProps<typeof Feather>['name'] }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletIcon}>
        <Feather name={icon} size={16} color={colors.phase.menstrual} />
      </View>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 80 },
  avatarWrap: { alignItems: 'center' },
  title: { ...typography.h1, color: colors.text.primary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 22,
  },
  bulletCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  bulletIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.phaseLight.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletText: { ...typography.body, color: colors.text.primary, flex: 1, lineHeight: 22 },
  boundaryCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
  },
  boundaryText: { ...typography.bodySmall, color: colors.text.secondary, flex: 1, lineHeight: 20 },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.phase.menstrual,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
  },
  primaryText: { ...typography.label, color: colors.text.inverse, fontSize: 16 },
  secondary: { alignItems: 'center', paddingVertical: spacing.sm },
  secondaryText: { ...typography.bodySmall, color: colors.phase.menstrual },
});
