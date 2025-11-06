import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  RECOGNIZED_CERTIFICATIONS,
  SPECIALIZATIONS,
  COACH_VERIFICATION_REQUIREMENTS,
} from '@/constants/coachCertifications';

export default function CoachApplicationScreen() {
  const [fullName, setFullName] = useState('');
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [trainingPhilosophy, setTrainingPhilosophy] = useState('');
  const [socialProof, setSocialProof] = useState('');

  const toggleCertification = (id: string) => {
    if (selectedCertifications.includes(id)) {
      setSelectedCertifications(selectedCertifications.filter((c) => c !== id));
    } else {
      setSelectedCertifications([...selectedCertifications, id]);
    }
  };

  const toggleSpecialization = (id: string) => {
    if (selectedSpecializations.includes(id)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== id));
    } else {
      setSelectedSpecializations([...selectedSpecializations, id]);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name');
      return;
    }
    if (selectedCertifications.length === 0 && parseInt(yearsExperience) < 2) {
      Alert.alert(
        'Requirements Not Met',
        'You need either a certification OR 2+ years of experience'
      );
      return;
    }
    if (selectedSpecializations.length === 0) {
      Alert.alert('Missing Field', 'Please select at least one specialization');
      return;
    }
    if (!trainingPhilosophy.trim()) {
      Alert.alert('Missing Field', 'Please describe your training philosophy');
      return;
    }

    // Mock submission
    console.log('Coach Application Submitted:', {
      fullName,
      certifications: selectedCertifications,
      yearsExperience,
      specializations: selectedSpecializations,
      trainingPhilosophy,
      socialProof,
    });

    Alert.alert(
      'Application Submitted!',
      'Your application has been received. SAYN will review it within 3-5 business days. You\'ll receive a notification when your status is updated.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>APPLY TO BE A COACH</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <LinearGradient
            colors={['#FFB800', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.welcomeGradient}
          >
            <Text style={styles.welcomeTitle}>Build Your Coaching Business on SAYN</Text>
            <Text style={styles.welcomeText}>
              Get verified, showcase your transformations, and connect with clients who value real results and honesty.
            </Text>
          </LinearGradient>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REQUIREMENTS</Text>
          <View style={styles.requirementsCard}>
            <RequirementItem text="SAYN account for 60+ days" />
            <RequirementItem text="Natural or Enhanced badge (shows credibility)" />
            <RequirementItem text="3+ AI-verified client transformations" />
            <RequirementItem text="Certification OR 2+ years experience" />
            <RequirementItem text="3+ verified client reviews (for MVP)" />
          </View>
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APPLICATION FORM</Text>

          {/* Full Name */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Full Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Certifications */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Certifications</Text>
            <Text style={styles.formHint}>Select all that apply</Text>
            <View style={styles.optionsGrid}>
              {RECOGNIZED_CERTIFICATIONS.map((cert) => (
                <Pressable
                  key={cert.id}
                  onPress={() => toggleCertification(cert.id)}
                  style={[
                    styles.option,
                    selectedCertifications.includes(cert.id) && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedCertifications.includes(cert.id) && styles.optionTextActive,
                    ]}
                  >
                    {cert.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Years Experience */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Years of Experience *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 5"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="numeric"
            />
          </View>

          {/* Specializations */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Specializations *</Text>
            <Text style={styles.formHint}>Select at least one</Text>
            <View style={styles.optionsGrid}>
              {SPECIALIZATIONS.map((spec) => (
                <Pressable
                  key={spec.id}
                  onPress={() => toggleSpecialization(spec.id)}
                  style={[
                    styles.option,
                    selectedSpecializations.includes(spec.id) && styles.optionActive,
                  ]}
                >
                  <Text style={styles.optionIcon}>{spec.icon}</Text>
                  <Text
                    style={[
                      styles.optionText,
                      selectedSpecializations.includes(spec.id) && styles.optionTextActive,
                    ]}
                  >
                    {spec.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Training Philosophy */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Training Philosophy *</Text>
            <Text style={styles.formHint}>What's your approach to coaching?</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your training philosophy and approach..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={trainingPhilosophy}
              onChangeText={setTrainingPhilosophy}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{trainingPhilosophy.length}/500</Text>
          </View>

          {/* Social Proof */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Social Proof (Optional)</Text>
            <Text style={styles.formHint}>Instagram, website, or other links</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://instagram.com/yourhandle"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={socialProof}
              onChangeText={setSocialProof}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Submit Button */}
          <Pressable onPress={handleSubmit} style={styles.submitButton}>
            <LinearGradient
              colors={['#00e5ff', '#ff0080']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>SUBMIT APPLICATION</Text>
            </LinearGradient>
          </Pressable>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              By submitting, you agree that all information provided is accurate. False information may result in permanent ban from the platform.
            </Text>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const RequirementItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.requirementItem}>
    <Text style={styles.requirementBullet}>✓</Text>
    <Text style={styles.requirementText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFB800',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 2,
  },
  welcomeSection: {
    padding: 20,
  },
  welcomeGradient: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 10,
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.8)',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  requirementsCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    gap: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  requirementBullet: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: '900',
  },
  requirementText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFB800',
    marginBottom: 6,
    letterSpacing: 1,
  },
  formHint: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: 'rgba(13, 17, 40, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'right',
    marginTop: 6,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  optionActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: '#00e5ff',
  },
  optionIcon: {
    fontSize: 14,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionTextActive: {
    color: '#00e5ff',
  },
  submitButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#000000',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
  },
  disclaimer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    borderRadius: 6,
  },
  disclaimerText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 16,
  },
});
