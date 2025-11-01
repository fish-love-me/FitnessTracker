import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession, NutritionHistory, WeightEntry, UserProfile } from '../types/index';

export function useAsyncStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}

// Specific storage keys
export const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  NUTRITION_LOG: '@nutrition_log',
  WEIGHT_LOG: '@weight_log',
  CURRENT_SESSION: '@current_session',
  USER_PROFILE: '@user_profile',
};

// Helper functions for specific data types
export async function getWorkoutHistory(): Promise<WorkoutSession[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading workout history:', error);
    return [];
  }
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  try {
    const history = await getWorkoutHistory();
    // Update or add session by date
    const existingIndex = history.findIndex(s => s.date === session.date);
    if (existingIndex >= 0) {
      history[existingIndex] = session;
    } else {
      history.push(session);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving workout session:', error);
  }
}

export async function getNutritionLog(): Promise<NutritionHistory> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NUTRITION_LOG);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading nutrition log:', error);
    return {};
  }
}

export async function getWeightLog(): Promise<WeightEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.WEIGHT_LOG);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading weight log:', error);
    return [];
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function getDayName(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

