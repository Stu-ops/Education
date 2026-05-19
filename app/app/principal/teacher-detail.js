import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Video, Users } from 'lucide-react-native';
import { getTeacherDetail } from '../../src/utils/principalApi';

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getTeacherDetail(id).then(setTeacher).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
        <ActivityIndicator color="#FFF" style={{ marginTop: 80 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Teacher Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Profile */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(teacher?.name || teacher?.username || '?')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{teacher?.name || teacher?.username}</Text>
            <Text style={styles.username}>@{teacher?.username}</Text>
            {teacher?.email ? <Text style={styles.email}>{teacher.email}</Text> : null}
            {teacher?.bio ? <Text style={styles.bio}>{teacher.bio}</Text> : null}
            <View style={[styles.badge, teacher?.is_active ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={styles.badgeText}>{teacher?.is_active ? 'Active' : 'Suspended'}</Text>
            </View>
          </View>

          {/* Videos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Video size={16} color="#A5B4FC" />
              <Text style={styles.sectionTitle}>Videos ({teacher?.videos?.length || 0})</Text>
            </View>
            {teacher?.videos?.length > 0
              ? teacher.videos.map(v => (
                  <View key={v.id} style={styles.listItem}>
                    <Text style={styles.listItemTitle} numberOfLines={1}>{v.title}</Text>
                    <Text style={styles.listItemSub}>{v.view_count} views · {v.upload_date?.slice(0, 10)}</Text>
                  </View>
                ))
              : <Text style={styles.empty}>No videos uploaded</Text>}
          </View>

          {/* Students */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={16} color="#6EE7B7" />
              <Text style={styles.sectionTitle}>Students ({teacher?.students?.length || 0})</Text>
            </View>
            {teacher?.students?.length > 0
              ? teacher.students.map((s, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={styles.listItemTitle}>{s.name || s.username}</Text>
                    <Text style={styles.listItemSub}>Class {s.class_level || '—'} · Enrolled {s.enrolled_date?.slice(0, 10)}</Text>
                  </View>
                ))
              : <Text style={styles.empty}>No students enrolled</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  profileCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  username: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  email: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  bio: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  badgeActive: { backgroundColor: '#10B98133' },
  badgeInactive: { backgroundColor: '#EF444433' },
  badgeText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
  section: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  listItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  listItemTitle: { fontSize: 14, fontWeight: '500', color: '#FFF' },
  listItemSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  empty: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: 8 },
});
