import React, { useEffect } from 'react';
import { View, Text, StyleSheet, UIManager } from 'react-native';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme/colors';

interface AppHeaderProps {}

// Check if Lottie is supported in the current native environment/client
const hasLottie = !!UIManager.getViewManagerConfig('LottieAnimationView');

export function AppHeader({}: AppHeaderProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false,
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Stash</Text>
      {hasLottie ? (
        <LottieView
          source={require('../../assets/birdy.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      ) : (
        <Animated.Text style={[styles.fallbackStar, animatedStyle]}>
          ✦
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  lottie: {
    width: 42,
    height: 42,
  },
  fallbackStar: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.accentCoral,
    width: 42,
    height: 42,
    textAlign: 'center',
    lineHeight: 42,
  },
});
