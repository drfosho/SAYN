import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ShieldCheck, Check, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserVerificationStats,
  submitBadgeApplication,
  checkNaturalRequirements,
  VerificationStats,
} from '@/lib/api/badgeVerification';

const TRAINING_DURATIONS = [
  { label: 'Select duration', value: '' },
  { label: 'Less than 1 year', value: '<1' },
  { label: '1-2 years', value: '1-2' },
  { label: '2-3 years', value: '2-3' },
  { label: '3-5 years', value: '3-5' },
  { label: '5+ years', value: '5+' },
];

export default function NaturalApplicationScreen() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<VerificationStats | null>(null);
  const [trainingDuration, setTrainingDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data } = await getUserVerificationStats(user.id);
      if (data) {
        setUserStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const requirements = userStats
    ? [
        {
          id: 'account_age',
          label: '30+ days account age',
          met: (userStats.account_age_days || 0) >= 30,
          current: `${userStats.account_age_days || 0} days`,
        },
        {
          id: 'verified_posts',
          label: '10+ verified photo uploads',
          met: (userStats.verified_posts || 0) >= 10,
          current: `${userStats.verified_posts || 0} posts`,
        },
        {
          id: 'verification_rate',
          label: '70%+ verification rate',
          met: (userStats.verification_rate || 0) >= 70,
          current: `${userStats.verification_rate || 0}%`,
        },
        {
          id: 'no_reports',
          label: 'No sustained community reports',
          met: (userStats.report_count || 0) === 0,
          current: `${userStats.report_count || 0} reports`,
        },
      ]
    : [];

  const allRequirementsMet = requirements.every((r) => r.met);

  const handleSubmit = async () => {
    if (!allRequirementsMet) {
      Alert.alert('Not Eligible', 'Please meet all requirements before applying.');
      return;
    }

    if (!trainingDuration) {
      Alert.alert('Missing Information', 'Please select how long you have been training naturally.');
      return;
    }

    if (!user?.id || !userStats) return;

    setSubmitting(true);
    try {
      const { error } = await submitBadgeApplication(
        user.id,
        'natural',
        { training_duration: trainingDuration },
        userStats
      );

      if (error) {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
        return;
      }

      Alert.alert(
        'Application Submitted!',
        "Your Natural badge application is now being reviewed. You'll be notified once verification is complete.",
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Application error:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Natural Badge</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={styles.loadingText}>Loading requirements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Natural Badge</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Badge Preview */}
        <View style={styles.badgePreview}>
          <View style={styles.badgeIconLarge}>
            <ShieldCheck size={48} color="#00ff88" />
          </View>
          <Text style={styles.badgeTitle}>Verified Natural</Text>
          <Text style={styles.badgeDescription}>
            For athletes who have achieved their results without performance enhancing
            substances.
          </Text>
        </View>

        {/* Requirements Checklist */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {requirements.map((req) => (
            <View key={req.id} style={styles.requirementRow}>
              <View style={[styles.checkCircle, req.met && styles.checkCircleMet]}>
                {req.met ? (
                  <Check size={16} color="#00ff88" />
                ) : (
                  <X size={16} color="rgba(255,255,255,0.3)" />
                )}
              </View>
              <View style={styles.requirementInfo}>
                <Text style={[styles.requirementLabel, req.met && styles.requirementLabelMet]}>
                  {req.label}
                </Text>
                <Text style={styles.requirementCurrent}>Current: {req.current}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalSection}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <Text style={styles.inputLabel}>How long have you been training naturally?</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={trainingDuration}
              onValueChange={setTrainingDuration}
              style={styles.picker}
              dropdownIconColor="white"
            >
              {TRAINING_DURATIONS.map((duration) => (
                <Picker.Item
                  key={duration.value}
                  label={duration.label}
                  value={duration.value}
                  color="#ffffff"
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Certification */}
        <View style={styles.certificationSection}>
          <Text style={styles.certificationText}>
            By submitting this application, I certify that I have never used performance
            enhancing substances and my progress has been achieved naturally through
            training and nutrition alone.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, !allRequirementsMet && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!allRequirementsMet || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#050814" />
          ) : (
            <Text style={styles.submitButtonText}>
              {allRequirementsMet ? 'Submit Application' : 'Requirements Not Met'}
            </Text>
          )}
        </TouchableOpacity>

        {!allRequirementsMet && (
          <Text style={styles.notEligibleText}>
            Keep posting verified content to meet all requirements!
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  badgePreview: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 8,
  },
  badgeIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 136, 0.4)',
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00ff88',
    marginBottom: 12,
  },
  badgeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkCircleMet: {
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
  },
  requirementInfo: {
    flex: 1,
  },
  requirementLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  requirementLabelMet: {
    color: '#00ff88',
  },
  requirementCurrent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  additionalSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  picker: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  certificationSection: {
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  certificationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#00ff88',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#050814',
    letterSpacing: 1,
  },
  notEligibleText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
});
