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
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { colors, fonts } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SplashScreenProps {
  onFinish?: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const lottieRef = useRef<LottieView>(null);

  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);

  useEffect(() => {
    lottieRef.current?.play();

    // Wave 1 animation loop (moves left to right)
    translateX1.value = withRepeat(
      withTiming(-200, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY1.value = withRepeat(
      withTiming(6, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    // Wave 2 animation loop (moves right to left)
    translateX2.value = withRepeat(
      withTiming(200, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY2.value = withRepeat(
      withTiming(-6, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => {
    const x = translateX1.value;
    const y = translateY1.value + 28;
    const yControl = translateY1.value + 18;
    const path = `M ${x} ${y} Q ${x + 50} ${yControl}, ${x + 100} ${y} T ${x + 200} ${y} T ${x + 300} ${y} T ${x + 400} ${y} T ${x + 500} ${y} T ${x + 600} ${y} L ${x + 600} 80 L ${x} 80 Z`;
    return { d: path };
  });

  const animatedProps2 = useAnimatedProps(() => {
    const x = translateX2.value - 200;
    const y = translateY2.value + 32;
    const yControl = translateY2.value + 42;
    const path = `M ${x} ${y} Q ${x + 50} ${yControl}, ${x + 100} ${y} T ${x + 200} ${y} T ${x + 300} ${y} T ${x + 400} ${y} T ${x + 500} ${y} T ${x + 600} ${y} L ${x + 600} 80 L ${x} 80 Z`;
    return { d: path };
  });

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(400)}
      style={styles.overlay}
    >
      <View style={styles.centerContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../../assets/birdy.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <View style={styles.brandWrapper}>
          <Svg width={240} height={64} viewBox="0 0 240 64">
            <Defs>
              <ClipPath id="text-clip-large">
                <SvgText
                  fontSize="48"
                  fontWeight="700"
                  fontFamily={fonts.display}
                  letterSpacing={-1.0}
                  x="120"
                  y="48"
                  textAnchor="middle"
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
              fontSize="48"
              fontWeight="700"
              fontFamily={fonts.display}
              letterSpacing={-1.0}
              x="120"
              y="48"
              textAnchor="middle"
            >
              Stash
            </SvgText>

            {/* Wave 1 (Back Wave) */}
            <AnimatedPath
              animatedProps={animatedProps1}
              fill="url(#grad1)"
              opacity={0.6}
              clipPath="url(#text-clip-large)"
            />

            {/* Wave 2 (Front Wave) */}
            <AnimatedPath
              animatedProps={animatedProps2}
              fill="url(#grad2)"
              opacity={0.85}
              clipPath="url(#text-clip-large)"
            />
          </Svg>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  brandWrapper: {
    height: 64,
    justifyContent: 'center',
  },
  lottie: {
    width: 96,
    height: 96,
  },
});
