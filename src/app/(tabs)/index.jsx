import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { lessons } from '../../data/lessons';
import { useAuth } from '../../lib/auth';
import { colors } from '../../theme';
function Hero() {
    const { user } = useAuth();
    return (<View style={styles.hero}>
      <Text style={styles.heroSmall}>
        WELCOME, {user ? user.name.toUpperCase() : 'GUEST'}
      </Text>
      <Text style={styles.heroTitle}>NETWORKING{'\n'}FUNDAMENTALS</Text>
      <View style={styles.heroLine}/>
    </View>);
}
export default function LessonsScreen() {
    return (<FlatList style={styles.list} ListHeaderComponent={Hero} contentContainerStyle={{ paddingBottom: 24 }} data={lessons} keyExtractor={(item) => item.id} renderItem={({ item }) => (<Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]} onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: item.id } })}>
          <View style={styles.iconBox}>
            <Ionicons name="wifi" size={22} color={colors.white}/>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted}/>
        </Pressable>)}/>);
}
const styles = StyleSheet.create({
    list: { flex: 1, backgroundColor: colors.bgLight },
    hero: {
        backgroundColor: colors.navy,
        paddingVertical: 36,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    heroSmall: { color: colors.muted, fontSize: 12, letterSpacing: 2 },
    heroTitle: {
        color: colors.white,
        fontSize: 30,
        fontWeight: '300',
        letterSpacing: 3,
        textAlign: 'center',
        marginTop: 10,
    },
    heroLine: { width: 48, height: 3, backgroundColor: colors.orange, marginTop: 16 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray,
        gap: 14,
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
    subtitle: { fontSize: 13, color: colors.muted, marginTop: 3 },
});
