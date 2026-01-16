// FeatureGrid component adapted from web app for React Native
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { getTopics } from '../utils/exploreApi';
import colors from '../styles/colors';

export default function FeatureGrid({ onTopicClick }) {
  const { lang } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const data = await getTopics();
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const icons = ['123', '+', '−', '⬤'];
  const gradients = [
    ['#A855F7', '#EC4899'],
    ['#3B82F6', '#06B6D4'],
    ['#22C55E', '#10B981'],
    ['#F97316', '#EAB308'],
  ];

  const features = topics.length > 0
    ? topics.map((topic, i) => ({
        label: lang === 'hi'
          ? ['संख्याएँ', 'जोड़', 'घटाव', 'आकार'][i] || topic
          : topic,
        icon: icons[i] || '❖',
        gradient: gradients[i] || gradients[0],
      }))
    : [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Browse Teachers Card */}
      {/* <LinearGradient
        colors={['rgba(34,197,94,0.2)', 'rgba(16,185,129,0.2)']}
        style={styles.teacherCard}
      >
        <View style={styles.teacherCardContent}>
          <View style={styles.teacherCardText}>
            <Text style={styles.teacherCardTitle}>
              {lang === 'hi' ? 'शिक्षक खोजें' : 'Browse Teachers'}
            </Text>
            <Text style={styles.teacherCardSubtitle}>
              {lang === 'hi' ? 'वीडियो लेक्चर देखें' : 'Watch video lectures'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.teacherCardButton}
            onPress={() => {
              // Navigate to find teachers (student feature)
              router.push('/student/find-teachers');
            }}
          >
            <LinearGradient
              colors={['#22C55E', '#10B981']}
              style={styles.teacherCardButtonGradient}
            >
              <Text style={styles.teacherCardButtonText}>
                {lang === 'hi' ? 'खोजें' : 'Browse'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient> */}

      {/* My Teachers Card */}
      <LinearGradient
        colors={['rgba(249,115,22,0.2)', 'rgba(239,68,68,0.2)']}
        style={styles.teacherCard}
      >
        <View style={styles.teacherCardContent}>
          <View style={styles.teacherCardText}>
            <Text style={styles.teacherCardTitle}>
              {lang === 'hi' ? 'मेरे शिक्षक' : 'My Teachers'}
            </Text>
            <Text style={styles.teacherCardSubtitle}>
              {lang === 'hi' ? 'नामांकित शिक्षक' : 'Enrolled teachers'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.teacherCardButton}
            onPress={() => {
              // Navigate to my teachers (student feature)
              router.push('/student/my-teachers');
            }}
          >
            <LinearGradient
              colors={['#F97316', '#EF4444']}
              style={styles.teacherCardButtonGradient}
            >
              <Text style={styles.teacherCardButtonText}>
                {lang === 'hi' ? 'देखें' : 'View'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Math Topics - Horizontal Row */}
      <View style={styles.topicsRow}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={styles.topicItem}
            onPress={() => onTopicClick(f.label)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={f.gradient}
              style={styles.topicIcon}
            >
              <Text style={styles.topicIconText}>{f.icon}</Text>
            </LinearGradient>
            <Text style={styles.topicLabel} numberOfLines={1}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  teacherCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teacherCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherCardText: {
    flex: 1,
  },
  teacherCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  teacherCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  teacherCardButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  teacherCardButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  teacherCardButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  topicsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  topicItem: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  topicIconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  topicLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
