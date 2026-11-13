import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import NetworkBuilder from '../../components/NetworkBuilder';
import { lessons } from '../../data/lessons';
import { colors } from '../../theme';

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const lesson = lessons.find((l) => l.id === id);

  if (!lesson) return <Text style={{ padding: 20 }}>Lesson not found.</Text>;

  const text = (
    <View style={wide && lesson.interactive ? styles.left : undefined}>
      <Text style={styles.label}>Topic</Text>
      <Text style={styles.body}>{lesson.topic}</Text>

      <Text style={styles.label}>Contents</Text>
      {lesson.sections.map((s) => (
        <View key={s.heading} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.heading}</Text>
          <Text style={styles.body}>{s.body}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lesson',
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

          {lesson.interactive ? (
            <View
              style={[
                styles.content,
                wide ? styles.row : { gap: 16 },
              ]}
            >
              {text}
              <View style={wide ? styles.right : undefined}>
                <NetworkBuilder />
              </View>
            </View>
          ) : (
            <View style={styles.content}>{text}</View>
          )}
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  row: { flexDirection: 'row', gap: 24, alignItems: 'flex-start' },
  left: { flex: 1 },
  right: { flex: 1.2 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 8,
  },
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