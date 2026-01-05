// Teacher Upload Screen - Enhanced with comprehensive file upload
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useTeacher } from '../../src/contexts/TeacherContext';
import { ArrowLeft, Upload, Video, FileText, Image, Plus, X } from 'lucide-react-native';

export default function TeacherUploadScreen() {
  const { uploadContent, uploadMultipleFiles, getUploadInfo } = useTeacher();
  
  const [activeTab, setActiveTab] = useState('video');
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'multiple'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_level: 'class_6',
    subject: '',
    file: null,
    files: [], // for multiple uploads
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadInfo, setUploadInfo] = useState(null);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const classOptions = [
    'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'
  ];

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 
    'Hindi', 'Social Studies', 'Computer Science', 'Geography', 'History'
  ];

  const tabs = [
    { id: 'video', label: 'Video', icon: Video },
    { id: 'document', label: 'Document', icon: FileText },
    { id: 'image', label: 'Image', icon: Image },
  ];

  useEffect(() => {
    fetchUploadInfo();
  }, []);

  const fetchUploadInfo = async () => {
    const result = await getUploadInfo();
    if (result.success) {
      setUploadInfo(result.data);
    }
  };

  const getAcceptedTypes = (type) => {
    if (!uploadInfo) {
      switch (type) {
        case 'video': return ['video/*'];
        case 'document': return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        case 'image': return ['image/*'];
        default: return ['*/*'];
      }
    }
    
    const typeInfo = uploadInfo.supported_types[type];
    return typeInfo ? typeInfo.mime_types : ['*/*'];
  };

  const getMaxSize = (type) => {
    if (!uploadInfo) {
      switch (type) {
        case 'video': return '500MB';
        case 'document': return '50MB';
        case 'image': return '10MB';
        default: return '500MB';
      }
    }
    
    const typeInfo = uploadInfo.supported_types[type];
    return typeInfo ? `${typeInfo.max_size_mb}MB` : '500MB';
  };

  const handlePickFile = async () => {
    try {
      let result;
      
      if (activeTab === 'image') {
        // For images, give option to pick from gallery or camera
        Alert.alert(
          'Select Image',
          'Choose an option',
          [
            { text: 'Camera', onPress: () => pickImageFromCamera() },
            { text: 'Gallery', onPress: () => pickImageFromGallery() },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      } else {
        // For videos and documents, use document picker
        result = await DocumentPicker.getDocumentAsync({
          type: getAcceptedTypes(activeTab),
          copyToCacheDirectory: true,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (uploadMode === 'single') {
          setFormData(prev => ({ ...prev, file: asset }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            files: [...prev.files, asset] 
          }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const pickImageFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = {
        ...result.assets[0],
        name: `camera_image_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
      };
      
      if (uploadMode === 'single') {
        setFormData(prev => ({ ...prev, file: asset }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          files: [...prev.files, asset] 
        }));
      }
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = {
        ...result.assets[0],
        name: result.assets[0].fileName || `gallery_image_${Date.now()}.jpg`,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
      };
      
      if (uploadMode === 'single') {
        setFormData(prev => ({ ...prev, file: asset }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          files: [...prev.files, asset] 
        }));
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, files: newFiles }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.class_level) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (uploadMode === 'single' && !formData.file) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (uploadMode === 'multiple' && formData.files.length === 0) {
      Alert.alert('Error', 'Please select at least one file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('class_level', formData.class_level);
      uploadFormData.append('subject', formData.subject);

      let result;
      
      if (uploadMode === 'single') {
        uploadFormData.append('file', {
          uri: formData.file.uri,
          name: formData.file.name,
          type: formData.file.mimeType,
        });
        result = await uploadContent(uploadFormData);
      } else {
        formData.files.forEach(file => {
          uploadFormData.append('files', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          });
        });
        result = await uploadMultipleFiles(uploadFormData);
      }
      
      if (result.success) {
        if (uploadMode === 'single') {
          setSuccess(`Content "${formData.title}" uploaded successfully!`);
        } else {
          const { success_count, error_count } = result.data;
          setSuccess(`Upload completed! ${success_count} files uploaded successfully${error_count > 0 ? `, ${error_count} failed` : ''}.`);
        }
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          class_level: 'class_6',
          subject: '',
          file: null,
          files: [],
        });

        // Navigate back after showing success
        setTimeout(() => {
          router.back();
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={24} color="#60A5FA" />;
      case 'document': return <FileText size={24} color="#34D399" />;
      case 'image': return <Image size={24} color="#A78BFA" />;
      default: return <Upload size={24} color="#9CA3AF" />;
    }
  };

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Content</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Content Type Tabs */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tab,
                  activeTab === tab.id && styles.activeTab,
                ]}
              >
                <tab.icon size={16} color={activeTab === tab.id ? '#FFFFFF' : 'rgba(255,255,255,0.7)'} />
                <Text style={[
                  styles.tabText,
                  activeTab === tab.id && styles.activeTabText,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upload Mode Toggle */}
          <View style={styles.modeContainer}>
            <TouchableOpacity
              onPress={() => setUploadMode('single')}
              style={[
                styles.modeButton,
                uploadMode === 'single' && styles.activeModeButton,
              ]}
            >
              <Text style={[
                styles.modeText,
                uploadMode === 'single' && styles.activeModeText,
              ]}>
                Single File
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setUploadMode('multiple')}
              style={[
                styles.modeButton,
                uploadMode === 'multiple' && styles.activeModeButton,
              ]}
            >
              <Text style={[
                styles.modeText,
                uploadMode === 'multiple' && styles.activeModeText,
              ]}>
                Multiple Files
              </Text>
            </TouchableOpacity>
          </View>

          {/* Upload Form */}
          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>✅ {success}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder={`e.g., ${activeTab === 'video' ? 'Algebra Basics Tutorial' : activeTab === 'document' ? 'Mathematics Formula Sheet' : 'Geometry Diagrams'}`}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.title}
                onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what students will learn from this content..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.description}
                onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Class Level *</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowClassPicker(true)}
                >
                  <Text style={styles.pickerText}>
                    {formData.class_level.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.halfInput}>
                <Text style={styles.label}>Subject</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowSubjectPicker(true)}
                >
                  <Text style={styles.pickerText}>
                    {formData.subject || 'Select Subject'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* File Upload Section */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} File{uploadMode === 'multiple' ? 's' : ''} *
              </Text>
              <TouchableOpacity style={styles.fileUploadArea} onPress={handlePickFile}>
                <View style={styles.fileUploadContent}>
                  {getFileIcon(activeTab)}
                  <Text style={styles.fileUploadText}>
                    Choose {activeTab} file{uploadMode === 'multiple' ? 's' : ''}
                  </Text>
                  <Text style={styles.fileUploadSubtext}>
                    Max size: {getMaxSize(activeTab)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Selected Files Display */}
              {uploadMode === 'single' && formData.file && (
                <View style={styles.selectedFile}>
                  <Text style={styles.selectedFileText}>Selected: {formData.file.name}</Text>
                </View>
              )}

              {uploadMode === 'multiple' && formData.files.length > 0 && (
                <View style={styles.selectedFilesContainer}>
                  {formData.files.map((file, index) => (
                    <View key={index} style={styles.selectedFileItem}>
                      <Text style={styles.selectedFileText} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeFile(index)}>
                        <X size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={uploading}
            >
              <LinearGradient colors={['#10B981', '#059669']} style={styles.uploadButtonGradient}>
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Upload size={20} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>
                      Upload {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Upload Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Upload Guidelines</Text>
            <View style={styles.guidelinesGrid}>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineTitle}>Video Files</Text>
                <Text style={styles.guidelineText}>• Formats: MP4, AVI, MOV, WebM</Text>
                <Text style={styles.guidelineText}>• Max size: 500MB</Text>
                <Text style={styles.guidelineText}>• Recommended: 720p or higher</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineTitle}>Documents</Text>
                <Text style={styles.guidelineText}>• Formats: PDF, DOC, PPT</Text>
                <Text style={styles.guidelineText}>• Max size: 50MB</Text>
                <Text style={styles.guidelineText}>• Clear, readable content</Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.guidelineTitle}>Images</Text>
                <Text style={styles.guidelineText}>• Formats: JPG, PNG, GIF</Text>
                <Text style={styles.guidelineText}>• Max size: 10MB</Text>
                <Text style={styles.guidelineText}>• High resolution preferred</Text>
              </View>
            </View>
          </View>
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
              <Text style={styles.modalTitle}>Select Class Level</Text>
              <ScrollView style={styles.modalScroll}>
                {classOptions.map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    style={[
                      styles.modalItem,
                      formData.class_level === cls && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, class_level: cls }));
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      formData.class_level === cls && styles.modalItemTextSelected,
                    ]}>
                      {cls.replace('_', ' ').toUpperCase()}
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

        {/* Subject Picker Modal */}
        <Modal
          visible={showSubjectPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowSubjectPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <ScrollView style={styles.modalScroll}>
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    !formData.subject && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, subject: '' }));
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    !formData.subject && styles.modalItemTextSelected,
                  ]}>
                    No Subject
                  </Text>
                </TouchableOpacity>
                {subjectOptions.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.modalItem,
                      formData.subject === subject && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, subject }));
                      setShowSubjectPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      formData.subject === subject && styles.modalItemTextSelected,
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowSubjectPicker(false)}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeModeButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#F87171', fontSize: 14, textAlign: 'center' },
  successContainer: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successText: { color: '#22C55E', fontSize: 14, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfInput: { flex: 1 },
  picker: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  pickerText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  fileUploadArea: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  fileUploadContent: {
    alignItems: 'center',
    gap: 8,
  },
  fileUploadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  fileUploadSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  selectedFile: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  selectedFileText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  selectedFilesContainer: {
    marginTop: 8,
    gap: 8,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
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
  guidelinesContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  guidelinesGrid: {
    gap: 16,
  },
  guidelineItem: {},
  guidelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#065F46',
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
  modalScroll: { maxHeight: 300 },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalItemSelected: {
    backgroundColor: '#059669',
  },
  modalItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  modalItemTextSelected: {
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#A7F3D0',
    fontSize: 16,
  },
});
