import { useState, useEffect, useCallback } from 'react';
import { useAsyncStorage, STORAGE_KEYS, saveWorkoutSession } from './useAsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise, WorkoutSession, ExerciseLog, SetLog } from '../types/index';
import { getDateString } from './useAsyncStorage';

export function useWorkout(workoutName: string, exercises: Exercise[]) {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or restore workout session
  useEffect(() => {
    loadOrCreateSession();
  }, [workoutName]);

  const loadOrCreateSession = async () => {
    try {
      // Try to restore existing session
      const storedSession = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (storedSession) {
        const parsed: WorkoutSession = JSON.parse(storedSession);
        // Only restore if it's from today
        if (parsed.date === getDateString() && parsed.workoutName === workoutName) {
          setSession(parsed);
          setIsLoading(false);
          return;
        }
      }
      
      // Create new session
      const exerciseLogs: ExerciseLog[] = exercises.map(ex => ({
        name: ex.name,
        sets: Array(ex.sets).fill(null).map(() => ({
          weight: '',
          reps: '',
          completed: false,
        })),
        targetSets: ex.sets,
        targetReps: ex.reps,
        rest: ex.rest,
      }));

      const newSession: WorkoutSession = {
        workoutName,
        exercises: exerciseLogs,
        currentExerciseIndex: 0,
        startTime: Date.now(),
        date: getDateString(),
      };

      setSession(newSession);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newSession));
    } catch (error) {
      console.error('Error loading workout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSet = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<SetLog>) => {
    if (!session) return;

    const updatedSession = { ...session };
    updatedSession.exercises = [...session.exercises];
    updatedSession.exercises[exerciseIndex] = { ...session.exercises[exerciseIndex] };
    updatedSession.exercises[exerciseIndex].sets = [...session.exercises[exerciseIndex].sets];
    updatedSession.exercises[exerciseIndex].sets[setIndex] = {
      ...session.exercises[exerciseIndex].sets[setIndex],
      ...updates,
    };

    setSession(updatedSession);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updatedSession));
  }, [session]);

  const completeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, { completed: true });
  }, [updateSet]);

  const setCurrentExercise = useCallback((index: number) => {
    if (!session) return;
    const updatedSession = { ...session, currentExerciseIndex: index };
    setSession(updatedSession);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updatedSession));
  }, [session]);

  const nextExercise = useCallback(() => {
    if (!session) return;
    if (session.currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExercise(session.currentExerciseIndex + 1);
    }
  }, [session, setCurrentExercise]);

  const previousExercise = useCallback(() => {
    if (!session) return;
    if (session.currentExerciseIndex > 0) {
      setCurrentExercise(session.currentExerciseIndex - 1);
    }
  }, [session, setCurrentExercise]);

  const finishWorkout = useCallback(async () => {
    if (!session) return;

    const completedSession: WorkoutSession = {
      ...session,
      endTime: Date.now(),
    };

    await saveWorkoutSession(completedSession);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    setSession(null);
  }, [session]);

  const cancelWorkout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    setSession(null);
  }, []);

  return {
    session,
    isLoading,
    updateSet,
    completeSet,
    setCurrentExercise,
    nextExercise,
    previousExercise,
    finishWorkout,
    cancelWorkout,
  };
}

