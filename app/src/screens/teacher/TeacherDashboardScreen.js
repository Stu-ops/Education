// TeacherDashboardScreen for React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Plus, Upload, Trash2, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTeacher } from '../../contexts/TeacherContext';

export default function TeacherDashboardScreen() {
  const navigation = useNavigation();
  const { teacher, students, logout, addStudent, removeStudent } = useTeacher();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ username: '', class: '' });
  const [isAdding, setIsAdding] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleAddStudent = async () => {
    if (!newStudent.username || !newStudent.class) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsAdding(true);
    const result = await addStudent(newStudent);
    setIsAdding(false);

    if (result.success) {
      setShowAddModal(false);
      setNewStudent({ username: '', class: '' });
    } else {
      Alert.alert('Error', result.error || 'Failed to add student');
    }
  };

  const handleRemoveStudent = async (username) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${username}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeStudent(username);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to remove student');
            }
          },
        },
      ]
    );
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.username || item.name}</Text>
        <Text style={styles.studentClass}>Class {item.class_level || item.class}</Text>
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
    <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Teacher Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {teacher?.name || 'Teacher'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowAddModal(true)}
            >
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.actionGradient}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Add Student</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TeacherUpload')}
            >
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionGradient}>
                <Upload size={20} color="#FFFFFF" />
                <Text style={styles.actionText}>Upload Content</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Students List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Students ({students.length})</Text>
            {students.length > 0 ? (
              <FlatList
                data={students}
                renderItem={renderStudent}
                keyExtractor={(item) => item.username || item.id?.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No students added yet</Text>
                <Text style={styles.emptySubtext}>Tap "Add Student" to get started</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Student Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Student</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color="#FFFFFF" />
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
                placeholder="Class Level (e.g., 5)"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={newStudent.class}
                onChangeText={(v) => setNewStudent(prev => ({ ...prev, class: v }))}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.modalButton, isAdding && styles.buttonDisabled]}
                onPress={handleAddStudent}
                disabled={isAdding}
              >
                <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.modalButtonGradient}>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  section: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 16 },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '500', color: '#FFFFFF' },
  studentClass: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  removeButton: { padding: 8 },
  emptyContainer: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  emptySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1B4B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  modalButton: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  modalButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
