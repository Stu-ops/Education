// Parent Dashboard Screen
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useParent } from '../../src/contexts/ParentContext';
import { LogOut, User, TrendingUp, Clock, Target, Award } from 'lucide-react-native';

export default function ParentDashboardScreen() {
  const { parent, stats, statsLoading, fetchStats, logout } = useParent();

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/parent/login');
  };

  if (statsLoading && !stats) {
    return (
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const childStats = stats?.child || {};
  const progress = stats?.progress || {};

  return (
    <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>👨‍👩‍👧 Parent Dashboard</Text>
              <Text style={styles.childName}>
                Monitoring: {childStats.name || childStats.username || 'Your Child'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Child Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <User size={20} color="#A855F7" />
              <Text style={styles.cardTitle}>Child Profile</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{childStats.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class:</Text>
              <Text style={styles.infoValue}>{childStats.class_level || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Level:</Text>
              <Text style={styles.infoValue}>{childStats.level || 1}</Text>
            </View>
          </View>

          {/* Progress Stats */}
          <View style={styles.statsGrid}>
            <LinearGradient colors={['rgba(168,85,247,0.3)', 'rgba(124,58,237,0.3)']} style={styles.statCard}>
              <TrendingUp size={24} color="#A855F7" />
              <Text style={styles.statValue}>{progress.problems_solved || 0}</Text>
              <Text style={styles.statLabel}>Problems Solved</Text>
            </LinearGradient>

            <LinearGradient colors={['rgba(34,197,94,0.3)', 'rgba(16,185,129,0.3)']} style={styles.statCard}>
              <Target size={24} color="#22C55E" />
              <Text style={styles.statValue}>{progress.accuracy || 0}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </LinearGradient>

            <LinearGradient colors={['rgba(59,130,246,0.3)', 'rgba(6,182,212,0.3)']} style={styles.statCard}>
              <Clock size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{progress.time_spent || 0}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </LinearGradient>

            <LinearGradient colors={['rgba(249,115,22,0.3)', 'rgba(234,179,8,0.3)']} style={styles.statCard}>
              <Award size={24} color="#F97316" />
              <Text style={styles.statValue}>{progress.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </LinearGradient>
          </View>

          {/* Weekly Progress */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Weekly Progress</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min((progress.weekly_solved || 0) / (progress.weekly_goal || 20) * 100, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {progress.weekly_solved || 0} / {progress.weekly_goal || 20} problems
              </Text>
            </View>
          </View>

          {/* Strengths & Focus */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💪 Strengths & Focus Areas</Text>
            <View style={styles.strengthRow}>
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>Strongest:</Text>
                <Text style={styles.strengthValue}>{progress.strongest || 'Addition'}</Text>
              </View>
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>Needs Focus:</Text>
                <Text style={styles.strengthValue}>{progress.focus_area || 'Division'}</Text>
              </View>
            </View>
          </View>

          {/* Profile Link */}
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/parent/profile')}
          >
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.profileButtonGradient}>
              <User size={20} color="#FFF" />
              <Text style={styles.profileButtonText}>View Parent Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFF', marginTop: 16, fontSize: 16 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  childName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  logoutButton: { padding: 8 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  infoLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  progressBarContainer: { marginTop: 8 },
  progressBar: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
  progressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 8, textAlign: 'center' },
  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  strengthItem: { flex: 1 },
  strengthLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  strengthValue: { color: '#FFF', fontSize: 16, fontWeight: '500', marginTop: 4 },
  profileButton: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  profileButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  profileButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
