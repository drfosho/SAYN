import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const GOALS = [
  { id: 'build_muscle', label: 'Build Muscle' },
  { id: 'lose_weight', label: 'Lose Weight' },
  { id: 'gain_strength', label: 'Gain Strength' },
  { id: 'improve_endurance', label: 'Improve Endurance' },
  { id: 'general_fitness', label: 'General Fitness' },
  { id: 'athletic_performance', label: 'Athletic Performance' },
];

interface GoalsSelectorProps {
  selectedGoals: string[];
  onChange: (goals: string[]) => void;
  maxSelections?: number;
}

export default function GoalsSelector({
  selectedGoals,
  onChange,
  maxSelections = 3,
}: GoalsSelectorProps) {
  const handleToggle = (goalId: string) => {
    const isSelected = selectedGoals.includes(goalId);

    if (isSelected) {
      // Remove goal
      onChange(selectedGoals.filter((g) => g !== goalId));
    } else {
      // Add goal (if under max)
      if (selectedGoals.length < maxSelections) {
        onChange([...selectedGoals, goalId]);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fitness Goals (Select up to {maxSelections})</Text>
      <Text style={styles.sublabel}>
        {selectedGoals.length} / {maxSelections} selected
      </Text>

      <View style={styles.goalsGrid}>
        {GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const canSelect = selectedGoals.length < maxSelections || isSelected;

          return (
            <Pressable
              key={goal.id}
              style={[
                styles.goalButton,
                isSelected && styles.goalButtonSelected,
                !canSelect && styles.goalButtonDisabled,
              ]}
              onPress={() => handleToggle(goal.id)}
              disabled={!canSelect && !isSelected}
            >
              <View style={styles.goalContent}>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.goalText, isSelected && styles.goalTextSelected]}>
                  {goal.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  sublabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  goalsGrid: {
    gap: 12,
  },
  goalButton: {
    backgroundColor: '#0d1128',
    borderWidth: 3,
    borderColor: '#1a1f3a',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  goalButtonSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  goalButtonDisabled: {
    opacity: 0.4,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#1a1f3a',
    backgroundColor: '#050814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#00e5ff',
    backgroundColor: '#00e5ff',
  },
  checkmark: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
  goalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  goalTextSelected: {
    color: '#00e5ff',
  },
});
