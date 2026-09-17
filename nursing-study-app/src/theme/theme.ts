// ═══════════════════════════════════════════════════════════════
//  زبان طراحی: «کاشی و کاغذ»
//  Design language: Persian tile & paper.
//
//  The palette is taken from Iranian material culture rather than
//  from generic medical-app blue: the firouzeh (turquoise) and
//  lajevardi (lapis) of Isfahan tilework, saffron, pomegranate red,
//  cypress green, and the warm kahgel (straw-clay) of adobe walls
//  as the paper ground. Deliberately secular — architecture,
//  textiles and landscape, not religious iconography.
//
//  Light mode reads like a page in a Persian manuscript: warm clay
//  paper, deep ink, jewel-tone accents used sparingly.
//  Dark mode reads like glazed tile at night: deep indigo ground
//  with the same jewels lifted in brightness.
// ═══════════════════════════════════════════════════════════════

export const persian = {
  // فیروزه‌ای — the signature Persian turquoise
  firouzeh: '#2E8B8F',
  firouzehLight: '#5FB5B8',
  firouzehDeep: '#1E6B6F',

  // لاجوردی — lapis lazuli blue
  lajevard: '#1F4E79',
  lajevardLight: '#4A7BA8',
  lajevardDeep: '#14324F',

  // زعفرانی — saffron
  zaferan: '#C8901E',
  zaferanLight: '#E3B453',
  zaferanDeep: '#9A6D12',

  // اناری — pomegranate
  anar: '#9E2B35',
  anarLight: '#C4626A',

  // سروی — cypress green
  sarv: '#4A6B4F',
  sarvLight: '#7B9880',

  // کاهگلی — adobe / straw-clay, the paper ground
  kahgel: '#F2EADC',
  kahgelRaised: '#FBF6EC',
  kahgelDeep: '#E2D5BF',

  // شبِ کاشی — night tile ground
  shab: '#121A26',
  shabRaised: '#1A2432',
  shabLine: '#2A3746',

  // مرکب — ink
  morakab: '#1E2530',
  morakabSoft: '#5C6672',
  morakabNight: '#E8E1D2',
  morakabNightSoft: '#96A1AE',
};

export type ThemeMode = 'light' | 'dark';

export function getTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';
  return {
    mode,
    color: {
      bg: isDark ? persian.shab : persian.kahgel,
      surface: isDark ? persian.shabRaised : persian.kahgelRaised,
      surfaceSunk: isDark ? persian.shab : persian.kahgelDeep,
      text: isDark ? persian.morakabNight : persian.morakab,
      textMuted: isDark ? persian.morakabNightSoft : persian.morakabSoft,
      hairline: isDark ? persian.shabLine : persian.kahgelDeep,

      primary: isDark ? persian.firouzehLight : persian.firouzehDeep,
      primarySoft: isDark ? persian.firouzeh : persian.firouzeh,
      onPrimary: isDark ? persian.shab : persian.kahgelRaised,

      accent: isDark ? persian.lajevardLight : persian.lajevard,
      gold: isDark ? persian.zaferanLight : persian.zaferan,
      danger: isDark ? persian.anarLight : persian.anar,
      success: isDark ? persian.sarvLight : persian.sarv,
      due: isDark ? persian.zaferanLight : persian.zaferanDeep,
    },
  };
}

export type Theme = ReturnType<typeof getTheme>;

// Domain accents — each nursing field gets one jewel tone from the
// same Persian palette, so the colour coding reads as one family.
export const domainColorPalette = [
  persian.lajevard,
  persian.zaferanDeep,
  '#6A4E7C',
  persian.anar,
  persian.firouzehDeep,
  persian.sarv,
  '#7A5C3E',
  '#4E6A8C',
  '#9C5A7A',
  '#3D7A6B',
];

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 14, lg: 20, pill: 999 };

export type FontSizeKey = 'small' | 'medium' | 'large';

export const fontScale: Record<FontSizeKey, number> = {
  small: 0.9,
  medium: 1,
  large: 1.18,
};

export const typeScale = {
  display: 30,
  title: 22,
  subtitle: 17,
  body: 16,
  caption: 13.5,
  micro: 11.5,
};

// ── Persian numerals ─────────────────────────────────────────────
const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export function toFaDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => faDigits[Number(d)]);
}
