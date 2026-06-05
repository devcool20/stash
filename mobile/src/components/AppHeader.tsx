import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Command } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface AppHeaderProps {
  onIngestPress: () => void;
}

export function AppHeader({ onIngestPress }: AppHeaderProps) {
  return (
    // web: flex items-center justify-between mb-5 pt-1
    <View style={styles.container}>
      {/* Left side: logo + brand */}
      <View style={styles.left}>
        {/* web: w-8 h-8 rounded-lg bg-white text-black font-bold text-base */}
        <View style={styles.logo}>
          <View style={styles.logoGradient} />
          <Text style={styles.logoText}>S</Text>
        </View>
        <View>
          {/* web: font-display font-medium text-sm tracking-tight text-white leading-none */}
          <Text style={styles.brand}>STASH</Text>
          {/* web: text-[8px] font-mono tracking-widest text-[#8A8A93] uppercase */}
          <Text style={styles.tagline}>LOCAL-FIRST INBOX</Text>
        </View>
      </View>

      {/* Right side: sync status + ingest button */}
      <View style={styles.right}>
        {/* Sync indicator */}
        <View style={styles.syncRow}>
          {/* web: w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse */}
          <View style={styles.syncDot} />
          <Text style={styles.syncLabel}>LOCAL</Text>
        </View>
        {/* Ingest button: px-2 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono */}
        <Pressable
          onPress={onIngestPress}
          style={({ pressed }) => [
            styles.ingestBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Command color="#FFFFFF" size={10} strokeWidth={2.5} />
          <Text style={styles.ingestText}>INGEST</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,  // pt-1
    marginBottom: 20, // mb-5
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // space-x-2
  },
  // web: w-8 h-8 rounded-lg bg-white shadow-[0_0_15px_rgba(255,255,255,0.12)]
  logo: {
    position: 'relative',
    width: 32,  // w-8
    height: 32, // h-8
    borderRadius: 8, // rounded-lg
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 15,
    elevation: 4,
    overflow: 'hidden',
  },
  // web: bg-gradient-to-br from-white via-white to-gray-300 opacity-25
  logoGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  // web: font-display font-bold text-base
  logoText: {
    position: 'relative',
    zIndex: 1,
    color: '#000000',
    fontWeight: '700',
    fontSize: 16, // text-base
  },
  // web: font-display font-medium text-sm tracking-tight leading-none
  brand: {
    fontWeight: '500',
    fontSize: 14, // text-sm
    letterSpacing: -0.5, // tracking-tight
    color: colors.textPrimary,
    lineHeight: 14, // leading-none
  },
  // web: text-[8px] font-mono tracking-widest text-[#8A8A93] uppercase
  tagline: {
    fontSize: 8,
    letterSpacing: 2.5, // tracking-widest
    color: '#8A8A93',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // space-x-2
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space-x-1
  },
  // web: w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399', // emerald-400
  },
  // web: text-[8px] tracking-widest text-[#8A8A93] font-mono font-bold uppercase
  syncLabel: {
    fontSize: 8,
    color: '#8A8A93',
    fontWeight: '700',
    letterSpacing: 2.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // web: px-2 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-mono
  ingestBtn: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 4,   // py-1
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space-x-1
  },
  // web: text-[9px]
  ingestText: {
    fontSize: 9,
    color: '#9CA3AF', // text-gray-400
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
