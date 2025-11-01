import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';
import type { WorkoutDay } from '../types/index';

interface WorkoutCardProps {
  workout: WorkoutDay;
  dayName: string;
  onStart: () => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, dayName, onStart }) => {
  const isRestDay = workout.type === 'rest';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.dayLabel}>{dayName.toUpperCase()}</Text>
        <Text style={styles.workoutName}>{workout.name}</Text>
        {!isRestDay && <Text style={styles.duration}>{workout.duration}</Text>}
      </View>

      {isRestDay ? (
        <View style={styles.restDay}>
          <Ionicons name="moon" size={48} color={colors.textTertiary} />
          <Text style={styles.restText}>Rest day - Recovery is important</Text>
        </View>
      ) : (
        <>
          <View style={styles.exerciseList}>
            <Text style={styles.exerciseTitle}>EXERCISES</Text>
            {workout.exercises.slice(0, 3).map((exercise, idx) => (
              <Text key={idx} style={styles.exerciseItem}>
                {exercise.name} — {exercise.sets}×{exercise.reps}
              </Text>
            ))}
            {workout.exercises.length > 3 && (
              <Text style={styles.moreExercises}>
                +{workout.exercises.length - 3} more exercises
              </Text>
            )}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>START WORKOUT</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  dayLabel: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  workoutName: {
    ...typography.heading,
    fontSize: fontSizes.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  duration: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  restDay: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restText: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    marginTop: spacing.md,
    ...typography.body,
  },
  exerciseList: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  exerciseTitle: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    lineHeight: 24,
    ...typography.body,
  },
  moreExercises: {
    fontSize: fontSizes.small,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
    ...typography.body,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.background,
  },
});
