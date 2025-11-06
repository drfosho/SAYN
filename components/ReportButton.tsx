import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { REPORT_TYPES } from '@/constants/badges';

interface ReportButtonProps {
  username: string;
  userId: string;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ username, userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmitReport = () => {
    if (!selectedType) {
      Alert.alert('Select Report Type', 'Please select a reason for reporting.');
      return;
    }

    // Mock submission - in production, this would send to backend
    console.log('Report submitted:', {
      userId,
      username,
      type: selectedType,
      comment,
      timestamp: new Date().toISOString(),
    });

    Alert.alert(
      'Report Submitted',
      'Thank you for helping keep SAYN honest. Our team will review this report.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowModal(false);
            setSelectedType(null);
            setComment('');
          },
        },
      ]
    );
  };

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        style={({ pressed }) => [
          styles.reportButton,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={styles.reportButtonText}>⚠ Report User</Text>
      </Pressable>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#050814', '#0d1128']}
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>REPORT USER</Text>
              <Pressable
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Username */}
              <View style={styles.userSection}>
                <Text style={styles.reportingLabel}>Reporting:</Text>
                <Text style={styles.username}>@{username}</Text>
              </View>

              {/* Report Types */}
              <Text style={styles.sectionTitle}>SELECT REASON</Text>
              {REPORT_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && styles.typeCardSelected,
                  ]}
                >
                  <View style={styles.typeHeader}>
                    <View
                      style={[
                        styles.radio,
                        selectedType === type.id && styles.radioSelected,
                      ]}
                    >
                      {selectedType === type.id && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.typeLabel,
                        selectedType === type.id && styles.typeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </View>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </Pressable>
              ))}

              {/* Comment */}
              <Text style={styles.sectionTitle}>ADDITIONAL DETAILS (OPTIONAL)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Add any additional context or evidence..."
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
              <Text style={styles.charCount}>{comment.length}/500</Text>

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmitReport}
                disabled={!selectedType}
                style={({ pressed }) => [
                  styles.submitButton,
                  !selectedType && styles.submitButtonDisabled,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <LinearGradient
                  colors={
                    selectedType
                      ? ['#ff0080', '#ff4500']
                      : ['#333333', '#555555']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitText}>SUBMIT REPORT</Text>
                </LinearGradient>
              </Pressable>

              {/* Disclaimer */}
              <View style={styles.disclaimer}>
                <Text style={styles.disclaimerText}>
                  False reports may result in account penalties. SAYN takes honesty
                  and transparency seriously.
                </Text>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 0, 128, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ff0080',
  },
  reportButtonText: {
    color: '#ff0080',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ff0080',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 0, 128, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff0080',
    letterSpacing: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#ff0080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#ff0080',
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 0, 128, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff0080',
    borderRadius: 8,
  },
  reportingLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },
  typeCard: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: 'rgba(13, 17, 40, 0.8)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  typeCardSelected: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#00e5ff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00e5ff',
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  typeLabelSelected: {
    color: '#00e5ff',
  },
  typeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 32,
  },
  commentInput: {
    backgroundColor: 'rgba(13, 17, 40, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
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
