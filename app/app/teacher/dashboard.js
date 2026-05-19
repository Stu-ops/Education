import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Modal, ActivityIndicator,
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
    if (!newStudent.username) { setAddError('Please enter student username'); return; }
    setIsAdding(true);
    setAddError('');
    const result = await addStudent(newStudent);
    setIsAdding(false);
    if (!result.success) setAddError(result.error || 'Failed to add student');
    else { setShowAddModal(false); setNewStudent({ username: '', class: '' }); }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>
          {(item.name || item.username || '?')[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName} numberOfLines={1}>{item.name || item.username}</Text>
        <Text style={styles.studentClass}>Class {item.class_level || 'N/A'}</Text>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => removeStudent(item.username)}>
        <Trash2 size={16} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>Teacher Dashboard</Text>
              <Text style={styles.subText} numberOfLines={1}>
                {teacher?.name || 'Teacher'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={22} color="#6EE7B7" />
              <Text style={styles.statValue}>{students.length}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Upload size={22} color="#93C5FD" />
              <Text style={styles.statValue}>{teacher?.videos?.length || 0}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>

          {/* Students Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Students</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
                <UserPlus size={16} color="#FFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {students.length > 0 ? (
              <FlatList
                data={students}
                renderItem={renderStudent}
                keyExtractor={item => item.username || item.id?.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>�</Text>
                <Text style={styles.emptyText}>No students yet</Text>
                <Text style={styles.emptySubtext}>Add students to get started</Text>
              </View>
            )}
          </View>

          {/* Upload Button */}
          <TouchableOpacity style={styles.uploadBtn} onPress={() => router.push('/teacher/upload')}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.uploadBtnGrad}>
              <Upload size={18} color="#FFF" />
              <Text style={styles.uploadBtnText}>Upload Content</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Student Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Student</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Student Username"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={newStudent.username}
                onChangeText={v => setNewStudent(p => ({ ...p, username: v }))}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Class (e.g. 5)"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={newStudent.class}
                onChangeText={v => setNewStudent(p => ({ ...p, class: v }))}
                keyboardType="numeric"
              />
              {addError ? <Text style={styles.modalError}>⚠️ {addError}</Text> : null}
              <TouchableOpacity
                style={[styles.modalBtn, isAdding && styles.btnDisabled]}
                onPress={handleAddStudent}
                disabled={isAdding}
              >
                <LinearGradient colors={['#10B981', '#059669']} style={styles.modalBtnGrad}>
                  <Text style={styles.modalBtnText}>{isAdding ? 'Adding...' : 'Add Student'}</Text>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFF', marginTop: 12, fontSize: 15 },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  headerText: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  subText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  logoutBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, padding: 14, marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#FFF' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: '500' },
  studentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, padding: 10, marginBottom: 8, gap: 10,
  },
  studentAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  studentAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: '500', color: '#FFF' },
  studentClass: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  removeBtn: { padding: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 20 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '500', color: '#FFF' },
  emptySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  uploadBtn: { borderRadius: 12, overflow: 'hidden' },
  uploadBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 14, gap: 8,
  },
  uploadBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#065F46',
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12,
    padding: 13, color: '#FFF', fontSize: 15, marginBottom: 14,
  },
  modalError: { color: '#F87171', marginBottom: 14, textAlign: 'center', fontSize: 13 },
  modalBtn: { borderRadius: 12, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  modalBtnGrad: { padding: 14, alignItems: 'center' },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
