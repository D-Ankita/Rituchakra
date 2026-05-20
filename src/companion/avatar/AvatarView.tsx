import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface Props {
  personaName: string;
  isSpeaking: boolean;
  amplitude?: number; // 0-1
}

/**
 * Stylized 2D portrait whose mouth opens/closes in time with an
 * amplitude signal driven by the TTS layer. Real visemes will land
 * later; this is the v1 "good enough for the demo" pseudo-lip-sync.
 *
 * Falls back to a gentle pulse on the portrait itself when no
 * amplitude is provided (e.g. while the LLM is thinking).
 */
export function AvatarView({ personaName, isSpeaking, amplitude = 0 }: Props) {
  const mouthScale = useRef(new Animated.Value(0.3)).current;
  const haloScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(mouthScale, {
      toValue: 0.3 + amplitude * 1.5,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [amplitude, mouthScale]);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(haloScale, {
            toValue: 1.04,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(haloScale, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      haloScale.stopAnimation();
      Animated.timing(haloScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSpeaking, haloScale]);

  const initials = personaName.slice(0, 1).toUpperCase();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.halo,
          { transform: [{ scale: haloScale }] },
          isSpeaking && styles.haloActive,
        ]}
      />
      <View style={styles.portrait}>
        <Text style={styles.initials}>{initials}</Text>
        <View style={styles.eyes}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
        <Animated.View
          style={[
            styles.mouth,
            { transform: [{ scaleY: mouthScale }] },
            !isSpeaking && styles.mouthIdle,
          ]}
        />
      </View>
      <Text style={styles.name}>{personaName}</Text>
    </View>
  );
}

const PORTRAIT_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  halo: {
    position: 'absolute',
    top: spacing.lg - 6,
    width: PORTRAIT_SIZE + 12,
    height: PORTRAIT_SIZE + 12,
    borderRadius: (PORTRAIT_SIZE + 12) / 2,
    backgroundColor: colors.phaseLight.menstrual,
    opacity: 0,
  },
  haloActive: {
    opacity: 0.5,
  },
  portrait: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    borderRadius: PORTRAIT_SIZE / 2,
    backgroundColor: colors.phase.menstrual,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.h1,
    color: 'white',
    fontSize: 48,
    opacity: 0.25,
    position: 'absolute',
  },
  eyes: {
    position: 'absolute',
    top: PORTRAIT_SIZE * 0.38,
    flexDirection: 'row',
    gap: 24,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3a1818',
    opacity: 0.85,
  },
  mouth: {
    position: 'absolute',
    bottom: PORTRAIT_SIZE * 0.27,
    width: 36,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#3a1818',
    opacity: 0.85,
  },
  mouthIdle: {
    height: 4,
    borderRadius: borderRadius.sm,
  },
  name: {
    ...typography.h2,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
});
