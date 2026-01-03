// TeacherVideosScreen for React Native
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, FileText } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import colors from '../../styles/colors';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export default function TeacherVideosScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { teacherId, teacherName, classLevel } = route.params || {};
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/teachers/${teacherId}/videos?class_level=${classLevel}`
      );
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('VideoPlayer', {
        videoId: item.id,
        videoUrl: item.url,
        videoTitle: item.title,
      })}
    >
      <View style={styles.videoThumbnail}>
        {item.type === 'pdf' ? (
          <FileText size={32} color="#FFFFFF" />
        ) : (
          <Play size={32} color="#FFFFFF" />
        )}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.videoMeta}>Class {item.class_level}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{teacherName || 'Teacher'}</Text>
            <Text style={styles.headerSubtitle}>Class {classLevel} Content</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : videos.length > 0 ? (
          <FlatList
            data={videos}
            renderItem={renderVideo}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContent}
            numColumns={2}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📹</Text>
            <Text style={styles.emptyText}>No videos available</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerText: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 8 },
  videoCard: {
    flex: 1,
    margin: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoThumbnail: {
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: { padding: 12 },
  videoTitle: { fontSize: 14, fontWeight: '500', color: '#FFFFFF' },
  videoMeta: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
});
