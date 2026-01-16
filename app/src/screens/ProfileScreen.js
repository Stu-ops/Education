// ProfileScreen adapted from web app for React Native
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Edit, Save, Upload, X, Star, GraduationCap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

export default function ProfileScreen() {
  const { user, loading, logout, updateUser } = useUser();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (user) {
      // Map backend field names to form field names
      setForm({
        ...user,
        classLevel: user.class_level || user.classLevel,
      });
    }
  }, [user]);

  // Animated counter effect
  useEffect(() => {
    if (!user || hasAnimated.current) return;
    
    const targetPoints = user.points || 250;
    const targetLevel = user.level || 1;
    const duration = 1500;
    const steps = 60;
    const pointsIncrement = targetPoints / steps;
    const levelIncrement = targetLevel / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimatedPoints(Math.min(Math.round(pointsIncrement * currentStep), targetPoints));
      setAnimatedLevel(Math.min(Math.round(levelIncrement * currentStep), targetLevel));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        hasAnimated.current = true;
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [user]);

  if (loading) {
    return (
      <LinearGradient colors={colors.gradients.main} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={colors.gradients.main} style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please log in to view profile</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setForm(prev => ({ 
        ...prev, 
        avatar: `data:image/jpeg;base64,${asset.base64}` 
      }));
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, avatar: null }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare the update payload with proper field mapping
      // Convert "Class 5" format to "class_5" for backend
      let classLevelForBackend = form.classLevel;
      if (classLevelForBackend) {
        // Handle formats like "Class 5", "class 5", "5"
        const match = classLevelForBackend.match(/\d+/);
        if (match) {
          classLevelForBackend = `class_${match[0]}`;
        }
      }
      
      const updatePayload = {
        name: form.name,
        email: form.email,
        age: form.age,
        school: form.school,
        level: form.level,
        class_level: classLevelForBackend,
        avatar: form.avatar,
      };
      
      console.log('Saving profile with payload:', updatePayload);
      
      const updated = await updateUser(updatePayload);
      if (updated) {
        setEditing(false);
        hasAnimated.current = false;
        // Update form with the returned data
        setForm({
          ...updated,
          classLevel: updated.class_level || updated.classLevel,
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const classOptions = ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'];

  const formatClassDisplay = (classLevel) => {
    if (!classLevel) return 'Select class';
    // Convert class_5 to "Class 5" for display
    const match = classLevel.match(/class_?(\d+)/i);
    if (match) return `Class ${match[1]}`;
    return classLevel;
  };

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              style={styles.avatarBorder}
            >
              <Image
                source={{ uri: form?.avatar || 'https://i.pravatar.cc/150' }}
                style={styles.avatar}
              />
            </LinearGradient>
            
            {editing && form?.avatar && (
              <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                <X size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {editing && (
              <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.uploadButtonGradient}
                >
                  <Upload size={18} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Upload Photo</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <Text style={styles.userName}>{form?.name || user?.name}</Text>
            
            {!editing ? (
              <Text style={styles.userInfo}>
                {form?.classLevel || user?.class_level || user?.classLevel} · Level {form?.level || user?.level}
              </Text>
            ) : (
              <View style={styles.editForm}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Name:</Text>
                  <TextInput
                    style={styles.input}
                    value={form?.name || ''}
                    onChangeText={(v) => handleChange('name', v)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    placeholder="Enter your name"
                  />
                </View>

                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowClassPicker(true)}
                >
                  <Text style={styles.inputLabel}>Class:</Text>
                  <View style={styles.inputValue}>
                    <Text style={styles.inputValueText}>{formatClassDisplay(form?.classLevel)}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Level:</Text>
                  <TextInput
                    style={styles.input}
                    value={String(form?.level || '')}
                    onChangeText={(v) => handleChange('level', parseInt(v) || 0)}
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email:</Text>
                  <TextInput
                    style={styles.input}
                    value={form?.email || ''}
                    onChangeText={(v) => handleChange('email', v)}
                    keyboardType="email-address"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Age:</Text>
                  <TextInput
                    style={styles.input}
                    value={String(form?.age || '')}
                    onChangeText={(v) => handleChange('age', parseInt(v) || null)}
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>School:</Text>
                  <TextInput
                    style={styles.input}
                    value={form?.school || ''}
                    onChangeText={(v) => handleChange('school', v)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Progress Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Star size={20} color="#EAB308" />
              <Text style={styles.statsTitle}>Progress</Text>
            </View>
            <View style={styles.statsGrid}>
              <LinearGradient
                colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)']}
                style={styles.statItem}
              >
                <Text style={styles.statValue}>{animatedPoints}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </LinearGradient>
              <LinearGradient
                colors={['rgba(59,130,246,0.2)', 'rgba(6,182,212,0.2)']}
                style={styles.statItem}
              >
                <Text style={styles.statValue}>{animatedLevel}</Text>
                <Text style={styles.statLabel}>Level</Text>
              </LinearGradient>
            </View>
            <LinearGradient
              colors={['rgba(234,179,8,0.2)', 'rgba(249,115,22,0.2)']}
              style={styles.ratingContainer}
            >
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <Star
                    key={starNum}
                    size={24}
                    color={starNum <= (user?.rating || 3) ? '#EAB308' : '#6B7280'}
                    fill={starNum <= (user?.rating || 3) ? '#EAB308' : 'transparent'}
                  />
                ))}
              </View>
              <Text style={styles.ratingLabel}>Achievement Rating</Text>
            </LinearGradient>
          </View>

          {/* Teacher Portal Link */}
          <LinearGradient
            colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)']}
            style={styles.teacherCard}
          >
            <View style={styles.teacherCardContent}>
              <LinearGradient
                colors={['#A855F7', '#EC4899']}
                style={styles.teacherIcon}
              >
                <GraduationCap size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.teacherCardText}>
                <Text style={styles.teacherCardTitle}>Teaching Hub</Text>
                <Text style={styles.teacherCardSubtitle}>Share knowledge & inspire</Text>
              </View>
              <TouchableOpacity
                style={styles.teacherCardButton}
                onPress={() => navigation.navigate('Teacher')}
              >
                <LinearGradient
                  colors={['#A855F7', '#EC4899']}
                  style={styles.teacherCardButtonGradient}
                >
                  <Text style={styles.teacherCardButtonText}>Access</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!editing ? (
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => {
                  console.log('Edit Profile pressed');
                  setEditing(true);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.actionButtonGradient}
                  pointerEvents="none"
                >
                  <Edit size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, saving && styles.buttonDisabled]}
                onPress={() => {
                  console.log('Save Changes pressed');
                  handleSave();
                }}
                disabled={saving}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={styles.actionButtonGradient}
                  pointerEvents="none"
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Save size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.actionButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.actionButtonGradient}
                pointerEvents="none"
              >
                <LogOut size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Class Picker Modal */}
        <Modal
          visible={showClassPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowClassPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <ScrollView style={styles.pickerScroll}>
                {classOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.pickerItem,
                      form?.classLevel === c && styles.pickerItemSelected,
                    ]}
                    onPress={() => {
                      handleChange('classLevel', c);
                      setShowClassPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        form?.classLevel === c && styles.pickerItemTextSelected,
                      ]}
                    >
                      {formatClassDisplay(c)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowClassPicker(false)}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarBorder: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: '#374151',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    padding: 8,
  },
  uploadButton: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  editForm: {
    width: '100%',
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#1F2937',
    fontSize: 16,
  },
  inputValue: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputValueText: {
    color: '#1F2937',
    fontSize: 16,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  ratingContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  teacherCard: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
  },
  teacherCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherCardText: {
    flex: 1,
    marginLeft: 12,
  },
  teacherCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  teacherCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
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
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pickerItemSelected: {
    backgroundColor: '#3B82F6',
  },
  pickerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#67E8F9',
    fontSize: 16,
  },
});
