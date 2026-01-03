// Profile Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Edit, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '../../src/contexts/UserContext';

export default function ProfileScreen() {
    const { user, logout } = useUser();
    const [points] = useState(250);
    const [level] = useState(5);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    return (
        <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.avatarBorder}>
                            <Image source={{ uri: 'https://i.pravatar.cc/150' }} style={styles.avatar} />
                        </LinearGradient>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                        <Text style={styles.userInfo}>{user?.classLevel || 'Class 5'} · Level {user?.level || 1}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsCard}>
                        <View style={styles.statsHeader}>
                            <Star size={20} color="#EAB308" />
                            <Text style={styles.statsTitle}>Progress</Text>
                        </View>
                        <View style={styles.statsGrid}>
                            <LinearGradient colors={['rgba(168,85,247,0.2)', 'rgba(236,72,153,0.2)']} style={styles.statItem}>
                                <Text style={styles.statValue}>{points}</Text>
                                <Text style={styles.statLabel}>Points</Text>
                            </LinearGradient>
                            <LinearGradient colors={['rgba(59,130,246,0.2)', 'rgba(6,182,212,0.2)']} style={styles.statItem}>
                                <Text style={styles.statValue}>{level}</Text>
                                <Text style={styles.statLabel}>Level</Text>
                            </LinearGradient>
                        </View>
                        <View style={styles.starsRow}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={24} color={i <= 3 ? '#EAB308' : '#6B7280'} fill={i <= 3 ? '#EAB308' : 'transparent'} />
                            ))}
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.button}>
                            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
                                <Edit size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Edit Profile</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleLogout}>
                            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.buttonGradient}>
                                <LogOut size={20} color="#FFF" />
                                <Text style={styles.buttonText}>Logout</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollContent: { padding: 16, alignItems: 'center', paddingBottom: 100 },
    avatarSection: { marginBottom: 20 },
    avatarBorder: { width: 124, height: 124, borderRadius: 62, padding: 4 },
    avatar: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: '#374151' },
    profileCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, width: '100%', alignItems: 'center', marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    userInfo: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
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
});
