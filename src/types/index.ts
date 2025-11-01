export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number; // rest time in seconds
}

export interface WorkoutDay {
  name: string;
  duration: string;
  type: 'strength' | 'hypertrophy' | 'rest';
  exercises: Exercise[];
}

export interface TrainingPlan {
  [key: string]: WorkoutDay;
}

export interface SetLog {
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ExerciseLog {
  name: string;
  sets: SetLog[];
  targetSets: number;
  targetReps: string;
  rest: number;
}

export interface WorkoutSession {
  workoutName: string;
  exercises: ExerciseLog[];
  currentExerciseIndex: number;
  startTime: number;
  endTime?: number;
  date: string;
}

export interface WorkoutHistory {
  [date: string]: WorkoutSession;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionHistory {
  [date: string]: NutritionData;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface WeightHistory {
  [date: string]: number;
}

export interface UserProfile {
  name?: string;
  currentWeight: number;
  targetWeight: number;
  startingWeight: number;
  startDate?: string;
  nutritionTargets: NutritionData;
}

export interface QuickMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface RestTimerState {
  isActive: boolean;
  timeRemaining: number;
  totalTime: number;
}

export type ViewType = 'home' | 'workout' | 'plan' | 'nutrition' | 'progress';

// Stack Navigator types
export type RootStackParamList = {
  MainTabs: undefined;
  Workout: { workoutName: string; exercises: Exercise[] };
};

export type TabParamList = {
  Home: undefined;
  Plan: undefined;
  Nutrition: undefined;
  Progress: undefined;
};

