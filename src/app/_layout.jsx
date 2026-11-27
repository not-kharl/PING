import { Stack, router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth';
import { ProgressProvider } from '../lib/progress';
import { ThemeProvider, colors, useTheme } from '../theme';

export const unstable_settings = {
  anchor: 'welcome',
};

const PUBLIC_PATHS = ['/welcome', '/login'];

function RootNav() {
  const { user, loading } = useAuth();
  const { ui } = useTheme();
  const pathname = usePathname();

  // Signed out: always send visitors to the welcome page.
  // Signed in: leave welcome/login and go to the main content.
  useEffect(() => {
    if (loading) return;
    const onPublic = PUBLIC_PATHS.includes(pathname);
    if (!user && !onPublic) router.replace('/welcome');
    if (user && onPublic) router.replace('/');
  }, [loading, user, pathname]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: ui.header,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.orange} size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: ui.header },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '300' },
        contentStyle: { backgroundColor: ui.bg },
      }}
    >
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="lesson/[id]"
          options={{ title: 'Module', animation: 'fade' }}
        />
        <Stack.Screen
          name="quiz/[id]"
          options={{ title: 'Quiz', animation: 'fade' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <RootNav />
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}