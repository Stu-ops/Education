import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getStudents } from '../../src/utils/principalApi';

export default function PrincipalStudentsScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.name || item.username)[0].toUpperCase()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.username}</Text>
        <Text style={styles.sub} numberOfLines={1}>@{item.username} · Class {item.class_level || '—'}</Text>
        <Text style={styles.stats} numberOfLines={1}>
          Score {item.score?.toFixed(1)} · 🔥 {item.current_streak}
        </Text>
      </View>
      <View style={[styles.badge, item.is_active ? styles.badgeActive : styles.badgeInactive]}>
        <Text style={styles.badgeText}>{item.is_active ? '✓' : '✗'}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Students ({students.length})</Text>
          <View style={{ width: 24 }} />
        </View>
        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <FlatList data={students} renderItem={renderItem} keyExtractor={i => i.username}
              contentContainerStyle={styles.list}
              ListEmptyComponent={<Text style={styles.empty}>No students enrolled yet</Text>} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  list: { padding: 16, gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  stats: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  badge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeActive: { backgroundColor: '#10B98133' },
  badgeInactive: { backgroundColor: '#EF444433' },
  badgeText: { fontSize: 14, color: '#FFF', fontWeight: 'bold' },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: 40 },
});
