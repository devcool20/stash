import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
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
  // Keep track of laid-out coordinates for each tab button
  const [layouts, setLayouts] = React.useState<Record<string, { x: number; width: number }>>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  React.useEffect(() => {
    const layout = layouts[activeTab];
    if (layout) {
      // Center the 36px wide indicator over the measured tab button layout
      const targetX = layout.x + (layout.width - 36) / 2;
      indicatorX.value = withSpring(targetX, { damping: 22, stiffness: 180 });
      indicatorWidth.value = withSpring(36, { damping: 22, stiffness: 180 });
      indicatorOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [activeTab, layouts]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: 0,
    width: indicatorWidth.value,
    transform: [{ translateX: indicatorX.value }],
    opacity: indicatorOpacity.value,
  }));

  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.barWrap}>
        <View style={styles.bar}>
          <View style={styles.inner}>
            {/* Shared sliding active background pill */}
            <Animated.View style={[styles.activeBg, indicatorStyle]} />

            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                Icon={tab.icon}
                onPress={() => setActiveTab(tab.id)}
                badge={tab.id === 'categories' ? pendingCount : undefined}
                onLayout={(x, width) => {
                  setLayouts((prev) => ({ ...prev, [tab.id]: { x, width } }));
                }}
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
  onLayout,
}: {
  isActive: boolean;
  Icon: any;
  onPress: () => void;
  badge?: number;
  onLayout: (x: number, width: number) => void;
}) {
  const scale = useSharedValue(1);

  const pressAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.88, { damping: 15, stiffness: 350 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      style={styles.tabBtn}
      onLayout={(e) => {
        const { x, width } = e.nativeEvent.layout;
        onLayout(x, width);
      }}
    >
      <Animated.View style={pressAnimStyle}>
        <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
          <Icon
            color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.45)'}
            size={16}
            strokeWidth={isActive ? 2.4 : 2}
          />
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          )}
        </View>
      </Animated.View>
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
        <Plus color="#FFFFFF" size={18} strokeWidth={2.6} />
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
    position: 'relative',
  },
  activeBg: {
    position: 'absolute',
    top: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    zIndex: 1,
  },
  tabBtn: {
    padding: 2,
    zIndex: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconWrapActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    color: '#000000',
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
});
