import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors, fonts } from '../theme/colors';

interface AppHeaderProps {
  onIngestPress: () => void;
}

export function AppHeader({ onIngestPress }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.brandGroup}>
          <Text style={styles.brandAccent}>✦</Text>
          <Text style={styles.brand}>Stash</Text>
        </View>
      </View>
      <Pressable
        onPress={onIngestPress}
        style={({ pressed }) => [
          styles.addBtn,
          pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
        ]}
      >
        <Plus color={colors.textPrimary} size={16} strokeWidth={2.4} />
      </Pressable>
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
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  brandAccent: {
    fontSize: 14,
    color: colors.accentCoral,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 1,
  },
});
