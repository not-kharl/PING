import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { pingCheck } from '../lib/network';
import { colors, themedStyles, useTheme } from '../theme';
import NetworkBuilder from './NetworkBuilder';

const GATEWAY = '192.168.10.1';
const MASK = '255.255.255.0';
const PC_A = '192.168.10.2';
const PC_B = '192.168.10.3';

const parts = (devices) => ({
    pcs: devices.filter((d) => d.kind === 'pc'),
    sw: devices.find((d) => d.kind === 'switch'),
    router: devices.find((d) => d.kind === 'router'),
});

const linked = (links, a, b) =>
    !!a &&
    !!b &&
    links.some(
        (l) => (l.a === a.id && l.b === b.id) || (l.a === b.id && l.b === a.id)
    );

const pcWith = (pcs, ip) =>
    pcs.find((p) => p.ip === ip && p.mask === MASK && p.gateway === GATEWAY);

const TASKS = [
    {
        title: 'Add the devices',
        hint: 'Tap "+ PC" twice, then "+ Switch" and "+ Router".',
        check: ({ pcs, sw, router }) => pcs.length >= 2 && !!sw && !!router,
    },
    {
        title: 'Connect the first PC to the switch',
        hint: 'Press "Cable", then drag from a PC onto the switch.',
        check: ({ pcs, sw }, links) => pcs.some((p) => linked(links, p, sw)),
    },
    {
        title: 'Connect the second PC to the switch',
        hint: 'Still in Cable mode, drag from the other PC onto the switch.',
        check: ({ pcs, sw }, links) =>
            pcs.filter((p) => linked(links, p, sw)).length >= 2,
    },
    {
        title: 'Connect the switch to the router',
        hint: 'Drag from the switch onto the router.',
        check: ({ sw, router }, links) => linked(links, sw, router),
    },
    {
        title: 'Configure the router port',
        hint: `Tap the router and type, one line at a time: enable, configure terminal, g0/0/0, ip address ${GATEWAY} ${MASK}, no shutdown`,
        check: ({ router }) =>
            !!router &&
            Object.values(router.ifaces).some(
                (i) => i.ip === GATEWAY && i.mask === MASK && i.up
            ),
    },
    {
        title: 'Configure the first PC',
        hint: `Tap a PC and type: ipconfig ${PC_A} ${MASK} ${GATEWAY}`,
        check: ({ pcs }) => !!pcWith(pcs, PC_A),
    },
    {
        title: 'Configure the second PC',
        hint: `Tap the other PC and type: ipconfig ${PC_B} ${MASK} ${GATEWAY}`,
        check: ({ pcs }) => !!pcWith(pcs, PC_B),
    },
    {
        title: 'Ping across the network',
        hint: `On the first PC (${PC_A}) type: ping ${PC_B}`,
        check: ({ pcs }, links, devices) => {
            const a = pcWith(pcs, PC_A);
            const b = pcWith(pcs, PC_B);
            return (
                !!a &&
                !!b &&
                pingCheck(a, PC_B, devices, links).ok &&
                pingCheck(a, GATEWAY, devices, links).ok
            );
        },
    },
];

export default function LabChallenge({ onComplete }) {
  useTheme();
    const [state, setState] = useState({ devices: [], links: [] });

    const p = parts(state.devices);
    let alive = true;
    const done = TASKS.map((t) => {
        let ok = false;
        try {
            ok = !!t.check(p, state.links, state.devices);
        } catch {
            ok = false;
        }
        alive = alive && ok; // each step needs all earlier steps
        return alive;
    });
    const current = done.indexOf(false);
    const complete = current === -1;
    const count = done.filter(Boolean).length;

    useEffect(() => {
        if (complete) onComplete?.();
    }, [complete]);

    return (
        <View>
            <View style={styles.box}>
                <View style={styles.head}>
                    <Text style={styles.heading}>Lab checklist</Text>
                    <Text style={styles.count}>
                        {count}/{TASKS.length}
                    </Text>
                </View>
                <View style={styles.track}>
                    <View
                        style={[styles.fill, { width: `${(count / TASKS.length) * 100}%` }]}
                    />
                </View>

                {TASKS.map((t, i) => {
                    const isDone = done[i];
                    const isCurrent = i === current;
                    return (
                        <View
                            key={t.title}
                            style={[styles.task, isCurrent && styles.taskCurrent, !isDone && !isCurrent && { opacity: 0.45 }]}
                        >
                            <Ionicons
                                name={isDone ? 'checkmark-circle' : isCurrent ? 'radio-button-on' : 'ellipse-outline'}
                                size={22}
                                color={isDone ? '#2e9b57' : isCurrent ? colors.orange : colors.muted}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.taskTitle}>
                                    {i + 1}. {t.title}
                                </Text>
                                {isCurrent && <Text style={styles.hint}>{t.hint}</Text>}
                            </View>
                        </View>
                    );
                })}

                {complete && (
                    <Text style={styles.success}>
                        Lab complete! Your network is built and configured correctly.
                    </Text>
                )}
            </View>

            <View style={{ marginTop: 14 }}>
                <NetworkBuilder
                    onStateChange={(devices, links) => setState({ devices, links })}
                />
            </View>
        </View>
    );
}

const styles = themedStyles({
    box: {
        backgroundColor: colors.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray,
        padding: 14,
    },
    head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    heading: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.orange,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    count: { fontSize: 13, fontWeight: '700', color: colors.navy },
    track: { height: 8, borderRadius: 4, backgroundColor: colors.gray, marginBottom: 12 },
    fill: { height: 8, borderRadius: 4, backgroundColor: colors.orange },
    task: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        padding: 10,
        borderRadius: 4,
        marginBottom: 6,
    },
    taskCurrent: {
        backgroundColor: colors.bgLight,
        borderLeftWidth: 4,
        borderLeftColor: colors.orange,
    },
    taskTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
    hint: { fontSize: 13, color: colors.text, marginTop: 4, lineHeight: 19 },
    success: { color: '#2e9b57', fontWeight: '700', marginTop: 10 },
});