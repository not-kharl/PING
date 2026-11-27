import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { lessons } from '../data/lessons';
import { useProgress } from '../lib/progress';
import { colors, themedStyles, useTheme } from '../theme';

const GREEN = '#2e9b57';
const shortTitle = (t) => t.replace(/^Module \d+ - /, '');

function Chip({ label, done, locked, onPress }) {
  const { ui } = useTheme();
  const color = done ? GREEN : locked ? colors.muted : ui.text;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, done && styles.chipDone, locked && { opacity: 0.6 }]}
    >
      <Ionicons
        name={done ? 'checkmark-circle' : locked ? 'lock-closed' : 'ellipse-outline'}
        size={14}
        color={color}
      />
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function ProgressCard() {
  useTheme();
  const { data, percent } = useProgress();

  const openLesson = (id) =>
    router.push({ pathname: '/lesson/[id]', params: { id } });
  const openQuiz = (id) =>
    router.push({ pathname: '/quiz/[id]', params: { id } });

  let next = null;
  for (const l of lessons) {
    if (!data[`lesson${l.id}`]) {
      next = { label: `Open Module ${l.id}`, go: () => openLesson(l.id) };
      break;
    }
    if (!data[`quiz${l.id}`]) {
      next = { label: `Take Quiz ${l.id}`, go: () => openQuiz(l.id) };
      break;
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.heading}>Your progress</Text>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%` },
            percent === 100 && { backgroundColor: GREEN },
          ]}
        />
      </View>
      <Text style={styles.note}>
        Each module viewed and each quiz passed adds 10%.
      </Text>

      {lessons.map((l) => (
        <View key={l.id} style={styles.module}>
          <Text style={styles.moduleTitle} numberOfLines={2}>
            {l.id}. {shortTitle(l.title)}
          </Text>
          <View style={styles.chips}>
            <Chip
              label="Module"
              done={data[`lesson${l.id}`]}
              onPress={() => openLesson(l.id)}
            />
            <Chip
              label="Quiz"
              done={data[`quiz${l.id}`]}
              locked={!data[`lesson${l.id}`]}
              onPress={() => openQuiz(l.id)}
            />
          </View>
        </View>
      ))}

      {next ? (
        <Pressable style={styles.reminder} onPress={next.go}>
          <Ionicons name="alarm" size={18} color={colors.white} />
          <Text style={styles.reminderText}>Next step: {next.label}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </Pressable>
      ) : (
        <Text style={styles.done}>All modules completed. Great work!</Text>
      )}
    </View>
  );
}

const styles = themedStyles({
  card: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 18,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  percent: { fontSize: 22, fontWeight: '700', color: colors.navy },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gray,
    marginTop: 8,
    marginBottom: 6,
  },
  fill: { height: 10, borderRadius: 5, backgroundColor: colors.orange },
  note: { fontSize: 12, color: colors.muted, marginBottom: 10 },
  module: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  moduleTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.navy },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.bgLight,
  },
  chipDone: { borderColor: GREEN, backgroundColor: '#e8f6ee' },
  chipText: { fontSize: 12, fontWeight: '600' },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.navy,
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
  },
  reminderText: { flex: 1, color: colors.white, fontWeight: '600', fontSize: 13 },
  done: { color: GREEN, fontWeight: '700', marginTop: 12 },
});