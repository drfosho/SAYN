import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  checkBadgeEligibility,
  applyForBadge,
  getBadgeInfo,
  BadgeType,
  BadgeEligibility,
  BadgeQuestionnaireData,
} from '@/lib/api/badges';
import { awardXP } from '@/lib/api/xp';
import BadgeRequirements from '@/components/badges/BadgeRequirements';
import BadgeSuccess from '@/components/badges/BadgeSuccess';
import { StatusBar } from 'expo-status-bar';

type Step = 'select' | 'questionnaire' | 'review' | 'success';

export default function BadgeApplicationScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('select');
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);
  const [eligibility, setEligibility] = useState<BadgeEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<BadgeQuestionnaireData>({});

  // Load current badge info
  useEffect(() => {
    if (user?.id) {
      loadBadgeInfo();
    }
  }, [user?.id]);

  const loadBadgeInfo = async () => {
    if (!user?.id) return;

    const { data } = await getBadgeInfo(user.id);
    if (data?.badge_type && (data.badge_type === 'natural' || data.badge_type === 'enhanced')) {
      setSelectedBadge(data.badge_type);
    }
  };

  const handleSelectBadge = async (badgeType: BadgeType) => {
    setSelectedBadge(badgeType);
    setLoading(true);

    try {
      const { data } = await checkBadgeEligibility(user!.id, badgeType);
      setEligibility(data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      Alert.alert('Error', 'Failed to check eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToQuestionnaire = () => {
    if (!eligibility?.eligible) {
      Alert.alert(
        'Not Eligible',
        'You do not meet all requirements yet. Complete the pending requirements and try again.'
      );
      return;
    }
    setStep('questionnaire');
  };

  const handleSubmitApplication = async () => {
    if (!user?.id || !selectedBadge) return;

    setLoading(true);

    try {
      const { data, error } = await applyForBadge(user.id, selectedBadge, questionnaire);

      if (error || !data) {
        Alert.alert('Application Failed', error || 'Failed to submit application');
        setLoading(false);
        return;
      }

      // Award XP for earning badge
      if (data.autoApproved) {
        await awardXP(user.id, 100, 'admin_award', data.application.id);
      }

      setStep('success');
    } catch (error: any) {
      console.error('Application error:', error);
      Alert.alert('Error', error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <BadgeSuccess badgeType={selectedBadge!} xpAwarded={100} />
        <Pressable
          onPress={() => router.back()}
          style={styles.doneButton}
        >
          <LinearGradient
            colors={['#00e5ff', '#ff00ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneGradient}
          >
            <Text style={styles.doneText}>Done</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={['#0a0e27', '#0a0e27']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00e5ff" />
          </Pressable>
          <Text style={styles.headerTitle}>Badge Verification</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: Select Badge Type */}
          {step === 'select' && (
            <>
              {/* Philosophy */}
              <View style={styles.philosophyCard}>
                <Text style={styles.philosophyTitle}>Honesty Over Everything</Text>
                <Text style={styles.philosophyText}>
                  Both Natural and Enhanced badges are badges of HONOR. They show transparency and
                  credibility. What matters is being real about YOUR journey.
                </Text>
              </View>

              {/* Badge Selection */}
              <Text style={styles.sectionTitle}>Choose Your Path</Text>

              {/* Natural Badge */}
              <Pressable
                onPress={() => handleSelectBadge('natural')}
                disabled={loading}
                style={({ pressed }) => [
                  styles.badgeCard,
                  selectedBadge === 'natural' && styles.badgeCardSelected,
                  pressed && styles.badgeCardPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    selectedBadge === 'natural'
                      ? ['#00ff8833', '#00e5ff22']
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={styles.badgeGradient}
                >
                  <View style={styles.badgeIconContainer}>
                    <Ionicons name="shield-checkmark" size={40} color="#00ff88" />
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>Natural Athlete</Text>
                    <Text style={styles.badgeDescription}>
                      Drug-free training with verified progression
                    </Text>
                    <View style={styles.badgePerks}>
                      <Text style={styles.perkItem}>✓ Verified badge</Text>
                      <Text style={styles.perkItem}>✓ +10% XP bonus</Text>
                      <Text style={styles.perkItem}>✓ Community credibility</Text>
                    </View>
                  </View>
                  {selectedBadge === 'natural' && (
                    <Ionicons name="checkmark-circle" size={24} color="#00ff88" />
                  )}
                </LinearGradient>
              </Pressable>

              {/* Enhanced Badge */}
              <Pressable
                onPress={() => handleSelectBadge('enhanced')}
                disabled={loading}
                style={({ pressed }) => [
                  styles.badgeCard,
                  selectedBadge === 'enhanced' && styles.badgeCardSelected,
                  pressed && styles.badgeCardPressed,
                ]}
              >
                <LinearGradient
                  colors={
                    selectedBadge === 'enhanced'
                      ? ['#9D4EDD33', '#FF6B3522']
                      : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                  }
                  style={styles.badgeGradient}
                >
                  <View style={styles.badgeIconContainer}>
                    <Ionicons name="shield-star" size={40} color="#9D4EDD" />
                  </View>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>Enhanced Athlete</Text>
                    <Text style={styles.badgeDescription}>
                      Honest about enhancement use
                    </Text>
                    <View style={styles.badgePerks}>
                      <Text style={styles.perkItem}>✓ Verified badge</Text>
                      <Text style={styles.perkItem}>✓ Community respect</Text>
                      <Text style={styles.perkItem}>✓ Privacy protected</Text>
                    </View>
                  </View>
                  {selectedBadge === 'enhanced' && (
                    <Ionicons name="checkmark-circle" size={24} color="#9D4EDD" />
                  )}
                </LinearGradient>
              </Pressable>

              {/* Requirements */}
              {eligibility && selectedBadge && (
                <>
                  <BadgeRequirements eligibility={eligibility} badgeType={selectedBadge} />

                  {eligibility.eligible && (
                    <Pressable
                      onPress={handleContinueToQuestionnaire}
                      style={styles.continueButton}
                    >
                      <LinearGradient
                        colors={['#00e5ff', '#ff00ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.continueGradient}
                      >
                        <Text style={styles.continueText}>Continue to Application</Text>
                        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
                      </LinearGradient>
                    </Pressable>
                  )}
                </>
              )}

              {loading && !eligibility && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00e5ff" />
                  <Text style={styles.loadingText}>Checking eligibility...</Text>
                </View>
              )}
            </>
          )}

          {/* Step 2: Questionnaire */}
          {step === 'questionnaire' && selectedBadge && (
            <>
              <Text style={styles.sectionTitle}>Questionnaire (Optional)</Text>
              <Text style={styles.sectionSubtitle}>
                This information helps us verify your badge and is kept confidential.
              </Text>

              {selectedBadge === 'natural' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>How long have you been training?</Text>
                    <View style={styles.optionsRow}>
                      {['<1 year', '1-3 years', '3-5 years', '5+ years'].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() =>
                            setQuestionnaire({ ...questionnaire, training_years: option })
                          }
                          style={[
                            styles.optionChip,
                            questionnaire.training_years === option && styles.optionChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              questionnaire.training_years === option && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Training focus (select all that apply):</Text>
                    <View style={styles.optionsRow}>
                      {['Strength', 'Hypertrophy', 'Endurance', 'Performance'].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => {
                            const current = questionnaire.training_focus || [];
                            const updated = current.includes(option)
                              ? current.filter((f) => f !== option)
                              : [...current, option];
                            setQuestionnaire({ ...questionnaire, training_focus: updated });
                          }}
                          style={[
                            styles.optionChip,
                            questionnaire.training_focus?.includes(option) &&
                              styles.optionChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              questionnaire.training_focus?.includes(option) &&
                                styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </>
              )}

              {selectedBadge === 'enhanced' && (
                <>
                  <View style={styles.privacyNotice}>
                    <Ionicons name="lock-closed" size={20} color="#00e5ff" />
                    <Text style={styles.privacyText}>
                      All compound information is encrypted and NEVER shown publicly. Only your
                      badge status is visible.
                    </Text>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>How long have you been enhanced? (Optional)</Text>
                    <View style={styles.optionsRow}>
                      {['<1 year', '1-2 years', '2-5 years', '5+ years'].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() =>
                            setQuestionnaire({ ...questionnaire, enhanced_years: option })
                          }
                          style={[
                            styles.optionChip,
                            questionnaire.enhanced_years === option && styles.optionChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              questionnaire.enhanced_years === option && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Primary compounds used (Optional, encrypted)
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Testosterone, etc."
                      placeholderTextColor="#6b7280"
                      value={questionnaire.primary_compounds || ''}
                      onChangeText={(text) =>
                        setQuestionnaire({ ...questionnaire, primary_compounds: text })
                      }
                      multiline
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Working with medical supervision?</Text>
                    <View style={styles.optionsRow}>
                      {['Yes', 'No'].map((option) => (
                        <Pressable
                          key={option}
                          onPress={() =>
                            setQuestionnaire({
                              ...questionnaire,
                              medical_supervision: option === 'Yes',
                            })
                          }
                          style={[
                            styles.optionChip,
                            questionnaire.medical_supervision ===
                              (option === 'Yes') &&
                              typeof questionnaire.medical_supervision === 'boolean' &&
                              styles.optionChipSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              questionnaire.medical_supervision ===
                                (option === 'Yes') &&
                                typeof questionnaire.medical_supervision === 'boolean' &&
                                styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Why did you choose transparency? (Optional)
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Share your reason..."
                      placeholderTextColor="#6b7280"
                      value={questionnaire.transparency_reason || ''}
                      onChangeText={(text) =>
                        setQuestionnaire({ ...questionnaire, transparency_reason: text })
                      }
                      multiline
                    />
                  </View>
                </>
              )}

              <Pressable
                onPress={handleSubmitApplication}
                disabled={loading}
                style={styles.submitButton}
              >
                <LinearGradient
                  colors={['#00e5ff', '#ff00ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.submitText}>Submit Application</Text>
                      <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={styles.certificationNotice}>
                <Text style={styles.certificationText}>
                  By submitting, I certify that this declaration is honest and accurate.
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  philosophyCard: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  philosophyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00e5ff',
    marginBottom: 12,
    textAlign: 'center',
  },
  philosophyText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  badgeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeCardSelected: {
    borderColor: '#00e5ff',
  },
  badgeCardPressed: {
    opacity: 0.7,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  badgePerks: {
    gap: 4,
  },
  perkItem: {
    fontSize: 12,
    color: '#00e5ff',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  continueButton: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionChipSelected: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: '#00e5ff',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  optionTextSelected: {
    color: '#00e5ff',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#ffffff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: '#00e5ff',
    lineHeight: 18,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  certificationNotice: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderRadius: 12,
  },
  certificationText: {
    fontSize: 12,
    color: '#ffa500',
    textAlign: 'center',
    fontWeight: '600',
  },
  doneButton: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  doneGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
});
