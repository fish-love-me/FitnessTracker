import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { ExerciseSet } from '../components/ExerciseSet';
import { RestTimer } from '../components/RestTimer';
import { useWorkout } from '../hooks/useWorkout';
import type { RootStackParamList, Exercise } from '../types/index';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

type WorkoutScreenRouteProp = RouteProp<RootStackParamList, 'Workout'>;

export const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<WorkoutScreenRouteProp>();
  const { workoutName, exercises } = route.params;
  const [showRestTimer, setShowRestTimer] = useState(false);

  useKeepAwake();

  const {
    session,
    isLoading,
    updateSet,
    completeSet,
    nextExercise,
    previousExercise,
    finishWorkout,
    cancelWorkout,
  } = useWorkout(workoutName, exercises);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleExit}
          style={{ marginLeft: 16 }}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      ),
      headerTitle: workoutName,
      headerStyle: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontWeight: '500', ...typography.heading, fontSize: fontSizes.h3 },
    });
  }, [navigation, workoutName]);

  if (isLoading || !session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = session.exercises[session.currentExerciseIndex];
  const completedSets = currentExercise.sets.filter(s => s.completed).length;
  const totalSets = currentExercise.targetSets;

  const handleSetUpdate = (setIndex: number, updates: Partial<{ weight: string; reps: string; completed: boolean }>) => {
    updateSet(session.currentExerciseIndex, setIndex, updates);
  };

  const handleSetComplete = (setIndex: number) => {
    completeSet(session.currentExerciseIndex, setIndex);
    if (setIndex < totalSets - 1) {
      setShowRestTimer(true);
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleFinish = async () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          style: 'default',
          onPress: async () => {
            await finishWorkout();
            const totalTime = session.endTime 
              ? Math.round((session.endTime - session.startTime) / 60000)
              : Math.round((Date.now() - session.startTime) / 60000);
            try {
              await Share.share({
                message: `Just completed ${workoutName}! 💪\nDuration: ${totalTime} minutes`,
              });
            } catch (error) {}
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Workout',
      'Your progress will be saved. Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            await cancelWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleNext = () => {
    setShowRestTimer(false);
    nextExercise();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePrevious = () => {
    setShowRestTimer(false);
    previousExercise();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>PROGRESS</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((session.currentExerciseIndex + 1) / session.exercises.length) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Exercise <Text style={styles.mono}>{session.currentExerciseIndex + 1}</Text> of <Text style={styles.mono}>{session.exercises.length}</Text>
          </Text>
        </View>

        {/* Current Exercise */}
        <View style={styles.card}>
          <Text style={styles.exerciseName}>{currentExercise.name}</Text>
          <Text style={styles.exerciseInfo}>
            Target: <Text style={styles.mono}>{currentExercise.targetSets}</Text> sets × <Text style={styles.mono}>{currentExercise.targetReps}</Text> reps
          </Text>
          <Text style={styles.setsProgress}>
            <Text style={styles.mono}>{completedSets}</Text> / <Text style={styles.mono}>{totalSets}</Text> sets completed
          </Text>

          {/* Sets */}
          <View style={styles.setsContainer}>
            {currentExercise.sets.map((set, index) => (
              <ExerciseSet
                key={index}
                setLog={set}
                setNumber={index + 1}
                onUpdate={(updates) => handleSetUpdate(index, updates)}
                onComplete={() => handleSetComplete(index)}
              />
            ))}
          </View>
        </View>

        {/* Rest Timer */}
        {showRestTimer && (
          <RestTimer
            restTime={currentExercise.rest}
            exerciseName={currentExercise.name}
            onComplete={handleRestComplete}
            onSkip={handleRestComplete}
          />
        )}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, session.currentExerciseIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={session.currentExerciseIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, session.currentExerciseIndex === session.exercises.length - 1 && styles.navButtonDisabled]}
            onPress={handleNext}
            disabled={session.currentExerciseIndex === session.exercises.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Finish Button */}
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Ionicons name="checkmark-circle" size={20} color={colors.background} />
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    ...typography.body,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    ...typography.body,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: fontSizes.small,
    ...typography.body,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.small,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  exerciseName: {
    fontSize: fontSizes.h2,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    ...typography.heading,
  },
  exerciseInfo: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    ...typography.body,
  },
  setsProgress: {
    fontSize: fontSizes.body,
    color: colors.success,
    marginBottom: spacing.lg,
    fontWeight: '600',
    ...typography.body,
  },
  setsContainer: {
    gap: spacing.sm,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    fontWeight: '600',
    ...typography.body,
  },
  finishButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  finishButtonText: {
    color: colors.background,
    fontSize: fontSizes.body,
    fontWeight: '600',
    ...typography.body,
  },
});
