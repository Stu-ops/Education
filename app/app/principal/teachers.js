import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Ban, CheckCircle, ChevronRight } from 'lucide-react-native';
import { getTeachers, deactivateTeacher, reactivateTeacher } from '../../src/utils/principalApi';

export default function PrincipalTeachersScreen() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getTeachers().then(setTeachers).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (t) => {
    if (t.is_active) await deactivateTeacher(t.id);
    else await reactivateTeacher(t.id);
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardMain} onPress={() => router.push({ pathname: '/principal/teacher-detail', params: { id: item.id } })}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || item.username)[0].toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name || item.username}</Text>
          <Text style={styles.sub} numberOfLines={1}>@{item.username}</Text>
          <Text style={styles.stats} numberOfLines={1}>📹 {item.video_count} · 👨‍🎓 {item.student_count} students</Text>
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Off'}</Text>
          </View>
          <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => toggle(item)}>
        {item.is_active
          ? <><Ban size={14} color="#F59E0B" /><Text style={[styles.toggleText, { color: '#F59E0B' }]}>Deactivate</Text></>
          : <><CheckCircle size={14} color="#10B981" /><Text style={[styles.toggleText, { color: '#10B981' }]}>Reactivate</Text></>}
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Teachers</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={teachers} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No teachers in your college yet</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  stats: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  right: { alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeActive: { backgroundColor: '#10B98133' },
  badgeInactive: { backgroundColor: '#EF444433' },
  badgeText: { fontSize: 11, color: '#FFF', fontWeight: '600' },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  toggleText: { fontSize: 13, fontWeight: '500' },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
