import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getAuditLog } from '../../src/utils/adminApi';

const ACTION_COLORS = {
  suspend: '#F59E0B', reactivate: '#10B981', delete: '#EF4444',
  flag: '#8B5CF6', unflag: '#6366F1', login: '#3B82F6', default: '#9CA3AF',
};

function actionColor(action = '') {
  for (const key of Object.keys(ACTION_COLORS)) {
    if (action.includes(key)) return ACTION_COLORS[key];
  }
  return ACTION_COLORS.default;
}

export default function AuditLogScreen() {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLog(1, 100)
      .then(data => { setEntries(data.entries || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: actionColor(item.action) }]} />
      <View style={styles.rowInfo}>
        <Text style={styles.action}>{item.action.replace(/_/g, ' ')}</Text>
        <Text style={styles.meta}>
          {item.actor_role} #{item.actor_id}
          {item.target_type ? ` → ${item.target_type} #${item.target_id}` : ''}
        </Text>
        <Text style={styles.time}>{item.created_at?.slice(0, 19).replace('T', ' ')}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Audit Log ({total})</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={entries} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No audit entries</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  list: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  rowInfo: { flex: 1 },
  action: { fontSize: 14, fontWeight: '600', color: '#FFF', textTransform: 'capitalize' },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  time: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
