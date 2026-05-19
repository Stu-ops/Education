import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, FileText } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import colors from '../../styles/colors';
import { apiLogger } from '../../utils/config';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export default function TeacherVideosScreen() {
  const { teacherId, teacherName, classLevel } = useLocalSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (teacherId && classLevel) fetchVideos();
  }, [teacherId, classLevel]);

  const fetchVideos = async () => {
    const endpoint = `/teachers/by-teacher/${teacherId}/class/${classLevel}`;
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        apiLogger(endpoint, 'GET', data);
        // Filter out flagged videos
        const visible = (data.videos || []).filter(v => !v.is_flagged);
        setVideos(visible);
      } else {
        setError('Failed to load videos');
        apiLogger(endpoint, 'GET', null, { message: 'Failed' });
      }
    } catch (e) {
      setError(e.message);
      apiLogger(endpoint, 'GET', null, e);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => router.push({
        pathname: '/student/video-player',
        params: {
          videoId: item.id,
          videoUrl: item.file_path,
          videoTitle: item.title,
        },
      })}
    >
      <View style={styles.videoThumb}>
        {item.file_path?.includes('.pdf') || item.subject === 'document'
          ? <FileText size={28} color="#FFF" />
          : <Play size={28} color="#FFF" />}
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.videoMeta}>
          {item.subject || 'General'} · {item.view_count || 0} views
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {teacherName || 'Teacher'}
            </Text>
            <Text style={styles.headerSub}>
              {classLevel?.replace('_', ' ').toUpperCase()} Content
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : videos.length > 0 ? (
          <FlatList
            data={videos}
            renderItem={renderVideo}
            keyExtractor={item => item.id?.toString()}
            contentContainerStyle={styles.list}
            numColumns={2}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>📹</Text>
            <Text style={styles.emptyText}>No videos available yet</Text>
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
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 8,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 8,
    padding: 12, marginHorizontal: 16, marginBottom: 8,
  },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.7)' },
  list: { padding: 8, paddingBottom: 24 },
  videoCard: {
    flex: 1, margin: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, overflow: 'hidden',
  },
  videoThumb: {
    height: 90, backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  videoInfo: { padding: 10 },
  videoTitle: { fontSize: 13, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  videoMeta: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
});
