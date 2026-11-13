import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '../../theme';

export default function TabsLayout() {
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
        name="index"
        options={{
          title: 'Lessons',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="book"
              size={24}
              color={focused ? colors.orange : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={24}
              color={focused ? colors.orange : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}