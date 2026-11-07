/**
 * App shell UI themes. Persisted in localStorage and applied via
 * `data-theme` on <html> so body / .nascent-app-bg pick up CSS vars.
 */

export type UiThemeId = 'aurora' | 'midnight' | 'cinema' | 'ocean' | 'night';

export type UiTheme = {
  id: UiThemeId;
  label: string;
  description: string;
  /** Tiny swatches for the settings preview chips */
  swatches: [string, string, string];
};

export const UI_THEMES: UiTheme[] = [
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Iridescent logo wash — default Nascent look',
    swatches: ['#38bdf8', '#f472b6', '#fde047'],
  },
  {
    id: 'midnight',
    label: 'Midnight',
    description: 'Deep dark blue with vivid blue accents',
    swatches: ['#3b82f6', '#1e40af', '#020617'],
  },
  {
    id: 'cinema',
    label: 'Cinema',
    description: 'Pink-red theatre glow with rose accents',
    swatches: ['#f43f5e', '#9f1239', '#12030a'],
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Deep teal waters with cyan highlights',
    swatches: ['#2dd4bf', '#0e7490', '#115e59'],
  },
  {
    id: 'night',
    label: 'Night',
    description: 'True dark mode with soft moonlight accents',
    swatches: ['#94a3b8', '#1e293b', '#020617'],
  },
];

const STORAGE_KEY = 'nascent_ui_theme';
export const DEFAULT_UI_THEME: UiThemeId = 'aurora';

export function isUiThemeId(value: unknown): value is UiThemeId {
  return typeof value === 'string' && UI_THEMES.some((t) => t.id === value);
}

export function getStoredUiTheme(): UiThemeId {
  if (typeof window === 'undefined') return DEFAULT_UI_THEME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isUiThemeId(raw) ? raw : DEFAULT_UI_THEME;
  } catch {
    return DEFAULT_UI_THEME;
  }
}

export function applyUiTheme(themeId: UiThemeId): void {
  if (typeof document === 'undefined') return;
  const id = isUiThemeId(themeId) ? themeId : DEFAULT_UI_THEME;
  document.documentElement.setAttribute('data-theme', id);
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // private mode / quota — theme still applies for this session
  }
}

/** Apply the stored theme as early as possible (call from App mount). */
export function initUiTheme(): UiThemeId {
  const theme = getStoredUiTheme();
  applyUiTheme(theme);
  return theme;
}
