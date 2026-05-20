import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface Props {
  personaName: string;
  isSpeaking?: boolean;
}

/**
 * Static portrait + soft waveform indicator. Used when the
 * animated avatar isn't available (no opt-in, low device perf,
 * provider failure).
 */
export function AvatarFallback({ personaName, isSpeaking }: Props) {
  const initials = personaName.slice(0, 1).toUpperCase();
  return (
    <View style={styles.container}>
      <View style={[styles.portrait, isSpeaking && styles.portraitSpeaking]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <Text style={styles.name}>{personaName}</Text>
      {isSpeaking ? <Waveform /> : <View style={styles.waveformPlaceholder} />}
    </View>
  );
}

function Waveform() {
  return (
    <View style={styles.waveform}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.bar, { height: 6 + (i % 3) * 6 }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  portrait: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.phase.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portraitSpeaking: {
    transform: [{ scale: 1.04 }],
  },
  initials: {
    ...typography.h1,
    color: 'white',
    fontSize: 56,
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    height: 20,
  },
  waveformPlaceholder: {
    height: 20,
    marginTop: spacing.md,
  },
  bar: {
    width: 3,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.phase.follicular,
  },
});
