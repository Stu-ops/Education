import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { getAnalytics, getStudentAnalytics, getContentAnalytics, getContestAnalytics } from '../../src/utils/principalApi';

const TABS = ['Summary', 'Students', 'Content', 'Contests'];

export default function PrincipalAnalyticsScreen() {
  const [tab, setTab] = useState(0);
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [content, setContent] = useState([]);
  const [contests, setContests] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), getStudentAnalytics(), getContentAnalytics(), getContestAnalytics()])
      .then(([s, st, c, co]) => { setSummary(s); setStudents(st); setContent(c); setContests(co); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((t, i) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === i && styles.tabActive]} onPress={() => setTab(i)}>
              <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading
          ? <ActivityIndicator color="#FFF" style={{ marginTop: 40 }} />
          : <ScrollView contentContainerStyle={styles.content}>
              {tab === 0 && summary && (
                <View style={styles.grid}>
                  <StatCard label="Teachers" value={summary.teacher_count} />
                  <StatCard label="Students" value={summary.student_count} />
                  <StatCard label="Uploads" value={summary.total_uploads} />
                  <StatCard label="Avg Score" value={summary.avg_student_score?.toFixed(1)} />
                </View>
              )}

              {tab === 1 && students.map((s, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.rowName}>{s.name || s.username}</Text>
                  <Text style={styles.rowSub}>Score {s.score?.toFixed(1)} · Acc {(s.accuracy * 100).toFixed(0)}% · 🔥{s.current_streak}</Text>
                </View>
              ))}

              {tab === 2 && content.map((c, i) => (
                <View key={i} style={styles.row}>
                  <Text style={styles.rowName}>{c.teacher_name || `Teacher #${c.teacher_id}`}</Text>
                  <Text style={styles.rowSub}>📹 {c.video_count} videos · 👁 {c.total_views} views</Text>
                  {c.most_watched_title && <Text style={styles.rowHint}>Top: {c.most_watched_title}</Text>}
                </View>
              ))}

              {tab === 3 && contests && (
                <View style={styles.grid}>
                  <StatCard label="Participants" value={contests.total_participants} />
                  <StatCard label="Attempts" value={contests.total_attempts} />
                  <StatCard label="Avg Score" value={contests.avg_score?.toFixed(1)} />
                  <StatCard label="Top Score" value={contests.top_score?.toFixed(1)} />
                </View>
              )}

              {((tab === 1 && students.length === 0) || (tab === 2 && content.length === 0)) && (
                <Text style={styles.empty}>No data available</Text>
              )}
            </ScrollView>}
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  content: { padding: 16, gap: 10, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  row: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 },
  rowName: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  rowHint: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  empty: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 40 },
});
