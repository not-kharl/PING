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

const EMPTY = {
    lesson1: false,
    lesson2: false,
    quiz1: false,
    quiz2: false,
    scores: {},
};
const KEYS = ['lesson1', 'lesson2', 'quiz1', 'quiz2'];

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

    // Load this user's saved progress (each account has its own)
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
                const raw = await AsyncStorage.getItem(`ping.progress.${userId}`);
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
                AsyncStorage.setItem(`ping.progress.${userId}`, JSON.stringify(next)).catch(
                    () => { }
                );
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

    const percent = KEYS.filter((k) => data[k]).length * 25;
    // Quiz N unlocks once Lesson N has been viewed
    const isUnlocked = (quizId) => !!data[`lesson${quizId}`];

    return (
        <ProgressContext.Provider
      value= {{ data, ready, percent, mark, saveScore, isUnlocked }
}
    >
    { children }
    </ProgressContext.Provider>
  );
}