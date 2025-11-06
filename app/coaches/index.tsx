import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { CoachCard } from '@/components/coach/CoachCard';
import { SPECIALIZATIONS } from '@/constants/coachCertifications';

// Mock coach data
const MOCK_COACHES = [
  {
    id: '1',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    name: 'Marcus "The Tank" Johnson',
    certifications: ['NASM', 'CSCS'],
    specializations: ['strength', 'powerlifting', 'sports'],
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 8,
    totalClients: 250,
  },
  {
    id: '2',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    name: 'Sarah Chen',
    certifications: ['ACE', 'ISSA'],
    specializations: ['weight_loss', 'nutrition', 'mobility'],
    rating: 4.8,
    reviewCount: 93,
    yearsExperience: 5,
    totalClients: 180,
  },
  {
    id: '3',
    avatarUrl: 'https://i.pravatar.cc/150?img=45',
    name: 'David "Iron" Martinez',
    certifications: ['NSCA', 'NASM'],
    specializations: ['bodybuilding', 'strength', 'nutrition'],
    rating: 5.0,
    reviewCount: 156,
    yearsExperience: 12,
    totalClients: 400,
  },
  {
    id: '4',
    avatarUrl: 'https://i.pravatar.cc/150?img=22',
    name: 'Emily Thompson',
    certifications: ['ACE', 'AFAA'],
    specializations: ['calisthenics', 'mobility', 'senior'],
    rating: 4.7,
    reviewCount: 68,
    yearsExperience: 6,
    totalClients: 145,
  },
  {
    id: '5',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    name: 'James "Beast Mode" Williams',
    certifications: ['ISSA', 'CSCS', 'NASM'],
    specializations: ['crossfit', 'olympic', 'sports'],
    rating: 4.9,
    reviewCount: 201,
    yearsExperience: 10,
    totalClients: 320,
  },
];

type SortOption = 'rating' | 'experience' | 'clients' | 'reviews';

export default function CoachDirectoryScreen() {
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const toggleSpecialization = (id: string) => {
    if (selectedSpecializations.includes(id)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== id));
    } else {
      setSelectedSpecializations([...selectedSpecializations, id]);
    }
  };

  // Filter and sort coaches
  const filteredCoaches = MOCK_COACHES.filter((coach) => {
    if (selectedSpecializations.length === 0) return true;
    return selectedSpecializations.some((spec) => coach.specializations.includes(spec));
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'experience':
        return b.yearsExperience - a.yearsExperience;
      case 'clients':
        return b.totalClients - a.totalClients;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={['#050814', '#0d1128']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>FIND COACHES</Text>
        <Text style={styles.headerSubtitle}>
          Verified trainers with real results
        </Text>

        {/* Filter and Sort Bar */}
        <View style={styles.controlBar}>
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <LinearGradient
              colors={['#00e5ff', '#ff0080']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.filterButtonGradient}
            >
              <Text style={styles.filterButtonText}>
                FILTERS {selectedSpecializations.length > 0 && `(${selectedSpecializations.length})`}
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Sort Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {(['rating', 'experience', 'clients', 'reviews'] as SortOption[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => setSortBy(option)}
                style={[
                  styles.sortOption,
                  sortBy === option && styles.sortOptionActive,
                ]}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive,
                  ]}
                >
                  {option.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterPanelTitle}>SPECIALIZATIONS</Text>
            <View style={styles.filterOptions}>
              {SPECIALIZATIONS.map((spec) => (
                <Pressable
                  key={spec.id}
                  onPress={() => toggleSpecialization(spec.id)}
                  style={[
                    styles.filterOption,
                    selectedSpecializations.includes(spec.id) &&
                      styles.filterOptionActive,
                  ]}
                >
                  <Text style={styles.filterOptionIcon}>{spec.icon}</Text>
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSpecializations.includes(spec.id) &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {spec.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {selectedSpecializations.length > 0 && (
              <Pressable
                onPress={() => setSelectedSpecializations([])}
                style={styles.clearFiltersButton}
              >
                <Text style={styles.clearFiltersText}>CLEAR ALL</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {filteredCoaches.length} coach{filteredCoaches.length !== 1 ? 'es' : ''} found
        </Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        data={filteredCoaches}
        renderItem={({ item }) => (
          <CoachCard
            {...item}
            onPress={(id) => router.push(`/coaches/${id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050814',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(255, 184, 0, 0.3)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFB800',
    letterSpacing: 3,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  controlBar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#000000',
  },
  filterButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  sortScroll: {
    flex: 1,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderColor: '#FFB800',
  },
  sortOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sortOptionTextActive: {
    color: '#FFB800',
  },
  filterPanel: {
    backgroundColor: 'rgba(13, 17, 40, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    marginBottom: 16,
  },
  filterPanelTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00e5ff',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  filterOptionActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: '#00e5ff',
  },
  filterOptionIcon: {
    fontSize: 14,
  },
  filterOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filterOptionTextActive: {
    color: '#00e5ff',
  },
  clearFiltersButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearFiltersText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ff0080',
    letterSpacing: 1,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
