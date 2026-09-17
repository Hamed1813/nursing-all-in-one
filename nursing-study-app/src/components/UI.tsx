import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppText } from './AppText';
import { radius, spacing } from '../theme/theme';
import { EightPointStar } from './PersianOrnament';

// ── Card ─────────────────────────────────────────────────────────
// Reads as a glazed tile: soft corner radius, hairline border, and a
// coloured edge band on the right (the RTL "leading" edge) for domain
// wayfinding. No drop-shadow stack — depth comes from the paper/tile
// contrast, the way a real tile sits in a wall.

interface CardProps {
  children: React.ReactNode;
  accentColor?: string;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
}

export function Card({ children, accentColor, style, onPress, elevated }: CardProps) {
  const { theme } = useApp();
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.card,
        {
          backgroundColor: theme.color.surface,
          borderColor: accentColor ? accentColor + '33' : theme.color.hairline,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.995 : 1 }],
        },
        elevated && {
          shadowColor: '#000',
          shadowOpacity: theme.mode === 'dark' ? 0.35 : 0.07,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 3 },
          elevation: 2,
        },
        accentColor ? { borderRightWidth: 4, borderRightColor: accentColor } : null,
        style,
      ]}
    >
      {children}
    </Wrapper>
  );
}

// ── Buttons ──────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'gold';
  disabled?: boolean;
  style?: ViewStyle;
  ornament?: boolean;
}

export function AppButton({ label, onPress, variant = 'primary', disabled, style, ornament }: ButtonProps) {
  const { theme } = useApp();

  const bg =
    variant === 'primary'
      ? theme.color.primary
      : variant === 'danger'
      ? theme.color.danger
      : variant === 'gold'
      ? theme.color.gold
      : 'transparent';

  const borderColor = variant === 'secondary' ? theme.color.hairline : bg;
  const textColor = variant === 'secondary' ? theme.color.text : theme.color.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: bg,
          borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <View style={styles.buttonInner}>
        {ornament && (
          <View style={{ marginLeft: spacing.sm }}>
            <EightPointStar size={14} color={textColor} filled />
          </View>
        )}
        <AppText weight="semibold" size={15.5} color={textColor} center>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

// ── Chip ─────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

export function Chip({ label, selected, onPress, color }: ChipProps) {
  const { theme } = useApp();
  const activeColor = color ?? theme.color.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? activeColor : 'transparent',
          borderColor: selected ? activeColor : theme.color.hairline,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <AppText weight="medium" size={13.5} color={selected ? theme.color.onPrimary : theme.color.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

// ── Progress bar ─────────────────────────────────────────────────

export function ProgressBar({ progress, color, height = 9 }: { progress: number; color?: string; height?: number }) {
  const { theme } = useApp();
  const pct = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[styles.progressTrack, { backgroundColor: theme.color.surfaceSunk, height, borderRadius: height }]}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: color ?? theme.color.primary,
        }}
      />
    </View>
  );
}

// ── Stat tile ────────────────────────────────────────────────────
// A small square tile for a single number — used in the home dashboard
// grid. Mirrors the modularity of a tiled wall.

export function StatTile({
  value,
  label,
  color,
  onPress,
}: {
  value: string;
  label: string;
  color?: string;
  onPress?: () => void;
}) {
  const { theme } = useApp();
  const accent = color ?? theme.color.primary;
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: any) => [
        styles.statTile,
        {
          backgroundColor: theme.color.surface,
          borderColor: theme.color.hairline,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <AppText weight="display" size={26} color={accent} center style={{ marginBottom: 2 }}>
        {value}
      </AppText>
      <AppText size={12} color={theme.color.textMuted} center>
        {label}
      </AppText>
    </Wrapper>
  );
}

// ── Divider ──────────────────────────────────────────────────────

export function Divider() {
  const { theme } = useApp();
  return <View style={{ height: 1, backgroundColor: theme.color.hairline, marginVertical: spacing.md }} />;
}

// ── Badge ────────────────────────────────────────────────────────

export function Badge({ label, color }: { label: string; color: string }) {
  const { theme } = useApp();
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <AppText size={12} weight="medium" color={theme.color.onPrimary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  button: {
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderWidth: 1.2,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md + 2,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    overflow: 'hidden',
    width: '100%',
  },
  statTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  badge: {
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 11,
    alignSelf: 'flex-start',
  },
});
