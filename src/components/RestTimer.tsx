import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { scheduleRestTimerNotification, cancelAllNotifications } from '../utils/notifications';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

interface RestTimerProps {
  restTime: number; // in seconds
  exerciseName: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  restTime,
  exerciseName,
  onComplete,
  onSkip,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(restTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    if (timeRemaining <= 0) {
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  const handleStart = async () => {
    setIsActive(true);
    await scheduleRestTimerNotification(timeRemaining, exerciseName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePause = () => {
    setIsActive(false);
    cancelAllNotifications();
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(restTime);
    cancelAllNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComplete = () => {
    setIsActive(false);
    cancelAllNotifications();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
    setTimeRemaining(restTime);
    cancelAllNotifications();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSkip?.();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / restTime) * 100;
  const color = percentage > 30 ? colors.success : percentage > 10 ? colors.primary : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>REST TIMER</Text>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
      </View>

      <View style={styles.timerContainer}>
        <View style={styles.circleContainer}>
          <View style={styles.circleBackground} />
          <Text style={[styles.timerText, { color }]}>
            {formatTime(timeRemaining)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Ionicons name="play" size={20} color={colors.background} />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Ionicons name="pause" size={20} color={colors.background} />
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleReset}>
          <Ionicons name="refresh" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.ghostButton} onPress={handleSkip}>
          <Text style={styles.ghostButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginVertical: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  exerciseName: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    ...typography.body,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  circleContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  timerText: {
    ...typography.mono,
    fontSize: 32,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  pauseButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  buttonText: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.background,
  },
  ghostButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    ...typography.body,
  },
});
