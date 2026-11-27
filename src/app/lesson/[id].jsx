import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Reference from '../../components/Reference';
import { lessons } from '../../data/lessons';
import { useProgress } from '../../lib/progress';
import { colors, themedStyles, useTheme } from '../../theme';

export default function LessonDetail() {
  useTheme();
  const { id } = useLocalSearchParams();
  const lesson = lessons.find((l) => l.id === id);
  const { ready, mark } = useProgress();

  // Count the module as viewed (this unlocks its quiz)
  useEffect(() => {
    if (ready && lesson) mark(`lesson${lesson.id}`);
  }, [ready, lesson?.id]);

  if (!lesson) return <Text style={{ padding: 20 }}>Module not found.</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Module',
          headerLeft: () => (
            <Pressable
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/')
              }
              hitSlop={12}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.white} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen}>
        <Animated.View entering={ZoomIn.duration(400)}>
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>{lesson.title.toUpperCase()}</Text>
            <View style={styles.heroLine} />
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Topic</Text>
            <Text style={styles.body}>{lesson.topic}</Text>

            {lesson.interactive && (
              <Pressable
                style={styles.playBtn}
                onPress={() => router.navigate('/playground')}
              >
                <Ionicons name="construct" size={18} color={colors.white} />
                <Text style={styles.playText}>OPEN THE PLAYGROUND</Text>
              </Pressable>
            )}

            <Text style={styles.label}>Contents</Text>
            {lesson.sections.map((s) => (
              <View key={s.heading} style={styles.section}>
                <Text style={styles.sectionTitle}>{s.heading}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </View>
            ))}

            {lesson.fromReference && (
              <View style={{ marginTop: 8 }}>
                <Reference />
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = themedStyles({
  screen: { flex: 1, backgroundColor: colors.bgLight },
  hero: {
    backgroundColor: colors.navy,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 2,
    textAlign: 'center',
  },
  heroLine: { width: 48, height: 3, backgroundColor: colors.orange, marginTop: 14 },
  content: { padding: 20 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.orange,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 14,
    marginBottom: 6,
  },
  playText: { color: colors.white, fontWeight: '700', letterSpacing: 2, fontSize: 13 },
  section: {
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
    padding: 14,
    marginBottom: 12,
    borderRadius: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
});