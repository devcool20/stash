import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Inbox, FolderHeart, ShieldCheck, Plus } from 'lucide-react-native';
import { TabKey } from '../types';
import { colors } from '../theme/colors';

interface BottomBarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onAddClick: () => void;
}

const TABS: { id: TabKey; label: string; icon: any }[] = [
  { id: 'stash', label: 'Stash', icon: Inbox },
  { id: 'categories', label: 'Categories', icon: FolderHeart },
  { id: 'profile', label: 'Profile', icon: ShieldCheck },
];

export function BottomBar({
  activeTab,
  setActiveTab,
  onAddClick,
}: BottomBarProps) {
  return (
    <View pointerEvents="box-none" style={styles.container}>
      <View style={styles.barWrap}>
        {/* Matches web: glass-panel-base glass-border-diagonal px-3 py-2 rounded-full */}
        <View style={styles.bar}>
          <View style={styles.inner}>
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                isActive={activeTab === tab.id}
                label={tab.label}
                Icon={tab.icon}
                onPress={() => setActiveTab(tab.id)}
              />
            ))}

            {/* Divider: h-6 w-px bg-white/10 mx-1 */}
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
  label,
  Icon,
  onPress,
}: {
  isActive: boolean;
  label: string;
  Icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabBtn,
        pressed && { opacity: 0.8 },
      ]}
    >
      {isActive && <Animated.View style={styles.activeBg} />}
      <Icon
        color={isActive ? '#FFFFFF' : '#9CA3AF'}
        size={20} // w-5 h-5
        strokeWidth={isActive ? 2.4 : 2}
        style={[
          styles.tabIcon,
          isActive && {
            transform: [{ scale: 1.1 }],
          },
        ]}
      />
      <Text
        style={[
          styles.tabLabel,
          isActive && { color: '#FFFFFF', fontWeight: '500' },
        ]}
      >
        {label.toUpperCase()}
      </Text>
    </Pressable>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.9, { stiffness: 300, damping: 15 });
        rotation.value = withSpring(90, { stiffness: 300, damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { stiffness: 300, damping: 15 });
        rotation.value = withSpring(0, { stiffness: 300, damping: 15 });
      }}
      onPress={onPress}
      style={styles.addBtn}
    >
      <Animated.View style={animatedStyle}>
        <Plus color="#000000" size={16} strokeWidth={2.5} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // web: fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-40
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24, // bottom-6 = 24px
    alignItems: 'center',
    zIndex: 40,
  },
  barWrap: {
    width: '92%',
    maxWidth: 448, // max-w-md
  },
  // web: glass-panel-base px-3 py-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]
  bar: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 999,
    paddingHorizontal: 12, // px-3 = 12px
    paddingVertical: 8,    // py-2 = 8px
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    // Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 50,
    elevation: 16,
  },
  // web: flex items-center space-x-1 justify-around w-full
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  // web: relative flex-col items-center py-2 px-4 rounded-full
  tabBtn: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,   // py-2 = 8px
    paddingHorizontal: 16, // px-4 = 16px
    borderRadius: 999,
  },
  // web: absolute inset-0 bg-white/8 rounded-full border border-white/10 shadow
  activeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
  },
  // web: mb-0.5
  tabIcon: {
    marginBottom: 2,
  },
  // web: text-[10px] uppercase font-display tracking-widest text-gray-500
  tabLabel: {
    fontSize: 10,
    color: '#6B7280', // text-gray-500
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  // web: h-6 w-px bg-white/10 mx-1
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 4,
  },
  // web: p-2.5 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]
  addBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // p-2.5 = 10px
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
});
