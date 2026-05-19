import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Flag, Trash2 } from 'lucide-react-native';
import { getAdminVideos, deleteVideo, flagVideo } from '../../src/utils/adminApi';

export default function AdminVideosScreen() {
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAdminVideos({ page: 1, page_size: 30, ...(flaggedOnly ? { flagged_only: true } : {}) })
      .then(data => { setVideos(data.videos || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [flaggedOnly]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (v) => {
    Alert.alert('Delete Video', `Delete "${v.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteVideo(v.id); load(); } },
    ]);
  };

  const handleFlag = async (v) => {
    await flagVideo(v.id);
    load();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        {item.is_flagged && (
          <View style={styles.flagBadge}><Text style={styles.flagText}>Flagged</Text></View>
        )}
      </View>
      <Text style={styles.cardSub}>
        👨‍🏫 {item.teacher_name || '—'} · 🏫 {item.college_name || 'No college'}
      </Text>
      <Text style={styles.cardSub}>
        Class {item.class_level} · {item.view_count} views · {item.upload_date?.slice(0, 10)}
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleFlag(item)}>
          <Flag size={15} color={item.is_flagged ? '#10B981' : '#F59E0B'} />
          <Text style={[styles.actionText, { color: item.is_flagged ? '#10B981' : '#F59E0B' }]}>
            {item.is_flagged ? 'Unflag' : 'Flag'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Trash2 size={15} color="#EF4444" />
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
          <Text style={styles.title}>Videos ({total})</Text>
          <TouchableOpacity onPress={() => setFlaggedOnly(f => !f)} style={[styles.filterBtn, flaggedOnly && styles.filterBtnActive]}>
            <Flag size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={videos} renderItem={renderItem} keyExtractor={i => i.id.toString()}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No videos found</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  filterBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)' },
  filterBtnActive: { backgroundColor: '#F59E0B' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFF' },
  flagBadge: { backgroundColor: '#F59E0B33', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  flagText: { fontSize: 11, color: '#F59E0B', fontWeight: '600' },
  cardSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  actionText: { fontSize: 12, fontWeight: '500' },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
