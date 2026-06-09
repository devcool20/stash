import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { PINOCCHIO_SVG } from './pinochhioSvg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CHAR_WIDTH = 34;
const CHAR_HEIGHT = 48;

const START_X = 100;
const STOP_X = 180;
const END_X = SCREEN_WIDTH + 40;

const WALK_IN_MS = 800;
const PAUSE_MS = 1200;
const WALK_OUT_MS = 1000;
const LOOP_MS = WALK_IN_MS + PAUSE_MS + WALK_OUT_MS;

const WALK_PERIOD = 300;

export function HeaderIntroAnimation() {
  const translateX = useSharedValue(START_X);
  const walkRotation = useSharedValue(0);
  const walkBounce = useSharedValue(0);
  const armLeftSwing = useSharedValue(0);
  const armRightSwing = useSharedValue(0);
  const armCameraRaise = useSharedValue(0);
  const headBobble = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearTimers() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function startWalkCycle() {
    walkRotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(-3, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    walkBounce.value = withRepeat(
      withSequence(
        withTiming(-1.5, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.5, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    armLeftSwing.value = withRepeat(
      withSequence(
        withTiming(12, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(-12, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    armRightSwing.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(8, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );

    headBobble.value = withRepeat(
      withSequence(
        withTiming(2, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(-2, { duration: WALK_PERIOD / 2, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }

  function stopWalkCycle() {
    cancelAnimation(walkRotation);
    cancelAnimation(walkBounce);
    cancelAnimation(armLeftSwing);
    cancelAnimation(armRightSwing);
    cancelAnimation(headBobble);

    walkRotation.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    walkBounce.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    armLeftSwing.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    armRightSwing.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    headBobble.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
  }

  function scheduleTimer(fn: () => void, delay: number) {
    timersRef.current.push(setTimeout(fn, delay));
  }

  useEffect(() => {
    function runCycle() {
      translateX.value = START_X;

      translateX.value = withTiming(STOP_X, {
        duration: WALK_IN_MS,
        easing: Easing.out(Easing.quad),
      });

      startWalkCycle();

      scheduleTimer(() => {
        stopWalkCycle();
        armCameraRaise.value = withTiming(-90, {
          duration: 300,
          easing: Easing.out(Easing.quad),
        });
      }, WALK_IN_MS);

      scheduleTimer(() => {
        flashOpacity.value = withSequence(
          withTiming(0.85, { duration: 60 }),
          withTiming(0, { duration: 40 }),
        );
      }, WALK_IN_MS + 350);

      scheduleTimer(() => {
        armCameraRaise.value = withTiming(0, {
          duration: 300,
          easing: Easing.inOut(Easing.quad),
        });
      }, WALK_IN_MS + 550);

      scheduleTimer(() => {
        startWalkCycle();
        translateX.value = withTiming(END_X, {
          duration: WALK_OUT_MS,
          easing: Easing.in(Easing.quad),
        });
      }, WALK_IN_MS + PAUSE_MS - WALK_OUT_MS);

      scheduleTimer(() => {
        clearTimers();
        runCycle();
      }, LOOP_MS);
    }

    runCycle();

    return () => {
      clearTimers();
      cancelAnimation(translateX);
      cancelAnimation(walkRotation);
      cancelAnimation(walkBounce);
      cancelAnimation(armLeftSwing);
      cancelAnimation(armRightSwing);
      cancelAnimation(armCameraRaise);
      cancelAnimation(headBobble);
      cancelAnimation(flashOpacity);
    };
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const charStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${walkRotation.value}deg` },
      { translateY: walkBounce.value },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  return (
    <>
      <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
        <Animated.View style={charStyle}>
          <SvgXml
            xml={PINOCCHIO_SVG}
            width={CHAR_WIDTH}
            height={CHAR_HEIGHT}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
  },
});
