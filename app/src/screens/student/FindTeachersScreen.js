// FindTeachersScreen for React Native
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
import { ArrowLeft, Video, Mail, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import colors from '../../styles/colors';
import { apiLogger } from '../../utils/config';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

const CLASS_OPTIONS = [
  'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'
];

export default function FindTeachersScreen() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('class_6');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [selectedClass]);

  const fetchTeachers = async () => {
    const endpoint = `/teachers/class/${selectedClass}`;
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        apiLogger(endpoint, 'GET', data);
        setTeachers(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to fetch teachers');
        apiLogger(endpoint, 'GET', null, { message: 'Failed to fetch teachers' });
      }
    } catch (error) {
      setError(error.message);
      apiLogger(endpoint, 'GET', null, error);
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderClassButton = (cls) => (
    <TouchableOpacity
      key={cls}
      onPress={() => setSelectedClass(cls)}
      style={[
        styles.classButton,
        selectedClass === cls && styles.classButtonActive
      ]}
    >
      <Text style={[
        styles.classButtonText,
        selectedClass === cls && styles.classButtonTextActive
      ]}>
        {cls.replace('_', ' ').toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const renderTeacher = ({ item }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherHeader}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherAvatarText}>
            {item.name?.charAt(0) || 'T'}
          </Text>
        </View>

        <View style={styles.teacherDetails}>
          <Text style={styles.teacherName}>{item.name}</Text>
          <Text style={styles.teacherUsername}>@{item.username}</Text>

          {item.bio && (
            <Text style={styles.teacherBio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}

          <View style={styles.teacherContact}>
            {item.email && (
              <View style={styles.contactItem}>
                <Mail size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.contactText} numberOfLines={1}>
                  {item.email}
                </Text>
              </View>
            )}
            {item.phone_number && (
              <View style={styles.contactItem}>
                <Phone size={12} color="rgba(255,255,255,0.6)" />
                <Text style={styles.contactText}>{item.phone_number}</Text>
              </View>
            )}
          </View>

          <View style={styles.teacherFooter}>
            <View style={styles.videoCount}>
              <Video size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.videoCountText}>
                {item.video_count || 0} videos
              </Text>
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.push({
                pathname: '/student/teacher-videos',
                params: {
                  teacherId: item.id,
                  teacherName: item.name,
                  classLevel: selectedClass,
                }
              })}
            >
              <Text style={styles.viewButtonText}>View Videos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Teachers</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Class Selection */}
        <View style={styles.classSelectionContainer}>
          <Text style={styles.classSelectionLabel}>Select Your Class</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.classScrollView}
            contentContainerStyle={styles.classScrollContent}
          >
            {CLASS_OPTIONS.map(renderClassButton)}
          </ScrollView>
        </View>

        {/* Error State */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : teachers.length > 0 ? (
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>
              Teachers for {selectedClass.replace('_', ' ').toUpperCase()} ({teachers.length})
            </Text>
            <FlatList
              data={teachers}
              renderItem={renderTeacher}
              keyExtractor={(item) => item.id?.toString()}
              contentContainerStyle={styles.listContent}
            />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎓</Text>
            <Text style={styles.emptyText}>
              No teachers found for {selectedClass.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.emptySubtext}>
              Try selecting a different class or check back later.
            </Text>
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

  // Class Selection
  classSelectionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  classSelectionLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  classScrollView: {
    flexGrow: 0,
  },
  classScrollContent: {
    gap: 8,
  },
  classButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  classButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  classButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  classButtonTextActive: {
    color: '#3B82F6',
  },

  // List
  listContainer: {
    flex: 1,
  },
  listHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  teacherHeader: {
    flexDirection: 'row',
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
  teacherDetails: {
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
  teacherContact: {
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
    flex: 1,
  },
  teacherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoCountText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // States
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
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
  },
});
