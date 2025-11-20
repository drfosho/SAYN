import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', sublabel: '< 1 year' },
  { id: 'intermediate', label: 'Intermediate', sublabel: '1-3 years' },
  { id: 'advanced', label: 'Advanced', sublabel: '3-5 years' },
  { id: 'expert', label: 'Expert', sublabel: '5+ years' },
];

interface ExperienceSelectorProps {
  selectedLevel: string | null;
  onChange: (level: string) => void;
}

export default function ExperienceSelector({
  selectedLevel,
  onChange,
}: ExperienceSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Experience Level</Text>

      <View style={styles.levelsGrid}>
        {EXPERIENCE_LEVELS.map((level) => {
          const isSelected = selectedLevel === level.id;

          return (
            <Pressable
              key={level.id}
              style={[styles.levelButton, isSelected && styles.levelButtonSelected]}
              onPress={() => onChange(level.id)}
            >
              <View style={styles.levelContent}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.levelTextContainer}>
                  <Text style={[styles.levelText, isSelected && styles.levelTextSelected]}>
                    {level.label}
                  </Text>
                  <Text style={[styles.levelSublabel, isSelected && styles.levelSublabelSelected]}>
                    {level.sublabel}
                  </Text>
                </View>
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
    marginBottom: 12,
  },
  levelsGrid: {
    gap: 12,
  },
  levelButton: {
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
  levelButtonSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  levelContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1a1f3a',
    backgroundColor: '#050814',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#00e5ff',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00e5ff',
  },
  levelTextContainer: {
    flex: 1,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  levelTextSelected: {
    color: '#00e5ff',
  },
  levelSublabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  levelSublabelSelected: {
    color: 'rgba(0, 229, 255, 0.7)',
  },
});
