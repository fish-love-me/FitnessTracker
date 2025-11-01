import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SetLog } from '../types/index';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

interface ExerciseSetProps {
  setLog: SetLog;
  setNumber: number;
  onUpdate: (updates: Partial<SetLog>) => void;
  onComplete: () => void;
}

export const ExerciseSet: React.FC<ExerciseSetProps> = ({
  setLog,
  setNumber,
  onUpdate,
  onComplete,
}) => {
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [repsModalVisible, setRepsModalVisible] = useState(false);
  const [tempWeight, setTempWeight] = useState(setLog.weight);
  const [tempReps, setTempReps] = useState(setLog.reps);

  const handleWeightConfirm = () => {
    onUpdate({ weight: tempWeight });
    setWeightModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRepsConfirm = () => {
    onUpdate({ reps: tempReps });
    setRepsModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleComplete = () => {
    onUpdate({ completed: true });
    onComplete();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const NumberPad: React.FC<{ value: string; onChange: (v: string) => void; onConfirm: () => void }> = ({
    value,
    onChange,
    onConfirm,
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

  return (
    <View style={[styles.container, setLog.completed && styles.containerCompleted]}>
      <View style={styles.setNumber}>
        <Text style={[styles.setNumberText, setLog.completed && styles.setNumberTextCompleted]}>
          {setNumber}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setWeightModalVisible(true)}
        disabled={setLog.completed}
      >
        <Text style={[styles.inputLabel, setLog.completed && styles.inputLabelCompleted]}>
          WEIGHT
        </Text>
        <Text style={[styles.inputValue, setLog.completed && styles.inputValueCompleted]}>
          {setLog.weight || '—'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setRepsModalVisible(true)}
        disabled={setLog.completed}
      >
        <Text style={[styles.inputLabel, setLog.completed && styles.inputLabelCompleted]}>
          REPS
        </Text>
        <Text style={[styles.inputValue, setLog.completed && styles.inputValueCompleted]}>
          {setLog.reps || '—'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleComplete}
        disabled={setLog.completed || !setLog.weight || !setLog.reps}
      >
        {setLog.completed ? (
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color={colors.textTertiary} />
        )}
      </TouchableOpacity>

      {/* Weight Input Modal */}
      <Modal
        visible={weightModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setWeightModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Weight (kg)</Text>
              <TouchableOpacity onPress={() => setWeightModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <NumberPad
              value={tempWeight}
              onChange={setTempWeight}
              onConfirm={handleWeightConfirm}
            />
          </View>
        </View>
      </Modal>

      {/* Reps Input Modal */}
      <Modal
        visible={repsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRepsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Reps</Text>
              <TouchableOpacity onPress={() => setRepsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <NumberPad
              value={tempReps}
              onChange={setTempReps}
              onConfirm={handleRepsConfirm}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  containerCompleted: {
    backgroundColor: colors.surface,
    opacity: 0.7,
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setNumberText: {
    ...typography.body,
    fontSize: fontSizes.small,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  setNumberTextCompleted: {
    color: colors.success,
  },
  inputContainer: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  inputLabel: {
    ...typography.body,
    fontSize: fontSizes.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  inputLabelCompleted: {
    color: colors.textTertiary,
  },
  inputValue: {
    ...typography.mono,
    fontSize: fontSizes.number,
    color: colors.textPrimary,
  },
  inputValueCompleted: {
    color: colors.success,
  },
  completeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
    ...typography.heading,
    fontSize: fontSizes.h3,
    color: colors.textPrimary,
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
    color: colors.background,
    fontSize: fontSizes.body,
    fontWeight: '600',
  },
});
