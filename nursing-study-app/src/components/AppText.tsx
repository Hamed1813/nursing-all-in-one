import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useApp } from '../context/AppContext';
import { fontScale } from '../theme/theme';

type Weight = 'regular' | 'medium' | 'semibold' | 'bold' | 'display';

// Vazirmatn carries the body text — it is built for Persian and stays
// legible at long reading lengths. Lalezar is reserved for display
// titles only: it is a Persian poster face with real character, and
// using it anywhere else would hurt readability.
const FONT_MAP: Record<Weight, string> = {
  regular: 'Vazirmatn_400Regular',
  medium: 'Vazirmatn_500Medium',
  semibold: 'Vazirmatn_600SemiBold',
  bold: 'Vazirmatn_700Bold',
  display: 'Lalezar_400Regular',
};

interface AppTextProps extends TextProps {
  weight?: Weight;
  size?: number;
  color?: string;
  center?: boolean;
  style?: TextStyle | TextStyle[];
}

export function AppText({ weight = 'regular', size = 16, color, center, style, ...rest }: AppTextProps) {
  const { theme, settings } = useApp();
  const scale = fontScale[settings.fontSize] ?? 1;
  const isDisplay = weight === 'display';
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: FONT_MAP[weight],
          fontSize: size * scale,
          color: color ?? theme.color.text,
          textAlign: center ? 'center' : 'right',
          writingDirection: 'rtl',
          // Persian script needs generous line height, and Lalezar sits
          // slightly differently on the baseline than Vazirmatn.
          lineHeight: size * scale * (isDisplay ? 1.5 : 1.75),
        },
        style,
      ]}
    />
  );
}
