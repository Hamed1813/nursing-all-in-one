import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, G, Circle, Defs, Pattern, Rect, Line } from 'react-native-svg';
import { useApp } from '../context/AppContext';

// ═══════════════════════════════════════════════════════════════
//  نقوش هندسی ایرانی
//  Girih-style geometric ornament. These are structural design
//  elements (headers, dividers, empty states), not stickers —
//  the geometry is the same eight-point star / interlace family
//  found in Iranian tilework and bookbinding.
// ═══════════════════════════════════════════════════════════════

/** ستاره هشت‌پر — the eight-point star (shamseh), drawn as a single path. */
export function EightPointStar({
  size = 24,
  color,
  opacity = 1,
  filled = false,
}: {
  size?: number;
  color?: string;
  opacity?: number;
  filled?: boolean;
}) {
  const { theme } = useApp();
  const c = color ?? theme.color.primary;
  // Two overlaid squares rotated 45° = classic eight-point star
  const p =
    'M50 4 L61 28 L88 17 L77 44 L96 50 L77 56 L88 83 L61 72 L50 96 L39 72 L12 83 L23 56 L4 50 L23 44 L12 17 L39 28 Z';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" opacity={opacity}>
      <Path d={p} fill={filled ? c : 'none'} stroke={c} strokeWidth={filled ? 0 : 5} strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * سرلوح — an ornamental header band.
 * Used at the top of a page/section the way an illuminated header
 * (sarlowh) opens a chapter in a Persian manuscript.
 */
export function OrnamentalHeader({
  color,
  height = 26,
  style,
}: {
  color?: string;
  height?: number;
  style?: ViewStyle;
}) {
  const { theme } = useApp();
  const c = color ?? theme.color.primary;
  return (
    <View style={[{ height, width: '100%' }, style]}>
      <Svg width="100%" height={height} viewBox="0 0 300 26" preserveAspectRatio="xMidYMid meet">
        {/* central medallion */}
        <G opacity={0.9}>
          <Path
            d="M150 3 L156 11 L164 13 L156 15 L150 23 L144 15 L136 13 L144 11 Z"
            fill={c}
          />
        </G>
        {/* interlaced side bands */}
        <G opacity={0.55} stroke={c} strokeWidth={1.4} fill="none">
          <Path d="M132 13 L118 13 M112 13 L98 13 M92 13 L78 13" strokeLinecap="round" />
          <Path d="M168 13 L182 13 M188 13 L202 13 M208 13 L222 13" strokeLinecap="round" />
          <Path d="M115 8 L115 18 M85 9 L85 17" strokeLinecap="round" />
          <Path d="M185 8 L185 18 M215 9 L215 17" strokeLinecap="round" />
        </G>
        <G opacity={0.3} fill={c}>
          <Circle cx="70" cy="13" r="1.8" />
          <Circle cx="230" cy="13" r="1.8" />
        </G>
      </Svg>
    </View>
  );
}

/** جداکننده — a light ornamental divider between sections. */
export function OrnamentalDivider({ color, style }: { color?: string; style?: ViewStyle }) {
  const { theme } = useApp();
  const c = color ?? theme.color.hairline;
  const accent = color ?? theme.color.primary;
  return (
    <View style={[{ height: 16, width: '100%', marginVertical: 8 }, style]}>
      <Svg width="100%" height={16} viewBox="0 0 300 16" preserveAspectRatio="xMidYMid meet">
        <Line x1="10" y1="8" x2="132" y2="8" stroke={c} strokeWidth={1} />
        <Line x1="168" y1="8" x2="290" y2="8" stroke={c} strokeWidth={1} />
        <Path d="M150 2 L155 8 L150 14 L145 8 Z" fill={accent} opacity={0.7} />
      </Svg>
    </View>
  );
}

/**
 * زمینه گره — a very low-contrast girih lattice used as a background
 * wash behind hero areas. Repeats a single tile via <Pattern>.
 */
export function GirihBackdrop({
  color,
  opacity = 0.07,
  height = 200,
}: {
  color?: string;
  opacity?: number;
  height?: number;
}) {
  const { theme } = useApp();
  const c = color ?? theme.color.primary;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height, overflow: 'hidden' }} pointerEvents="none">
      <Svg width="100%" height={height}>
        <Defs>
          <Pattern id="girih" patternUnits="userSpaceOnUse" width="60" height="60">
            <G stroke={c} strokeWidth={1.1} fill="none" opacity={opacity}>
              {/* interlaced octagon-and-star lattice */}
              <Path d="M30 2 L44 16 L44 44 L30 58 L16 44 L16 16 Z" />
              <Path d="M30 12 L38 20 L38 40 L30 48 L22 40 L22 20 Z" />
              <Path d="M2 30 L16 16 M44 16 L58 30 M58 30 L44 44 M16 44 L2 30" />
              <Path d="M30 2 L30 12 M30 48 L30 58" />
            </G>
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height={height} fill="url(#girih)" />
      </Svg>
    </View>
  );
}

/** بته جقه — a stylised boteh (paisley), used for empty states. */
export function BotehMotif({ size = 72, color, opacity = 0.35 }: { size?: number; color?: string; opacity?: number }) {
  const { theme } = useApp();
  const c = color ?? theme.color.primary;
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 80 100" opacity={opacity}>
      <G stroke={c} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* outer boteh silhouette: teardrop with the curled tip */}
        <Path d="M40 96 C12 82 8 52 22 32 C32 17 52 14 62 26 C72 38 68 54 56 58 C48 61 42 55 45 48 C47 43 53 43 55 47" />
        {/* inner echo */}
        <Path d="M40 84 C22 72 20 52 30 38 C37 28 50 26 56 34" opacity={0.6} />
      </G>
    </Svg>
  );
}
