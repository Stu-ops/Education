// History Screen
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageSquare, ChevronRight, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useHistoryStore } from '../../src/contexts/HistoryContext';

export default function HistoryScreen() {
  const { history, deleteConversation, clearHistory } = useHistoryStore();

  const handleItemPress = (item) => {
    // Navigate to home with the conversation data
    router.push({
      pathname: '/home',
      params: {
        session_id: item.session_id,
        messages: JSON.stringify(item.messages),
      },
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MessageSquare size={20} color="#FFF" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemTime}>{formatDate(item.timestamp)}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            deleteConversation(item.id);
          }}
        >
          <Trash2 size={18} color="#EF4444" />
        </TouchableOpacity>
        <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat History</Text>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearHistory}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  clearButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8 },
  clearButtonText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  list: { padding: 16, paddingBottom: 100 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14, marginBottom: 10 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59,130,246,0.3)', alignItems: 'center', justifyContent: 'center' },
  itemContent: { flex: 1, marginLeft: 12 },
  itemTitle: { fontSize: 16, fontWeight: '500', color: '#FFF', marginBottom: 2 },
  itemTime: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteButton: { padding: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: '600', color: '#FFF' },
  emptySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
});
