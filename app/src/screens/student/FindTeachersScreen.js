// FindTeachersScreen for React Native
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
import { ArrowLeft, GraduationCap, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import colors from '../../styles/colors';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export default function FindTeachersScreen() {
  const navigation = useNavigation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/teachers/list`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTeacher = ({ item }) => (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => navigation.navigate('TeacherVideos', {
        teacherId: item.id,
        teacherName: item.name,
        classLevel: item.class_level || '5',
      })}
    >
      <LinearGradient
        colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)']}
        style={styles.teacherCardGradient}
      >
        <View style={styles.teacherIcon}>
          <GraduationCap size={24} color="#FFFFFF" />
        </View>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{item.name}</Text>
          <Text style={styles.teacherSubject}>{item.subject || 'Mathematics'}</Text>
        </View>
        <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Teachers</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        ) : teachers.length > 0 ? (
          <FlatList
            data={teachers}
            renderItem={renderTeacher}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎓</Text>
            <Text style={styles.emptyText}>No teachers available yet</Text>
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  teacherCard: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  teacherCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  teacherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherInfo: { flex: 1, marginLeft: 12 },
  teacherName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  teacherSubject: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
});
