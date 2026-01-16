// Profile Screen
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Edit, Star, Save, X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useUser();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                ...user,
                classLevel: user.class_level || user.classLevel,
            });
        }
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

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
            // Convert "Class 5" format to "class_5" for backend
            let classLevelForBackend = form.classLevel;
            if (classLevelForBackend) {
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

            const updated = await updateUser(updatePayload);
            if (updated) {
                setEditing(false);
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

    const classOptions = ['class_1', 'class_2', 'class_3', 'class_4', 'class_5', 'class_6', 'class_7', 'class_8', 'class_9', 'class_10', 'class_11', 'class_12'];

    const formatClassDisplay = (classLevel) => {
        if (!classLevel) return 'Select class';
        const match = classLevel.match(/class_?(\d+)/i);
        if (match) return `Class ${match[1]}`;
        return classLevel;
    };

    return (
        <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.avatarBorder}>
                            <Image source={{ uri: form?.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
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
                        {!editing ? (
                            <>
                                <Text style={styles.userName}>{form?.name || user?.name || 'Student'}</Text>
                                <Text style={styles.userInfo}>
                                    {formatClassDisplay(form?.classLevel || user?.class_level || user?.classLevel)} · Level {form?.level || user?.level || 1}
                                </Text>
                            </>
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

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statsHeader}>
                            <Star size={20} color="#EAB308" />
                            <Text style={styles.statsTitle}>Progress</Text>
                        </View>
                        <View style={styles.statsGrid}>
                            <LinearGradient colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)']} style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.points || 250}</Text>
                                <Text style={styles.statLabel}>Points</Text>
                            </LinearGradient>
                            <LinearGradient colors={['rgba(59,130,246,0.2)', 'rgba(6,182,212,0.2)']} style={styles.statItem}>
                                <Text style={styles.statValue}>{user?.level || 1}</Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </LinearGradient>
                        </View>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={24} color={i <= (user?.rating || 3) ? '#EAB308' : '#6B7280'} fill={i <= (user?.rating || 3) ? '#EAB308' : 'transparent'} />
                            ))}
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        {!editing ? (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => setEditing(true)}
                            >
                                <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
                                    <Edit size={20} color="#FFF" />
                                    <Text style={styles.buttonText}>Edit Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.buttonGradient}>
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Save size={20} color="#FFF" />
                                    )}
                                    <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.button} onPress={handleLogout}>
                            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.buttonGradient}>
                                <LogOut size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Logout</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>

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
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: { padding: 16, alignItems: 'center', paddingBottom: 100 },
    avatarSection: { marginBottom: 20, alignItems: 'center' },
    avatarBorder: { width: 124, height: 124, borderRadius: 62, padding: 4 },
    avatar: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: '#374151' },
    removeButton: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', borderRadius: 16, padding: 8 },
    uploadButton: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
    uploadButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 8 },
    uploadButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    profileCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    userInfo: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    editForm: { width: '100%', marginTop: 16 },
    inputContainer: { marginBottom: 12 },
    inputLabel: { fontSize: 14, color: '#FFF', marginBottom: 4, fontWeight: '500' },
    input: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, color: '#1F2937', fontSize: 16 },
    inputValue: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, justifyContent: 'center' },
    inputValueText: { color: '#1F2937', fontSize: 16 },
    statsCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, width: '100%', marginBottom: 16 },
    statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    statsTitle: { fontSize: 18, fontWeight: '600', color: '#FFF' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statItem: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
    statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
    buttons: { flexDirection: 'row', gap: 12, width: '100%' },
    button: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E1B4B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 16 },
    pickerScroll: { maxHeight: 300 },
    pickerItem: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
    pickerItemSelected: { backgroundColor: '#3B82F6' },
    pickerItemText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
    pickerItemTextSelected: { fontWeight: 'bold' },
    modalClose: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
    modalCloseText: { color: '#67E8F9', fontSize: 16 },
});
