import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProgress } from '../lib/progress';
import { colors } from '../theme';

const STEPS = [
    {
        key: 'lesson1',
        label: 'Lesson 1 viewed',
        next: 'Open Lesson 1',
        go: () => router.push({ pathname: '/lesson/[id]', params: { id: '1' } }),
    },
    {
        key: 'lesson2',
        label: 'Lesson 2 viewed',
        next: 'Open Lesson 2',
        go: () => router.push({ pathname: '/lesson/[id]', params: { id: '2' } }),
    },
    {
        key: 'quiz1',
        label: 'Quiz 1 passed',
        next: 'Take Quiz 1',
        go: () => router.push({ pathname: '/quiz/[id]', params: { id: '1' } }),
    },
    {
        key: 'quiz2',
        label: 'Quiz 2 completed',
        next: 'Take Quiz 2',
        go: () => router.push({ pathname: '/quiz/[id]', params: { id: '2' } }),
    },
];

export default function ProgressCard() {
    const { data, percent } = useProgress();
    const next = STEPS.find((s) => !data[s.key]);

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
                        percent === 100 && { backgroundColor: '#2e9b57' },
                    ]}
                />
            </View>

            {STEPS.map((s) => (
                <View key={s.key} style={styles.step}>
                    <Ionicons
                        name={data[s.key] ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={data[s.key] ? '#2e9b57' : colors.muted}
                    />
                    <Text style={[styles.stepText, data[s.key] && { color: colors.navy }]}>
                        {s.label}
                    </Text>
                    <Text style={styles.pts}>25%</Text>
                </View>
            ))}

            {next ? (
                <Pressable style={styles.reminder} onPress={next.go}>
                    <Ionicons name="alarm" size={18} color={colors.white} />
                    <Text style={styles.reminderText}>Next step: {next.next}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.white} />
                </Pressable>
            ) : (
                <Text style={styles.done}>All modules completed. Great work!</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
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
        marginBottom: 14,
    },
    fill: { height: 10, borderRadius: 5, backgroundColor: colors.orange },
    step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
    stepText: { flex: 1, fontSize: 14, color: colors.muted },
    pts: { fontSize: 12, color: colors.muted },
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
    done: { color: '#2e9b57', fontWeight: '700', marginTop: 12 },
});