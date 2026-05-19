import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LogOut, Users, GraduationCap, Copy, RefreshCw, BarChart2, CheckCircle } from 'lucide-react-native';
import { usePrincipal } from '../../src/contexts/PrincipalContext';
import { getAnalytics } from '../../src/utils/principalApi';

export default function PrincipalDashboardScreen() {
  const { principal, college, logout, fetchInviteCode, refreshInviteCode } = usePrincipal();
  const [inviteCode, setInviteCode] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [codeData, analyticsData] = await Promise.all([
        fetchInviteCode(), getAnalytics(),
      ]);
      setInviteCode(codeData.invite_code);
      setAnalytics(analyticsData);
    } catch {}
    setLoading(false);
  }, [fetchInviteCode]);

  useEffect(() => { load(); }, [load]);

  const handleLogout = async () => { await logout(); router.replace('/principal/login'); };

  const copyCode = () => {
    if (!inviteCode) return;
    // Use React Native Clipboard
    const RN = require('react-native');
    if (RN.Clipboard) RN.Clipboard.setString(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshCode = () => {
    Alert.alert('Refresh Code', 'This will invalidate the current invite code. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Refresh', onPress: async () => {
          setRefreshing(true);
          const result = await refreshInviteCode();
          if (result.success) setInviteCode(result.invite_code);
          setRefreshing(false);
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Principal Dashboard</Text>
              <Text style={styles.subText} numberOfLines={1}>
                {college?.name || principal?.username}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Invite Code Card */}
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>TEACHER INVITE CODE</Text>
            {loading ? (
              <ActivityIndicator color="#FFF" style={{ marginVertical: 8 }} />
            ) : (
              <View style={styles.codeRow}>
                <Text style={styles.codeValue} numberOfLines={1} adjustsFontSizeToFit>
                  {inviteCode || '—'}
                </Text>
                <TouchableOpacity onPress={copyCode} style={styles.iconBtn}>
                  {copied
                    ? <CheckCircle size={20} color="#A5F3FC" />
                    : <Copy size={20} color="#C7D2FE" />}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRefreshCode} style={styles.iconBtn} disabled={refreshing}>
                  <RefreshCw size={20} color={refreshing ? '#6B7280' : '#C7D2FE'} />
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.codeHint}>Share this code with teachers to join your college</Text>
          </View>

          {/* Stats */}
          {analytics && (
            <View style={styles.statsRow}>
              <StatCard label="Teachers" value={analytics.teacher_count} icon={GraduationCap} color="#A5B4FC" />
              <StatCard label="Students" value={analytics.student_count} icon={Users} color="#6EE7B7" />
              <StatCard label="Uploads" value={analytics.total_uploads} icon={BarChart2} color="#FCD34D" />
            </View>
          )}

          {/* Navigation */}
          <Text style={styles.sectionTitle}>Manage</Text>
          <View style={styles.navGrid}>
            <NavTile emoji="👨‍🏫" label="Teachers" onPress={() => router.push('/principal/teachers')} />
            <NavTile emoji="👨‍🎓" label="Students" onPress={() => router.push('/principal/students')} />
            <NavTile emoji="📊" label="Analytics" onPress={() => router.push('/principal/analytics')} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <View style={styles.statCard}>
      <Icon size={20} color={color} />
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NavTile({ emoji, label, onPress }) {
  return (
    <TouchableOpacity style={styles.navTile} onPress={onPress}>
      <Text style={styles.navEmoji}>{emoji}</Text>
      <Text style={styles.navLabel}>{label}</Text>
    </TouchableOpacity>
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
  codeCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  codeLabel: {
    fontSize: 11, color: '#C7D2FE', fontWeight: '700',
    letterSpacing: 1, marginBottom: 10,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  codeValue: {
    flex: 1, fontSize: 24, fontWeight: 'bold',
    color: '#FFF', letterSpacing: 3,
  },
  iconBtn: { padding: 6 },
  codeHint: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFF', marginBottom: 12 },
  navGrid: { flexDirection: 'row', gap: 10 },
  navTile: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, padding: 16, alignItems: 'center', gap: 8,
  },
  navEmoji: { fontSize: 26 },
  navLabel: { fontSize: 13, fontWeight: '600', color: '#FFF', textAlign: 'center' },
});
