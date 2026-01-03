// ExploreScreen adapted from web app for React Native
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getExploreData } from '../utils/exploreApi';
import CircularProgress from '../components/CircularProgress';
import AccuracyCard from '../components/AccuracyCard';
import colors from '../styles/colors';

export default function ExploreScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const result = await getExploreData();
    setData(result);
  };

  if (!data) {
    return (
      <LinearGradient colors={colors.gradients.main} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const { progress, accuracy, practice, strengths, weeklyGoal, badges } = data;
  const goalProgress = Math.min((weeklyGoal.solved / weeklyGoal.goal) * 100, 100);

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress & Accuracy Row */}
          <View style={styles.row}>
            {/* Progress Card */}
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardTitle}>Progress</Text>
              <View style={styles.progressContainer}>
                <CircularProgress percentage={progress.percentage} size="mobile" />
              </View>
              <Text style={styles.cardSubtext}>
                {progress.mastered} / {progress.total} topics
              </Text>
            </View>

            {/* Accuracy Card with animated counter and sparkle effects */}
            <AccuracyCard accuracy={accuracy} subtitle="Last 7 days" />
          </View>

          {/* Practice & Strengths Row */}
          <View style={styles.row}>
            {/* Practice Card */}
            <View style={[styles.card, styles.halfCard]}>
              <Text style={styles.cardTitle}>Practice</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>📝</Text>
                  <Text style={styles.statValue}>{practice.problems}</Text>
                  <Text style={styles.statLabel}>Problems</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>⏱️</Text>
                  <Text style={styles.statValue}>{practice.minutes}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{practice.streak} day streak</Text>
              </View>
            </View>

            {/* Strengths Card */}
            <View style={[styles.card, styles.halfCard]}>
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

          {/* Weekly Goal Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Goal 🎯</Text>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>
                Solved: <Text style={styles.goalBold}>{weeklyGoal.solved}</Text>
              </Text>
              <Text style={styles.goalText}>
                Goal: <Text style={styles.goalBold}>{weeklyGoal.goal}</Text>
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${goalProgress}%` }]} />
              <Text style={styles.progressBarText}>{Math.round(goalProgress)}%</Text>
            </View>
            {goalProgress >= 100 && (
              <View style={styles.goalComplete}>
                <Text style={styles.goalCompleteEmoji}>🎉</Text>
                <Text style={styles.goalCompleteText}>Goal Completed!</Text>
              </View>
            )}
          </View>

          {/* Badges Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Badges 🏆</Text>
            <View style={styles.badgesGrid}>
              {badges.map((badge, idx) => {
                const gradientColors = colors.badge.gradients[idx % colors.badge.gradients.length];
                return (
                  <LinearGradient
                    key={idx}
                    colors={gradientColors}
                    style={styles.badge}
                  >
                    <Text style={styles.badgeEmoji}>
                      {['🌟', '🎯', '🔥', '💎', '🚀', '⭐'][idx % 6]}
                    </Text>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </LinearGradient>
                );
              })}
            </View>
          </View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '600',
  },
  strengthItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  strengthValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  goalBold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 8,
  },
  progressBarText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  goalComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    gap: 8,
  },
  goalCompleteEmoji: {
    fontSize: 20,
  },
  goalCompleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});
