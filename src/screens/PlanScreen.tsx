import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrainingPlan } from '../hooks/useTrainingPlan';
import type { WorkoutDay, Exercise } from '../types/index';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';
import * as Haptics from 'expo-haptics';

export const PlanScreen: React.FC = () => {
  const { plan, savePlan, resetPlan, daysOfWeek } = useTrainingPlan();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingExercise, setEditingExercise] = useState<{ dayName: string; index: number } | null>(null);
  const [editExerciseData, setEditExerciseData] = useState<Exercise | null>(null);
  const [draggedDay, setDraggedDay] = useState<string | null>(null);
  const [draggedExercise, setDraggedExercise] = useState<{ dayName: string; index: number } | null>(null);

  const toggleDay = (dayName: string) => {
    if (!editMode) {
      setExpandedDays(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dayName)) {
          newSet.delete(dayName);
        } else {
          newSet.add(dayName);
        }
        return newSet;
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleEditMode = () => {
    if (!editMode) {
      // Expand all days when entering edit mode
      setExpandedDays(new Set(daysOfWeek));
    } else {
      // Collapse all when exiting edit mode
      setExpandedDays(new Set());
    }
    setEditMode(!editMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSwapWorkouts = (day1: string, day2: string) => {
    if (day1 === day2) return;
    
    const updated = { ...plan };
    const temp = updated[day1];
    updated[day1] = updated[day2];
    updated[day2] = temp;
    savePlan(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleMoveExercise = (fromDay: string, fromIndex: number, toDay: string, toIndex: number) => {
    if (fromDay === toDay && fromIndex === toIndex) return;
    
    const updated = { ...plan };
    const exercise = updated[fromDay].exercises[fromIndex];
    
    // Remove from original position
    updated[fromDay] = {
      ...updated[fromDay],
      exercises: updated[fromDay].exercises.filter((_, i) => i !== fromIndex),
    };
    
    // Insert at new position
    const newExercises = [...updated[toDay].exercises];
    newExercises.splice(toIndex, 0, exercise);
    updated[toDay] = {
      ...updated[toDay],
      exercises: newExercises,
    };
    
    savePlan(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraggedExercise(null);
  };

  const handleDeleteExercise = (dayName: string, index: number) => {
    Alert.alert(
      'Delete Exercise',
      `Remove "${plan[dayName].exercises[index].name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = { ...plan };
            updated[dayName] = {
              ...updated[dayName],
              exercises: updated[dayName].exercises.filter((_, i) => i !== index),
            };
            savePlan(updated);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleResetDay = (dayName: string) => {
    Alert.alert(
      'Reset Day',
      `Reset ${dayName} to default?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            const { trainingPlan: defaultPlan } = await import('../data/trainingPlan');
            const updated = { ...plan };
            updated[dayName] = defaultPlan[dayName];
            savePlan(updated);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const handleEditExercise = (dayName: string, index: number) => {
    const exercise = plan[dayName].exercises[index];
    setEditingExercise({ dayName, index });
    setEditExerciseData({ ...exercise });
  };

  const handleSaveExercise = () => {
    if (!editingExercise || !editExerciseData) return;
    
    const updated = { ...plan };
    updated[editingExercise.dayName] = {
      ...updated[editingExercise.dayName],
      exercises: updated[editingExercise.dayName].exercises.map((ex, i) =>
        i === editingExercise.index ? editExerciseData : ex
      ),
    };
    savePlan(updated);
    setEditingExercise(null);
    setEditExerciseData(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const renderWorkoutDay = (dayName: string, workout: WorkoutDay, dayIndex: number) => {
    const isExpanded = expandedDays.has(dayName);
    const isRestDay = workout.type === 'rest';

    return (
      <View key={dayName} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <TouchableOpacity
            style={styles.dayHeaderLeft}
            onPress={() => toggleDay(dayName)}
            activeOpacity={0.7}
            disabled={editMode}
          >
            <View style={[styles.dayIndicator, isRestDay && styles.dayIndicatorRest]} />
            <View>
              <Text style={styles.dayName}>{dayName.toUpperCase()}</Text>
              <Text style={styles.workoutName}>{workout.name}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.dayHeaderRight}>
            {!editMode && (
              <>
                <Text style={styles.duration}>{workout.duration}</Text>
                <TouchableOpacity onPress={() => toggleDay(dayName)}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </>
            )}
            {editMode && (
              <View style={styles.editDayActions}>
                {dayIndex > 0 && (
                  <TouchableOpacity
                    style={styles.swapButton}
                    onPress={() => handleSwapWorkouts(dayName, daysOfWeek[dayIndex - 1])}
                  >
                    <Ionicons name="chevron-up" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {dayIndex < daysOfWeek.length - 1 && (
                  <TouchableOpacity
                    style={styles.swapButton}
                    onPress={() => handleSwapWorkouts(dayName, daysOfWeek[dayIndex + 1])}
                  >
                    <Ionicons name="chevron-down" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {!isRestDay && workout.exercises.length > 0 && (
                  <TouchableOpacity
                    style={styles.resetDayButton}
                    onPress={() => handleResetDay(dayName)}
                  >
                    <Ionicons name="refresh" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {(isExpanded || editMode) && (
          <View style={styles.dayContent}>
            {isRestDay ? (
              <View style={styles.restDayContent}>
                <Ionicons name="moon" size={48} color={colors.textTertiary} />
                <Text style={styles.restText}>Take a well-deserved rest</Text>
              </View>
            ) : (
              <View style={styles.exercisesList}>
                <View style={styles.exerciseTitleRow}>
                  <Text style={styles.exerciseTitle}>EXERCISES</Text>
                </View>
                {workout.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    {editMode && (
                      <View style={styles.exerciseDragButtons}>
                        {index > 0 && (
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => handleMoveExercise(dayName, index, dayName, index - 1)}
                          >
                            <Ionicons name="chevron-up" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                        {index < workout.exercises.length - 1 && (
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => handleMoveExercise(dayName, index, dayName, index + 1)}
                          >
                            <Ionicons name="chevron-down" size={16} color={colors.primary} />
                          </TouchableOpacity>
                        )}
                        {daysOfWeek.map((otherDay, otherDayIndex) => {
                          if (otherDay === dayName || plan[otherDay].type === 'rest') return null;
                          return (
                            <TouchableOpacity
                              key={otherDay}
                              style={styles.moveToDayButton}
                              onPress={() => {
                                const targetExercises = plan[otherDay].exercises.length;
                                handleMoveExercise(dayName, index, otherDay, targetExercises);
                              }}
                            >
                              <Text style={styles.moveToDayText}>{otherDay.substring(0, 3)}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                    <View style={styles.exerciseNumber}>
                      <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.exerciseDetails}
                      onPress={() => editMode && handleEditExercise(dayName, index)}
                      disabled={!editMode}
                    >
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseSetsReps}>
                        <Text style={styles.mono}>{exercise.sets}</Text> sets × <Text style={styles.mono}>{exercise.reps}</Text> reps
                      </Text>
                      <Text style={styles.exerciseRest}>
                        Rest: <Text style={styles.mono}>{Math.floor(exercise.rest / 60)}:{(exercise.rest % 60).toString().padStart(2, '0')}</Text>
                      </Text>
                    </TouchableOpacity>
                    {editMode && (
                      <TouchableOpacity
                        style={styles.deleteExerciseButton}
                        onPress={() => handleDeleteExercise(dayName, index)}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {workout.exercises.length === 0 && (
                  <View style={styles.emptyExercises}>
                    <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plan</Text>
        <TouchableOpacity
          onPress={toggleEditMode}
          style={[styles.editButton, editMode && styles.editButtonActive]}
        >
          <Ionicons name={editMode ? "checkmark" : "create-outline"} size={20} color={editMode ? colors.primary : colors.textSecondary} />
          <Text style={[styles.editButtonText, editMode && styles.editButtonTextActive]}>
            {editMode ? 'Done' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.textSecondary} />
        }
      >
        {daysOfWeek.map((dayName, index) => {
          const workout = plan[dayName];
          return renderWorkoutDay(dayName, workout, index);
        })}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Exercise Modal */}
      <Modal
        visible={editingExercise !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setEditingExercise(null);
          setEditExerciseData(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Exercise</Text>
              <TouchableOpacity onPress={() => {
                setEditingExercise(null);
                setEditExerciseData(null);
              }}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {editExerciseData && (
              <ScrollView style={styles.editExerciseContent}>
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Exercise Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editExerciseData.name}
                    onChangeText={(text) => setEditExerciseData({ ...editExerciseData, name: text })}
                    placeholder="Exercise name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Sets</Text>
                  <View style={styles.numberInputRow}>
                    <TouchableOpacity
                      style={styles.numberInputButton}
                      onPress={() => {
                        const currentSets = parseInt(editExerciseData.sets.toString()) || 1;
                        setEditExerciseData({ ...editExerciseData, sets: Math.max(1, currentSets - 1) });
                      }}
                    >
                      <Ionicons name="remove" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.numberDisplay}>{editExerciseData.sets}</Text>
                    <TouchableOpacity
                      style={styles.numberInputButton}
                      onPress={() => {
                        const currentSets = parseInt(editExerciseData.sets.toString()) || 1;
                        setEditExerciseData({ ...editExerciseData, sets: currentSets + 1 });
                      }}
                    >
                      <Ionicons name="add" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Reps</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editExerciseData.reps}
                    onChangeText={(text) => setEditExerciseData({ ...editExerciseData, reps: text })}
                    placeholder="e.g., 8-12"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Rest Time (seconds)</Text>
                  <View style={styles.restTimeControls}>
                    <TouchableOpacity
                      style={styles.restTimeButton}
                      onPress={() => {
                        setEditExerciseData({
                          ...editExerciseData,
                          rest: Math.max(0, editExerciseData.rest - 15),
                        });
                      }}
                    >
                      <Ionicons name="remove" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.restTimeDisplay}>
                      {Math.floor(editExerciseData.rest / 60)}:{(editExerciseData.rest % 60).toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.restTimeButton}
                      onPress={() => {
                        setEditExerciseData({
                          ...editExerciseData,
                          rest: editExerciseData.rest + 15,
                        });
                      }}
                    >
                      <Ionicons name="add" size={20} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSaveExercise}>
                  <Text style={styles.saveButtonText}>Save Exercise</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading,
    fontSize: fontSizes.h1,
    color: colors.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  editButtonText: {
    ...typography.body,
    fontSize: fontSizes.small,
    color: colors.textSecondary,
  },
  editButtonTextActive: {
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  dayIndicator: {
    width: 4,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  dayIndicatorRest: {
    backgroundColor: colors.textTertiary,
  },
  dayName: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  workoutName: {
    ...typography.heading,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  duration: {
    fontSize: fontSizes.small,
    color: colors.textTertiary,
    ...typography.body,
  },
  editDayActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  swapButton: {
    padding: spacing.xs,
  },
  resetDayButton: {
    padding: spacing.xs,
  },
  dayContent: {
    padding: spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  restDayContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  restText: {
    color: colors.textSecondary,
    fontSize: fontSizes.body,
    marginTop: spacing.md,
    ...typography.body,
  },
  exercisesList: {
    gap: spacing.md,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  exerciseDragButtons: {
    flexDirection: 'column',
    gap: spacing.xs,
    alignItems: 'center',
  },
  moveButton: {
    padding: spacing.xs,
  },
  moveToDayButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moveToDayText: {
    ...typography.body,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseNumberText: {
    ...typography.body,
    fontSize: fontSizes.small,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  exerciseSetsReps: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    ...typography.body,
  },
  exerciseRest: {
    fontSize: fontSizes.small,
    color: colors.textTertiary,
    ...typography.body,
  },
  deleteExerciseButton: {
    padding: spacing.xs,
  },
  emptyExercises: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyExercisesText: {
    color: colors.textTertiary,
    fontSize: fontSizes.body,
    fontStyle: 'italic',
    ...typography.body,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.small,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.heading,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
  },
  editExerciseContent: {
    maxHeight: 500,
  },
  editField: {
    marginBottom: spacing.lg,
  },
  editLabel: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
  },
  textInput: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSizes.body,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
  },
  numberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numberInputButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberDisplay: {
    ...typography.mono,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
    minWidth: 60,
    textAlign: 'center',
  },
  restTimeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  restTimeButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimeDisplay: {
    ...typography.mono,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
    minWidth: 80,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.background,
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
    ...typography.mono,
    fontSize: 48,
    color: colors.textPrimary,
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
    ...typography.mono,
    fontSize: 24,
    color: colors.textPrimary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.background,
  },
});
