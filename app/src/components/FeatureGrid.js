// FeatureGrid component adapted from web app for React Native
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { getTopics, getTopicsBySubject } from '../utils/exploreApi';
import colors from '../styles/colors';

// Subject → emoji icon mapping for topic pills
const SUBJECT_ICONS = {
  Mathematics: ['📐', '➕', '➖', '✖️', '➗', '📊'],
  Science: ['🔬', '⚗️', '🧬', '🌿', '⚡', '🔭'],
  Physics: ['⚡', '🔭', '🌊', '💡', '🧲', '🚀'],
  Chemistry: ['⚗️', '🧪', '🔥', '💧', '🧬', '⚛️'],
  Biology: ['🌿', '🧬', '🦠', '🫀', '🌱', '🔬'],
  English: ['📖', '✏️', '📝', '🗣️', '📚', '🔤'],
  History: ['🏛️', '📜', '⚔️', '🗺️', '👑', '🏺'],
  Geography: ['🌍', '🗺️', '🏔️', '🌊', '🌦️', '🧭'],
  General: ['123', '+', '−', '⬤'],
};

const BADGE_COLORS = [
  colors.accent.pink,
  colors.accent.blue,
  colors.accent.green,
  colors.accent.orange,
  '#8B5CF6',
  '#F59E0B',
];

export default function FeatureGrid({ onTopicClick, selectedSubject = 'General' }) {
  const { lang } = useLanguage();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [selectedSubject]);  // re-fetch whenever subject changes

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      let data;
      if (selectedSubject && selectedSubject !== 'General') {
        data = await getTopicsBySubject(selectedSubject);
      } else {
        data = await getTopics();
      }
      setTopics(data || []);
    } catch (err) {
      console.error('Error fetching topics:', err);
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  };

  const icons = SUBJECT_ICONS[selectedSubject] || SUBJECT_ICONS.General;

  const features = topics.map((topic, i) => ({
    label: topic,
    icon: icons[i % icons.length],
    color: BADGE_COLORS[i % BADGE_COLORS.length],
  }));

  if (isLoading && topics.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{lang === 'hi' ? 'शिक्षक खोजें' : 'Browse Teachers'}</Text>
          <Text style={styles.cardSubtitle}>{lang === 'hi' ? 'वीडियो लेक्चर देखें और सीखें' : 'Watch video lectures and learn'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: colors.accent.green }]}
          onPress={() => router.push('/student/find-teachers')}
        >
          <Text style={styles.cardButtonText}>{lang === 'hi' ? 'खोजें' : 'Browse'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{lang === 'hi' ? 'मेरे शिक्षक' : 'My Teachers'}</Text>
          <Text style={styles.cardSubtitle}>{lang === 'hi' ? 'आपके नामांकित शिक्षकों की सामग्री देखें' : 'Access content from your enrolled teachers'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.cardButton, { backgroundColor: colors.accent.orange }]}
          onPress={() => router.push('/student/my-teachers')}
        >
          <Text style={styles.cardButtonText}>{lang === 'hi' ? 'देखें' : 'View'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topicsHeader}>
        <Text style={styles.topicsTitle}>
          {selectedSubject === 'General'
            ? (lang === 'hi' ? 'विषय' : 'Topics')
            : selectedSubject}
        </Text>
        {isLoading && <ActivityIndicator size="small" color={colors.accent.orange} style={{ marginLeft: 8 }} />}
      </View>
      <View style={styles.topicsRow}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={styles.topicItem}
            onPress={() => onTopicClick(f.label)}
            activeOpacity={0.8}
          >
            <View style={[styles.topicIcon, { backgroundColor: f.color }]}>
              <Text style={styles.topicIconText}>{f.icon}</Text>
            </View>
            <Text style={styles.topicLabel} numberOfLines={2}>{f.label}</Text>
          </TouchableOpacity>
        ))}
        {!isLoading && features.length === 0 && (
          <Text style={styles.emptyText}>No topics found</Text>
        )}
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
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary.border,
    backgroundColor: colors.primary.creamLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  cardButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  cardButtonText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 8,
  },
  topicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  topicsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicItem: {
    width: '22%',
    flexGrow: 1,
    backgroundColor: colors.primary.creamLight,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  topicIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  topicIconText: {
    fontSize: 15,
    color: colors.text.white,
  },
  topicLabel: {
    fontSize: 10,
    color: colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.text.muted,
    padding: 8,
  },
});
