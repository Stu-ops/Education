// Teacher Dashboard Screen
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTeacher } from '../../src/contexts/TeacherContext';
import { LogOut, UserPlus, Trash2, Upload, Users, X } from 'lucide-react-native';

export default function TeacherDashboardScreen() {
  const { teacher, students, loading, logout, addStudent, removeStudent } = useTeacher();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ username: '', class: '' });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/teacher/login');
  };

  const handleAddStudent = async () => {
    if (!newStudent.username) {
      setAddError('Please enter student username');
      return;
    }

    setIsAdding(true);
    setAddError('');

    const result = await addStudent(newStudent);
    setIsAdding(false);

    if (!result.success) {
      setAddError(result.error || 'Failed to add student');
    } else {
      setShowAddModal(false);
      setNewStudent({ username: '', class: '' });
    }
  };

  const handleRemoveStudent = async (username) => {
    await removeStudent(username);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name || item.username}</Text>
        <Text style={styles.studentClass}>Class {item.class_level || 'N/A'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveStudent(item.username)}
      >
        <Trash2 size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>👨‍🏫 Teacher Dashboard</Text>
              <Text style={styles.teacherName}>{teacher?.name || 'Teacher'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <LinearGradient colors={['rgba(16,185,129,0.3)', 'rgba(5,150,105,0.3)']} style={styles.statCard}>
              <Users size={24} color="#10B981" />
              <Text style={styles.statValue}>{students.length}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </LinearGradient>

            <LinearGradient colors={['rgba(59,130,246,0.3)', 'rgba(37,99,235,0.3)']} style={styles.statCard}>
              <Upload size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{teacher?.videos?.length || 0}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </LinearGradient>
          </View>

          {/* Students List */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📚 My Students</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <UserPlus size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {students.length > 0 ? (
              <FlatList
                data={students}
                renderItem={renderStudent}
                keyExtractor={(item) => item.username || item.id?.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>No students yet</Text>
                <Text style={styles.emptySubtext}>Add students to get started</Text>
              </View>
            )}
          </View>

          {/* Upload Button */}
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={() => router.push('/teacher/upload')}
          >
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.uploadButtonGradient}>
              <Upload size={20} color="#FFF" />
              <Text style={styles.uploadButtonText}>Upload Content</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Student Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Student</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Student Username"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newStudent.username}
                onChangeText={(v) => setNewStudent(prev => ({ ...prev, username: v }))}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Class (e.g., 5)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newStudent.class}
                onChangeText={(v) => setNewStudent(prev => ({ ...prev, class: v }))}
                keyboardType="numeric"
              />

              {addError ? (
                <Text style={styles.modalError}>⚠️ {addError}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.modalButton, isAdding && styles.buttonDisabled]}
                onPress={handleAddStudent}
                disabled={isAdding}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.modalButtonGradient}>
                  <Text style={styles.modalButtonText}>
                    {isAdding ? 'Adding...' : 'Add Student'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFF', marginTop: 16, fontSize: 16 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  teacherName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  logoutButton: { padding: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addButtonText: { color: '#FFF', fontWeight: '500' },
  studentCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 8 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '500', color: '#FFF' },
  studentClass: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  removeButton: { padding: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '500', color: '#FFF' },
  emptySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  uploadButton: { borderRadius: 12, overflow: 'hidden' },
  uploadButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  uploadButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#065F46', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 16, marginBottom: 16 },
  modalError: { color: '#F87171', marginBottom: 16, textAlign: 'center' },
  modalButton: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  modalButtonGradient: { padding: 14, alignItems: 'center' },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
