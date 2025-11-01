import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAsyncStorage, STORAGE_KEYS, getWorkoutHistory, saveUserProfile } from '../hooks/useAsyncStorage';
import type { WorkoutSession, WeightEntry } from '../types/index';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';
import * as Haptics from 'expo-haptics';
import { getDateString } from '../hooks/useAsyncStorage';

export const ProgressScreen: React.FC = () => {
  const [workoutHistory, setWorkoutHistory] = useAsyncStorage<WorkoutSession[]>(
    STORAGE_KEYS.WORKOUT_HISTORY,
    []
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

  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [targetWeightModalVisible, setTargetWeightModalVisible] = useState(false);
  const [startingWeightModalVisible, setStartingWeightModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [editingWeight, setEditingWeight] = useState<'current' | 'target' | 'starting' | null>(null);

  const stats = useMemo(() => {
    const workouts = Array.isArray(workoutHistory) ? workoutHistory : [];
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => {
      if (w.endTime) {
        return sum + (w.endTime - w.startTime);
      }
      return sum;
    }, 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60000) : 0;

    const sortedWeights = [...weightLog].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : userProfile.currentWeight;
    const weightChange = currentWeight - userProfile.startingWeight;
    const weightToTarget = userProfile.targetWeight - currentWeight;

    return {
      totalWorkouts,
      avgDuration,
      currentWeight,
      weightChange,
      weightToTarget,
    };
  }, [workoutHistory, weightLog, userProfile]);

  const sortedWorkouts = useMemo(() => {
    if (!Array.isArray(workoutHistory)) return [];
    return [...workoutHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [workoutHistory]);

  const formatWorkoutDuration = (session: WorkoutSession): string => {
    if (!session.endTime) return '—';
    const duration = Math.round((session.endTime - session.startTime) / 60000);
    return `${duration} min`;
  };

  const handleEditCurrentWeight = () => {
    setEditingWeight('current');
    setWeightInput(stats.currentWeight.toString());
    setWeightModalVisible(true);
  };

  const handleEditTargetWeight = () => {
    setEditingWeight('target');
    setWeightInput(userProfile.targetWeight.toString());
    setTargetWeightModalVisible(true);
  };

  const handleEditStartingWeight = () => {
    setEditingWeight('starting');
    setWeightInput(userProfile.startingWeight.toString());
    setStartingWeightModalVisible(true);
  };

  const handleSaveWeight = () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight');
      return;
    }

    if (editingWeight === 'current') {
      const today = getDateString();
      const updated = [...weightLog];
      const existingIndex = updated.findIndex(w => w.date === today);
      if (existingIndex >= 0) {
        updated[existingIndex] = { date: today, weight };
      } else {
        updated.unshift({ date: today, weight });
      }
      setWeightLog(updated);
      setWeightModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (editingWeight === 'target') {
      setUserProfile({ ...userProfile, targetWeight: weight });
      saveUserProfile({ ...userProfile, targetWeight: weight });
      setTargetWeightModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (editingWeight === 'starting') {
      setUserProfile({ ...userProfile, startingWeight: weight });
      saveUserProfile({ ...userProfile, startingWeight: weight });
      setStartingWeightModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setWeightInput('');
    setEditingWeight(null);
  };

  const handleDeleteWorkout = (session: WorkoutSession) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${session.workoutName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = workoutHistory.filter(w => w.date !== session.date);
            setWorkoutHistory(updated);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const NumberPad: React.FC<{ value: string; onChange: (v: string) => void; onConfirm: () => void; title: string }> = ({
    value,
    onChange,
    onConfirm,
    title,
  }) => {
    const handleNumberPress = (num: string) => {
      if (value === '0' && num !== '.') {
        onChange(num);
      } else {
        onChange(value + num);
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleBackspace = () => {
      if (value.length > 0) {
        onChange(value.slice(0, -1));
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    return (
      <View style={styles.numberPad}>
        <View style={styles.numberPadDisplay}>
          <Text style={styles.numberPadValue}>{value || '0'}</Text>
        </View>
        <View style={styles.numberPadGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.numberPadButton,
                item === '⌫' && styles.numberPadButtonSpecial,
              ]}
              onPress={() => {
                if (item === '⌫') {
                  handleBackspace();
                } else {
                  handleNumberPress(item);
                }
              }}
            >
              <Text style={styles.numberPadButtonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Text style={styles.confirmButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWorkoutItem = ({ item }: { item: WorkoutSession }) => (
    <View style={styles.workoutItem}>
      <View style={styles.workoutItemLeft}>
        <View style={styles.workoutIcon}>
          <Ionicons name="barbell" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.workoutItemName}>{item.workoutName}</Text>
          <Text style={styles.workoutItemDate}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>
      <View style={styles.workoutItemRight}>
        <View style={{ alignItems: 'flex-end', marginBottom: spacing.xs }}>
          <Text style={styles.workoutItemDuration}>{formatWorkoutDuration(item)}</Text>
          <Text style={styles.workoutItemExercises}>
            <Text style={styles.mono}>{item.exercises.length}</Text> exercises
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWorkout(item)}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard} onPress={handleEditCurrentWeight}>
              <Ionicons name="scale" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{stats.currentWeight}</Text>
              <Text style={styles.statLabel}>Current Weight (kg)</Text>
              <Ionicons name="create-outline" size={16} color={colors.textTertiary} style={{ marginTop: spacing.xs }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.statCard} onPress={handleEditTargetWeight}>
              <Ionicons name="flag" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{userProfile.targetWeight}</Text>
              <Text style={styles.statLabel}>Target Weight (kg)</Text>
              <Ionicons name="create-outline" size={16} color={colors.textTertiary} style={{ marginTop: spacing.xs }} />
            </TouchableOpacity>

            <View style={styles.statCard}>
              <Ionicons name="trophy" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="time" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{stats.avgDuration}</Text>
              <Text style={styles.statLabel}>Avg Duration (min)</Text>
            </View>
          </View>
        </View>

        {/* Weight Progress */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WEIGHT PROGRESS</Text>
            <TouchableOpacity onPress={handleEditStartingWeight} style={styles.editButton}>
              <Ionicons name="create-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.editButtonText}>Edit Start</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.weightProgressBar}>
              <View style={styles.weightProgressFill}>
                <View
                  style={[
                    styles.weightProgressIndicator,
                    {
                      left: `${Math.min(Math.max(((stats.currentWeight - userProfile.startingWeight) / 
                        (userProfile.targetWeight - userProfile.startingWeight)) * 100, 0), 100)}%`,
                    },
                  ]}
                >
                  <View style={styles.weightProgressDot} />
                  <Text style={styles.weightProgressLabel}>
                    <Text style={styles.mono}>{stats.currentWeight}</Text>kg
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.weightProgressLabels}>
              <Text style={styles.weightProgressLabelText}>
                Start: <Text style={styles.mono}>{userProfile.startingWeight}</Text>kg
              </Text>
              <Text style={styles.weightProgressLabelText}>
                Target: <Text style={styles.mono}>{userProfile.targetWeight}</Text>kg
              </Text>
            </View>
            {stats.weightToTarget > 0 && (
              <Text style={styles.weightToTarget}>
                <Text style={styles.mono}>{stats.weightToTarget.toFixed(1)}</Text>kg to reach your target
              </Text>
            )}
          </View>
        </View>

        {/* Workout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WORKOUT HISTORY</Text>
          {sortedWorkouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={48} color={colors.textTertiary} />
              <Text style={styles.emptyStateText}>No workouts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Complete your first workout to see it here
              </Text>
            </View>
          ) : (
            <FlatList
              data={sortedWorkouts}
              renderItem={renderWorkoutItem}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              scrollEnabled={false}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Weight Input Modal */}
      <Modal
        visible={weightModalVisible || targetWeightModalVisible || startingWeightModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setWeightModalVisible(false);
          setTargetWeightModalVisible(false);
          setStartingWeightModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingWeight === 'current' && 'Enter Current Weight (kg)'}
                {editingWeight === 'target' && 'Enter Target Weight (kg)'}
                {editingWeight === 'starting' && 'Enter Starting Weight (kg)'}
              </Text>
              <TouchableOpacity onPress={() => {
                setWeightModalVisible(false);
                setTargetWeightModalVisible(false);
                setStartingWeightModalVisible(false);
              }}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <NumberPad
              value={weightInput}
              onChange={setWeightInput}
              onConfirm={handleSaveWeight}
              title=""
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: fontSizes.h1,
    color: colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.numberLarge,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    ...typography.mono,
  },
  statLabel: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    ...typography.body,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  weightProgressBar: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    position: 'relative',
  },
  weightProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    width: '100%',
    position: 'relative',
  },
  weightProgressIndicator: {
    position: 'absolute',
    top: -24,
    alignItems: 'center',
    transform: [{ translateX: -15 }],
  },
  weightProgressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.textPrimary,
    borderWidth: 3,
    borderColor: colors.primary,
    marginBottom: spacing.xs,
  },
  weightProgressLabel: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    ...typography.body,
  },
  weightProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weightProgressLabelText: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  weightToTarget: {
    fontSize: fontSizes.body,
    color: colors.primary,
    fontWeight: '500',
    ...typography.body,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  workoutItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutItemName: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    ...typography.body,
  },
  workoutItemDate: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  workoutItemRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  workoutItemDuration: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.primary,
    ...typography.body,
  },
  workoutItemExercises: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.small,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    ...typography.body,
  },
  emptyStateSubtext: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    textAlign: 'center',
    ...typography.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.h3,
    fontWeight: '500',
    color: colors.textPrimary,
    ...typography.heading,
  },
  numberPad: {
    width: '100%',
  },
  numberPadDisplay: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  numberPadValue: {
    fontSize: 48,
    fontWeight: '600',
    color: colors.textPrimary,
    ...typography.mono,
  },
  numberPadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  numberPadButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberPadButtonSpecial: {
    backgroundColor: colors.surface,
  },
  numberPadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    ...typography.mono,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.background,
    fontSize: fontSizes.body,
    fontWeight: '600',
    ...typography.body,
  },
});
