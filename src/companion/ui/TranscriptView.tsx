import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export interface TranscriptTurn {
  role: 'user' | 'assistant';
  text: string;
  memoriesUsed?: number;
  isFallback?: boolean;
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
          style={[
            styles.bubbleWrap,
            t.role === 'user' ? styles.userWrap : styles.assistantWrap,
          ]}
        >
          {t.role === 'assistant' && t.memoriesUsed && t.memoriesUsed > 0 ? (
            <View style={styles.memoryBadge}>
              <Feather name="bookmark" size={10} color={colors.phase.menstrual} />
              <Text style={styles.memoryBadgeText}>
                Remembering {t.memoriesUsed} thing{t.memoriesUsed === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null}
          <View
            style={[
              styles.bubble,
              t.role === 'user' ? styles.user : styles.assistant,
            ]}
          >
            <Text style={styles.text}>{t.text}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, gap: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, color: colors.text.tertiary },
  bubbleWrap: { gap: 4, maxWidth: '85%' },
  userWrap: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  assistantWrap: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { padding: spacing.md, borderRadius: borderRadius.lg },
  user: { backgroundColor: colors.phaseLight.menstrual },
  assistant: { backgroundColor: colors.surfaceAlt },
  text: { ...typography.body, color: colors.text.primary },
  memoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.phaseLight.menstrual,
  },
  memoryBadgeText: { ...typography.caption, color: colors.phase.menstrual, fontWeight: '500' },
});
