import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY = 10;

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search users, coaches, posts...',
  onFocus,
  onBlur,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const saveToHistory = async (query: string) => {
    if (!query.trim()) return;

    try {
      const newHistory = [query, ...searchHistory.filter((h) => h !== query)].slice(
        0,
        MAX_HISTORY
      );
      setSearchHistory(newHistory);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      setShowHistory(false);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowHistory(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowHistory(false), 200); // Delay to allow tap on history item
    onBlur?.();
  };

  const handleSubmit = () => {
    if (value.trim()) {
      saveToHistory(value);
      setShowHistory(false);
    }
  };

  const handleHistorySelect = (query: string) => {
    onChangeText(query);
    setShowHistory(false);
    saveToHistory(query);
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <Ionicons name="search" size={20} color={isFocused ? '#00e5ff' : '#6b7280'} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </Pressable>
        )}
      </View>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && !value && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <Pressable onPress={clearHistory}>
              <Text style={styles.clearHistoryText}>Clear</Text>
            </Pressable>
          </View>
          <FlatList
            data={searchHistory}
            keyExtractor={(item, index) => `history-${index}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleHistorySelect(item)}
                style={styles.historyItem}
              >
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.historyItemText}>{item}</Text>
              </Pressable>
            )}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainerFocused: {
    borderColor: '#00e5ff',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  historyContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    backgroundColor: '#1a1f3a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    padding: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  clearHistoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00e5ff',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  historyItemText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
});
