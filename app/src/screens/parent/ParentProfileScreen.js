// ParentProfileScreen for React Native
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useParent } from '../../contexts/ParentContext';
import colors from '../../styles/colors';

export default function ParentProfileScreen() {
  const navigation = useNavigation();
  const { parent, stats } = useParent();

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parent Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👨‍👩‍👧</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{parent?.username || 'N/A'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Linked Student</Text>
            <Text style={styles.value}>{parent?.student_username || stats?.child?.name || 'N/A'}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Account Status</Text>
            <Text style={[styles.value, styles.activeStatus]}>Active ✓</Text>
          </View>
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
  content: { padding: 16, alignItems: 'center' },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarEmoji: { fontSize: 50 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  activeStatus: { color: '#22C55E' },
});
