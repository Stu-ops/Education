// History Screen - Pixel matched to design

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare } from 'lucide-react-native';
import { router } from 'expo-router';
import { useHistoryStore } from '../../src/contexts/HistoryContext';
import { useUser } from '../../src/contexts/UserContext';
import Header from '../../src/components/Header';

export default function HistoryScreen() {
  const { history } = useHistoryStore();
  const { user, loading } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [history.length]);

  const handleItemPress = (item) => {
    const sessionId = item.session_id || item.sessionId || item.id;

    router.push({
      pathname: '/home',
      params: {
        session_id: sessionId,
        messages: JSON.stringify(item.messages || []),
      },
    });
  };

  const renderItem = ({ item }) => {
    const preview =
      item.messages && item.messages.length > 0
        ? item.messages.map((m) => m.text || '').join(' ')
        : 'No messages yet';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {item.title}
          </Text>

          <View style={styles.iconBubble}>
            <MessageSquare size={16} color="#D98A5E" />
          </View>
        </View>

        <Text numberOfLines={2} style={styles.previewText}>
          {preview}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.metaText}>
          {item.messages?.length || 0} messages
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerWrap}>
          <Header />
        </View>
        <Text style={styles.pageTitle}>
          {user ? `${user.username}'s Chat History` : 'Chat History'}
        </Text>

        {loading || isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={{ color: '#8E8A87' }}>Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFE6E2', // page background like screenshot
  },

  safeArea: {
    flex: 1,
    paddingBottom: 90,
  },
  headerWrap: { paddingHorizontal: 12, paddingTop: 8, marginBottom: 6 },

  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E2E2E',
    marginBottom: 16,
    marginTop: 2,
    paddingHorizontal: 18,
  },

  list: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },

  // Card
  card: {
    backgroundColor: '#F3ECE8', // warm beige like image
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E7D6CF',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E2E2E',
    flex: 1,
    marginRight: 10,
  },

  previewText: {
    fontSize: 13,
    color: '#6E6A67',
    marginTop: 6,
    lineHeight: 18,
  },

  divider: {
    height: 1,
    backgroundColor: '#E6D8D2',
    marginTop: 12,
    marginBottom: 8,
  },

  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D98A5E',
  },

  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1D5C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
