import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Platform } from 'react-native';

// Light palette (unchanged). Screens keep importing this.
export const colors = {
  black: '#0f0f10',
  navyDark: '#14202e',
  navy: '#1c2b3d',
  orange: '#f4511e',
  orangeSoft: '#ff7a4d',
  bgLight: '#f4f4f4',
  gray: '#e6e6e6',
  white: '#ffffff',
  text: '#1c2b3d',
  muted: '#8a96a3',
};

// Colors for places that set a color inline (headers, tab bar, page backgrounds)
const UI = {
  light: {
    bg: '#f4f4f4',
    surface: '#ffffff',
    text: '#1c2b3d',
    bar: '#0f0f10',
    header: '#1c2b3d',
  },
  dark: {
    bg: '#161e29',
    surface: '#1f2a39',
    text: '#e3e9f2',
    bar: '#0f151d',
    header: '#2a4262',
  },
};

// Dark replacements for the light colors used in StyleSheets
const BG = {
  '#ffffff': '#1f2a39', // cards
  '#f4f4f4': '#161e29', // page / inset areas
  '#e6e6e6': '#2f3b4e', // bars, chips
  '#1c2b3d': '#2a4262', // navy buttons, heroes, avatars
  '#14202e': '#0f1823', // canvas, panes
  '#0f0f10': '#0f151d', // nav bar, footer
  '#0f1925': '#0b121b',
  '#e8f6ee': '#1b3a2b', // "correct" green tint
  '#fdecea': '#3d2327', // "wrong" red tint
  '#0a0f14': '#eceff3', // terminal turns white in dark mode
};
const FG = {
  '#1c2b3d': '#e3e9f2', // text
  '#c62828': '#ff8a80', // errors
  '#2e9b57': '#4cc27f', // success green
  '#7cfc9a': '#1a6b3c', // terminal text on the white terminal
  '#fdfdfd': '#14202e', // terminal input text
};
const BORDER = {
  '#e6e6e6': '#2f3b4e',
};

let currentMode = 'light';

function adapt(style) {
  if (!style || typeof style !== 'object') return style;
  const out = { ...style };
  Object.keys(out).forEach((key) => {
    const v = out[key];
    if (typeof v !== 'string') return;
    const low = v.toLowerCase();
    let map = null;
    if (key === 'backgroundColor') map = BG;
    else if (key === 'color') map = FG;
    else if (/^border.*Color$/.test(key)) map = BORDER;
    if (map && map[low]) out[key] = map[low];
  });
  return out;
}

// Use instead of StyleSheet.create: same styles, recolored in dark mode
export function themedStyles(styles) {
  const darkCache = {};
  return new Proxy(styles, {
    get(target, key) {
      if (typeof key !== 'string' || currentMode === 'light') return target[key];
      if (!(key in darkCache)) darkCache[key] = adapt(target[key]);
      return darkCache[key];
    },
  });
}

const THEME_KEY = 'ping.theme';

const ThemeContext = createContext({
  mode: 'light',
  dark: false,
  toggle: () => {},
  ui: UI.light,
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  currentMode = mode; // set before children render so their styles use it

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (v === 'dark' || v === 'light') setMode(v);
      })
      .catch(() => {});
  }, []);

  // Keep the page behind the app the same color on the web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = UI[mode].bg;
      document.body.style.backgroundColor = UI[mode].bg;
    }
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, dark: mode === 'dark', toggle, ui: UI[mode] }),
    [mode, toggle]
  );

  return createElement(ThemeContext.Provider, { value }, children);
}