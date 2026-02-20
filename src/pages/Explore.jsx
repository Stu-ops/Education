import { useEffect, useState } from "react";
import { getExploreData } from "../utils/exploreApi";
import CircularProgress from "../components/CircularProgress";
import Confetti from "../components/Confetti";
import BadgeUnlock from "../components/BadgeUnlock";
import { BookOpen, Clock, Flame, Target, Trophy, Medal, Gem, Star, Coins } from "lucide-react";

export default function Explore() {
  const [data, setData] = useState(null);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [previousStreak, setPreviousStreak] = useState(0);

  useEffect(() => {
    getExploreData().then(setData);
  }, []);

  useEffect(() => {
    if (data?.accuracy) {
      const duration = 1500;
      const steps = 60;
      const increment = data.accuracy / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= data.accuracy) {
          setAnimatedAccuracy(data.accuracy);
          clearInterval(timer);
        } else {
          setAnimatedAccuracy(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [data?.accuracy]);

  useEffect(() => {
    if (data?.weeklyGoal) {
      const progress = (data.weeklyGoal.solved / data.weeklyGoal.goal) * 100;
      if (progress >= 100) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [data?.weeklyGoal]);

  useEffect(() => {
    if (data?.practice?.streak && previousStreak > 0) {
      const currentStreak = data.practice.streak;
      const milestones = [3, 7, 14, 30, 60, 100];

      const justUnlockedMilestone = milestones.find(
        (milestone) => currentStreak >= milestone && previousStreak < milestone
      );

      if (justUnlockedMilestone) {
        setUnlockedBadge({
          icon: "streak",
          title: `${justUnlockedMilestone} Day Streak!`,
          description: `Amazing! You've practiced for ${justUnlockedMilestone} days in a row!`,
        });
        setShowBadgeUnlock(true);
        setTimeout(() => setShowBadgeUnlock(false), 2500);
      }
    }

    if (data?.practice?.streak) {
      setPreviousStreak(data.practice.streak);
    }
  }, [data?.practice?.streak]);

  if (!data) return <div className="text-masterly-navy p-4">Loading...</div>;

  const { progress, practice, strengths, weeklyGoal, badges } = data;

  return (
  <div className="min-h-screen bg-[#F6EDEA] p-4 text-[#1F2A44] space-y-4">
    {showConfetti && <Confetti />}
    {showBadgeUnlock && unlockedBadge && (
      <BadgeUnlock badge={unlockedBadge} onComplete={() => setShowBadgeUnlock(false)} />
    )}

    {/* Top Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      {/* Progress Overview */}
      <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6 text-center">
        <h3 className="font-semibold mb-4">Progress Overview</h3>
        <CircularProgress percentage={progress.percentage} />
        <p className="text-sm mt-4 text-gray-500">
          Topics mastered {progress.mastered} / {progress.total}
        </p>
      </div>

      {/* Accuracy */}
      <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6 text-center flex flex-col justify-center">
        <h3 className="font-semibold mb-2">Accuracy</h3>
        <p className="text-4xl font-bold text-green-500">
          {animatedAccuracy}%
        </p>
        <p className="text-sm text-gray-500 mt-2">Last 7 days</p>
      </div>
    </div>

    {/* Practice & Strength */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      {/* Practice */}
      <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6 text-center">
        <h3 className="font-semibold mb-4">Practice & Engagement</h3>

        <div className="flex justify-center gap-4 mb-4">
          <div className="bg-[#FBECE8] p-4 rounded-xl w-24">
            <BookOpen size={18} className="mx-auto mb-1 text-orange-500" />
            <p className="font-bold">{practice.problems}</p>
            <p className="text-xs text-gray-500">Problems</p>
          </div>

          <div className="bg-[#FBECE8] p-4 rounded-xl w-24">
            <Clock size={18} className="mx-auto mb-1 text-green-500" />
            <p className="font-bold">{practice.minutes}</p>
            <p className="text-xs text-gray-500">Minutes</p>
          </div>
        </div>

        <div className="bg-[#FBECE8] inline-flex items-center gap-2 px-4 py-2 rounded-full">
          <Flame size={16} className="text-orange-500" />
          <span className="font-semibold text-orange-500">
            {practice.streak} day streak
          </span>
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Strengths & Focus</h3>

        <div className="space-y-3">
          <div className="bg-[#FBECE8] p-3 rounded-lg">
            <span className="font-semibold text-orange-500">🔥 Streaks! </span>
            {practice.streak}
          </div>

          <div className="bg-[#FBECE8] p-3 rounded-lg">
            <span className="font-semibold text-blue-500">🎯 Focus area: </span>
            {strengths.focus}
          </div>
        </div>
      </div>
    </div>

    {/* Weekly Goal */}
    <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        Weekly Goal <Trophy size={16} className="text-orange-500" />
      </h3>

      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Problems solved: {weeklyGoal.solved}</span>
        <span>Goal: {weeklyGoal.goal}</span>
      </div>

      <div className="w-full bg-[#FBECE8] h-4 rounded-full mb-4 relative">
        <div
          className="h-4 bg-orange-400 rounded-full"
          style={{
            width: `${Math.min(
              (weeklyGoal.solved / weeklyGoal.goal) * 100,
              100
            )}%`,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {Math.round(
            (weeklyGoal.solved / weeklyGoal.goal) * 100
          )}%
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="number"
          value={weeklyGoal.goal}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              weeklyGoal: {
                ...prev.weeklyGoal,
                goal: Number(e.target.value),
              },
            }))
          }
          className="px-3 py-2 rounded-lg border border-[#F0DAD2] bg-white w-20"
        />

        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
          Set
        </button>
      </div>
    </div>

    {/* Badges */}
    <div className="bg-[#FBF1EF] border border-[#F0DAD2] rounded-2xl p-6">
      <h3 className="font-semibold mb-4">Badges & Rewards</h3>

      <div className="flex justify-around text-center">
        <div>
          <Medal size={36} className="text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Locked</p>
        </div>

        <div>
          <Gem size={36} className="text-pink-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Locked</p>
        </div>

        <div>
          <Star size={36} className="text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Locked</p>
        </div>

        <div>
          <Coins size={36} className="text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Locked</p>
        </div>

        <div>
          <Trophy size={36} className="text-orange-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Locked</p>
        </div>
      </div>
    </div>
  </div>
);

}
