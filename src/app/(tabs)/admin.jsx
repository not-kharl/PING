import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { colors, themedStyles, useTheme } from '../../theme';

export default function AdminScreen() {
  useTheme();
  const { user, users, removeUser } = useAuth();
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.center}>
        <Text style={styles.denied}>Admins only.</Text>
      </View>
    );
  }

  const onDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      setError('');
      return;
    }
    setConfirmId(null);
    setError((await removeUser(id)) ?? '');
  };

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={{ padding: 16 }}
      data={users}
      keyExtractor={(u) => u.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Users ({users.length})</Text>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
      }
      renderItem={({ item }) => {
        const isMe = item.id === user.id;
        const isAdmin = item.role === 'admin';
        const confirming = confirmId === item.id;
        return (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name}
                {isMe ? ' (you)' : ''}
              </Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: isAdmin ? colors.orange : colors.navy },
              ]}
            >
              <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
            </View>
            {!isMe && (
              <View style={styles.actions}>
                {confirming && (
                  <Pressable
                    style={styles.btn}
                    onPress={() => setConfirmId(null)}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.btn, { backgroundColor: '#c62828' }]}
                  onPress={() => onDelete(item.id)}
                >
                  <Text style={styles.btnText}>
                    {confirming ? 'Tap again to delete' : 'Delete'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = themedStyles({
  list: { flex: 1, backgroundColor: colors.bgLight },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  denied: { color: colors.muted, fontSize: 16 },
  heading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.orange,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  error: { color: '#c62828', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  username: { fontSize: 12, color: colors.muted },
  badge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    backgroundColor: colors.navy,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  btnText: { color: colors.white, fontSize: 12, fontWeight: '600' },
});