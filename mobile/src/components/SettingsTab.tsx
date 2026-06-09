import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import {
  ShieldCheck,
  Cpu,
  Heart,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  HardDrive,
  User,
  Database,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { db } from '../database';
import { colors, fonts, radii } from '../theme/colors';

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
  const [localSync, setLocalSync] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = async () => {
    try {
      await Clipboard.setStringAsync(PRIVATE_KEY_SEED);
    } catch {}
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.section}>
        {/* Vault Header */}
        <View style={styles.vaultHeader}>
          <View style={styles.vaultIconBox}>
            <ShieldCheck
              color={colors.bg}
              size={16}
              strokeWidth={2.4}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.vaultTitle}>THE VAULT</Text>
            <Text style={styles.vaultTagline}>
              Your data is your own. Zero sync, zero exposure.
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.glassCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User color={colors.bgCard} size={16} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>LOCAL OPERATOR</Text>
              <Text style={styles.profileSub}>
                STASH UTILITY CORE V1.0.4
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
        </Animated.View>

        {/* Storage Meter */}
        <Animated.View
          entering={FadeIn.duration(350)}
          style={styles.glassCard}
        >
          <View style={styles.storageTop}>
            <View style={styles.storageLeft}>
              <View style={styles.iconGlass}>
                <HardDrive
                  color={colors.textPrimary}
                  size={12}
                  strokeWidth={2}
                />
              </View>
              <View>
                <Text style={styles.storageTitle}>
                  ON-DEVICE ALLOCATION
                </Text>
                <Text style={styles.storageSub}>
                  LOCAL HARDWARE BOUNDS
                </Text>
              </View>
            </View>
            <View style={styles.percentPill}>
              <Text style={styles.percentText}>
                {metrics.percent}%
              </Text>
            </View>
          </View>

          <View style={styles.barTrack}>
            <Animated.View
              style={[styles.barFill, { width: `${metrics.percent}%` }]}
            />
          </View>

          <View style={styles.storageBottom}>
            <Text style={styles.barLabel}>DATABASE SECTOR</Text>
            <Text style={styles.barValue}>
              {metrics.usedMB} MB / {metrics.maxMB} MB
            </Text>
          </View>
        </Animated.View>

        {/* Local-Only Sync Toggle (app.md feature) */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.glassCard}
        >
          <View style={styles.syncRow}>
            <View style={styles.iconGlass}>
              {localSync ? (
                <WifiOff
                  color={colors.accentGreen}
                  size={12}
                  strokeWidth={2}
                />
              ) : (
                <Wifi
                  color={colors.textSecondary}
                  size={12}
                  strokeWidth={2}
                />
              )}
            </View>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.syncLabel}>
                LOCAL-ONLY SYNC MODE
              </Text>
              <Text style={styles.syncDesc}>
                Keep all data strictly on-device. No servers, no exposure.
              </Text>
            </View>
            <Pressable
              onPress={() => setLocalSync(!localSync)}
              style={[
                styles.switchTrack,
                {
                  backgroundColor: localSync
                    ? colors.accentGreen
                    : colors.glassBg,
                  borderColor: localSync
                    ? colors.accentGreen
                    : colors.borderSubtle,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.switchKnob,
                  { transform: [{ translateX: localSync ? 20 : 0 }] },
                ]}
              />
            </Pressable>
          </View>
        </Animated.View>

        {/* Encryption Section */}
        <Animated.View
          entering={FadeIn.duration(450)}
          style={styles.glassCard}
        >
          <View style={styles.encryptionHeader}>
            <View style={styles.encryptionLeft}>
              <View style={styles.iconGlass}>
                <Database
                  color={colors.textPrimary}
                  size={12}
                  strokeWidth={2}
                />
              </View>
              <Text style={styles.encryptionTitle}>
                CRYPTOGRAPHIC CONTROLS
              </Text>
            </View>
          </View>

          {/* Key Reveal */}
          <View style={styles.keySection}>
            <View style={styles.keyTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <KeyRound
                  color={colors.textSecondary}
                  size={11}
                  strokeWidth={2}
                />
                <Text style={styles.keyLabel}>
                  Decryption Key Envelope
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <GlassIconBtn
                  onPress={() => setShowKey(!showKey)}
                >
                  {showKey ? (
                    <EyeOff color={colors.textSecondary} size={10} />
                  ) : (
                    <Eye color={colors.textSecondary} size={10} />
                  )}
                  <Text style={styles.iconBtnLabel}>
                    {showKey ? 'HIDE' : 'SHOW'}
                  </Text>
                </GlassIconBtn>
                <GlassIconBtn onPress={handleCopyKey}>
                  {copiedKey ? (
                    <Check color={colors.accentGreen} size={10} />
                  ) : (
                    <Copy color={colors.textSecondary} size={10} />
                  )}
                </GlassIconBtn>
              </View>
            </View>
            <View style={styles.keyBox}>
              <Text style={styles.keyText} selectable>
                {showKey
                  ? PRIVATE_KEY_SEED
                  : '••••••••••••••••••••••••••••••••••••••••••••'}
              </Text>
            </View>
          </View>

          {/* Toggles */}
          <View style={styles.toggleGroup}>
            <GlassToggleRow
              label="Hardware Enclave Encryption"
              desc="Locks FTS database entries into local Secure Enclave."
              value={enclave}
              onChange={setEnclave}
            />
            <View style={styles.divider} />
            <GlassToggleRow
              label="Biometric Vault Lock"
              desc="FaceID / fingerprint before app access."
              value={biometric}
              onChange={setBiometric}
            />
          </View>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.dangerCard}
        >
          <View style={styles.dangerHeader}>
            <View style={styles.dangerIconBox}>
              <RefreshCw
                color={colors.accentCoral}
                size={11}
                strokeWidth={2.4}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dangerTitle}>DEVELOPER LAB</Text>
              <Text style={styles.dangerSub}>
                Destructive sandbox controls
              </Text>
            </View>
          </View>
          <Text style={styles.dangerDesc}>
            Resets all data to default lookbook listings. Useful for
            testing or starting fresh.
          </Text>
          <Pressable
            onPress={() => {
              Alert.alert(
                'Reset Database?',
                'This restores all 10 default aesthetic listings.',
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
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <RefreshCw
              color={colors.accentCoral}
              size={11}
              strokeWidth={2}
            />
            <Text style={styles.resetText}>RESET SANDBOX DATABASE</Text>
          </Pressable>
        </Animated.View>

        {/* Credits */}
        <View style={styles.credits}>
          <View style={styles.creditsRow}>
            <Heart
              color={colors.textTertiary}
              size={8}
              fill={colors.textTertiary}
            />
            <Text style={styles.creditsText}>LOCAL FIRST</Text>
            <Text style={styles.creditsDot}>·</Text>
            <Text style={styles.creditsText}>STASH UTILITY CORE</Text>
          </View>
          <Text style={styles.creditsVer}>V1.0.4 — SECURED LOCALLY</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function GlassIconBtn({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        pressed && { opacity: 0.75, transform: [{ scale: 0.95 }] },
      ]}
    >
      {children}
    </Pressable>
  );
}

function GlassToggleRow({
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
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Pressable
        onPress={() => onChange(!value)}
        style={[
          styles.switchTrack,
          {
            backgroundColor: value
              ? colors.accentCoral
              : colors.glassBg,
            borderColor: value
              ? colors.accentCoral
              : colors.borderSubtle,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchKnob,
            { transform: [{ translateX: value ? 20 : 0 }] },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
    gap: 12,
  },
  section: {
    gap: 12,
  },

  // Glass card base
  glassCard: {
    backgroundColor: colors.glassBgStrong,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },

  // Vault header
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: 8,
    gap: 12,
  },
  vaultIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  vaultTagline: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  // Profile
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.2,
  },
  profileSub: {
    fontSize: 8.5,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accentGreen,
  },
  statusText: {
    fontSize: 8,
    color: colors.accentGreen,
    fontFamily: fonts.mono,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Storage
  storageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconGlass: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  storageSub: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  percentPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  percentText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontWeight: '700',
  },
  barTrack: {
    width: '100%',
    height: 5,
    backgroundColor: colors.bgSoft,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
  },
  storageBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  barLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
  },
  barValue: {
    fontSize: 8.5,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontWeight: '700',
  },

  // Local-Only Sync
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.2,
  },
  syncDesc: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 12,
    fontFamily: fonts.body,
  },

  // Encryption
  encryptionHeader: {
    marginBottom: 14,
  },
  encryptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  encryptionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  keySection: {
    gap: 10,
    marginBottom: 14,
  },
  keyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keyLabel: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.3,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  iconBtnLabel: {
    fontSize: 7.5,
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    letterSpacing: 0.5,
  },
  keyBox: {
    padding: 10,
    backgroundColor: colors.bgSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  keyText: {
    fontSize: 8.5,
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    letterSpacing: 0.3,
  },
  toggleGroup: {
    gap: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.1,
  },
  toggleDesc: {
    fontSize: 8.5,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 11,
    fontFamily: fonts.body,
  },
  switchTrack: {
    width: 40,
    height: 22,
    borderRadius: 999,
    padding: 1.5,
    justifyContent: 'center',
    borderWidth: 1,
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.bgCard,
    shadowColor: colors.shadowMed,
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  // Danger
  dangerCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: 12,
    shadowColor: colors.glassShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dangerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.accentCoralSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  dangerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  dangerSub: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  dangerDesc: {
    fontSize: 9,
    color: colors.textSecondary,
    lineHeight: 13,
    fontFamily: fonts.body,
  },
  resetBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accentCoral,
    backgroundColor: colors.accentCoralSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  resetText: {
    fontSize: 9.5,
    color: colors.accentCoral,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Credits
  credits: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  creditsText: {
    fontSize: 8.5,
    color: colors.textTertiary,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  creditsDot: {
    fontSize: 8.5,
    color: colors.textTertiary,
  },
  creditsVer: {
    fontSize: 7.5,
    color: colors.textTertiary,
    fontFamily: fonts.mono,
    letterSpacing: 1.2,
    marginTop: 6,
  },
});
