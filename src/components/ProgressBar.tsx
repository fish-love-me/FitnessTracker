import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  color = colors.primary,
  height = 6,
  showLabel = false,
  label,
  style,
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <View style={style}>
      {showLabel && label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label.toUpperCase()}</Text>
          <Text style={styles.value}>
            <Text style={styles.mono}>{Math.round(current)}</Text>
            {' / '}
            <Text style={styles.mono}>{target}</Text>
          </Text>
        </View>
      )}
      <View style={[styles.container, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: borderRadius.full,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  value: {
    fontSize: fontSizes.small,
    color: colors.textPrimary,
    ...typography.body,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.small,
  },
});
