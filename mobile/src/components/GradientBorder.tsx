import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme/colors';

interface GradientBorderProps {
  borderRadius?: number;
  inset?: number;
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Diagonal gradient micro border. Reproduces the
 * `glass-border-diagonal::before` micro-border from the web CSS.
 * Uses an absolutely-positioned SVG stroked rect to create a
 * 1px diagonal sheen border with a rounded outline.
 */
export function GradientBorder({
  borderRadius = 16,
  inset = 0,
  borderWidth = 1,
  style,
}: GradientBorderProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: inset,
          left: inset,
          right: inset,
          bottom: inset,
          borderRadius,
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="diagonalBorder" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </LinearGradient>
        </Defs>
        <Rect
          x={borderWidth / 2}
          y={borderWidth / 2}
          width="100%"
          height="100%"
          rx={borderRadius - inset}
          ry={borderRadius - inset}
          stroke="url(#diagonalBorder)"
          strokeWidth={borderWidth}
          fill="transparent"
        />
      </Svg>
    </View>
  );
}
