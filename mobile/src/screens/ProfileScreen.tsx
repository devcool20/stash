import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { SettingsTab } from '../components/SettingsTab';

interface ProfileScreenProps {
  onResetDatabase: () => void;
}

export function ProfileScreen({ onResetDatabase }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <SettingsTab onResetDatabase={onResetDatabase} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
