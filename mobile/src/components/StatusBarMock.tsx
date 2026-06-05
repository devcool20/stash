import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Wifi } from 'lucide-react-native';
import { colors } from '../theme/colors';

interface StatusBarMockProps {
  batteryLevel: number;
  isCharging: boolean;
  connectionType: 'WiFi' | '5G' | 'LTE';
}

export function StatusBarMock({
  batteryLevel,
  isCharging,
  connectionType,
}: StatusBarMockProps) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const id = setInterval(update, 20_000);
    return () => clearInterval(id);
  }, []);

  const lowBattery = batteryLevel <= 20;
  const barColor = lowBattery
    ? colors.red
    : isCharging
    ? colors.emerald
    : '#FFFFFF';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.time}>{time}</Text>

        <View style={styles.right}>
          {connectionType === 'WiFi' ? (
            <Wifi color={colors.textPrimary} size={14} strokeWidth={2.2} />
          ) : (
            <View style={styles.signalGroup}>
              <View style={styles.signalBars}>
                <View style={[styles.bar, { height: 2 }]} />
                <View style={[styles.bar, { height: 4 }]} />
                <View style={[styles.bar, { height: 6 }]} />
                <View style={[styles.bar, { height: 8 }]} />
              </View>
              <Text style={styles.signalLabel}>{connectionType}</Text>
            </View>
          )}

          <View style={styles.batteryGroup}>
            {isCharging && (
              <Text style={styles.bolt}>⚡</Text>
            )}
            <Text style={styles.batteryPct}>{batteryLevel}%</Text>
            <View style={styles.batteryShell}>
              <View
                style={[
                  styles.batteryFill,
                  { width: `${batteryLevel}%`, backgroundColor: barColor },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

interface BarProps {
  height: number;
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingBottom: 10,
    paddingTop: 6,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signalGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
    height: 10,
    paddingBottom: 1,
  },
  bar: {
    width: 2,
    backgroundColor: colors.textPrimary,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  signalLabel: {
    fontSize: 8,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  batteryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bolt: {
    fontSize: 8,
    color: colors.emerald,
  },
  batteryPct: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: 'rgba(255,255,255,0.8)',
  },
  batteryShell: {
    width: 22,
    height: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 1,
  },
});
