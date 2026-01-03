// History Screen
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, ChevronRight } from 'lucide-react-native';
import { useHistoryStore } from '../../src/contexts/HistoryContext';

export default function HistoryScreen() {
  const { history } = useHistoryStore();

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.historyItem}>
      <View style={styles.iconContainer}>
        <MessageSquare size={20} color="#FFF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemTime}>Recent</Text>
      </View>
      <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Chat History</Text>
        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No chat history yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation to see it here</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingBottom: 90 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', padding: 16 },
  list: { padding: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, marginBottom: 10 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.3)', alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#FFF' },
  itemTime: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#FFF' },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
});
