// Explore Screen
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { BookOpen, Clock, Flame, Target, Trophy, Medal, Gem, Star, Coins } from 'lucide-react-native';
import { getExploreData } from '../../src/utils/exploreApi';
import Confetti from '../../src/components/Confetti';
import BadgeUnlock from '../../src/components/BadgeUnlock';
import colors from '../../src/styles/colors';
import Header from '../../src/components/Header';

function CircularProgress({ percentage }) {
  const size = 88;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.primary.border} strokeWidth={strokeWidth} fill="transparent" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.accent.orange} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Text style={{ position: 'absolute', fontSize: 18, fontWeight: '700', color: colors.text.primary }}>{percentage}%</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getExploreData();
    setData(result);
    if (result?.weeklyGoal?.goal) {
      setGoalInput(String(result.weeklyGoal.goal));
    }
    setLoading(false);
  };

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

  useEffect(() => {
    if (data?.weeklyGoal) {
      const progress = (data.weeklyGoal.solved / data.weeklyGoal.goal) * 100;
      if (progress >= 100) {
        setShowConfetti(true);
        const timer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [data?.weeklyGoal]);

  useEffect(() => {
    if (data?.practice?.streak && previousStreak > 0) {
      const currentStreak = data.practice.streak;
      const milestones = [3, 7, 14, 30, 60, 100];
      const justUnlocked = milestones.find(
        (milestone) => currentStreak >= milestone && previousStreak < milestone
      );

      if (justUnlocked) {
        setUnlockedBadge({
          title: `${justUnlocked} Day Streak`,
        });
        setShowBadgeUnlock(true);
        const timer = setTimeout(() => setShowBadgeUnlock(false), 2500);
        return () => clearTimeout(timer);
      }
    }

    if (data?.practice?.streak) {
      setPreviousStreak(data.practice.streak);
    }
  }, [data?.practice?.streak, previousStreak]);

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent.orange} />
            <Text style={styles.loadingText}>Loading explore data...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Unable to load data</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const { progress, practice, strengths, weeklyGoal, badges } = data;
  const goalProgress = Math.min((weeklyGoal.solved / weeklyGoal.goal) * 100, 100);
  const goalPercent = Math.round(goalProgress);

  const handleSetGoal = () => {
    const nextGoal = parseInt(goalInput, 10);
    if (!Number.isFinite(nextGoal) || nextGoal <= 0) return;
    setData((prev) => ({
      ...prev,
      weeklyGoal: {
        ...prev.weeklyGoal,
        goal: nextGoal,
      },
    }));
  };

  return (
    <View style={styles.container}>
      <Confetti show={showConfetti} />
      <BadgeUnlock
        visible={showBadgeUnlock}
        badgeName={unlockedBadge?.title || 'Achievement'}
        badgeEmoji="*"
        onComplete={() => setShowBadgeUnlock(false)}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerWrap}>
          <Header />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topSpacer} />

          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Progress Overview</Text>
              <CircularProgress percentage={progress.percentage} />
              <Text style={styles.cardSubtext}>Topics mastered {progress.mastered} / {progress.total}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Accuracy</Text>
              <Text style={styles.accuracyText}>{animatedAccuracy}%</Text>
              <Text style={styles.cardSubtext}>Last 7 days</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.cardTall]}>
              <Text style={styles.cardTitle}>Practice & Engagement</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <BookOpen size={16} color={colors.accent.orange} />
                  <Text style={styles.statValue}>{practice.problems}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Problems</Text>
                </View>
                <View style={styles.statItem}>
                  <Clock size={16} color={colors.accent.green} />
                  <Text style={styles.statValue}>{practice.minutes}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>Minutes</Text>
                </View>
              </View>
              <View style={styles.streakBadge}>
                <Flame size={14} color={colors.accent.orange} />
                <Text style={styles.streakText} numberOfLines={1} adjustsFontSizeToFit>
                  {practice.streak} day streak
                </Text>
              </View>
            </View>

            <View style={[styles.card, styles.cardTall]}>
              <Text style={styles.cardTitle}>Strengths & Focus</Text>
              <View style={styles.pill}>
                <Text style={styles.pillLabel} numberOfLines={1}>Streaks!</Text>
                <Text style={styles.pillValue} numberOfLines={1}>{practice.streak}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillLabel} numberOfLines={1}>Focus area:</Text>
                <Text style={styles.pillValue} numberOfLines={1} ellipsizeMode="tail">
                  {strengths.focus}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardFull}>
            <View style={styles.titleRow}>
              <Text style={styles.cardTitle}>Weekly Goal</Text>
              <Trophy size={16} color={colors.accent.orange} />
            </View>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>Problems solved: {weeklyGoal.solved}</Text>
              <Text style={styles.goalText}>Goal: {weeklyGoal.goal}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
              <View style={styles.progressLabel}>
                <Text style={styles.progressLabelText}>{goalPercent}%</Text>
              </View>
            </View>
            <View style={styles.goalActions}>
              <Text style={styles.goalInputLabel}>Set new goal:</Text>
              <TextInput
                style={styles.goalInput}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                placeholder="Goal"
                placeholderTextColor={colors.text.muted}
              />
              <TouchableOpacity style={styles.goalButton} onPress={handleSetGoal}>
                <Text style={styles.goalButtonText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardFull}>
            <Text style={styles.cardTitle}>Badges & Rewards</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badgeItem}>
                <Medal size={26} color={colors.accent.yellow} />
                <Text style={styles.badgeText}>Locked</Text>
              </View>
              <View style={styles.badgeItem}>
                <Gem size={26} color={colors.accent.pink} />
                <Text style={styles.badgeText}>Locked</Text>
              </View>
              <View style={styles.badgeItem}>
                <Star size={26} color={colors.accent.orange} />
                <Text style={styles.badgeText}>Locked</Text>
              </View>
              <View style={styles.badgeItem}>
                <Coins size={26} color={colors.accent.yellow} />
                <Text style={styles.badgeText}>Locked</Text>
              </View>
              <View style={styles.badgeItem}>
                <Trophy size={26} color={colors.accent.orangeDeep} />
                <Text style={styles.badgeText}>Locked</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6EDEA' },
  safeArea: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 100 },
  headerWrap: { paddingHorizontal: 12, paddingTop: 8, marginBottom: 6 },
  topSpacer: { height: 2 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.text.muted, marginTop: 12, fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, backgroundColor: '#FBF1EF', borderRadius: 20, padding: 14, alignItems: 'stretch', borderWidth: 1, borderColor: '#F0DAD2', minHeight: 150 },
  cardTall: { minHeight: 170, justifyContent: 'space-between' },
  cardFull: { backgroundColor: '#FBF1EF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F0DAD2', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.text.primary, marginBottom: 10, alignSelf: 'flex-start' },
  cardSubtext: { fontSize: 11, color: colors.text.muted, marginTop: 8 },
  accuracyText: { fontSize: 32, fontWeight: '800', color: colors.accent.green },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 10, gap: 10 },
  statItem: { flex: 1, alignItems: 'center', backgroundColor: '#FBECE8', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, borderWidth: 1, borderColor: '#F0DAD2' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text.primary, marginTop: 4 },
  statLabel: { fontSize: 10, color: colors.text.muted, textAlign: 'center' },
  streakBadge: { alignSelf: 'center', backgroundColor: '#FBECE8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#F0DAD2', flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakText: { color: colors.accent.orange, fontWeight: '700', maxWidth: 140 },
  pill: { backgroundColor: '#FBECE8', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8, width: '100%', borderWidth: 1, borderColor: '#F0DAD2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillLabel: { fontSize: 11, color: colors.text.muted, fontWeight: '600', maxWidth: '48%' },
  pillValue: { fontSize: 11, color: colors.text.primary, fontWeight: '700', maxWidth: '52%', textAlign: 'right' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  goalText: { color: colors.text.muted, fontSize: 12 },
  progressBar: { width: '100%', height: 14, backgroundColor: '#FBECE8', borderRadius: 10, overflow: 'hidden', justifyContent: 'center' },
  progressFill: { height: '100%', backgroundColor: colors.accent.orange, borderRadius: 10 },
  progressLabel: { position: 'absolute', width: '100%', alignItems: 'center' },
  progressLabelText: { fontSize: 11, fontWeight: '700', color: colors.text.primary },
  goalActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  goalInputLabel: { fontSize: 12, color: colors.text.muted },
  goalInput: { width: 64, backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#F0DAD2', color: colors.text.primary, textAlign: 'center' },
  goalButton: { backgroundColor: colors.accent.orange, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 10, justifyContent: 'center' },
  goalButtonText: { color: '#FFFFFF', fontWeight: '700' },
  badgesRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 6 },
  badgeItem: { alignItems: 'center', gap: 6 },
  badgeText: { fontSize: 10, color: colors.text.muted, fontWeight: '600' },
});
