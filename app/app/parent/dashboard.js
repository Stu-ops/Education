import { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useParent } from '../../src/contexts/ParentContext';
import { LogOut, User, TrendingUp, Clock, Target, Award } from 'lucide-react-native';

export default function ParentDashboardScreen() {
  const { parent, stats, statsLoading, fetchStats, logout } = useParent();

  useEffect(() => { fetchStats(); }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/parent/login');
  };

  if (statsLoading && !stats) {
    return (
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const child = stats?.child || {};
  const progress = stats?.progress || {};
  const weeklyGoal = progress.weekly_goal || 20;
  const weeklySolved = progress.weekly_solved || 0;
  const weeklyPct = Math.min((weeklySolved / weeklyGoal) * 100, 100);

  return (
    <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Parent Dashboard</Text>
              <Text style={styles.subText} numberOfLines={1}>
                Monitoring: {child.name || child.username || 'Your Child'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Child Profile Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={18} color="#C4B5FD" />
              <Text style={styles.cardTitle}>Child Profile</Text>
            </View>
            {[
              ['Name', child.name || 'N/A'],
              ['Class', child.class_level || 'N/A'],
              ['Level', child.level || 1],
            ].map(([label, value]) => (
              <View key={label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Stats Grid — 2 columns */}
          <View style={styles.statsGrid}>
            <StatCard icon={TrendingUp} color="#C4B5FD" value={progress.problems_solved || 0} label="Problems" />
            <StatCard icon={Target} color="#6EE7B7" value={`${progress.accuracy || 0}%`} label="Accuracy" />
            <StatCard icon={Clock} color="#93C5FD" value={progress.time_spent || 0} label="Minutes" />
            <StatCard icon={Award} color="#FCD34D" value={progress.streak || 0} label="Streak" />
          </View>

          {/* Weekly Progress */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Progress</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${weeklyPct}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {weeklySolved} / {weeklyGoal} problems this week
            </Text>
          </View>

          {/* Strengths */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Strengths & Focus</Text>
            <View style={styles.strengthRow}>
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>Strongest</Text>
                <Text style={styles.strengthValue}>{progress.strongest || 'Addition'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>Needs Focus</Text>
                <Text style={styles.strengthValue}>{progress.focus_area || 'Division'}</Text>
              </View>
            </View>
          </View>

          {/* Profile Link */}
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/parent/profile')}>
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.profileBtnGrad}>
              <User size={18} color="#FFF" />
              <Text style={styles.profileBtnText}>View Parent Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({ icon: Icon, color, value, label }) {
  return (
    <View style={styles.statCard}>
      <Icon size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 15 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  headerText: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: { padding: 8 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 14, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infoLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 14 },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    width: '47%', flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  progressTrack: {
    height: 10, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5, overflow: 'hidden', marginTop: 10,
  },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 5 },
  progressText: {
    color: 'rgba(255,255,255,0.7)', fontSize: 12,
    marginTop: 8, textAlign: 'center',
  },
  strengthRow: { flexDirection: 'row', marginTop: 10, gap: 12 },
  strengthItem: { flex: 1 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  strengthLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
  strengthValue: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  profileBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  profileBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14, gap: 8,
  },
  profileBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
