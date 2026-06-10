import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, fonts } from '../theme/colors';

export interface LoadingState {
  text: string;
}

interface MultiStepLoaderProps {
  loadingStates: LoadingState[];
  loading: boolean;
  duration?: number;
  loop?: boolean;
  value?: number;
}

export function MultiStepLoader({
  loadingStates,
  loading,
  duration = 1600,
  loop = true,
  value: controlledValue,
}: MultiStepLoaderProps) {
  const [localValue, setLocalValue] = useState(0);
  const activeValue = controlledValue !== undefined ? controlledValue : localValue;

  useEffect(() => {
    if (!loading || controlledValue !== undefined) {
      setLocalValue(0);
      return;
    }
    const interval = setInterval(() => {
      setLocalValue((prev) => {
        if (prev < loadingStates.length - 1) {
          return prev + 1;
        } else if (loop) {
          return 0;
        } else {
          return prev;
        }
      });
    }, duration);

    return () => clearInterval(interval);
  }, [loading, loadingStates.length, duration, loop, controlledValue]);

  if (!loading) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(200)}
      style={styles.backdrop}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerSub}>INGESTING NEW RESOURCE</Text>
            <Text style={styles.headerTitle}>STORING IN YOUR VAULT</Text>
          </View>

          <View style={styles.list}>
            {loadingStates.map((state, index) => {
              const isCompleted = index < activeValue;
              const isActive = index === activeValue;

              return (
                <Animated.View
                  key={index}
                  entering={FadeIn.duration(300).delay(index * 60)}
                  style={styles.itemRow}
                >
                  <View style={styles.iconWrap}>
                    {isCompleted ? (
                      <Feather name="check-circle" color="#FFFFFF" size={18} />
                    ) : isActive ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <View style={styles.pendingCircle} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.itemText,
                      isCompleted && styles.itemTextCompleted,
                      isActive && styles.itemTextActive,
                    ]}
                  >
                    {state.text}
                  </Text>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  container: {
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 380,
  },
  content: {
    gap: 24,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  headerSub: {
    fontSize: 8.5,
    fontFamily: fonts.mono,
    color: '#8A8A93',
    letterSpacing: 1.5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.display,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  list: {
    gap: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  itemText: {
    fontSize: 12,
    fontFamily: fonts.mono,
    color: 'rgba(255, 255, 255, 0.15)',
  },
  itemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  itemTextCompleted: {
    color: 'rgba(255, 255, 255, 0.40)',
    textDecorationLine: 'line-through',
  },
});
