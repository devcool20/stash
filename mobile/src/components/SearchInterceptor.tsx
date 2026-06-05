import React from 'react';
import { View, TextInput, Text, StyleSheet, Platform } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface SearchInterceptorProps {
  value: string;
  onChangeText: (text: string) => void;
  matchCount: number;
}

export function SearchInterceptor({
  value,
  onChangeText,
  matchCount,
}: SearchInterceptorProps) {
  return (
    // web: mb-4 relative z-20
    <View style={styles.container}>
      {/* web: w-full bg-white/5 border border-white/5 rounded-xl pl-8 pr-16 py-2 text-xs */}
      <View style={styles.box}>
        {/* web: absolute inset-y-0 left-3, w-3.5 h-3.5 text-gray-400 */}
        <View style={styles.icon}>
          <Search color="#9CA3AF" size={14} strokeWidth={2.2} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search index metadata..."
          placeholderTextColor="#6B7280" // text-gray-500
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {/* web: font-mono text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase font-bold */}
        <View style={styles.countPill}>
          <Text style={styles.countText}>
            {matchCount} MATCH
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // web: mb-4
  container: {
    marginBottom: 16, // mb-4 = 16px
    zIndex: 20,
  },
  // web: bg-white/5 border border-white/5 rounded-xl py-2
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, // rounded-xl = 12px
    paddingHorizontal: 12, // pl-8 area covered by icon absolute + padding
    height: 36, // py-2 with text-xs ~ 36px
  },
  // web: left-3
  icon: {
    marginRight: 8,
  },
  // web: text-xs text-white font-sans placeholder:text-gray-500
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12, // text-xs
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  // web: font-mono text-[8px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase font-bold
  countPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6, // px-1.5
    paddingVertical: 2,   // py-0.5
    borderRadius: 4, // rounded
  },
  countText: {
    fontSize: 8,  // text-[8px]
    color: '#9CA3AF', // text-gray-400
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700', // font-bold
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
