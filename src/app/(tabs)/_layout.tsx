import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors } from '../../theme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabsLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '300', letterSpacing: 2 },
        tabBarStyle: { backgroundColor: colors.black, borderTopWidth: 0 },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { letterSpacing: 1, textTransform: 'uppercase', fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="playground"
        options={{
          title: 'Playground',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="construct" size={24} color={focused ? colors.orange : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="book" size={24} color={focused ? colors.orange : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Ionicons name="person" size={24} color={focused ? colors.orange : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="shield-checkmark"
              size={24}
              color={focused ? colors.orange : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}