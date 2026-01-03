// TeacherUploadScreen for React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, Video, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useTeacher } from '../../contexts/TeacherContext';

export default function TeacherUploadScreen() {
  const navigation = useNavigation();
  const { uploadContent } = useTeacher();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'application/pdf'],
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!title || !classLevel || !selectedFile) {
      Alert.alert('Error', 'Please fill all required fields and select a file');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('class_level', classLevel);
    formData.append('file', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType,
    });

    const result = await uploadContent(formData);
    setIsUploading(false);

    if (result.success) {
      Alert.alert('Success', 'Content uploaded successfully!');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error || 'Upload failed');
    }
  };

  return (
    <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Content</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={styles.input}
            placeholder="Class Level (e.g., 5) *"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={classLevel}
            onChangeText={setClassLevel}
            keyboardType="numeric"
          />

          {/* File Picker */}
          <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
            <View style={styles.filePickerContent}>
              {selectedFile ? (
                <>
                  {selectedFile.mimeType?.includes('video') ? (
                    <Video size={24} color="#FFFFFF" />
                  ) : (
                    <FileText size={24} color="#FFFFFF" />
                  )}
                  <Text style={styles.fileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </>
              ) : (
                <>
                  <Upload size={24} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.filePickerText}>
                    Tap to select video or PDF
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.buttonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.uploadButtonGradient}>
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Upload size={20} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Upload Content</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  content: { padding: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  filePicker: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    padding: 24,
    marginBottom: 24,
  },
  filePickerContent: {
    alignItems: 'center',
    gap: 8,
  },
  filePickerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  fileName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: { opacity: 0.7 },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
