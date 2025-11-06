import React from 'react';
import { StyleSheet, View, Text, Image, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ClientTransformation as TransformationType } from '@/constants/coachCertifications';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with gaps

interface ClientTransformationProps {
  transformation: TransformationType;
  onPress?: (transformation: TransformationType) => void;
}

export const ClientTransformation: React.FC<ClientTransformationProps> = ({
  transformation,
  onPress,
}) => {
  return (
    <Pressable
      onPress={() => onPress?.(transformation)}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <LinearGradient
        colors={['#0d1128', '#050814']}
        style={styles.card}
      >
        {/* Before/After Images */}
        <View style={styles.imagesContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: transformation.beforeImageUrl }}
              style={styles.image}
            />
            <View style={styles.imageLabel}>
              <Text style={styles.imageLabelText}>BEFORE</Text>
            </View>
          </View>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: transformation.afterImageUrl }}
              style={styles.image}
            />
            <View style={[styles.imageLabel, styles.imageLabelAfter]}>
              <Text style={styles.imageLabelText}>AFTER</Text>
            </View>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={styles.clientName}>{transformation.clientName}</Text>
            {transformation.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.timePeriod}>{transformation.timePeriod}</Text>
          <Text style={styles.results} numberOfLines={2}>
            {transformation.results}
          </Text>
        </View>

        {/* AI Verified indicator */}
        {transformation.isVerified && (
          <View style={styles.aiVerified}>
            <Text style={styles.aiVerifiedText}>AI VERIFIED</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#000000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  imagesContainer: {
    flexDirection: 'row',
    height: 120,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLabel: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 0, 128, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  imageLabelAfter: {
    backgroundColor: 'rgba(0, 229, 255, 0.9)',
  },
  imageLabelText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ff88',
    borderWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 9,
    color: '#000000',
    fontWeight: '900',
  },
  timePeriod: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFB800',
    marginBottom: 4,
  },
  results: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 14,
  },
  aiVerified: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  aiVerifiedText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 0.5,
  },
});
