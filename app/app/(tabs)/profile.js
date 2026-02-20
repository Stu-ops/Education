// Profile Screen
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Edit, Star, Save, X, Upload, GraduationCap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';
import colors from '../../src/styles/colors';
import Header from '../../src/components/Header';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useUser();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [animatedPoints, setAnimatedPoints] = useState(0);
    const [animatedLevel, setAnimatedLevel] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (user) {
            setForm({
                ...user,
                classLevel: user.class_level || user.classLevel,
            });
        }
    }, [user]);

    useEffect(() => {
        if (!user || hasAnimated.current) return;
        const targetPoints = user.points || 250;
        const targetLevel = user.level || 1;
        const duration = 1200;
        const steps = 60;
        const pointsIncrement = targetPoints / steps;
        const levelIncrement = targetLevel / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep += 1;
            setAnimatedPoints(Math.min(Math.round(pointsIncrement * currentStep), targetPoints));
            setAnimatedLevel(Math.min(Math.round(levelIncrement * currentStep), targetLevel));
            if (currentStep >= steps) {
                clearInterval(timer);
                hasAnimated.current = true;
            }
        }, duration / steps);

        return () => clearInterval(timer);
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
                hasAnimated.current = false;
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
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.headerWrap}>
                    <Header />
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarBorder}>
                            <Image source={{ uri: form?.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                        </View>

                        {editing && form?.avatar && (
                            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
                                <X size={16} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}

                        {editing && (
                            <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
                                <Upload size={18} color="#FFFFFF" />
                                <Text style={styles.uploadButtonText}>Upload Photo</Text>
                            </TouchableOpacity>
                        )}

                        <Text style={styles.userName}>{form?.name || user?.name || 'Student'}</Text>
                        <Text style={styles.userInfo}>Level {form?.level || user?.level || 1}</Text>

                        <View style={styles.actionRow}>
                            {!editing ? (
                                <TouchableOpacity style={[styles.actionButton, styles.actionBlue]} onPress={() => setEditing(true)}>
                                    <Edit size={18} color="#FFFFFF" />
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity style={[styles.actionButton, styles.actionGreen]} onPress={handleSave} disabled={saving}>
                                    {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Save size={18} color="#FFFFFF" />}
                                    <Text style={styles.actionText}>{saving ? 'Saving...' : 'Save'}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.actionButton, styles.actionRed]} onPress={handleLogout}>
                                <LogOut size={18} color="#FFFFFF" />
                                <Text style={styles.actionText}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {editing && (
                        <View style={styles.profileCard}>
                            <View style={styles.editForm}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Name:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form?.name || ''}
                                        onChangeText={(v) => handleChange('name', v)}
                                        placeholderTextColor={colors.text.muted}
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
                                        placeholderTextColor={colors.text.muted}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Email:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form?.email || ''}
                                        onChangeText={(v) => handleChange('email', v)}
                                        keyboardType="email-address"
                                        placeholderTextColor={colors.text.muted}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Age:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={String(form?.age || '')}
                                        onChangeText={(v) => handleChange('age', parseInt(v) || null)}
                                        keyboardType="numeric"
                                        placeholderTextColor={colors.text.muted}
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>School:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={form?.school || ''}
                                        onChangeText={(v) => handleChange('school', v)}
                                        placeholderTextColor={colors.text.muted}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    <View style={styles.statsCard}>
                        <View style={styles.statsHeader}>
                            <Star size={18} color={colors.accent.yellow} />
                            <Text style={styles.statsTitle}>Progress</Text>
                        </View>

                        <View style={styles.progressRow}>
                            <View style={[styles.progressChip, styles.progressChipOrange]}>
                                <Text style={styles.progressValue}>{animatedPoints}</Text>
                                <Text style={styles.progressLabel} numberOfLines={1}>Progress</Text>
                            </View>
                            <View style={[styles.progressChip, styles.progressChipBlue]}>
                                <Text style={[styles.progressValue, { color: colors.accent.blue }]}>Level {animatedLevel}</Text>
                                <Text style={styles.progressLabel} numberOfLines={1}>Current Level</Text>
                            </View>
                        </View>

                        <View style={styles.ratingCard}>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={20} color={i <= (user?.rating || 3) ? colors.accent.yellow : colors.text.soft} fill={i <= (user?.rating || 3) ? colors.accent.yellow : 'transparent'} />
                                ))}
                            </View>
                            <Text style={styles.ratingText}>Achievement Rating</Text>
                        </View>
                    </View>

                    <View style={styles.teachingCard}>
                        <View style={styles.teachingContent}>
                            <View style={styles.teachingIcon}>
                                <GraduationCap size={20} color="#FFFFFF" />
                            </View>
                            <View style={styles.teachingText}>
                                <Text style={styles.teachingTitle}>Teaching Hub</Text>
                                <Text style={styles.teachingSubtitle}>Share your knowledge with us</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.teachingButton}
                            onPress={() => router.push('/teacher/login')}
                        >
                            <Text style={styles.teachingButtonText}>Access</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>

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
                                    style={[styles.pickerItem, form?.classLevel === c && styles.pickerItemSelected]}
                                    onPress={() => {
                                        handleChange('classLevel', c);
                                        setShowClassPicker(false);
                                    }}
                                >
                                    <Text style={[styles.pickerItemText, form?.classLevel === c && styles.pickerItemTextSelected]}>
                                        {formatClassDisplay(c)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowClassPicker(false)}>
                            <Text style={styles.modalCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary.cream },
    safeArea: { flex: 1 },
    scrollContent: { padding: 16, alignItems: 'center', paddingBottom: 100 },
    headerWrap: { width: '100%', paddingHorizontal: 12, paddingTop: 8, marginBottom: 6 },
    avatarSection: { marginBottom: 16, alignItems: 'center' },
    avatarBorder: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.accent.orange, padding: 4, backgroundColor: '#FFF' },
    avatar: { width: '100%', height: '100%', borderRadius: 56, backgroundColor: '#E5E7EB' },
    removeButton: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', borderRadius: 16, padding: 8 },
    uploadButton: { marginTop: 12, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.accent.blue, flexDirection: 'row', alignItems: 'center', gap: 6 },
    uploadButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
    userName: { fontSize: 20, fontWeight: '700', color: colors.text.primary, marginTop: 10 },
    userInfo: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 999 },
    actionBlue: { backgroundColor: colors.accent.blue },
    actionGreen: { backgroundColor: colors.accent.green },
    actionRed: { backgroundColor: '#EF4444' },
    actionText: { color: '#FFF', fontWeight: '600', fontSize: 12 },
    profileCard: { backgroundColor: '#FBF1EF', borderRadius: 18, padding: 16, width: '100%', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#F0DAD2' },
    editForm: { width: '100%', marginTop: 8 },
    inputContainer: { marginBottom: 12 },
    inputLabel: { fontSize: 13, color: colors.text.primary, marginBottom: 4, fontWeight: '500' },
    input: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, color: colors.text.primary, fontSize: 14, borderWidth: 1, borderColor: '#F0DAD2' },
    inputValue: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#F0DAD2' },
    inputValueText: { color: colors.text.primary, fontSize: 14 },
    statsCard: { backgroundColor: '#FBF1EF', borderRadius: 18, padding: 16, width: '100%', marginBottom: 16, borderWidth: 1, borderColor: '#F0DAD2' },
    statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    statsTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    progressRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    progressChip: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.primary.border },
    progressChipOrange: { backgroundColor: '#FEE6DA' },
    progressChipBlue: { backgroundColor: '#E7F5FE' },
    progressValue: { fontSize: 20, fontWeight: '700', color: colors.accent.orange },
    progressLabel: { fontSize: 10, color: colors.text.muted, marginTop: 2, textAlign: 'center' },
    ratingCard: { backgroundColor: '#FEF9F1', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.primary.border },
    statValue: { fontSize: 22, fontWeight: '700', color: colors.accent.orange },
    statLabel: { fontSize: 12, color: colors.text.muted, marginTop: 2 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 6 },
    ratingText: { textAlign: 'center', fontSize: 12, color: colors.text.muted, marginTop: 6 },
    teachingCard: { backgroundColor: '#FDFBFA', borderRadius: 18, padding: 14, width: '100%', borderWidth: 1, borderColor: '#F0DAD2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    teachingContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    teachingIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent.orange, alignItems: 'center', justifyContent: 'center' },
    teachingText: { flexShrink: 1 },
    teachingTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
    teachingSubtitle: { fontSize: 11, color: colors.text.muted, marginTop: 2 },
    teachingButton: { backgroundColor: colors.accent.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
    teachingButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FBF1EF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%', borderWidth: 1, borderColor: '#F0DAD2' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary, textAlign: 'center', marginBottom: 16 },
    pickerScroll: { maxHeight: 300 },
    pickerItem: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, marginBottom: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#F0DAD2' },
    pickerItemSelected: { backgroundColor: '#FFE9D8' },
    pickerItemText: { color: colors.text.primary, fontSize: 16, textAlign: 'center' },
    pickerItemTextSelected: { fontWeight: 'bold' },
    modalClose: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
    modalCloseText: { color: colors.text.muted, fontSize: 16 },
});
