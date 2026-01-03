// Parent Profile Screen
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useParent } from '../../src/contexts/ParentContext';
import { ArrowLeft, User, Mail, LogOut } from 'lucide-react-native';

export default function ParentProfileScreen() {
  const { parent, logout } = useParent();

  const handleLogout = async () => {
    await logout();
    router.replace('/parent/login');
  };

  return (
    <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Parent Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={['#A855F7', '#EC4899']} style={styles.avatarBorder}>
              <View style={styles.avatar}>
                <Text style={styles.avatarEmoji}>👨‍👩‍👧</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Profile Info */}
          <View style={styles.card}>
            <View style={styles.infoItem}>
              <User size={20} color="#A855F7" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{parent?.username || 'Parent'}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Mail size={20} color="#A855F7" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Linked Child</Text>
                <Text style={styles.infoValue}>{parent?.student_username || 'Not linked'}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity style={styles.dashboardButton} onPress={() => router.push('/parent/dashboard')}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Back to Dashboard</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.buttonGradient}>
              <LogOut size={20} color="#FFF" />
              <Text style={styles.buttonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  avatarSection: { marginBottom: 24 },
  avatarBorder: { width: 124, height: 124, borderRadius: 62, padding: 4 },
  avatar: { width: '100%', height: '100%', borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 50 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, width: '100%', marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  infoValue: { fontSize: 16, color: '#FFF', fontWeight: '500', marginTop: 2 },
  dashboardButton: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  logoutButton: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
