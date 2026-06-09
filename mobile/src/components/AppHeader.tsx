import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import Svg, { Defs, ClipPath, Text as SvgText, Path, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface AppHeaderProps {}

export function AppHeader({}: AppHeaderProps) {
  const lottieRef = useRef<LottieView>(null);

  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);

  useEffect(() => {
    // Ensure Lottie animation plays on mount robustly
    lottieRef.current?.play();

    // Wave 1 animation loop (moves left to right)
    translateX1.value = withRepeat(
      withTiming(-100, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY1.value = withRepeat(
      withTiming(3, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Wave 2 animation loop (moves right to left)
    translateX2.value = withRepeat(
      withTiming(100, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY2.value = withRepeat(
      withTiming(-3, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => {
    const x = translateX1.value;
    const y = translateY1.value + 14;
    const yControl = translateY1.value + 9;
    const path = `M ${x} ${y} Q ${x + 25} ${yControl}, ${x + 50} ${y} T ${x + 100} ${y} T ${x + 150} ${y} T ${x + 200} ${y} T ${x + 250} ${y} T ${x + 300} ${y} L ${x + 300} 40 L ${x} 40 Z`;
    return { d: path };
  });

  const animatedProps2 = useAnimatedProps(() => {
    const x = translateX2.value - 100;
    const y = translateY2.value + 16;
    const yControl = translateY2.value + 21;
    const path = `M ${x} ${y} Q ${x + 25} ${yControl}, ${x + 50} ${y} T ${x + 100} ${y} T ${x + 150} ${y} T ${x + 200} ${y} T ${x + 250} ${y} T ${x + 300} ${y} L ${x + 300} 40 L ${x} 40 Z`;
    return { d: path };
  });

  return (
    <View style={styles.container}>
      <View style={styles.brandWrapper}>
        <Svg width={120} height={32} viewBox="0 0 120 32">
          <Defs>
            <ClipPath id="text-clip">
              <SvgText
                fontSize="24"
                fontWeight="700"
                fontFamily={fonts.display}
                letterSpacing={-0.5}
                x="0"
                y="24"
              >
                Stash
              </SvgText>
            </ClipPath>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="50%" stopColor="#3B82F6" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
            <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#EC4899" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#34D399" />
            </LinearGradient>
          </Defs>

          {/* Base Background Text (always readable, subtle contrast) */}
          <SvgText
            fill="rgba(255, 255, 255, 0.15)"
            fontSize="24"
            fontWeight="700"
            fontFamily={fonts.display}
            letterSpacing={-0.5}
            x="0"
            y="24"
          >
            Stash
          </SvgText>

          {/* Wave 1 (Back Wave) */}
          <AnimatedPath
            animatedProps={animatedProps1}
            fill="url(#grad1)"
            opacity={0.6}
            clipPath="url(#text-clip)"
          />

          {/* Wave 2 (Front Wave) */}
          <AnimatedPath
            animatedProps={animatedProps2}
            fill="url(#grad2)"
            opacity={0.85}
            clipPath="url(#text-clip)"
          />
        </Svg>
      </View>
      <LottieView
        ref={lottieRef}
        source={require('../../assets/birdy.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
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
  brandWrapper: {
    height: 32,
    justifyContent: 'center',
  },
  lottie: {
    width: 48,
    height: 48,
  },
});
