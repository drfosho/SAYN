import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Shield, Check, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/AuthContext';
import {
  getUserVerificationStats,
  submitBadgeApplication,
  checkEnhancedRequirements,
  VerificationStats,
} from '@/lib/api/badgeVerification';

export default function EnhancedApplicationScreen() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<VerificationStats | null>(null);
  const [selfDisclosed, setSelfDisclosed] = useState(false);
  const [transparencyStatement, setTransparencyStatement] = useState('');
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
          label: '14+ days account age',
          met: (userStats.account_age_days || 0) >= 14,
          current: `${userStats.account_age_days || 0} days`,
        },
        {
          id: 'verified_posts',
          label: '3+ verified photo uploads',
          met: (userStats.verified_posts || 0) >= 3,
          current: `${userStats.verified_posts || 0} posts`,
        },
        {
          id: 'self_disclosed',
          label: 'Self-disclosed enhancement use',
          met: selfDisclosed,
          current: selfDisclosed ? 'Disclosed' : 'Not disclosed',
        },
      ]
    : [];

  const allRequirementsMet = requirements.every((r) => r.met);

  const handleSubmit = async () => {
    if (!allRequirementsMet) {
      Alert.alert('Not Eligible', 'Please meet all requirements before applying.');
      return;
    }

    if (!selfDisclosed) {
      Alert.alert(
        'Self-Disclosure Required',
        'Please confirm that you are open about your enhancement use.'
      );
      return;
    }

    if (!user?.id || !userStats) return;

    setSubmitting(true);
    try {
      const { error } = await submitBadgeApplication(
        user.id,
        'enhanced',
        {
          self_disclosed: selfDisclosed,
          transparency_statement: transparencyStatement,
        },
        userStats
      );

      if (error) {
        Alert.alert('Error', 'Failed to submit application. Please try again.');
        return;
      }

      Alert.alert(
        'Application Submitted!',
        "Your Transparent Enhanced badge application is now being reviewed. You'll be notified once verification is complete.",
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
          <Text style={styles.headerTitle}>Enhanced Badge</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9D4EDD" />
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
        <Text style={styles.headerTitle}>Enhanced Badge</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Badge Preview */}
        <View style={styles.badgePreview}>
          <View style={styles.badgeIconLarge}>
            <Shield size={48} color="#9D4EDD" />
          </View>
          <Text style={styles.badgeTitle}>Transparent Enhanced</Text>
          <Text style={styles.badgeDescription}>
            For athletes who are open and honest about their use of performance enhancing
            substances. Your transparency helps build a healthier fitness community.
          </Text>
        </View>

        {/* Honesty Message */}
        <View style={styles.honestySection}>
          <Text style={styles.honestyTitle}>Honesty is Strength</Text>
          <Text style={styles.honestyText}>
            Being transparent about enhancement use shows courage and integrity. It helps
            others set realistic expectations and builds trust in our community.
          </Text>
        </View>

        {/* Requirements Checklist */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          {requirements.slice(0, 2).map((req) => (
            <View key={req.id} style={styles.requirementRow}>
              <View style={[styles.checkCircle, req.met && styles.checkCircleMet]}>
                {req.met ? (
                  <Check size={16} color="#9D4EDD" />
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

        {/* Self-Disclosure Toggle */}
        <View style={styles.disclosureSection}>
          <Text style={styles.sectionTitle}>Self-Disclosure</Text>
          <View style={styles.disclosureCard}>
            <View style={styles.disclosureHeader}>
              <Text style={styles.disclosureText}>
                I confirm that I use or have used performance enhancing substances
              </Text>
              <Switch
                value={selfDisclosed}
                onValueChange={setSelfDisclosed}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: 'rgba(157, 78, 221, 0.4)' }}
                thumbColor={selfDisclosed ? '#9D4EDD' : '#f4f3f4'}
              />
            </View>
            {selfDisclosed && (
              <View style={styles.disclosedBadge}>
                <Check size={16} color="#9D4EDD" />
                <Text style={styles.disclosedText}>Disclosed</Text>
              </View>
            )}
          </View>
        </View>

        {/* Optional Transparency Statement */}
        <View style={styles.statementSection}>
          <Text style={styles.sectionTitle}>Transparency Statement (Optional)</Text>
          <Text style={styles.inputLabel}>
            Share your story or message about your fitness journey. This helps inspire
            others and shows the community who you are.
          </Text>
          <TextInput
            style={styles.textInput}
            value={transparencyStatement}
            onChangeText={setTransparencyStatement}
            placeholder="I chose to be transparent because..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{transparencyStatement.length}/500</Text>
        </View>

        {/* Certification */}
        <View style={styles.certificationSection}>
          <Text style={styles.certificationText}>
            By submitting this application, I confirm that I am being transparent about
            my fitness journey and enhancement use. I understand that this badge
            represents honesty and integrity within the SAYN community.
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
            Complete all requirements to submit your application.
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
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.4)',
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#9D4EDD',
    marginBottom: 12,
  },
  badgeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  honestySection: {
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  honestyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9D4EDD',
    marginBottom: 8,
  },
  honestyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
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
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
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
    color: '#9D4EDD',
  },
  requirementCurrent: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  disclosureSection: {
    marginBottom: 24,
  },
  disclosureCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  disclosureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclosureText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 16,
    lineHeight: 20,
  },
  disclosedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  disclosedText: {
    fontSize: 14,
    color: '#9D4EDD',
    fontWeight: '600',
  },
  statementSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'right',
    marginTop: 8,
  },
  certificationSection: {
    backgroundColor: 'rgba(157, 78, 221, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.2)',
  },
  certificationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#9D4EDD',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#9D4EDD',
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
    color: '#ffffff',
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
