import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radii } from '../theme/colors';

type GlassVariant = 'base' | 'interactive';

interface GlassPanelProps {
  variant?: GlassVariant;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  intensity?: number;
}

/**
 * Premium dark glass panel matching the webapp's .glass-panel-base and .glass-panel-interactive.
 * 
 * .glass-panel-base: rgba(255,255,255,0.03) + backdrop-blur(24px) + 16px radius
 * .glass-panel-interactive: rgba(255,255,255,0.06) + backdrop-blur(24px) + 16px radius
 * .glass-border-diagonal: 1px gradient border from rgba(255,255,255,0.12) to rgba(255,255,255,0.02)
 */
export function GlassPanel({
  variant = 'base',
  borderRadius = 16,
  style,
  children,
  intensity = 24,
}: GlassPanelProps) {
  const bg =
    variant === 'interactive'
      ? 'rgba(255,255,255,0.06)' // .glass-panel-interactive
      : 'rgba(255,255,255,0.03)'; // .glass-panel-base

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius,
          overflow: 'hidden',
          // Simulates .glass-border-diagonal with a simple border
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View style={{ position: 'relative', zIndex: 1 }}>{children}</View>
    </View>
  );
}
