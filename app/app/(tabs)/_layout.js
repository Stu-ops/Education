// Tab layout
import { Tabs } from 'expo-router';
import { Home, Compass, User, MessageSquare } from 'lucide-react-native';
import { useLanguage } from '../../src/contexts/LanguageContext';

export default function TabLayout() {
  const { lang } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          borderRadius: 20,
          marginHorizontal: 10,
          marginBottom: 10,
        },
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: lang === 'hi' ? 'होम' : 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: lang === 'hi' ? 'चैट' : 'History',
          tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: lang === 'hi' ? 'खोजें' : 'Explore',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
