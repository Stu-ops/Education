// Explore Screen
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { getExploreData } from '../../src/utils/exploreApi';

function CircularProgress({ percentage }) {
  const size = 100;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} fill="transparent" />
        <Circle cx={size/2} cy={size/2} r={radius} stroke="#06B6D4" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      </Svg>
      <Text style={{ position: 'absolute', fontSize: 24, fontWeight: 'bold', color: '#FFF' }}>{percentage}%</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getExploreData();
    setData(result);
    setLoading(false);
  };

  // Animate accuracy counter
  useEffect(() => {
    if (!data?.accuracy) return;
    
    let current = 0;
    const target = data.accuracy;
    const timer = setInterval(() => {
      current += 2;
      if (current >= target) {
        setAnimatedAccuracy(target);
        clearInterval(timer);
      } else {
        setAnimatedAccuracy(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [data?.accuracy]);

  if (loading) {
    return (
      <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading explore data...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!data) {
    return (
      <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Unable to load data</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { progress, accuracy, practice, strengths, weeklyGoal, badges } = data;
  const goalProgress = Math.min((weeklyGoal.solved / weeklyGoal.goal) * 100, 100);

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress & Accuracy */}
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progress</Text>
              <CircularProgress percentage={progress.percentage} />
              <Text style={styles.cardSubtext}>{progress.mastered} / {progress.total} topics</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Accuracy</Text>
              <Text style={styles.accuracyText}>{animatedAccuracy}%</Text>
              <Text style={styles.cardSubtext}>Last 7 days</Text>
            </View>
          </View>

          {/* Practice & Strengths */}
          <View style={styles.row}>
            {/* Practice Stats */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Practice</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{practice.problems}</Text>
                  <Text style={styles.statLabel}>Problems</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{practice.minutes}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {practice.streak} day streak</Text>
              </View>
            </View>

            {/* Strengths */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Focus</Text>
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>💪 Strongest:</Text>
                <Text style={styles.strengthValue}>{strengths.strongest}</Text>
              </View>
              <View style={styles.strengthItem}>
                <Text style={styles.strengthLabel}>🎯 Focus:</Text>
                <Text style={styles.strengthValue}>{strengths.focus}</Text>
              </View>
            </View>
          </View>

          {/* Weekly Goal */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Goal 🎯</Text>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>Solved: {weeklyGoal.solved}</Text>
              <Text style={styles.goalText}>Goal: {weeklyGoal.goal}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
            </View>
            {goalProgress >= 100 && (
              <View style={styles.goalComplete}>
                <Text style={styles.goalCompleteText}>🎉 Goal Completed!</Text>
              </View>
            )}
          </View>

          {/* Badges */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Badges 🏆</Text>
            <View style={styles.badgesGrid}>
              {badges.map((badge, i) => (
                <LinearGradient 
                  key={i} 
                  colors={[
                    ['#EAB308','#F97316'], 
                    ['#22C55E','#3B82F6'], 
                    ['#A855F7','#EC4899'], 
                    ['#3B82F6','#4F46E5'],
                    ['#F97316','#EF4444'],
                    ['#06B6D4','#3B82F6']
                  ][i % 6]} 
                  style={styles.badge}
                >
                  <Text style={styles.badgeEmoji}>{['🌟','🎯','🔥','💎','🚀','⭐'][i % 6]}</Text>
                  <Text style={styles.badgeText}>{badge}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 12, alignSelf: 'flex-start' },
  cardSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 },
  accuracyText: { fontSize: 48, fontWeight: 'bold', color: '#22C55E' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 12 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  streakBadge: { backgroundColor: 'rgba(249,115,22,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  streakText: { color: '#F97316', fontWeight: '600' },
  strengthItem: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, marginBottom: 8, width: '100%' },
  strengthLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  strengthValue: { fontSize: 14, color: '#FFF', fontWeight: '500' },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  goalText: { color: 'rgba(255,255,255,0.8)' },
  progressBar: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
  goalComplete: { marginTop: 12, backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 8, padding: 8, alignItems: 'center' },
  goalCompleteText: { color: '#22C55E', fontWeight: '600', fontSize: 14 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  badge: { width: '30%', borderRadius: 12, padding: 12, alignItems: 'center' },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeText: { fontSize: 10, color: '#FFF', fontWeight: '600', textAlign: 'center' },
});
