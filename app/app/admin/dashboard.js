import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  LogOut, Building2, Users, GraduationCap,
  Video, Trophy, FileText, Settings, BookOpen,
} from 'lucide-react-native';
import { useAdmin } from '../../src/contexts/AdminContext';
import { getPlatformStats } from '../../src/utils/adminApi';

const NAV_TILES = [
  { label: 'Colleges',  icon: Building2,    color: '#6366F1', route: '/admin/colleges' },
  { label: 'Students',  icon: Users,         color: '#10B981', route: '/admin/users' },
  { label: 'Teachers',  icon: GraduationCap, color: '#F59E0B', route: '/admin/teachers' },
  { label: 'Videos',    icon: Video,         color: '#3B82F6', route: '/admin/videos' },
  { label: 'Audit Log', icon: FileText,      color: '#8B5CF6', route: '/admin/audit-log' },
  { label: 'Config',    icon: Settings,      color: '#EC4899', route: '/admin/config' },
];

export default function AdminDashboardScreen() {
  const { admin, logout } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => { await logout(); router.replace('/admin/login'); };

  return (
    <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Admin Dashboard</Text>
              <Text style={styles.subText} numberOfLines={1}>{admin?.username}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Platform Stats */}
          {loading ? (
            <ActivityIndicator color="#FFF" style={{ marginVertical: 20 }} />
          ) : stats ? (
            <View style={styles.statsGrid}>
              <StatCard label="Colleges"   value={stats.total_colleges}         icon={Building2}    color="#A5B4FC" />
              <StatCard label="Principals" value={stats.total_principals}       icon={BookOpen}     color="#C4B5FD" />
              <StatCard label="Teachers"   value={stats.total_teachers}         icon={GraduationCap} color="#FCD34D" />
              <StatCard label="Students"   value={stats.total_students}         icon={Users}        color="#6EE7B7" />
              <StatCard label="Videos"     value={stats.total_videos}           icon={Video}        color="#93C5FD" />
              <StatCard label="Contests"   value={stats.total_contest_attempts} icon={Trophy}       color="#FCA5A5" />
            </View>
          ) : null}

          {/* Navigation */}
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.tilesGrid}>
            {NAV_TILES.map(({ label, icon: Icon, color, route }) => (
              <TouchableOpacity key={label} style={styles.tile} onPress={() => router.push(route)}>
                <View style={[styles.tileIcon, { backgroundColor: color + '33' }]}>
                  <Icon size={24} color={color} />
                </View>
                <Text style={styles.tileLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <View style={styles.statCard}>
      <Icon size={18} color={color} />
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  headerText: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: { padding: 8 },
  // Stats — 3 per row, wraps to 2 rows of 3
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  statCard: {
    width: '31%', flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  // Tiles — 3 per row, wraps to 2 rows of 3
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '31%', flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 8,
  },
  tileIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, fontWeight: '600', color: '#FFF', textAlign: 'center' },
});
