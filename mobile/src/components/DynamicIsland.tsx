import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export function DynamicIsland() {
  return (
    <View style={styles.container}>
      <View style={styles.camera} />
      <View style={styles.sensor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    left: '50%',
    transform: [{ translateX: -56 }],
    width: 112,
    height: 24,
    backgroundColor: '#000000',
    borderRadius: 12,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  camera: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0d0d14',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.1)',
    marginRight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensor: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0a0a14',
  },
});
