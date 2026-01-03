// FeatureGrid component adapted from web app for React Native
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { getTopics } from '../utils/exploreApi';
import colors from '../styles/colors';

export default function FeatureGrid({ onTopicClick }) {
  const { lang } = useLanguage();
  const navigation = useNavigation();
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
      <LinearGradient
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
            onPress={() => navigation.navigate('FindTeachers')}
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
      </LinearGradient>

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
            onPress={() => navigation.navigate('MyTeachers')}
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

      {/* Math Topics Grid */}
      <View style={styles.grid}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={styles.gridItem}
            onPress={() => onTopicClick(f.label)}
            activeOpacity={0.8}
          >
            <View style={styles.gridItemContent}>
              <LinearGradient
                colors={f.gradient}
                style={styles.iconContainer}
              >
                <Text style={styles.icon}>{f.icon}</Text>
              </LinearGradient>
              <Text style={styles.label}>{f.label}</Text>
            </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
  },
  gridItemContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
  },
});
