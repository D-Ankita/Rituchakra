import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';
import { AvatarFallback } from './AvatarFallback';

interface Props {
  personaName: string;
  isSpeaking: boolean;
  amplitude?: number; // 0-1, optional drive for the mouth
}

/**
 * Illustrated 2D avatar with amplitude-driven "mouth" — for v1 the
 * mouth is a soft pulsing oval over a stylized portrait. Real
 * viseme animation lands in a follow-up. Falls back to
 * AvatarFallback's static portrait when no opt-in.
 */
export function AvatarView({ personaName, isSpeaking, amplitude = 0 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1 + amplitude * 0.15,
      duration: 80,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [amplitude, scale]);

  return (
    <View style={styles.container}>
      <AvatarFallback personaName={personaName} isSpeaking={isSpeaking} />
      <Animated.View style={[styles.mouth, { transform: [{ scaleY: scale }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  mouth: {
    position: 'absolute',
    bottom: 80,
    width: 36,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#5b2a2a',
    opacity: 0.6,
  },
});
