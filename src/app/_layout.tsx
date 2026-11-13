import { Stack } from 'expo-router';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '300' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="lesson/[id]"
        options={{ title: 'Lesson', animation: 'fade' }}
      />
    </Stack>
  );
}