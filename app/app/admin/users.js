import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Ban, CheckCircle } from 'lucide-react-native';
import { getAdminUsers, suspendAccount, reactivateAccount } from '../../src/utils/adminApi';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback((p = 1) => {
    setLoading(true);
    const params = { page: p, page_size: 20 };
    if (classFilter) params.class_level = classFilter;
    getAdminUsers(params)
      .then(data => { setUsers(data.users || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classFilter]);

  useEffect(() => { load(1); setPage(1); }, [load]);

  const toggleUser = async (user) => {
    if (user.is_active) await suspendAccount('student', user.id);
    else await reactivateAccount('student', user.id);
    load(page);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name || item.username}</Text>
        <Text style={styles.rowSub}>@{item.username} · Class {item.class_level || '—'} · Score {item.score?.toFixed(1)}</Text>
      </View>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleUser(item)}>
        {item.is_active
          ? <Ban size={18} color="#F59E0B" />
          : <CheckCircle size={18} color="#10B981" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Students ({total})</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.filterRow}>
          <TextInput style={styles.filterInput} placeholder="Filter by class (e.g. class_5)"
            placeholderTextColor="rgba(255,255,255,0.4)" value={classFilter}
            onChangeText={setClassFilter} autoCapitalize="none" />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={users} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No students found</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  filterRow: { paddingHorizontal: 16, marginBottom: 8 },
  filterInput: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, color: '#FFF', fontSize: 14 },
  list: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  toggleBtn: { padding: 8 },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
