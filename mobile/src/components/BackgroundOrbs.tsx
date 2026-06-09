import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function BackgroundOrbs() {
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);

  useEffect(() => {
    orb1.value = withRepeat(
      withTiming(1, {
        duration: 28000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    orb2.value = withRepeat(
      withTiming(1, {
        duration: 32000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb1.value * 24 },
      { translateY: orb1.value * -36 },
      { scale: 1 + orb1.value * 0.12 },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb2.value * -32 },
      { translateY: orb2.value * 28 },
      { scale: 1 + orb2.value * 0.08 },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orb1, orb1Style]} />
      <Animated.View style={[styles.orb2, orb2Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orb1: {
    position: 'absolute',
    top: -140,
    left: -100,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(18, 14, 46, 0.6)',
  },
  orb2: {
    position: 'absolute',
    bottom: -120,
    right: -100,
    width: 560,
    height: 560,
    borderRadius: 280,
    backgroundColor: 'rgba(10, 28, 22, 0.45)',
  },
});
