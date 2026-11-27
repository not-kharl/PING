import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, } from 'react-native';
import { useAuth } from '../lib/auth';
import { colors, themedStyles, useTheme } from '../theme';

export default function Login() {
  const { ui } = useTheme();
    const { signIn, signUp } = useAuth();
    const { mode } = useLocalSearchParams();
    const [register, setRegister] = useState(mode === 'register');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        if (busy)
            return;
        setBusy(true);
        setError('');
        const err = register
            ? await signUp(name, username, password)
            : await signIn(username, password);
        if (err)
            setError(err);
        setBusy(false);
    };
    return (<KeyboardAvoidingView style={{ flex: 1, backgroundColor: ui.header }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.small}>WELCOME TO</Text>
        <Text style={styles.title}>NETWORKING{'\n'}FUNDAMENTALS</Text>
        <View style={styles.line}/>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{register ? 'Create account' : 'Log in'}</Text>

          {register && (<TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={setName}/>)}
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor={colors.muted} autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername}/>
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry autoCapitalize="none" value={password} onChangeText={setPassword} onSubmitEditing={submit}/>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={[styles.button, busy && { opacity: 0.6 }]} onPress={submit}>
            <Text style={styles.buttonText}>
              {register ? 'SIGN UP' : 'LOG IN'}
            </Text>
          </Pressable>

          <Pressable onPress={() => {
            setRegister(!register);
            setError('');
        }}>
            <Text style={styles.switch}>
              {register
            ? 'Already have an account? Log in'
            : "No account yet? Sign up as a student"}
            </Text>
          </Pressable>
        </View>

        {!register && (<Text style={styles.demo}>Demo admin: admin / admin123</Text>)}
      </ScrollView>
    </KeyboardAvoidingView>);
}
const styles = themedStyles({
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    small: { color: colors.muted, fontSize: 12, letterSpacing: 2 },
    title: {
        color: colors.white,
        fontSize: 30,
        fontWeight: '300',
        letterSpacing: 3,
        textAlign: 'center',
        marginTop: 10,
    },
    line: { width: 48, height: 3, backgroundColor: colors.orange, marginTop: 16, marginBottom: 28 },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: colors.white,
        borderRadius: 6,
        padding: 20,
        gap: 12,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
    input: {
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 15,
        color: colors.text,
        backgroundColor: colors.bgLight,
    },
    error: { color: '#c62828', fontSize: 13 },
    button: {
        backgroundColor: colors.orange,
        paddingVertical: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: { color: colors.white, fontWeight: '700', letterSpacing: 2 },
    switch: { color: colors.navy, fontSize: 13, textAlign: 'center', marginTop: 4 },
    demo: { color: colors.muted, fontSize: 12, marginTop: 18 },
});
