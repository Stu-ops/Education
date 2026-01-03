// Explore Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

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
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    // Animate accuracy
    let current = 0;
    const target = 85;
    const timer = setInterval(() => {
      current += 2;
      if (current >= target) {
        setAccuracy(target);
        clearInterval(timer);
      } else {
        setAccuracy(current);
      }
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const badges = ['Math Star', 'Quick Solver', 'Streak Master', 'Problem Pro'];

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Progress & Accuracy */}
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progress</Text>
              <CircularProgress percentage={65} />
              <Text style={styles.cardSubtext}>13 / 20 topics</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Accuracy</Text>
              <Text style={styles.accuracyText}>{accuracy}%</Text>
              <Text style={styles.cardSubtext}>Last 7 days</Text>
            </View>
          </View>

          {/* Practice Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Practice</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>42</Text>
                <Text style={styles.statLabel}>Problems</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>120</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 7 day streak</Text>
            </View>
          </View>

          {/* Weekly Goal */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Goal 🎯</Text>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>Solved: 15</Text>
              <Text style={styles.goalText}>Goal: 20</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
          </View>

          {/* Badges */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Badges 🏆</Text>
            <View style={styles.badgesGrid}>
              {badges.map((badge, i) => (
                <LinearGradient key={i} colors={[['#EAB308','#F97316'], ['#22C55E','#3B82F6'], ['#A855F7','#EC4899'], ['#3B82F6','#4F46E5']][i]} style={styles.badge}>
                  <Text style={styles.badgeEmoji}>{['🌟','🎯','🔥','💎'][i]}</Text>
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
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  goalText: { color: 'rgba(255,255,255,0.8)' },
  progressBar: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 6 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  badge: { width: '47%', borderRadius: 12, padding: 12, alignItems: 'center' },
  badgeEmoji: { fontSize: 24, marginBottom: 4 },
  badgeText: { fontSize: 12, color: '#FFF', fontWeight: '600' },
});
