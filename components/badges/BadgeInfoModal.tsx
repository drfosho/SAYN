import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BADGE_DEFINITIONS, BADGE_PHILOSOPHY } from '@/constants/badges';
import { NaturalBadge } from './NaturalBadge';
import { EnhancedBadge } from './EnhancedBadge';
import { UnderReviewBadge } from './UnderReviewBadge';

const { width } = Dimensions.get('window');

interface BadgeInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BadgeInfoModal: React.FC<BadgeInfoModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <LinearGradient
          colors={['#050814', '#0d1128']}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{BADGE_PHILOSOPHY.title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Philosophy */}
            <View style={styles.philosophySection}>
              <Text style={styles.philosophyText}>{BADGE_PHILOSOPHY.description}</Text>
            </View>

            {/* Principles */}
            <View style={styles.principlesSection}>
              {BADGE_PHILOSOPHY.principles.map((principle, index) => (
                <View key={index} style={styles.principleItem}>
                  <Text style={styles.bulletPoint}>▸</Text>
                  <Text style={styles.principleText}>{principle}</Text>
                </View>
              ))}
            </View>

            {/* Badge Breakdown */}
            <Text style={styles.sectionTitle}>BADGE TYPES</Text>

            {/* Natural Badge */}
            <View style={styles.badgeCard}>
              <View style={styles.badgeHeader}>
                <NaturalBadge size="large" showLabel={false} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{BADGE_DEFINITIONS.natural.name}</Text>
                  <Text style={styles.badgeDescription}>
                    {BADGE_DEFINITIONS.natural.description}
                  </Text>
                </View>
              </View>
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {BADGE_DEFINITIONS.natural.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Enhanced Badge */}
            <View style={styles.badgeCard}>
              <View style={styles.badgeHeader}>
                <EnhancedBadge size="large" showLabel={false} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{BADGE_DEFINITIONS.enhanced.name}</Text>
                  <Text style={styles.badgeDescription}>
                    {BADGE_DEFINITIONS.enhanced.description}
                  </Text>
                </View>
              </View>
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>Requirements:</Text>
                {BADGE_DEFINITIONS.enhanced.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Under Review Badge */}
            <View style={styles.badgeCard}>
              <View style={styles.badgeHeader}>
                <UnderReviewBadge size="large" showLabel={false} />
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>
                    {BADGE_DEFINITIONS.under_review.name}
                  </Text>
                  <Text style={styles.badgeDescription}>
                    {BADGE_DEFINITIONS.under_review.description}
                  </Text>
                </View>
              </View>
              <View style={styles.requirementsSection}>
                <Text style={styles.requirementsTitle}>What this means:</Text>
                {BADGE_DEFINITIONS.under_review.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Text style={styles.requirementBullet}>•</Text>
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom padding */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    borderColor: '#00e5ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0, 229, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00e5ff',
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
  philosophySection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#00e5ff',
    borderRadius: 8,
  },
  philosophyText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 24,
  },
  principlesSection: {
    marginTop: 16,
    gap: 12,
  },
  principleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletPoint: {
    fontSize: 18,
    color: '#00e5ff',
    fontWeight: '900',
  },
  principleText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    marginTop: 30,
    marginBottom: 16,
  },
  badgeCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(13, 17, 40, 0.8)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: 16,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  requirementsSection: {
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  requirementBullet: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  requirementText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
});
