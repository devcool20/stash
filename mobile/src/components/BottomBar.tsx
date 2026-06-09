import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Inbox, FolderOpen, ShieldCheck, Plus } from 'lucide-react-native';
import { TabKey } from '../types';
import { colors, fonts } from '../theme/colors';

interface BottomBarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onAddClick: () => void;
  pendingCount?: number;
}

const TABS: { id: TabKey; label: string; icon: any }[] = [
  { id: 'stash', label: 'Stash', icon: Inbox },
  { id: 'categories', label: 'Inbox', icon: FolderOpen },
  { id: 'profile', label: 'Profile', icon: ShieldCheck },
];

export function BottomBar({
  activeTab,
  setActiveTab,
  onAddClick,
  pendingCount = 0,
}: BottomBarProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.barWrap}>
        <View style={styles.bar}>
          <View style={styles.inner}>
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                Icon={tab.icon}
                onPress={() => setActiveTab(tab.id)}
                badge={tab.id === 'categories' ? pendingCount : undefined}
              />
            ))}

            <View style={styles.divider} />

            <AddButton onPress={onAddClick} />
          </View>
        </View>
      </View>
    </View>
  );
}

function TabButton({
  isActive,
  Icon,
  onPress,
  badge,
}: {
  isActive: boolean;
  Icon: any;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabBtn,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          isActive && styles.iconWrapActive,
        ]}
      >
        <Icon
          color={isActive ? colors.bg : colors.textPrimary}
          size={16}
          strokeWidth={isActive ? 2.4 : 2}
        />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.9, { stiffness: 300, damping: 15 });
        rotation.value = withSpring(45, { stiffness: 300, damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 15 });
        rotation.value = withSpring(0, { stiffness: 300, damping: 15 });
      }}
      onPress={onPress}
      style={styles.addBtn}
    >
      <Animated.View style={animatedStyle}>
        <Plus color={colors.bg} size={18} strokeWidth={2.6} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    alignItems: 'center',
  },
  barWrap: {
    width: '88%',
    maxWidth: 320,
  },
  bar: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 999,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabBtn: {
    padding: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapActive: {
    backgroundColor: colors.textPrimary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.accentCoral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    color: colors.bg,
    fontFamily: fonts.mono,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: colors.border,
    marginHorizontal: 6,
  },
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 999,
    backgroundColor: colors.textPrimary,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
});
