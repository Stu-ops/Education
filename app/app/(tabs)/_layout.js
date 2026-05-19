// Tab layout
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Compass, User, MessageSquare, ClipboardList } from 'lucide-react-native';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useUser } from '../../src/contexts/UserContext';
import { getContestLeaderboard } from '../../src/utils/contestApi';

function TabIcon({ color, size, Icon, badge }) {
  return (
    <View style={styles.iconWrapper}>
      <Icon size={size} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const { lang } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const [contestRank, setContestRank] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadRank = async () => {
      if (userLoading) return;
      if (!user) {
        if (isMounted) setContestRank(null);
        return;
      }
      try {
        const data = await getContestLeaderboard();
        if (isMounted) {
          setContestRank(typeof data?.student_rank === 'number' ? data.student_rank : null);
        }
      } catch {
        if (isMounted) setContestRank(null);
      }
    };

    loadRank();
    return () => { isMounted = false; };
  }, [user, userLoading]);

  // Tab label translations
  const labels = {
    home:    lang === 'hi' ? '\u0939\u094B\u092E'          : 'Home',
    history: lang === 'hi' ? '\u091A\u0948\u091F'          : 'History',
    explore: lang === 'hi' ? '\u0916\u094B\u091C\u0947\u0902' : 'Explore',
    test:    lang === 'hi' ? '\u091F\u0947\u0938\u094D\u091F' : 'Test',
    profile: lang === 'hi' ? '\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932' : 'Profile',
  };

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
          title: labels.home,
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} Icon={Home} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: labels.history,
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} Icon={MessageSquare} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: labels.explore,
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} Icon={Compass} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: labels.test,
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              color={color}
              size={size}
              Icon={ClipboardList}
              badge={contestRank ? `#${contestRank}` : null}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: labels.profile,
          tabBarIcon: ({ color, size }) => (
            <TabIcon color={color} size={size} Icon={User} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -7,
    right: -14,
    backgroundColor: '#F97316',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
