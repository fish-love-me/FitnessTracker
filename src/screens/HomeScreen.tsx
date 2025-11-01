import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutCard } from '../components/WorkoutCard';
import { ProgressBar } from '../components/ProgressBar';
import { daysOfWeek } from '../data/trainingPlan';
import { useTrainingPlan } from '../hooks/useTrainingPlan';
import { useAsyncStorage, STORAGE_KEYS, getWorkoutHistory, getUserProfile } from '../hooks/useAsyncStorage';
import { getDayName, getDateString, formatDate } from '../hooks/useAsyncStorage';
import type { RootStackParamList, NutritionHistory, WeightEntry } from '../types/index';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { plan } = useTrainingPlan();
  const [currentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(currentDate.getDay());
  const [refreshing, setRefreshing] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useAsyncStorage<Array<{ date: string; workoutName: string }>>(
    STORAGE_KEYS.WORKOUT_HISTORY,
    []
  );
  const [nutritionLog, setNutritionLog] = useAsyncStorage<NutritionHistory>(
    STORAGE_KEYS.NUTRITION_LOG,
    {}
  );
  const [weightLog, setWeightLog] = useAsyncStorage<WeightEntry[]>(
    STORAGE_KEYS.WEIGHT_LOG,
    []
  );
  const [userProfile, setUserProfile] = useAsyncStorage(
    STORAGE_KEYS.USER_PROFILE,
    {
      currentWeight: 65,
      targetWeight: 70,
      startingWeight: 65,
      nutritionTargets: {
        calories: 2800,
        protein: 145,
        carbs: 350,
        fats: 80,
      },
    }
  );

  const selectedDayName = daysOfWeek[selectedDayIndex];
  const todayWorkout = plan[selectedDayName];

  // Calculate weekly progress
  const weeklyProgress = React.useMemo(() => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return getDateString(date);
    });

    const completed = weekDates.filter(date => {
      const workout = Array.isArray(workoutHistory) 
        ? workoutHistory.find((w: any) => w.date === date)
        : null;
      return workout && plan[getDayName(new Date(date))]?.type !== 'rest';
    }).length;

    return { completed, total: 6 };
  }, [workoutHistory, currentDate, plan]);

  // Get today's nutrition
  const todayNutrition = React.useMemo(() => {
    const today = getDateString();
    return nutritionLog[today] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };
  }, [nutritionLog]);

  // Get current weight
  const currentWeight = React.useMemo(() => {
    if (weightLog.length > 0) {
      const sorted = [...weightLog].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].weight;
    }
    return userProfile.currentWeight || 65;
  }, [weightLog, userProfile]);

  const handleStartWorkout = () => {
    if (todayWorkout.type !== 'rest') {
      navigation.navigate('Workout', {
        workoutName: todayWorkout.name,
        exercises: todayWorkout.exercises,
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const history = await getWorkoutHistory();
    const profile = await getUserProfile();
    setWorkoutHistory(history as any);
    if (profile) setUserProfile(profile);
    setRefreshing(false);
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setSelectedDayIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? 6 : prev - 1;
      } else {
        return prev === 6 ? 0 : prev + 1;
      }
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{formatDate(currentDate)}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textSecondary} />
        }
      >
        {/* Day Navigation */}
        <View style={styles.dayNavigation}>
          <TouchableOpacity onPress={() => navigateDay('prev')} style={styles.dayNavButton}>
            <Text style={styles.dayNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.selectedDay}>{selectedDayName}</Text>
          <TouchableOpacity onPress={() => navigateDay('next')} style={styles.dayNavButton}>
            <Text style={styles.dayNavText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Workout Card */}
        <WorkoutCard workout={todayWorkout} dayName={selectedDayName} onStart={handleStartWorkout} />

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <View style={styles.card}>
            <View style={styles.progressNumbers}>
              <Text style={styles.progressCurrent}>{weeklyProgress.completed}</Text>
              <Text style={styles.progressTotal}>/ {weeklyProgress.total}</Text>
            </View>
            <Text style={styles.progressLabel}>Workouts completed</Text>
            <ProgressBar
              current={weeklyProgress.completed}
              target={weeklyProgress.total}
              color={colors.primary}
              height={6}
              style={{ marginTop: spacing.md }}
            />
          </View>
        </View>

        {/* Weight Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENT WEIGHT</Text>
          <View style={styles.card}>
            <View style={styles.weightDisplay}>
              <Text style={styles.weightNumber}>{currentWeight}</Text>
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            <Text style={styles.weightTarget}>
              Target: <Text style={styles.mono}>{userProfile.targetWeight}</Text>kg
            </Text>
          </View>
        </View>

        {/* Nutrition Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S NUTRITION</Text>
          <View style={styles.card}>
            <ProgressBar
              current={todayNutrition.calories}
              target={userProfile.nutritionTargets.calories}
              color={colors.primary}
              height={6}
              showLabel
              label="Calories"
            />

            <ProgressBar
              current={todayNutrition.protein}
              target={userProfile.nutritionTargets.protein}
              color={colors.primary}
              height={6}
              showLabel
              label="Protein"
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </View>

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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  content: {
    padding: spacing.lg,
  },
  dayNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  dayNavButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNavText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  selectedDay: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  progressNumbers: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  progressCurrent: {
    fontSize: fontSizes.numberLarge,
    fontWeight: '600',
    color: colors.textPrimary,
    ...typography.mono,
  },
  progressTotal: {
    fontSize: fontSizes.h3,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
    marginBottom: 2,
    ...typography.body,
  },
  progressLabel: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    ...typography.body,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  weightNumber: {
    fontSize: fontSizes.numberLarge,
    fontWeight: '600',
    color: colors.textPrimary,
    ...typography.mono,
  },
  weightUnit: {
    fontSize: fontSizes.body,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    marginBottom: 4,
    ...typography.body,
  },
  weightTarget: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.small,
  },
});
