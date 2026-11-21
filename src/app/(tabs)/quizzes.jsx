import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { quizzes } from '../../data/quizzes';
import { useProgress } from '../../lib/progress';
import { colors } from '../../theme';

export default function QuizzesTab() {
  const { data, ready, isUnlocked } = useProgress();
  const [note, setNote] = useState('');

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: 16 }}
      data={quizzes}
      keyExtractor={(q) => q.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.heading}>Quizzes</Text>
          <Text style={styles.sub}>
            Each quiz unlocks after you view its module.
          </Text>
          {!!note && <Text style={styles.note}>{note}</Text>}
        </View>
      }
      renderItem={({ item }) => {
        const open = ready && isUnlocked(item.id);
        const done = data[`quiz${item.id}`];
        const best = data.scores[item.id];
        return (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
            onPress={() => {
              if (!open) {
                setNote(
                  `Quiz ${item.id} is locked. Open Module ${item.lessonId} in the Modules tab first.`
                );
                return;
              }
              setNote('');
              router.push({ pathname: '/quiz/[id]', params: { id: item.id } });
            }}
          >
            <View style={[styles.iconBox, !open && { backgroundColor: colors.muted }]}>
              <Ionicons
                name={!open ? 'lock-closed' : done ? 'checkmark' : 'help'}
                size={22}
                color={colors.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <Text style={[styles.status, done && { color: '#2e9b57' }]}>
                {!open
                  ? `Locked - view Module ${item.lessonId} first`
                  : done
                  ? `Completed${best ? ` - best ${best.score}/${best.total}` : ''}`
                  : best
                  ? `Best so far ${best.score}/${best.total}`
                  : 'Ready to start'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.bgLight },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  sub: { color: colors.muted, fontSize: 14, marginTop: 4 },
  note: { color: '#c62828', fontSize: 13, marginTop: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 4,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  status: { fontSize: 12, fontWeight: '600', color: colors.orange, marginTop: 6 },
});