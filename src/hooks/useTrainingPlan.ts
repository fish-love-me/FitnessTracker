import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trainingPlan as defaultTrainingPlan, daysOfWeek } from '../data/trainingPlan';
import type { TrainingPlan } from '../types/index';

const STORAGE_KEY = '@training_plan';

export function useTrainingPlan() {
  const [plan, setPlan] = useState<TrainingPlan>(defaultTrainingPlan);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPlan(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading training plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async (newPlan: TrainingPlan) => {
    try {
      setPlan(newPlan);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
    } catch (error) {
      console.error('Error saving training plan:', error);
    }
  };

  const resetPlan = async () => {
    await savePlan(defaultTrainingPlan);
  };

  return { plan, savePlan, resetPlan, isLoading, daysOfWeek };
}

