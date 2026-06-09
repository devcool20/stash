import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors, fonts } from '../theme/colors';

interface AppHeaderProps {}


export function AppHeader({}: AppHeaderProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Ensure animation plays on mount robustly
    lottieRef.current?.play();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Stash</Text>
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
  brand: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  lottie: {
    width: 48,
    height: 48,
  },
});
