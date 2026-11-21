import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from './auth';

// 5 modules: each has a lesson and a quiz, worth 10% each
const KEYS = [
  'lesson1', 'quiz1',
  'lesson2', 'quiz2',
  'lesson3', 'quiz3',
  'lesson4', 'quiz4',
  'lesson5', 'quiz5',
];
const EMPTY = {
  ...Object.fromEntries(KEYS.map((k) => [k, false])),
  scores: {},
};

const ProgressContext = createContext(null);

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}

export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [data, setData] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const ref = useRef(EMPTY);
  const readyRef = useRef(false);
  const storageKey = `ping.progress.v2.${userId}`;

  useEffect(() => {
    let cancelled = false;
    readyRef.current = false;
    setReady(false);
    ref.current = EMPTY;
    setData(EMPTY);
    if (!userId) return;
    (async () => {
      let loaded = EMPTY;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) loaded = { ...EMPTY, ...JSON.parse(raw) };
      } catch {
        // storage unavailable: start from zero
      }
      if (cancelled) return;
      ref.current = loaded;
      setData(loaded);
      readyRef.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const commit = useCallback(
    (next) => {
      ref.current = next;
      setData(next);
      if (userId)
        AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
    },
    [userId]
  );

  const mark = useCallback(
    (key) => {
      if (!readyRef.current) return;
      if (!KEYS.includes(key)) return;
      if (ref.current[key]) return;
      commit({ ...ref.current, [key]: true });
    },
    [commit]
  );

  const saveScore = useCallback(
    (quizId, score, total) => {
      if (!readyRef.current) return;
      const best = ref.current.scores[quizId];
      if (best && best.score >= score) return;
      commit({
        ...ref.current,
        scores: { ...ref.current.scores, [quizId]: { score, total } },
      });
    },
    [commit]
  );

  const done = KEYS.filter((k) => data[k]).length;
  const percent = Math.round((done / KEYS.length) * 100);
  
  const isUnlocked = (quizId) =>
    user?.role === 'admin' || !!data[`lesson${quizId}`];

  return (
    <ProgressContext.Provider
      value={{ data, ready, percent, mark, saveScore, isUnlocked }}
    >
      {children}
    </ProgressContext.Provider>
  );
}