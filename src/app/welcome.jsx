import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { lessons } from '../data/lessons';
import { colors } from '../theme';

const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'Consolas, monospace',
});

const FEATURES = [
  {
    icon: 'terminal',
    title: 'Cisco-style Console',
    body: 'Type real IOS commands like enable, configure terminal and ip address, and see how the device responds.',
  },
  {
    icon: 'git-network',
    title: 'Drag-and-drop Playground',
    body: 'Place PCs, switches and routers, drag cables between them, and build a working network in the browser.',
  },
  {
    icon: 'checkmark-done',
    title: 'Ping That Checks Your Work',
    body: 'Pings succeed or fail based on IP addresses, subnet masks, gateways and cables, with hints when something is wrong.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Student and Admin Roles',
    body: 'Students learn and practice. Admins manage accounts and see who is enrolled.',
  },
];

const SNIPPETS = [
  {
    label: 'Same network',
    code: [
      'PC1> ipconfig 192.168.1.2 255.255.255.0',
      'PC2> ipconfig 192.168.1.3 255.255.255.0',
      'PC1> ping 192.168.1.3',
    ],
    output: [
      'Pinging 192.168.1.3 with 32 bytes of data:',
      'Reply from 192.168.1.3: bytes=32 time<1ms TTL=128',
      'Reply from 192.168.1.3: bytes=32 time<1ms TTL=128',
      'Reply from 192.168.1.3: bytes=32 time<1ms TTL=128',
      'Reply from 192.168.1.3: bytes=32 time<1ms TTL=128',
      'Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
    ],
    ok: true,
  },
  {
    label: 'Wrong network',
    code: [
      'PC1> ipconfig 192.168.1.2 255.255.255.0',
      'PC2> ipconfig 192.168.2.3 255.255.255.0',
      'PC1> ping 192.168.2.3',
    ],
    output: [
      'Pinging 192.168.2.3 with 32 bytes of data:',
      'Request timed out.',
      'Request timed out.',
      'Request timed out.',
      'Request timed out.',
      'Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)',
      'Hint: 192.168.2.3 is on another network and PC1 has no default gateway.',
    ],
    ok: false,
  },
  {
    label: 'Router setup',
    code: [
      'R1> enable',
      'R1# configure terminal',
      'R1(config)# interface g0/0',
      'R1(config-if)# ip address 192.168.1.1 255.255.255.0',
      'R1(config-if)# no shutdown',
      'R1(config-if)# end',
      'R1# show ip interface brief',
    ],
    output: [
      'Interface            IP-Address     Status   Protocol',
      'GigabitEthernet0/0   192.168.1.1    up       up',
      'GigabitEthernet0/1   unassigned     admin down  down',
      'GigabitEthernet0/2   unassigned     admin down  down',
    ],
    ok: true,
  },
];

function Button({ label, onPress, variant = 'solid', small }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        variant === 'solid' && styles.btnSolid,
        variant === 'outline' && styles.btnOutline,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          small && { fontSize: 12 },
          variant === 'outline' && { color: colors.white },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Section({ small, title, subtitle, children, onLayout, dark }) {
  return (
    <View
      onLayout={onLayout}
      style={[styles.section, dark && { backgroundColor: colors.white }]}
    >
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>{small}</Text>
        <Text style={styles.h2}>{title}</Text>
        {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
        {children}
      </View>
    </View>
  );
}

export default function Welcome() {
  const { width } = useWindowDimensions();
  const wide = width >= 860;
  const scroller = useRef(null);
  const ys = useRef({});
  const [pick, setPick] = useState(0);
  const [ran, setRan] = useState(false);

  const goLogin = () => router.push('/login');
  const goRegister = () =>
    router.push({ pathname: '/login', params: { mode: 'register' } });

  const jump = (key) =>
    scroller.current?.scrollTo({ y: ys.current[key] ?? 0, animated: true });
  const track = (key) => (e) => {
    ys.current[key] = e.nativeEvent.layout.y;
  };

  const snippet = SNIPPETS[pick];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgLight }}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <View style={styles.navInner}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="wifi" size={16} color={colors.white} />
            </View>
            <Text style={styles.brandText}>PING</Text>
          </View>
          {wide && (
            <View style={styles.links}>
              <Pressable onPress={() => jump('features')}>
                <Text style={styles.link}>Features</Text>
              </Pressable>
              <Pressable onPress={() => jump('try')}>
                <Text style={styles.link}>Try It</Text>
              </Pressable>
              <Pressable onPress={() => jump('modules')}>
                <Text style={styles.link}>Lessons</Text>
              </Pressable>
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button label="Sign In" variant="outline" small onPress={goLogin} />
            <Button label="Register" small onPress={goRegister} />
          </View>
        </View>
      </View>

      <ScrollView ref={scroller}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.inner, wide && styles.heroRow]}>
            <View style={wide ? { flex: 1, paddingRight: 24 } : undefined}>
              <Text style={styles.eyebrowLight}>E-LEARNING MANAGEMENT SYSTEM</Text>
              <Text style={styles.h1}>Interactive Networking Fundamentals Portal</Text>
              <Text style={styles.heroText}>
                Practice IP addressing, build networks with drag-and-drop, and type
                Cisco-style commands, all inside your browser or phone.
              </Text>
              <View style={styles.ctaRow}>
                <Button label="Student Enrollment" onPress={goRegister} />
                <Button label="Account Login" variant="outline" onPress={goLogin} />
              </View>
              <View style={styles.stats}>
                <View>
                  <Text style={styles.statNum}>{lessons.length}</Text>
                  <Text style={styles.statLabel}>Core Lessons</Text>
                </View>
                <View>
                  <Text style={styles.statNum}>100%</Text>
                  <Text style={styles.statLabel}>In-App Simulator</Text>
                </View>
                <View>
                  <Text style={styles.statNum}>2</Text>
                  <Text style={styles.statLabel}>Student and Admin Roles</Text>
                </View>
              </View>
            </View>

            {/* Fake window */}
            <View style={[styles.window, wide ? { flex: 1 } : { marginTop: 32 }]}>
              <View style={styles.winBar}>
                <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
                <View style={[styles.dot, { backgroundColor: '#febc2e' }]} />
                <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
                <Text style={styles.winTitle}>PING_Lab01 - Network Workspace</Text>
              </View>
              <View style={styles.winBody}>
                <View style={styles.winSide}>
                  <Text style={styles.winSideHead}>DEVICES</Text>
                  <Text style={styles.winSideItem}>PC1</Text>
                  <Text style={styles.winSideItem}>PC2</Text>
                  <Text style={styles.winSideItem}>SW1</Text>
                  <Text style={styles.winSideItem}>R1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.code}>PC1&gt; ipconfig 192.168.1.2 255.255.255.0</Text>
                  <Text style={styles.code}>PC1&gt; ping 192.168.1.3</Text>
                  <Text style={[styles.code, { color: '#7cfc9a' }]}>
                    Reply from 192.168.1.3: bytes=32 time&lt;1ms
                  </Text>
                  <Text style={[styles.code, { color: '#7cfc9a', marginTop: 6 }]}>
                    Output: Ping Successful
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features */}
        <Section
          small="SYSTEM OVERVIEW"
          title="Key Capabilities & Features"
          subtitle="Everything you need to learn networking and practice what you learn."
          onLayout={track('features')}
          dark
        >
          <View style={[styles.grid, wide && { flexDirection: 'row' }]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.card, wide && { flex: 1 }]}>
                <View style={styles.iconBox}>
                  <Ionicons name={f.icon} size={22} color={colors.white} />
                </View>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardBody}>{f.body}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Sandbox */}
        <Section
          small="LIVE DEMO"
          title="Network Command Sandbox"
          subtitle="Pick a scenario and run it to see what the console shows."
          onLayout={track('try')}
        >
          <View style={styles.tabs}>
            {SNIPPETS.map((s, i) => (
              <Pressable
                key={s.label}
                onPress={() => {
                  setPick(i);
                  setRan(false);
                }}
                style={[styles.tab, pick === i && styles.tabActive]}
              >
                <Text style={[styles.tabText, pick === i && { color: colors.white }]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.sandbox, wide && { flexDirection: 'row' }]}>
            <View style={[styles.pane, wide && { flex: 1 }]}>
              <Text style={styles.paneHead}>COMMANDS</Text>
              {snippet.code.map((l, i) => (
                <Text key={i} style={styles.code}>
                  {l}
                </Text>
              ))}
              <Pressable style={styles.run} onPress={() => setRan(true)}>
                <Ionicons name="play" size={14} color={colors.white} />
                <Text style={styles.runText}>RUN OUTPUT</Text>
              </Pressable>
            </View>
            <View style={[styles.pane, wide && { flex: 1 }]}>
              <Text style={styles.paneHead}>EXECUTION OUTPUT</Text>
              {ran ? (
                snippet.output.map((l, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.code,
                      { color: snippet.ok ? '#7cfc9a' : '#ff8a80' },
                    ]}
                  >
                    {l}
                  </Text>
                ))
              ) : (
                <Text style={[styles.code, { color: colors.muted }]}>
                  Click "Run Output" to execute...
                </Text>
              )}
              <Text style={styles.status}>
                Status: {ran ? (snippet.ok ? 'Success' : 'Failed') : 'Ready'}
              </Text>
            </View>
          </View>
        </Section>

        {/* Modules */}
        <Section
          small="CURRICULUM OUTLINE"
          title="Course Modules & Topics"
          onLayout={track('modules')}
          dark
        >
          {lessons.map((l, i) => (
            <View key={l.id} style={styles.module}>
              <View style={styles.modTag}>
                <Text style={styles.modTagText}>LESSON {i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{l.title.replace(/^Lesson \d+ - /, '')}</Text>
                <Text style={styles.cardBody}>{l.topic}</Text>
              </View>
            </View>
          ))}
          <View style={{ marginTop: 20, alignSelf: 'flex-start' }}>
            <Button label="Start Learning" onPress={goRegister} />
          </View>
        </Section>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footInner}>
            <Text style={styles.footBrand}>PING Learning System</Text>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <Pressable onPress={goLogin}>
                <Text style={styles.footLink}>Portal Login</Text>
              </Pressable>
              <Pressable onPress={goRegister}>
                <Text style={styles.footLink}>Register</Text>
              </Pressable>
              <Pressable onPress={() => jump('features')}>
                <Text style={styles.footLink}>Features</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.copy}>
            © {new Date().getFullYear()} PING | Networking Fundamentals Project
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { backgroundColor: colors.black, paddingVertical: 12, paddingHorizontal: 16 },
  navInner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 3 },
  links: { flexDirection: 'row', gap: 26 },
  link: { color: colors.muted, fontSize: 13, letterSpacing: 1 },

  inner: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  hero: { backgroundColor: colors.navy, paddingVertical: 48, paddingHorizontal: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  eyebrowLight: { color: colors.orangeSoft, fontSize: 12, letterSpacing: 3, marginBottom: 12 },
  h1: {
    color: colors.white,
    fontSize: 38,
    fontWeight: '300',
    letterSpacing: 1,
    lineHeight: 46,
  },
  heroText: { color: '#b8c3cf', fontSize: 16, lineHeight: 25, marginTop: 16, maxWidth: 520 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 24 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 28, marginTop: 32 },
  statNum: { color: colors.orange, fontSize: 24, fontWeight: '700' },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },

  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 4 },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14 },
  btnSolid: { backgroundColor: colors.orange },
  btnOutline: { borderWidth: 1, borderColor: colors.muted },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 13, letterSpacing: 1 },

  window: {
    backgroundColor: colors.navyDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2b3d52',
    overflow: 'hidden',
  },
  winBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    backgroundColor: '#0f1925',
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  winTitle: { color: colors.muted, fontSize: 11, marginLeft: 8 },
  winBody: { flexDirection: 'row', padding: 14, gap: 14 },
  winSide: { width: 90, borderRightWidth: 1, borderRightColor: '#2b3d52', paddingRight: 10 },
  winSideHead: { color: colors.muted, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  winSideItem: { color: colors.white, fontSize: 12, paddingVertical: 2 },
  code: { color: '#d7e0ea', fontFamily: MONO, fontSize: 12, lineHeight: 19 },

  section: { paddingVertical: 48, paddingHorizontal: 20 },
  eyebrow: { color: colors.orange, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
  h2: { color: colors.navy, fontSize: 28, fontWeight: '300', marginTop: 8 },
  sub: { color: colors.muted, fontSize: 15, marginTop: 8, marginBottom: 8 },

  grid: { gap: 14, marginTop: 20 },
  card: {
    backgroundColor: colors.bgLight,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 18,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 4,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  cardBody: { fontSize: 14, lineHeight: 21, color: colors.text },

  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 14 },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    backgroundColor: colors.gray,
  },
  tabActive: { backgroundColor: colors.orange },
  tabText: { color: colors.navy, fontSize: 13, fontWeight: '600' },
  sandbox: { gap: 12 },
  pane: { backgroundColor: colors.navyDark, borderRadius: 6, padding: 16, minHeight: 200 },
  paneHead: { color: colors.muted, fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  run: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.orange,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 4,
    marginTop: 14,
  },
  runText: { color: colors.white, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  status: { color: colors.muted, fontSize: 12, marginTop: 14 },

  module: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: colors.bgLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
    borderRadius: 4,
    padding: 16,
    marginTop: 12,
  },
  modTag: {
    backgroundColor: colors.navy,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  modTagText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  footer: { backgroundColor: colors.black, paddingVertical: 28, paddingHorizontal: 20 },
  footInner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  footBrand: { color: colors.white, fontWeight: '700', letterSpacing: 1 },
  footLink: { color: colors.muted, fontSize: 13 },
  copy: { color: '#5b6773', fontSize: 12, textAlign: 'center', marginTop: 20 },
});