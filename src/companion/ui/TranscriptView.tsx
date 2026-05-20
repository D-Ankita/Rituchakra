import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  turns: TranscriptTurn[];
}

export function TranscriptView({ turns }: Props) {
  if (turns.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Tell me how you're feeling.</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {turns.map((t, i) => (
        <View
          key={i}
          style={[styles.bubble, t.role === 'user' ? styles.user : styles.assistant]}
        >
          <Text style={styles.text}>{t.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.text.tertiary },
  bubble: { padding: spacing.md, borderRadius: borderRadius.lg, maxWidth: '85%' },
  user: { alignSelf: 'flex-end', backgroundColor: colors.phaseLight.menstrual },
  assistant: { alignSelf: 'flex-start', backgroundColor: colors.surfaceAlt },
  text: { ...typography.body, color: colors.text.primary },
});
