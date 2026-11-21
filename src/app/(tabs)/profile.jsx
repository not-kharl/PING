import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ProgressCard from '../../components/ProgressCard';
import Reference from '../../components/Reference';
import { useAuth } from '../../lib/auth';
import { colors } from '../../theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const isAdmin = user.role === 'admin';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: isAdmin ? colors.orange : colors.navy },
          ]}
        >
          <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      <ProgressCard />

      <Pressable style={styles.logout} onPress={signOut}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </Pressable>

      <View style={styles.footer}>
        <Reference />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },
  content: { flexGrow: 1, padding: 20, gap: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 30, fontWeight: '300' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 12 },
  username: { fontSize: 14, color: colors.muted, marginTop: 2 },
  badge: { marginTop: 12, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 4 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  logout: {
    backgroundColor: colors.navy,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutText: { color: colors.white, fontWeight: '700', letterSpacing: 2 },
  footer: { marginTop: 'auto', alignItems: 'flex-end', paddingTop: 12 },
});