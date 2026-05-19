import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Save, Plus } from 'lucide-react-native';
import { getAnnouncement, setAnnouncement, getConfig, setConfig } from '../../src/utils/adminApi';

export default function AdminConfigScreen() {
  const [announcement, setAnnouncementText] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(true);
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  const [configKey, setConfigKey] = useState('');
  const [configValue, setConfigValue] = useState('');
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    getAnnouncement()
      .then(data => setAnnouncementText(data.announcement || ''))
      .catch(() => {})
      .finally(() => setAnnouncementLoading(false));
  }, []);

  const saveAnnouncement = async () => {
    setAnnouncementSaving(true);
    try {
      await setAnnouncement(announcement);
      Alert.alert('Saved', 'Announcement updated successfully.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const saveConfig = async () => {
    if (!configKey.trim()) { Alert.alert('Error', 'Key is required'); return; }
    setConfigSaving(true);
    try {
      await setConfig(configKey.trim(), configValue);
      Alert.alert('Saved', `Config "${configKey}" updated.`);
      setConfigKey(''); setConfigValue('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setConfigSaving(false);
    }
  };

  const lookupConfig = async () => {
    if (!configKey.trim()) return;
    try {
      const data = await getConfig(configKey.trim());
      setConfigValue(data.value || '');
    } catch {
      setConfigValue('');
      Alert.alert('Not found', `No config for key "${configKey}"`);
    }
  };

  return (
    <LinearGradient colors={['#DC2626', '#7F1D1D']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFF" /></TouchableOpacity>
          <Text style={styles.title}>System Config</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Announcement */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📢 Platform Announcement</Text>
            <Text style={styles.cardSub}>Shown to all users on login</Text>
            {announcementLoading
              ? <ActivityIndicator color="#FFF" />
              : <>
                  <TextInput
                    style={styles.textarea}
                    placeholder="Enter announcement message..."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={announcement}
                    onChangeText={setAnnouncementText}
                    multiline
                    numberOfLines={4}
                  />
                  <TouchableOpacity style={[styles.btn, announcementSaving && styles.btnDisabled]} onPress={saveAnnouncement} disabled={announcementSaving}>
                    <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.btnGrad}>
                      <Save size={16} color="#FFF" />
                      <Text style={styles.btnText}>{announcementSaving ? 'Saving...' : 'Save Announcement'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>}
          </View>

          {/* Feature Flags */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ Feature Flags</Text>
            <Text style={styles.cardSub}>Read or write any config key</Text>
            <TextInput
              style={styles.input}
              placeholder="Config key (e.g. feature_contests)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={configKey}
              onChangeText={setConfigKey}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.lookupBtn} onPress={lookupConfig}>
              <Text style={styles.lookupText}>Look up key</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Value (e.g. true / false / any string)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={configValue}
              onChangeText={setConfigValue}
            />
            <TouchableOpacity style={[styles.btn, configSaving && styles.btnDisabled]} onPress={saveConfig} disabled={configSaving}>
              <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.btnGrad}>
                <Plus size={16} color="#FFF" />
                <Text style={styles.btnText}>{configSaving ? 'Saving...' : 'Set Config'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  textarea: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14, minHeight: 90, textAlignVertical: 'top' },
  input: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 14 },
  lookupBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  lookupText: { color: '#FFF', fontSize: 13 },
  btn: { borderRadius: 10, overflow: 'hidden' },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 6 },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
