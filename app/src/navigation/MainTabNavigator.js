// Main Tab Navigator with bottom tabs
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, MessageSquare, Compass, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useLanguage } from '../contexts/LanguageContext';
import colors from '../styles/colors';

const Tab = createBottomTabNavigator();

function TabBarIcon({ focused, icon: Icon, label }) {
  return (
    <View style={styles.tabItem}>
      {focused && (
        <View style={styles.activeIndicator} />
      )}
      <Icon 
        size={24} 
        color={focused ? colors.primary.cyan : 'rgba(255,255,255,0.7)'} 
      />
      <Text style={[
        styles.tabLabel,
        { color: focused ? colors.primary.cyan : 'rgba(255,255,255,0.7)' }
      ]}>
        {label}
      </Text>
    </View>
  );
}

export default function MainTabNavigator() {
  const { lang } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              icon={Home} 
              label={lang === 'hi' ? 'होम' : 'Home'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              icon={MessageSquare} 
              label={lang === 'hi' ? 'चैट' : 'History'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              icon={Compass} 
              label={lang === 'hi' ? 'खोजें' : 'Explore'} 
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              focused={focused} 
              icon={User} 
              label={lang === 'hi' ? 'प्रोफ़ाइल' : 'Profile'} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 0,
    elevation: 0,
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
    position: 'absolute',
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 32,
    height: 3,
    backgroundColor: colors.primary.cyan,
    borderRadius: 2,
  },
});
