import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../components/ProgressBar';
import { useAsyncStorage, STORAGE_KEYS, getDateString } from '../hooks/useAsyncStorage';
import type { NutritionHistory, NutritionData, QuickMeal } from '../types/index';
import * as Haptics from 'expo-haptics';
import { colors, typography, fontSizes, spacing, borderRadius } from '../theme';

const QUICK_MEALS: QuickMeal[] = [
  { name: 'Protein Shake', calories: 120, protein: 25, carbs: 3, fats: 1 },
  { name: 'Chicken Breast', calories: 231, protein: 43, carbs: 0, fats: 5 },
  { name: 'Rice (100g)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
  { name: 'Eggs (2)', calories: 140, protein: 12, carbs: 1, fats: 10 },
  { name: 'Greek Yogurt', calories: 130, protein: 11, carbs: 9, fats: 5 },
];

export const NutritionScreen: React.FC = () => {
  const [nutritionLog, setNutritionLog] = useAsyncStorage<NutritionHistory>(
    STORAGE_KEYS.NUTRITION_LOG,
    {}
  );
  const [userProfile] = useAsyncStorage(
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
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [currentMacro, setCurrentMacro] = useState<keyof NutritionData | null>(null);
  const [inputValue, setInputValue] = useState('');

  const today = getDateString();
  const todayNutrition = useMemo(() => {
    return nutritionLog[today] || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };
  }, [nutritionLog, today]);

  const handleMacroInput = (macro: keyof NutritionData) => {
    setCurrentMacro(macro);
    setInputValue(todayNutrition[macro].toString());
    setInputModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMacroSave = () => {
    if (currentMacro && inputValue) {
      const value = parseFloat(inputValue) || 0;
      const updated = {
        ...nutritionLog,
        [today]: {
          ...todayNutrition,
          [currentMacro]: value,
        },
      };
      setNutritionLog(updated);
      setInputModalVisible(false);
      setCurrentMacro(null);
      setInputValue('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleQuickMeal = (meal: QuickMeal) => {
    const updated = {
      ...nutritionLog,
      [today]: {
        calories: todayNutrition.calories + meal.calories,
        protein: todayNutrition.protein + meal.protein,
        carbs: todayNutrition.carbs + meal.carbs,
        fats: todayNutrition.fats + meal.fats,
      },
    };
    setNutritionLog(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleReset = () => {
    const updated = {
      ...nutritionLog,
      [today]: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      },
    };
    setNutritionLog(updated);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nutrition Tracking</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Macro Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S NUTRITION</Text>
          <View style={styles.macroCards}>
            <TouchableOpacity
              style={styles.macroCard}
              onPress={() => handleMacroInput('calories')}
            >
              <Text style={styles.macroLabel}>CALORIES</Text>
              <Text style={styles.macroValue}>
                <Text style={styles.mono}>{Math.round(todayNutrition.calories)}</Text>
                {' / '}
                <Text style={styles.mono}>{userProfile.nutritionTargets.calories}</Text>
              </Text>
              <ProgressBar
                current={todayNutrition.calories}
                target={userProfile.nutritionTargets.calories}
                color={colors.primary}
                height={6}
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.macroCard}
              onPress={() => handleMacroInput('protein')}
            >
              <Text style={styles.macroLabel}>PROTEIN</Text>
              <Text style={styles.macroValue}>
                <Text style={styles.mono}>{Math.round(todayNutrition.protein)}</Text>g / <Text style={styles.mono}>{userProfile.nutritionTargets.protein}</Text>g
              </Text>
              <ProgressBar
                current={todayNutrition.protein}
                target={userProfile.nutritionTargets.protein}
                color={colors.primary}
                height={6}
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.macroCard}
              onPress={() => handleMacroInput('carbs')}
            >
              <Text style={styles.macroLabel}>CARBS</Text>
              <Text style={styles.macroValue}>
                <Text style={styles.mono}>{Math.round(todayNutrition.carbs)}</Text>g / <Text style={styles.mono}>{userProfile.nutritionTargets.carbs}</Text>g
              </Text>
              <ProgressBar
                current={todayNutrition.carbs}
                target={userProfile.nutritionTargets.carbs}
                color={colors.primary}
                height={6}
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.macroCard}
              onPress={() => handleMacroInput('fats')}
            >
              <Text style={styles.macroLabel}>FATS</Text>
              <Text style={styles.macroValue}>
                <Text style={styles.mono}>{Math.round(todayNutrition.fats)}</Text>g / <Text style={styles.mono}>{userProfile.nutritionTargets.fats}</Text>g
              </Text>
              <ProgressBar
                current={todayNutrition.fats}
                target={userProfile.nutritionTargets.fats}
                color={colors.primary}
                height={6}
                style={{ marginTop: spacing.md }}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Add Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ADD</Text>
          <View style={styles.quickMealsGrid}>
            {QUICK_MEALS.map((meal, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickMealButton}
                onPress={() => handleQuickMeal(meal)}
              >
                <Text style={styles.quickMealName}>{meal.name}</Text>
                <Text style={styles.quickMealCalories}>
                  <Text style={styles.mono}>{meal.calories}</Text> cal
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color={colors.textPrimary} />
          <Text style={styles.resetButtonText}>Reset Today</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Input Modal */}
      <Modal
        visible={inputModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInputModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Enter {currentMacro ? currentMacro.charAt(0).toUpperCase() + currentMacro.slice(1) : 'Macro'}
              </Text>
              <TouchableOpacity onPress={() => setInputModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <NumberPad
              value={inputValue}
              onChange={setInputValue}
              onConfirm={handleMacroSave}
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
  sectionTitle: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  macroCards: {
    gap: spacing.md,
  },
  macroCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  macroLabel: {
    ...typography.body,
    fontSize: fontSizes.label,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  macroValue: {
    fontSize: fontSizes.body,
    color: colors.textPrimary,
    ...typography.body,
  },
  mono: {
    ...typography.mono,
    fontSize: fontSizes.number,
  },
  quickMealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickMealButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  quickMealName: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  quickMealCalories: {
    fontSize: fontSizes.small,
    color: colors.textSecondary,
    ...typography.body,
  },
  resetButton: {
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
  resetButtonText: {
    ...typography.body,
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.textPrimary,
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
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.background,
  },
});
