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
          backgroundColor: '#21273A',
          borderTopWidth: 0,
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute',
          borderRadius: 22,
          marginHorizontal: 12,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOpacity: 0.18,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        tabBarActiveTintColor: '#F97316',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarHideOnKeyboard: true,
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
