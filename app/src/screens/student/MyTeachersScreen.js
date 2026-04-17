// MyTeachersScreen for React Native
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Video, Calendar, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { useUser } from '../../contexts/UserContext';
import colors from '../../styles/colors';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export default function MyTeachersScreen() {
  const { user } = useUser();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.username) {
      fetchMyTeachers();
    }
  }, [user]);

  const fetchMyTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${BACKEND_URL}/teachers/my-teachers?student_username=${user.username}`
      );
      if (response.ok) {
        const data = await response.json();
        setTeachers(data || []);
      } else if (response.status === 404) {
        setTeachers([]);
      } else {
        setError('Failed to fetch teachers');
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching my teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = (video) => (
    <View key={video.id} style={styles.videoPreview}>
      <Text style={styles.videoTitle} numberOfLines={1}>
        {video.title}
      </Text>
      <Text style={styles.videoDescription} numberOfLines={2}>
        {video.description || 'No description'}
      </Text>
      <View style={styles.videoMeta}>
        <Text style={styles.videoMetaText}>{video.subject || 'General'}</Text>
        <Text style={styles.videoMetaText}>{video.view_count || 0} views</Text>
      </View>
    </View>
  );

  const renderTeacher = ({ item: teacherData }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherHeader}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherAvatarText}>
            {teacherData.teacher.name?.charAt(0) || 'T'}
          </Text>
        </View>
        
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacherData.teacher.name}</Text>
          <Text style={styles.teacherUsername}>@{teacherData.teacher.username}</Text>
          
          {teacherData.teacher.bio && (
            <Text style={styles.teacherBio} numberOfLines={2}>
              {teacherData.teacher.bio}
            </Text>
          )}
          
          <View style={styles.teacherMeta}>
            <View style={styles.metaItem}>
              <Calendar size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.metaText}>
                Enrolled: {new Date(teacherData.enrolled_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <BookOpen size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.metaText}>
                Class: {teacherData.class_level.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Video size={12} color="rgba(255,255,255,0.6)" />
              <Text style={styles.metaText}>
                {teacherData.video_count || 0} videos available
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.viewContentButton}
        onPress={() => router.push({
          pathname: '/student/teacher-videos',
          params: {
            teacherId: teacherData.teacher.id,
            teacherName: teacherData.teacher.name,
            classLevel: teacherData.class_level,
          }
        })}
      >
        <Text style={styles.viewContentButtonText}>View Content</Text>
      </TouchableOpacity>
      
      {/* Recent Videos Preview */}
      {teacherData.videos && teacherData.videos.length > 0 && (
        <View style={styles.videosSection}>
          <Text style={styles.videosSectionTitle}>Recent Videos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teacherData.videos.slice(0, 3).map(renderVideo)}
          </ScrollView>
          {teacherData.videos.length > 3 && (
            <Text style={styles.moreVideosText}>
              +{teacherData.videos.length - 3} more videos available
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <LinearGradient colors={colors.gradients.main} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>Please login to view your teachers.</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Teachers</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Error State */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : teachers.length > 0 ? (
          <View style={styles.listContainer}>
            <View style={styles.listHeaderContainer}>
              <Text style={styles.listHeaderTitle}>
                Teachers you're enrolled with ({teachers.length})
              </Text>
              <Text style={styles.listHeaderSubtitle}>
                These teachers have added you to their student list and you can access their content.
              </Text>
            </View>
            <FlatList
              data={teachers}
              renderItem={renderTeacher}
              keyExtractor={(item) => item.teacher.id?.toString()}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>No teachers yet</Text>
            <Text style={styles.emptyText}>
              You haven't been enrolled by any teachers yet.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/student/find-teachers')}
            >
              <LinearGradient
                colors={['#22C55E', '#16A34A']}
                style={styles.browseButtonGradient}
              >
                <Text style={styles.browseButtonText}>Browse All Teachers</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  
  // List
  listContainer: {
    flex: 1,
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  listHeaderSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  listContent: { 
    padding: 16,
    paddingTop: 0,
  },
  
  // Teacher Card
  teacherCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teacherHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  teacherAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teacherAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  teacherUsername: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  teacherBio: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  teacherMeta: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
  },
  viewContentButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  viewContentButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Videos Section
  videosSection: {
    marginTop: 4,
  },
  videosSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  videoPreview: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginBottom: 8,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  videoMetaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  moreVideosText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 8,
  },
  
  // States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.5)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  emptyEmoji: { 
    fontSize: 60, 
    marginBottom: 16 
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  emptyText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.7)', 
    marginBottom: 24,
    textAlign: 'center',
  },
  browseButton: { 
    borderRadius: 12, 
    overflow: 'hidden' 
  },
  browseButtonGradient: { 
    paddingVertical: 14, 
    paddingHorizontal: 24 
  },
  browseButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});
