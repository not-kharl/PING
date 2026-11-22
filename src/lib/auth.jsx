import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const USERS_KEY = 'ping.users';
const SESSION_KEY = 'ping.session';

// The login session lives only as long as the browser tab:
// a refresh keeps it, closing the tab (or the browser) clears it.
// On phones the session is not saved, so the app starts at the welcome page.
const sessionStore = {
  get() {
    try {
      if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined')
        return sessionStorage.getItem(SESSION_KEY);
    } catch {
      // storage blocked: treat as signed out
    }
    return null;
  },
  set(value) {
    try {
      if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined')
        sessionStorage.setItem(SESSION_KEY, value);
    } catch {
      // storage blocked: the session just won't survive a refresh
    }
  },
  remove() {
    try {
      if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined')
        sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // nothing to clear
    }
  },
};

const hashPassword = (salt, password) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);

async function makeUser(name, username, password, role) {
  const salt = Crypto.randomUUID();
  return {
    id: Crypto.randomUUID(),
    username: username.trim().toLowerCase(),
    name: name.trim(),
    role,
    createdAt: new Date().toISOString(),
    salt,
    hash: await hashPassword(salt, password),
  };
}

// Public view of an account (never exposes the password hash)
const toUser = (u) => ({
  id: u.id,
  username: u.username,
  name: u.name,
  role: u.role,
  createdAt: u.createdAt ?? null,
});

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }) {
  const [stored, setStored] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let list = JSON.parse((await AsyncStorage.getItem(USERS_KEY)) ?? '[]');
        if (list.length === 0) {
          // First run: create the default admin account
          list = [await makeUser('Administrator', 'admin', 'admin123', 'admin')];
          await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list));
        }
        // Remove the old long-lived session from earlier versions
        await AsyncStorage.removeItem(SESSION_KEY);

        // Restore the login only if this same tab was already signed in
        const sid = sessionStore.get();
        setStored(list);
        setUserId(sid && list.some((u) => u.id === sid) ? sid : null);
      } catch {
        // storage unavailable: start signed out
      }
      setLoading(false);
    })();
  }, []);

  const persist = async (list) => {
    setStored(list);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(list));
  };

  const signIn = async (username, password) => {
    const found = stored.find((u) => u.username === username.trim().toLowerCase());
    if (!found) return 'Wrong username or password.';
    if ((await hashPassword(found.salt, password)) !== found.hash)
      return 'Wrong username or password.';
    sessionStore.set(found.id);
    setUserId(found.id);
    return null;
  };

  const signUp = async (name, username, password) => {
    const uname = username.trim().toLowerCase();
    if (!name.trim()) return 'Please enter your name.';
    if (!/^[a-z0-9_]{3,20}$/.test(uname))
      return 'Username must be 3-20 letters, numbers or underscores.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (stored.some((u) => u.username === uname)) return 'That username is taken.';
    const created = await makeUser(name, uname, password, 'student');
    await persist([...stored, created]);
    sessionStore.set(created.id);
    setUserId(created.id);
    return null;
  };

  const signOut = async () => {
    sessionStore.remove();
    setUserId(null);
  };

  const current = stored.find((u) => u.id === userId) ?? null;

  const removeUser = async (id) => {
    if (current?.role !== 'admin') return 'Only admins can delete users.';
    if (id === current.id) return "You can't delete your own account.";
    await persist(stored.filter((u) => u.id !== id));
    try {
      await AsyncStorage.removeItem(`ping.progress.v2.${id}`);
    } catch {
      // nothing saved for this user
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user: current ? toUser(current) : null,
        users: stored.map(toUser),
        loading,
        signIn,
        signUp,
        signOut,
        removeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}