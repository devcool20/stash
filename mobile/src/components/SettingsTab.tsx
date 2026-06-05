import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
  NativeModules,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  ShieldAlert,
  Cpu,
  Heart,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { GlassPanel } from './GlassPanel';
import { db } from '../database';
import { colors, radii } from '../theme/colors';

interface SettingsTabProps {
  onResetDatabase: () => void;
}

const PRIVATE_KEY_SEED =
  'stash_seed_aes256_x86_64_9af4bc8382c18d41fe0901e';

export function SettingsTab({ onResetDatabase }: SettingsTabProps) {
  const [metrics, setMetrics] = useState({
    usedMB: 28.4,
    maxMB: 50,
    percent: 56.8,
  });

  useEffect(() => {
    db.getStorageMetrics().then(setMetrics);
  }, []);

  const [enclave, setEnclave] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [zeroLeak, setZeroLeak] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [bubbleActive, setBubbleActive] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const { FloatBubbleModule } = NativeModules;
      if (FloatBubbleModule) {
        FloatBubbleModule.isBubbleServiceRunning().then(setBubbleActive);
      }
    }
  }, []);

  const handleToggleBubble = async (value: boolean) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Platform not supported', 'Floating overlay bubble is only supported on Android.');
      return;
    }

    const { FloatBubbleModule } = NativeModules;
    if (!FloatBubbleModule) {
      Alert.alert('Module Error', 'FloatBubbleModule not found.');
      return;
    }

    if (value) {
      try {
        const hasOverlay = await FloatBubbleModule.hasOverlayPermission();
        if (!hasOverlay) {
          Alert.alert(
            'Overlay Permission Required',
            'Please grant "Draw over other apps" permission in system settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Grant',
                onPress: async () => {
                  await FloatBubbleModule.requestOverlayPermission();
                },
              },
            ]
          );
          return;
        }

        const success = await FloatBubbleModule.startBubbleService();
        if (success) {
          setBubbleActive(true);
        } else {
          Alert.alert('Permission Rejected', 'Screen capture permission is required to take screenshots.');
        }
      } catch (err: any) {
        Alert.alert('Error starting overlay', err.message || err);
      }
    } else {
      await FloatBubbleModule.stopBubbleService();
      setBubbleActive(false);
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(PRIVATE_KEY_SEED);
    } catch {
      // ignore
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* 1. On-Device Storage Allocation */}
      <GlassPanel
        variant="base"
        borderRadius={16}
        style={styles.section}
      >
        <View style={styles.storageHeader}>
          <View style={styles.storageLeft}>
            <View style={styles.storageIcon}>
              <Cpu color={colors.emerald} size={14} strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.storageTitle}>ON-CHIP LOCAL METRICS</Text>
              <Text style={styles.storageSub}>
                SOVEREIGN HARDWARE BOUNDS
              </Text>
            </View>
          </View>
          <View style={styles.usedPill}>
            <Text style={styles.usedPillText}>
              {metrics.percent}% USED
            </Text>
          </View>
        </View>

        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: `${metrics.percent}%` },
            ]}
          />
        </View>
        <View style={styles.barMeta}>
          <Text style={styles.barMetaText}>DATABASE ALLOCATION</Text>
          <Text style={styles.barMetaRight}>
            {metrics.usedMB}MB / {metrics.maxMB}MB
          </Text>
        </View>
      </GlassPanel>

      {/* 2. Subscription state banner */}
      <View style={styles.subscription}>
        <View style={styles.subscriptionDot} />
        <Text style={styles.subscriptionText}>
          STASH PRO · ACTIVE MEMBER
        </Text>
        <View style={styles.subscriptionPulse} />
      </View>

      {/* 3. Cryptographic Switchboard */}
      <View style={styles.section}>
        <View style={styles.switchHeader}>
          <Text style={styles.switchHeaderLabel}>
            CRYPTOGRAPHIC CONTROL
          </Text>
          <Text style={styles.switchHeaderSub}>AES-256 SEED SYSTEM</Text>
        </View>

        <GlassPanel
          variant="base"
          borderRadius={16}
          style={styles.keyPanel}
        >
          <View style={styles.keyHeader}>
            <View style={styles.keyHeaderLeft}>
              <KeyRound color={colors.emerald} size={14} strokeWidth={2} />
              <Text style={styles.keyTitle}>Decryption Key Envelope</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <Pressable
                onPress={() => setShowKey(!showKey)}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                {showKey ? (
                  <EyeOff color={colors.textSecondary} size={11} />
                ) : (
                  <Eye color={colors.textSecondary} size={11} />
                )}
                <Text style={styles.iconBtnText}>
                  {showKey ? 'HIDE' : 'REVEAL'}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCopy}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                {copiedKey ? (
                  <Check color={colors.emerald} size={11} />
                ) : (
                  <Copy color={colors.textSecondary} size={11} />
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.seedBox}>
            <Text style={styles.seedText} selectable>
              {showKey
                ? PRIVATE_KEY_SEED
                : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </Text>
          </View>
        </GlassPanel>

        <GlassPanel
          variant="base"
          borderRadius={16}
          style={{ marginTop: 10 }}
        >
          <ToggleRow
            label="Hardware Enclave Encryption"
            desc="Locks all FTS database entries into Apple T2 or local Secure Enclave partition."
            value={enclave}
            onChange={setEnclave}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Biometric FaceID Vault Lock"
            desc="Inbuilt system check triggers authentic device signature verification before app focus."
            value={biometric}
            onChange={setBiometric}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Zero-Network Leak Strategy"
            desc="Blocks outbound analytical requests. Keeps metadata scraping sandbox insulated and strictly local."
            value={zeroLeak}
            onChange={setZeroLeak}
          />
          {Platform.OS === 'android' && (
            <>
              <View style={styles.divider} />
              <ToggleRow
                label="Floating Overlay Capture"
                desc="Displays a persistent hover bubble to instantly capture and stash screen contents in other apps (Instagram, Twitter, Pinterest, WhatsApp)."
                value={bubbleActive}
                onChange={handleToggleBubble}
              />
            </>
          )}
        </GlassPanel>
      </View>

      {/* 4. Diagnostic Reset */}
      <View style={[styles.dangerPanel]}>
        <View style={styles.dangerHeader}>
          <ShieldAlert color={colors.red} size={14} strokeWidth={2} />
          <View>
            <Text style={styles.dangerTitle}>CRITICAL LAB BOUNDS</Text>
            <Text style={styles.dangerSub}>
              DESTRUCTIVE DEVELOPER TESTS
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            Alert.alert(
              'Re-crystallize Sandbox database?',
              'This restores all 10 default aesthetic lookbook listings.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: onResetDatabase,
                },
              ],
            );
          }}
          style={({ pressed }) => [
            styles.resetBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <RefreshCw color={colors.red} size={12} strokeWidth={2} />
          <Text style={styles.resetText}>RESET SANDBOX DATABASE</Text>
        </Pressable>
      </View>

      {/* Credits */}
      <View style={styles.credits}>
        <View style={styles.creditsRow}>
          <Text style={styles.creditsText}>
            STASH UTILITY CORE V1.0.4
          </Text>
          <Text style={styles.creditsDot}>•</Text>
          <Heart color={colors.red} size={9} fill={colors.red} />
          <Text style={styles.creditsText}>LOCAL FIRST</Text>
        </View>
        <Text style={styles.creditsSub}>
          SECURED VIA LOCALHOST SANDBOX
        </Text>
      </View>
    </ScrollView>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  // Matches web: motion.div with type:'spring', stiffness:500, damping:30
  const knobX = useSharedValue(value ? 20 : 0);

  useEffect(() => {
    knobX.value = withSpring(value ? 20 : 0, {
      stiffness: 500,
      damping: 30,
    });
  }, [value]);

  const knobAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: knobX.value }],
  }));

  return (
    // web: p-4 flex items-center justify-between
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 16 }}>
        {/* web: font-display text-xs text-white font-medium */}
        <Text style={styles.toggleLabel}>{label}</Text>
        {/* web: text-[10px] text-[#8A8A93] font-sans leading-normal */}
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      {/* web: w-11 h-6 rounded-full p-0.5 */}
      <Pressable
        onPress={() => onChange(!value)}
        style={[
          styles.switch,
          {
            backgroundColor: value
              ? '#10B981' // bg-emerald-500
              : 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        {/* web: w-5 h-5 rounded-full bg-white shadow-md */}
        <Animated.View style={[styles.knob, knobAnim]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageIcon: {
    padding: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  storageTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: colors.textPrimary,
    letterSpacing: -0.1,
  },
  storageSub: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  usedPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  usedPillText: {
    fontSize: 9,
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.emeraldDeep,
    borderRadius: 999,
    shadowColor: colors.emerald,
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  barMetaText: {
    fontSize: 8.5,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  barMetaRight: {
    fontSize: 8.5,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  subscription: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
    marginBottom: 20,
  },
  subscriptionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  subscriptionText: {
    flex: 1,
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subscriptionPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  switchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  switchHeaderLabel: {
    fontSize: 9.5,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  switchHeaderSub: {
    fontSize: 8.5,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  keyPanel: {
    padding: 14,
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  keyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyTitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  iconBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  iconBtnText: {
    fontSize: 7.5,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
  },
  seedBox: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  seedText: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  // web: p-4 flex items-center justify-between
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // p-4
  },
  // web: font-display text-xs text-white font-medium
  toggleLabel: {
    fontSize: 12, // text-xs
    fontWeight: '500',
    color: '#FFFFFF',
  },
  // web: text-[10px] text-[#8A8A93] font-sans leading-normal
  toggleDesc: {
    fontSize: 10,
    color: '#8A8A93',
    marginTop: 2,
    lineHeight: 14, // leading-normal
  },
  // web: w-11 h-6 rounded-full p-0.5
  switch: {
    width: 44, // w-11
    height: 24, // h-6
    borderRadius: 999,
    padding: 2, // p-0.5
    justifyContent: 'center',
    flexShrink: 0,
  },
  // web: w-5 h-5 rounded-full bg-white shadow-md
  knob: {
    width: 20, // w-5
    height: 20, // h-5
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  dangerPanel: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(127,29,29,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(127,29,29,0.2)',
    gap: 12,
    marginBottom: 16,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerTitle: {
    fontSize: 10.5,
    color: '#FCA5A5',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  dangerSub: {
    fontSize: 8,
    color: 'rgba(248,113,113,0.7)',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  resetBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(127,29,29,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resetText: {
    fontSize: 9,
    color: colors.red,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  credits: {
    alignItems: 'center',
    paddingTop: 16,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditsText: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  creditsDot: {
    fontSize: 9,
    color: colors.textMuted,
  },
  creditsSub: {
    fontSize: 8,
    color: '#52525B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 1.5,
    marginTop: 6,
  },
});
