// Teacher Upload Screen
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useTeacher } from '../../src/contexts/TeacherContext';
import { ArrowLeft, Upload, FileVideo, X, Check } from 'lucide-react-native';

export default function TeacherUploadScreen() {
  const { uploadContent } = useTeacher();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      setError('Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!title || !selectedFile) {
      setError('Please fill title and select a file');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('class_level', classLevel);
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'video/mp4',
      });

      const result = await uploadContent(formData);

      if (!result.success) {
        setError(result.error || 'Upload failed');
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.back();
        }, 2000);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Upload Content</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Upload Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Video Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter video title"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter video description"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Class Level</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowClassPicker(true)}
            >
              <Text style={classLevel ? styles.inputText : styles.placeholder}>
                {classLevel ? `Class ${classLevel}` : 'Select class level'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Video File *</Text>
            <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
              <LinearGradient 
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} 
                style={styles.fileButtonGradient}
              >
                {selectedFile ? (
                  <>
                    <FileVideo size={24} color="#10B981" />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {selectedFile.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <X size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Upload size={24} color="#FFF" />
                    <Text style={styles.fileButtonText}>Select Video File</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.uploadButtonGradient}>
                {isUploading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Upload size={20} color="#FFF" />
                    <Text style={styles.uploadButtonText}>Upload Video</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Class Picker Modal */}
        <Modal visible={showClassPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Class</Text>
              <ScrollView style={styles.modalScroll}>
                {classOptions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.modalItem}
                    onPress={() => { setClassLevel(c); setShowClassPicker(false); }}
                  >
                    <Text style={styles.modalItemText}>Class {c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.successOverlay}>
            <View style={styles.successContent}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.successIcon}>
                <Check size={40} color="#FFF" />
              </LinearGradient>
              <Text style={styles.successText}>Upload Successful!</Text>
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
  scrollContent: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  form: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#FFF', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 16, marginBottom: 16, justifyContent: 'center' },
  inputText: { color: '#FFF', fontSize: 16 },
  placeholder: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  fileButton: { marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  fileButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed', borderRadius: 12 },
  fileButtonText: { color: '#FFF', fontSize: 16 },
  fileName: { flex: 1, color: '#FFF', fontSize: 14 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#F87171', textAlign: 'center' },
  uploadButton: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  uploadButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  uploadButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#065F46', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 16 },
  modalScroll: { maxHeight: 300 },
  modalItem: { padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8 },
  modalItemText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
  modalCancel: { color: '#A7F3D0', textAlign: 'center', marginTop: 16, fontSize: 16 },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  successContent: { alignItems: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successText: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
});
