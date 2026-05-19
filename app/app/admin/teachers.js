import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Ban, CheckCircle } from 'lucide-react-native';
import { getAdminTeachers, suspendAccount, reactivateAccount } from '../../src/utils/adminApi';

export default function AdminTeachersScreen() {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getAdminTeachers({ page: 1, page_size: 50 })
      .then(data => { setTeachers(data.teachers || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleTeacher = async (t) => {
    if (t.is_active) await suspendAccount('teacher', t.id);
    else await reactivateAccount('teacher', t.id);
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name || item.username}</Text>
        <Text style={styles.rowSub}>@{item.username} · {item.video_count} videos</Text>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Suspended'}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => toggleTeacher(item)}>
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
          <Text style={styles.title}>Teachers ({total})</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={teachers} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No teachers found</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  list: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  rowInfo: { flex: 1, gap: 4 },
  rowName: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeActive: { backgroundColor: '#10B98133' },
  badgeInactive: { backgroundColor: '#EF444433' },
  badgeText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  toggleBtn: { padding: 8 },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
