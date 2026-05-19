import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Building2, Trash2, Ban, CheckCircle } from 'lucide-react-native';
import { getColleges, deleteCollege, suspendAccount, reactivateAccount } from '../../src/utils/adminApi';

export default function AdminCollegesScreen() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getColleges().then(setColleges).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (college) => {
    Alert.alert('Deactivate College', `Deactivate "${college.name}" and all its accounts?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Deactivate', style: 'destructive', onPress: async () => {
        await deleteCollege(college.id);
        load();
      }},
    ]);
  };

  const handleToggle = async (college) => {
    if (college.is_active) await suspendAccount('principal', college.id);
    else await reactivateAccount('principal', college.id);
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Building2 size={18} color="#6366F1" />
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.is_active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      <Text style={styles.cardSub}>Principal: {item.principal_name || item.principal_username || '—'}</Text>
      <View style={styles.cardStats}>
        <Text style={styles.statText}>👨‍🏫 {item.teacher_count} teachers</Text>
        <Text style={styles.statText}>👨‍🎓 {item.student_count} students</Text>
      </View>
      <Text style={styles.codeText}>Code: {item.invite_code}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(item)}>
          {item.is_active
            ? <Ban size={16} color="#F59E0B" />
            : <CheckCircle size={16} color="#10B981" />}
          <Text style={[styles.actionText, { color: item.is_active ? '#F59E0B' : '#10B981' }]}>
            {item.is_active ? 'Suspend' : 'Reactivate'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Trash2 size={16} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Colleges</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={colleges} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No colleges found</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFF' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeActive: { backgroundColor: '#10B98133' },
  badgeInactive: { backgroundColor: '#EF444433' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#FFF' },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  cardStats: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  statText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  codeText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  actionText: { fontSize: 13, fontWeight: '500' },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
