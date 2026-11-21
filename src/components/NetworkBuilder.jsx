import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { defaultSession, promptFor, runCommand } from '../lib/cli';
import { addressesOf, newIfaces, pingCheck } from '../lib/network';
import { colors } from '../theme';

const SIZE = 64;
const MONO = Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'Consolas, monospace',
});
const META = {
    pc: { icon: 'desktop', prefix: 'PC', label: 'PC' },
    switch: { icon: 'git-network', prefix: 'SW', label: 'Switch' },
    router: { icon: 'radio', prefix: 'R', label: 'Router' },
};
const COMMANDS = [
    { group: 'On a PC', cmd: 'ipconfig', desc: 'Show the IP settings' },
    { group: 'On a PC', cmd: 'ipconfig 192.168.1.2 255.255.255.0', desc: 'Set IP address and subnet mask' },
    { group: 'On a PC', cmd: 'ipconfig 192.168.1.2 255.255.255.0 192.168.1.1', desc: 'Same, plus a default gateway' },
    { group: 'On a PC', cmd: 'ping 192.168.1.3', desc: 'Test the connection to another device' },
    { group: 'On a Router / Switch', cmd: 'enable', desc: 'Enter privileged mode (Router#)' },
    { group: 'On a Router / Switch', cmd: 'configure terminal', desc: 'Enter global configuration' },
    { group: 'On a Router / Switch', cmd: 'hostname R1', desc: 'Rename the device' },
    { group: 'On a Router / Switch', cmd: 'interface g0/0', desc: 'Select a router port' },
    { group: 'On a Router / Switch', cmd: 'ip address 192.168.1.1 255.255.255.0', desc: 'Set the port\'s IP address' },
    { group: 'On a Router / Switch', cmd: 'no shutdown', desc: 'Turn the port on' },
    { group: 'On a Router / Switch', cmd: 'exit', desc: 'Go back one level' },
    { group: 'On a Router / Switch', cmd: 'end', desc: 'Jump back to privileged mode' },
    { group: 'On a Router / Switch', cmd: 'show ip interface brief', desc: 'Summary of ports and IPs' },
    { group: 'On a Router / Switch', cmd: 'show running-config', desc: 'View the current configuration' },
    { group: 'On a Router / Switch', cmd: 'ping 192.168.1.2', desc: 'Test connectivity' },
];
const INTRO = [
    'Tap a device on the canvas to open its console.',
    'Type "help" to see the commands.',
];

function Cable({ a, b, color }) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    return (<View pointerEvents="none" style={{
            position: 'absolute',
            left: (a.x + b.x) / 2 - len / 2,
            top: (a.y + b.y) / 2 - 1.5,
            width: len,
            height: 3,
            backgroundColor: color,
            transform: [{ rotate: `${angle}rad` }],
        }}/>);
}

function DeviceNode(props) {
    const { device, selected } = props;
    const latest = useRef(props);
    latest.current = props;
    const start = useRef({ x: 0, y: 0 });
    const pan = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
            start.current = { x: latest.current.device.x, y: latest.current.device.y };
            latest.current.onSelect(latest.current.device.id);
        },
        onPanResponderMove: (_, g) => {
            const { device, mode, onMove, onCableDrag } = latest.current;
            if (mode === 'move') {
                onMove(device.id, start.current.x + g.dx, start.current.y + g.dy);
            }
            else {
                onCableDrag(device.id, {
                    x: start.current.x + SIZE / 2 + g.dx,
                    y: start.current.y + SIZE / 2 + g.dy,
                });
            }
        },
        onPanResponderRelease: (_, g) => {
            const { device, mode, onCableEnd } = latest.current;
            if (mode === 'cable') {
                onCableEnd(device.id, {
                    x: start.current.x + SIZE / 2 + g.dx,
                    y: start.current.y + SIZE / 2 + g.dy,
                });
            }
        },
    })).current;
    const label = device.kind === 'pc'
        ? device.ip ?? 'no IP'
        : device.kind === 'router'
            ? addressesOf(device)[0]?.ip ?? ''
            : '';
    return (<View {...pan.panHandlers} style={[styles.nodeWrap, { left: device.x, top: device.y }]}>
      <View style={[styles.node, selected && styles.nodeSelected]}>
        <Ionicons name={META[device.kind].icon} size={24} color={colors.white}/>
        <Text style={styles.nodeText} numberOfLines={1}>
          {device.name}
        </Text>
      </View>
      <Text style={styles.ipText} numberOfLines={1}>
        {label}
      </Text>
    </View>);
}

export default function NetworkBuilder({ onStateChange }) {
    const [devices, setDevices] = useState([]);
    const [links, setLinks] = useState([]);
    const [mode, setMode] = useState('move');
    const [drag, setDrag] = useState(null);
    const [size, setSize] = useState({ w: 320, h: 360 });
    const [message, setMessage] = useState('Add devices, then connect them with cables.');
    const [selectedId, setSelectedId] = useState(null);
    const [sessions, setSessions] = useState({});
    const [log, setLog] = useState(INTRO);
    const [input, setInput] = useState('');
    const [pingOpen, setPingOpen] = useState(false);
    const [pingSrcId, setPingSrcId] = useState(null);
    const [pingDstKey, setPingDstKey] = useState(null);

    useEffect(() => {
        onStateChange?.(devices, links);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [devices, links]);

    const counters = useRef({ pc: 0, switch: 0, router: 0 });
    const devicesRef = useRef(devices);
    devicesRef.current = devices;
    const linksRef = useRef(links);
    linksRef.current = links;
    const sizeRef = useRef(size);
    sizeRef.current = size;
    const selectedRef = useRef(selectedId);
    selectedRef.current = selectedId;
    const termRef = useRef(null);

    const selected = devices.find((d) => d.id === selectedId) ?? null;
    const session = selected ? sessions[selected.id] ?? defaultSession : defaultSession;

    // Ping panel: which PC sends, and which device/IP receives
    const pcs = devices.filter((d) => d.kind === 'pc');
    const pingSrc = pcs.find((d) => d.id === pingSrcId) ||
        (selected && selected.kind === 'pc' ? selected : null) ||
        pcs[0] ||
        null;
    const pingTargets = [];
    devices.forEach((d) => {
        if (!pingSrc || d.id === pingSrc.id || d.kind === 'switch')
            return;
        const addrs = addressesOf(d);
        if (addrs.length === 0) {
            pingTargets.push({ key: d.id, label: `${d.name} (no active IP)`, ip: null });
        }
        else {
            addrs.forEach((a) => pingTargets.push({ key: `${d.id}-${a.ip}`, label: `${d.name} - ${a.ip}`, ip: a.ip }));
        }
    });
    const pingDst = pingTargets.find((t) => t.key === pingDstKey && t.ip) || null;

    const center = (id) => {
        const d = devices.find((x) => x.id === id);
        return d ? { x: d.x + SIZE / 2, y: d.y + SIZE / 2 } : null;
    };
    const select = (id) => {
        if (id === selectedRef.current)
            return;
        const d = devicesRef.current.find((x) => x.id === id);
        selectedRef.current = id;
        setSelectedId(id);
        if (d)
            setLog((p) => [...p, `--- Console: ${d.name} ---`]);
    };
    const addDevice = (kind) => {
        counters.current[kind] += 1;
        const n = devices.length;
        const device = {
            id: `${kind}${counters.current[kind]}`,
            kind,
            name: `${META[kind].prefix}${counters.current[kind]}`,
            x: 16 + (n % 3) * 80,
            y: 16 + Math.floor(n / 3) * 92,
            ifaces: newIfaces(kind),
        };
        setDevices([...devices, device]);
        selectedRef.current = device.id;
        setSelectedId(device.id);
        setLog((p) => [...p, `--- Console: ${device.name} ---`]);
        setMessage(`${device.name} added. Drag it where you want it.`);
    };
    const moveDevice = (id, x, y) => {
        const { w, h } = sizeRef.current;
        const cx = Math.max(0, Math.min(w - SIZE, x));
        const cy = Math.max(0, Math.min(h - SIZE - 16, y));
        setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, x: cx, y: cy } : d)));
    };
    const dragCable = (id, to) => setDrag({ from: id, to });
    const endCable = (fromId, point) => {
        setDrag(null);
        const target = devicesRef.current.find((d) => d.id !== fromId &&
            point.x >= d.x &&
            point.x <= d.x + SIZE &&
            point.y >= d.y &&
            point.y <= d.y + SIZE);
        if (!target) {
            setMessage('Drop the cable onto another device.');
            return;
        }
        const exists = linksRef.current.some((l) => (l.a === fromId && l.b === target.id) || (l.a === target.id && l.b === fromId));
        if (exists) {
            setMessage('Those devices are already connected.');
            return;
        }
        setLinks([...linksRef.current, { a: fromId, b: target.id }]);
        const fromName = devicesRef.current.find((d) => d.id === fromId)?.name;
        setMessage(`Connected ${fromName} to ${target.name}.`);
    };
    const exec = (dev, cmd) => {
        const sess = sessions[dev.id] ?? defaultSession;
        const line = `${promptFor(dev, sess)} ${cmd}`;
        if (!cmd.trim()) {
            setLog((p) => [...p, line]);
            return;
        }
        const res = runCommand(cmd, dev, sess, devices, links);
        setDevices(res.devices);
        setSessions((s) => ({ ...s, [dev.id]: res.session }));
        setLog((p) => (res.clear ? [] : [...p, line, ...res.out]));
    };
    const submit = () => {
        if (!selected) {
            setMessage('Tap a device first to open its console.');
            return;
        }
        exec(selected, input);
        setInput('');
    };
    const sendPing = () => {
        if (!pingSrc) {
            setMessage('Add a PC first.');
            return;
        }
        if (!pingDst) {
            setMessage('Choose a device to ping.');
            return;
        }
        select(pingSrc.id);
        exec(pingSrc, `ping ${pingDst.ip}`);
        const r = pingCheck(pingSrc, pingDst.ip, devices, links);
        setMessage(r.ok
            ? `Ping ${pingSrc.name} to ${pingDst.name}: reply received. Success!`
            : `Ping ${pingSrc.name} to ${pingDst.name}: request timed out. ${r.hint}`);
    };
    const deleteSelected = () => {
        if (!selectedId) {
            setMessage('Tap a device first, then press Delete.');
            return;
        }
        const dev = devices.find((d) => d.id === selectedId);
        if (!dev)
            return;
        setDevices(devices.filter((d) => d.id !== selectedId));
        setLinks(links.filter((l) => l.a !== selectedId && l.b !== selectedId));
        setSessions((s) => {
            const next = { ...s };
            delete next[selectedId];
            return next;
        });
        selectedRef.current = null;
        setSelectedId(null);
        setDrag(null);
        setLog((p) => [...p, `--- ${dev.name} deleted ---`]);
        setMessage(`${dev.name} deleted along with its cables.`);
    };
    const clear = () => {
        setDevices([]);
        setLinks([]);
        setDrag(null);
        setSelectedId(null);
        setSessions({});
        setLog(INTRO);
        setInput('');
        counters.current = { pc: 0, switch: 0, router: 0 };
        setMessage('Canvas cleared.');
    };
    const onLayout = (e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
    const dragFrom = drag ? center(drag.from) : null;
    const groups = ['On a PC', 'On a Router / Switch'];

    return (<View style={styles.wrap}>
      <Text style={styles.heading}>Network Builder</Text>

      <View style={styles.toolbar}>
        {['pc', 'switch', 'router'].map((k) => (<Pressable key={k} style={styles.btn} onPress={() => addDevice(k)}>
            <Ionicons name={META[k].icon} size={16} color={colors.white}/>
            <Text style={styles.btnText}>+ {META[k].label}</Text>
          </Pressable>))}
      </View>

      <View style={styles.toolbar}>
        <Pressable style={[styles.btn, mode === 'move' && styles.btnActive]} onPress={() => setMode('move')}>
          <Text style={styles.btnText}>Move</Text>
        </Pressable>
        <Pressable style={[styles.btn, mode === 'cable' && styles.btnActive]} onPress={() => setMode('cable')}>
          <Text style={styles.btnText}>Cable</Text>
        </Pressable>
        <Pressable style={[styles.btn, selected ? styles.btnDanger : { opacity: 0.45 }]} onPress={deleteSelected}>
          <Ionicons name="trash" size={16} color={colors.white}/>
          <Text style={styles.btnText}>Delete{selected ? ` ${selected.name}` : ''}</Text>
        </Pressable>
        <Pressable style={[styles.btn, pingOpen && styles.btnActive]} onPress={() => setPingOpen(!pingOpen)}>
          <Ionicons name="pulse" size={16} color={colors.white}/>
          <Text style={styles.btnText}>Ping</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={clear}>
          <Text style={styles.btnText}>Clear</Text>
        </Pressable>
      </View>

      {pingOpen && (<View style={styles.pingBox}>
          {pcs.length === 0 ? (<Text style={styles.hint}>Add at least one PC to send a ping.</Text>) : (<>
              <Text style={styles.pingLabel}>From (PC)</Text>
              <View style={styles.chipRow}>
                {pcs.map((d) => (<Pressable key={d.id} onPress={() => setPingSrcId(d.id)} style={[styles.chip, pingSrc?.id === d.id && styles.chipActive]}>
                    <Text style={[styles.chipText, pingSrc?.id === d.id && { color: colors.white }]}>
                      {d.name}
                    </Text>
                  </Pressable>))}
              </View>

              <Text style={styles.pingLabel}>To</Text>
              <View style={styles.chipRow}>
                {pingTargets.length === 0 ? (<Text style={styles.hint}>Add another PC or a router to ping.</Text>) : (pingTargets.map((t) => (<Pressable key={t.key} disabled={!t.ip} onPress={() => setPingDstKey(t.key)} style={[
                    styles.chip,
                    pingDst?.key === t.key && styles.chipActive,
                    !t.ip && { opacity: 0.45 },
                ]}>
                      <Text style={[styles.chipText, pingDst?.key === t.key && { color: colors.white }]}>
                        {t.label}
                      </Text>
                    </Pressable>)))}
              </View>

              <Pressable style={[styles.btn, styles.btnActive, { alignSelf: 'flex-start', marginTop: 4 }, !pingDst && { opacity: 0.5 }]} onPress={sendPing}>
                <Ionicons name="paper-plane" size={16} color={colors.white}/>
                <Text style={styles.btnText}>Send ping</Text>
              </Pressable>
              <Text style={styles.hint}>
                Set IP addresses first (tap a PC and use ipconfig), then cable the devices.
              </Text>
            </>)}
        </View>)}

      <View style={[styles.canvas, { userSelect: 'none' }]} onLayout={onLayout}>
        {links.map((l, i) => {
            const a = center(l.a);
            const b = center(l.b);
            return a && b ? <Cable key={i} a={a} b={b} color={colors.orange}/> : null;
        })}
        {drag && dragFrom && <Cable a={dragFrom} b={drag.to} color={colors.muted}/>}
        {devices.map((d) => (<DeviceNode key={d.id} device={d} selected={d.id === selectedId} mode={mode} onSelect={select} onMove={moveDevice} onCableDrag={dragCable} onCableEnd={endCable}/>))}
        {devices.length === 0 && (<Text style={styles.empty}>Tap "+ PC", "+ Switch" or "+ Router"</Text>)}
      </View>

      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>
        Move mode: drag devices. Cable mode: drag from one device onto another.
      </Text>

      {/* CLI */}
      <View style={styles.terminal}>
        <Text style={styles.termHead}>
          CONSOLE {selected ? `- ${selected.name}` : ''}
        </Text>
        <ScrollView ref={termRef} style={styles.termScroll} nestedScrollEnabled onContentSizeChange={() => termRef.current?.scrollToEnd({ animated: false })}>
          {log.map((line, i) => (<Text key={i} style={styles.termText}>
              {line === '' ? ' ' : line}
            </Text>))}
        </ScrollView>
        <View style={styles.inputRow}>
          <Text style={styles.termText}>
            {selected ? promptFor(selected, session) : '>'}{' '}
          </Text>
          <TextInput style={[styles.input, { outlineStyle: 'none' }]} value={input} onChangeText={setInput} onSubmitEditing={submit} submitBehavior="submit" autoCapitalize="none" autoCorrect={false} spellCheck={false} placeholder="type a command and press Enter" placeholderTextColor="#4b5b6b"/>
        </View>
      </View>

      {/* Command reference */}
      <View style={styles.ref}>
        <Text style={styles.heading}>Basic commands</Text>
        <Text style={styles.hint}>Tap a command to copy it into the console.</Text>
        {groups.map((g) => (<View key={g} style={{ marginTop: 10 }}>
            <Text style={styles.refGroup}>{g}</Text>
            {COMMANDS.filter((c) => c.group === g).map((c) => (<Pressable key={c.cmd} onPress={() => setInput(c.cmd)} style={({ pressed }) => [styles.refRow, pressed && { opacity: 0.6 }]}>
                <Text style={styles.refCmd}>{c.cmd}</Text>
                <Text style={styles.refDesc}>{c.desc}</Text>
              </Pressable>))}
          </View>))}
      </View>
    </View>);
}

const styles = StyleSheet.create({
    wrap: {
        backgroundColor: colors.white,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray,
        padding: 14,
    },
    heading: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.orange,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    toolbar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colors.navy,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    btnActive: { backgroundColor: colors.orange },
    btnDanger: { backgroundColor: '#c62828' },
    btnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
    pingBox: {
        backgroundColor: colors.bgLight,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 6,
        padding: 12,
        marginTop: 4,
        marginBottom: 8,
        gap: 8,
    },
    pingLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.orange,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray,
        backgroundColor: colors.white,
    },
    chipActive: { backgroundColor: colors.orange, borderColor: colors.orange },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.navy },
    canvas: {
        height: 360,
        backgroundColor: colors.navyDark,
        borderRadius: 6,
        overflow: 'hidden',
        marginTop: 4,
    },
    nodeWrap: { position: 'absolute', width: SIZE, alignItems: 'center' },
    node: {
        width: SIZE,
        height: SIZE,
        borderRadius: 8,
        backgroundColor: colors.navy,
        borderWidth: 2,
        borderColor: colors.orange,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    nodeSelected: { borderColor: colors.white },
    nodeText: { color: colors.white, fontSize: 10, marginTop: 2, fontWeight: '600' },
    ipText: {
        width: 120,
        textAlign: 'center',
        color: colors.muted,
        fontSize: 10,
        marginTop: 2,
    },
    empty: {
        color: colors.muted,
        textAlign: 'center',
        marginTop: 150,
        fontSize: 13,
    },
    message: { marginTop: 10, fontSize: 14, color: colors.text, fontWeight: '600' },
    hint: { marginTop: 4, fontSize: 12, color: colors.muted },
    terminal: {
        backgroundColor: '#0a0f14',
        borderRadius: 6,
        marginTop: 14,
        padding: 10,
    },
    termHead: { color: colors.muted, fontSize: 11, letterSpacing: 1, marginBottom: 6 },
    termScroll: { height: 180 },
    termText: { color: '#7cfc9a', fontFamily: MONO, fontSize: 12, lineHeight: 17 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    input: {
        flex: 1,
        color: '#ffffff',
        fontFamily: MONO,
        fontSize: 12,
        padding: 0,
    },
    ref: { marginTop: 14 },
    refGroup: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.navy,
        marginBottom: 4,
    },
    refRow: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray,
    },
    refCmd: { fontFamily: MONO, fontSize: 12, color: colors.orange },
    refDesc: { fontSize: 12, color: colors.muted, marginTop: 1 },
});