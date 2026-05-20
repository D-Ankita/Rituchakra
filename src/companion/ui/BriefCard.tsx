import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Card } from '../../components/common/Card';

interface Props {
  text: string;
  isFallback: boolean;
  generatedAt?: number;
}

export function BriefCard({ text, isFallback, generatedAt }: Props) {
  return (
    <Card>
      <Text style={styles.title}>This morning</Text>
      <Text style={styles.body}>{text}</Text>
      <View style={styles.footer}>
        {isFallback ? <Text style={styles.tag}>local</Text> : <Text style={styles.tagCloud}>cloud</Text>}
        {generatedAt ? (
          <Text style={styles.timestamp}>{formatTime(generatedAt)}</Text>
        ) : null}
      </View>
    </Card>
  );
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  title: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 1, fontSize: 11 },
  body: { ...typography.body, color: colors.text.primary, lineHeight: 24 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  tag: { ...typography.caption, color: colors.text.tertiary },
  tagCloud: { ...typography.caption, color: colors.phase.menstrual },
  timestamp: { ...typography.caption, color: colors.text.tertiary },
});
