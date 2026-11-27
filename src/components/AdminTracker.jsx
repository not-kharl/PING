import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { lessons } from '../data/lessons';
import { useAuth } from '../lib/auth';
import { colors, themedStyles, useTheme } from '../theme';

const GREEN = '#2e9b57';
const PREFIX = 'ping.progress.v2.';

function timeAgo(iso) {
  if (!iso) return 'Before tracking';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatDate(iso) {
  if (!iso) return 'Created before tracking started';
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

const isNew = (iso) =>
  !!iso && Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;

function statsFor(p) {
  const viewed = lessons.filter((l) => p?.[`lesson${l.id}`]).length;
  const quizzes = lessons.filter((l) => p?.[`quiz${l.id}`]).length;
  const percent = Math.round(((viewed + quizzes) / (lessons.length * 2)) * 100);
  let waiting = null;
  for (const l of lessons) {
    if (!p?.[`lesson${l.id}`]) {
      waiting = `Module ${l.id}`;
      break;
    }
    if (!p?.[`quiz${l.id}`]) {
      waiting = `Quiz ${l.id}`;
      break;
    }
  }
  return { viewed, quizzes, percent, waiting };
}

export default function AdminTracker() {
  useTheme();
  const { users } = useAuth();
  const [progress, setProgress] = useState({});

  const students = users.filter((u) => u.role === 'student');
  const idKey = students.map((s) => s.id).join(',');

  // Reload the saved progress each time the Profile tab is opened
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const ids = idKey ? idKey.split(',') : [];
        const map = {};
        try {
          const pairs = await AsyncStorage.multiGet(ids.map((id) => PREFIX + id));
          pairs.forEach(([key, raw]) => {
            const id = key.slice(PREFIX.length);
            try {
              map[id] = raw ? JSON.parse(raw) : null;
            } catch {
              map[id] = null;
            }
          });
        } catch {
          // storage unavailable: show everyone as not started
        }
        if (alive) setProgress(map);
      })();
      return () => {
        alive = false;
      };
    }, [idKey])
  );

  const recent = [...users]
    .sort(
      (a, b) =>
        (b.createdAt ? Date.parse(b.createdAt) : 0) -
        (a.createdAt ? Date.parse(a.createdAt) : 0)
    )
    .slice(0, 5);

  const rows = students.map((s) => ({ s, ...statsFor(progress[s.id]) }));
  const finished = rows.filter((r) => r.percent === 100).length;

  return (
    <View style={{ gap: 16 }}>
      {/* History tracker */}
      <View style={styles.card}>
        <Text style={styles.heading}>Recent registrations</Text>
        {recent.length === 0 && <Text style={styles.empty}>No accounts yet.</Text>}
        {recent.map((u) => (
          <View key={u.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{u.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{u.name}</Text>
                {isNew(u.createdAt) && (
                  <View style={styles.newTag}>
                    <Text style={styles.newTagText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sub}>
                @{u.username} - {u.role}
              </Text>
              <Text style={styles.sub}>{formatDate(u.createdAt)}</Text>
            </View>
            <Text style={styles.ago}>{timeAgo(u.createdAt)}</Text>
          </View>
        ))}
      </View>

      {/* Student progress guide */}
      <View style={styles.card}>
        <Text style={styles.heading}>Student progress guide</Text>
        {students.length === 0 ? (
          <Text style={styles.empty}>No students have registered yet.</Text>
        ) : (
          <>
            <Text style={styles.summary}>
              {finished} of {students.length} student{students.length === 1 ? '' : 's'}{' '}
              finished all modules and quizzes.
            </Text>
            {rows.map(({ s, viewed, quizzes, percent, waiting }) => {
              const done = percent === 100;
              const started = percent > 0;
              return (
                <View key={s.id} style={styles.student}>
                  <View style={styles.nameRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{s.name}</Text>
                      <Text style={styles.sub}>@{s.username}</Text>
                    </View>
                    <View
                      style={[
                        styles.pill,
                        { backgroundColor: done ? GREEN : started ? colors.orange : colors.muted },
                      ]}
                    >
                      <Text style={styles.pillText}>
                        {done ? 'COMPLETED' : started ? 'IN PROGRESS' : 'NOT STARTED'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.track}>
                    <View
                      style={[
                        styles.fill,
                        { width: `${percent}%` },
                        done && { backgroundColor: GREEN },
                      ]}
                    />
                  </View>
                  <Text style={styles.sub}>
                    {percent}% - Modules {viewed}/{lessons.length} - Quizzes {quizzes}/
                    {lessons.length}
                    {waiting ? `  |  Waiting on: ${waiting}` : ''}
                  </Text>
                </View>
              );
            })}
            <Text style={styles.note}>
              Progress is read from this device. Students who used other devices will
              show as not started until a shared database is connected.
            </Text>
          </>
        )}
      </View>
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
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  empty: { color: colors.muted, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '600' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 15, fontWeight: '700', color: colors.navy },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  ago: { fontSize: 12, fontWeight: '600', color: colors.navy },
  newTag: {
    backgroundColor: colors.orange,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  newTagText: { color: colors.white, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  summary: { fontSize: 14, color: colors.text, marginBottom: 6 },
  student: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    gap: 8,
  },
  pill: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.gray },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.orange },
  note: { fontSize: 11, color: colors.muted, marginTop: 10, lineHeight: 16 },
});