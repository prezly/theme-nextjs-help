import { DEFAULT_THEME_SETTINGS, type ThemeSettings } from '@/theme-settings';

// Use local theme settings as the primary source instead of fetching from API
// This is because this theme is deployed separately and doesn't have API settings configured
export function themeSettings(): ThemeSettings {
    return DEFAULT_THEME_SETTINGS;
}
