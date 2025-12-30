import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface RatingSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export function RatingSelector({
  value,
  onChange,
  label,
  max = 5,
  lowLabel,
  highLabel,
}: RatingSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {lowLabel && (
          <Text style={styles.edgeLabel}>{lowLabel}</Text>
        )}
        <View style={styles.buttons}>
          {Array.from({ length: max }, (_, i) => i + 1).map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.button,
                value === num && styles.buttonSelected,
              ]}
              onPress={() => onChange(num)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  value === num && styles.buttonTextSelected,
                ]}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {highLabel && (
          <Text style={styles.edgeLabel}>{highLabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  buttonSelected: {
    backgroundColor: colors.phase.menstrual,
    borderColor: colors.phase.menstrual,
  },
  buttonText: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  buttonTextSelected: {
    color: colors.text.inverse,
  },
  edgeLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
});
