import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

export function BackgroundOrbs() {
  const orb1 = useSharedValue(0);
  const orb2 = useSharedValue(0);

  useEffect(() => {
    orb1.value = withRepeat(
      withTiming(1, {
        duration: 25000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
    orb2.value = withRepeat(
      withTiming(1, {
        duration: 30000,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb1.value * 30 },
      { translateY: orb1.value * -50 },
      { scale: 1 + orb1.value * 0.15 },
    ],
  }));

  const orb2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: orb2.value * -50 },
      { translateY: orb2.value * 40 },
      { scale: 1 + orb2.value * 0.1 },
    ],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orbIndigo, orb1Style]} />
      <Animated.View style={[styles.orbEmerald, orb2Style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orbIndigo: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 480,
    height: 480,
    borderRadius: 240,
    backgroundColor: 'rgba(18, 14, 46, 0.6)',
    opacity: 0.7,
  },
  orbEmerald: {
    position: 'absolute',
    bottom: 60,
    right: -100,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(10, 28, 22, 0.45)',
    opacity: 0.6,
  },
});
